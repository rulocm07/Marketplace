/* ======================================================
   Panel de administración: catálogo y perfil.
   La autorización real se integrará con el backend.
   ====================================================== */
(() => {
    'use strict';
    if (document.body.dataset.page !== 'admin') return;

    const M = window.Market;
    const root = document.getElementById('admin-root');
    const session = M.getSession();

    if (!session || session.role !== 'admin') {
        root.innerHTML = `
            <div class="empty">
                <strong>Acceso al panel de administración</strong>
                <p>Inicia sesión como administrador para continuar.</p>
                <button class="button" type="button" data-auth="admin">Iniciar sesión</button>
            </div>
        `;
        return;
    }

    let currentTab = 'dashboard';
    let editingID = null;

    function renderShell() {
        root.innerHTML = `
            <div class="admin-layout">
                <aside class="panel">
                    <h3>Administración</h3>
                    <nav class="admin-nav" id="admin-menu" aria-label="Menú de administración">
                        <button type="button" data-tab="dashboard">Resumen</button>
                        <button type="button" data-tab="products">Gestionar productos</button>
                        <button type="button" data-tab="new">Registrar elemento</button>
                        <button type="button" data-tab="profile">Perfil de administrador</button>
                        <button type="button" data-action="logout">Cerrar sesión</button>
                    </nav>
                </aside>
                <section class="panel" id="admin-content"></section>
            </div>
        `;

        root.querySelector('#admin-menu').addEventListener('click', event => {
            const button = event.target.closest('[data-tab]');
            if (!button) return;
            currentTab = button.dataset.tab;
            if (currentTab === 'new') editingID = null;
            render();
        });

        root.querySelector('#admin-content').addEventListener('click', event => {
            const editButton = event.target.closest('[data-edit]');
            const deleteButton = event.target.closest('[data-remove]');

            if (editButton) {
                editingID = editButton.dataset.edit;
                currentTab = 'new';
                render();
                return;
            }

            if (deleteButton) {
                const product = M.findProduct(deleteButton.dataset.remove);
                if (!product || !confirm(`¿Eliminar "${product.name}" del catálogo?`)) return;
                M.setProducts(M.getProducts().filter(item => item.id !== product.id));
                M.setCart(M.getCart().filter(item => item.id !== product.id));
                M.setFavs(M.getFavs().filter(id => id !== product.id));
                M.toast('Producto eliminado.');
                render();
                return;
            }

            if (event.target.closest('#reset-catalog')) {
                if (!confirm('¿Restaurar el catálogo inicial? Se eliminarán los productos agregados.')) return;
                M.setProducts(M.initialProducts.map(product => ({ ...product })));
                M.toast('Catálogo restaurado.');
                render();
            }
        });

        render();
    }

    function render() {
        document.querySelectorAll('[data-tab]').forEach(button => {
            button.classList.toggle('active', button.dataset.tab === currentTab);
        });

        const content = document.getElementById('admin-content');
        const products = M.getProducts();

        if (currentTab === 'dashboard') {
            content.innerHTML = `
                <h2>Resumen general</h2>
                <p class="muted">Bienvenido al panel de administración.</p>
                <div class="admin-stat-grid">
                    <div class="stat-card">
                        <div class="small muted">Productos publicados</div>
                        <div class="stat-number">${products.length}</div>
                    </div>
                    <div class="stat-card">
                        <div class="small muted">Categorías</div>
                        <div class="stat-number">${new Set(products.map(product => product.category)).size}</div>
                    </div>
                    <div class="stat-card">
                        <div class="small muted">Productos destacados</div>
                        <div class="stat-number">${products.filter(product => product.featured).length}</div>
                    </div>
                </div>
                <div class="card">
                    <h3>Acciones rápidas</h3>
                    <p class="muted">Agrega productos y administra la información de tu tienda.</p>
                    <button class="button" type="button" id="go-new">Agregar producto</button>
                    <a class="btn-secondary" href="productos.html">Ver tienda</a>
                </div>
            `;
            content.querySelector('#go-new').addEventListener('click', openNewProduct);
            return;
        }

        if (currentTab === 'products') {
            content.innerHTML = `
                <div class="page-heading">
                    <div>
                        <h2>Gestionar productos</h2>
                        <p class="muted small">Edita o elimina productos del catálogo.</p>
                    </div>
                    <button class="button" type="button" id="go-new">+ Nuevo producto</button>
                </div>
                <div class="table-wrap">
                    <table class="data-table">
                        <thead>
                            <tr><th>Producto</th><th>Categoría</th><th>Precio</th><th>Acciones</th></tr>
                        </thead>
                        <tbody>
                            ${products.map(product => `
                                <tr>
                                    <td>${M.escapeHTML(product.name)}</td>
                                    <td>${M.escapeHTML(product.category)}</td>
                                    <td>${M.money(product.price)}</td>
                                    <td>
                                        <button type="button" class="btn-secondary small-button"
                                                data-edit="${M.escapeHTML(product.id)}">Editar</button>
                                        <button type="button" class="btn-danger small-button"
                                                data-remove="${M.escapeHTML(product.id)}">Eliminar</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <button type="button" class="btn-ghost small-button restore-button"
                        id="reset-catalog">Restaurar catálogo inicial</button>
            `;
            content.querySelector('#go-new').addEventListener('click', openNewProduct);
            return;
        }

        if (currentTab === 'new') {
            renderProductForm(content);
            return;
        }

        if (currentTab === 'profile') {
            renderAdminProfile(content);
        }
    }

    function openNewProduct() {
        editingID = null;
        currentTab = 'new';
        render();
    }

    function renderProductForm(content) {
        const product = editingID ? M.findProduct(editingID) : null;
        const title = product ? 'Editar producto' : 'Registrar elemento nuevo';
        const currentImage = product ? (product.image || M.imagePath(product)) : '';

        content.innerHTML = `
            <h2>${title}</h2>
            <form class="form-grid" id="product-form">
                <div class="field">
                    <label for="prod-name">Nombre del producto</label>
                    <input id="prod-name" maxlength="90" required
                           value="${M.escapeHTML(product?.name || '')}" placeholder="Ej. Mochila casual">
                </div>
                <div class="field">
                    <label for="prod-price">Precio (MXN)</label>
                    <input id="prod-price" type="number" required min="1" max="1000000"
                           step="0.01" value="${product?.price ?? ''}" placeholder="899">
                </div>
                <div class="field">
                    <label for="prod-category">Categoría</label>
                    <select id="prod-category" required>
                        ${M.categories.map(category => `
                            <option value="${M.escapeHTML(category.name)}"
                                    ${category.name === (product?.category || 'Ropa') ? 'selected' : ''}>
                                ${M.escapeHTML(category.name)}
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div class="field">
                    <label for="prod-image">Ruta de imagen</label>
                    <input id="prod-image" type="text" maxlength="180"
                           placeholder="img/productos/mi-producto.jpg"
                           value="${M.escapeHTML(currentImage)}">
                </div>
                <div class="field span-2">
                    <label for="prod-description">Descripción</label>
                    <textarea id="prod-description" maxlength="500"
                              placeholder="Describe el producto">${M.escapeHTML(product?.description || '')}</textarea>
                </div>
                <div class="span-2">
                    <label><input id="prod-featured" type="checkbox"
                                  ${product?.featured ? 'checked' : ''}> Mostrar en productos destacados</label>
                </div>
                <div class="span-2 form-actions">
                    <button class="button" type="submit">${product ? 'Guardar cambios' : 'Registrar producto'}</button>
                    <button type="button" class="btn-secondary" id="cancel-edit">Cancelar</button>
                </div>
            </form>
        `;

        content.querySelector('#cancel-edit').addEventListener('click', () => {
            currentTab = 'products';
            editingID = null;
            render();
        });

        content.querySelector('#product-form').addEventListener('submit', event => {
            event.preventDefault();
            const name = content.querySelector('#prod-name').value.trim();
            const price = Number(content.querySelector('#prod-price').value);
            const category = content.querySelector('#prod-category').value;
            const image = content.querySelector('#prod-image').value.trim();
            const description = content.querySelector('#prod-description').value.trim();
            const featured = content.querySelector('#prod-featured').checked;

            if (!name || !Number.isFinite(price) || price <= 0 || price > 1000000) {
                M.toast('Revisa el nombre y el precio.');
                return;
            }
            if (image && !M.validImagePath(image)) {
                M.toast('Usa una ruta como img/productos/mi-producto.jpg');
                return;
            }

            const result = {
                id: product?.id || `new-${Date.now()}`,
                name, price, category, image, description, featured,
                accent: M.categories.find(item => item.name === category)?.accent || '#e7edf5'
            };
            const allProducts = M.getProducts();
            const index = allProducts.findIndex(item => item.id === result.id);
            if (index >= 0) allProducts[index] = result;
            else allProducts.push(result);

            M.setProducts(allProducts);
            M.toast(product ? 'Producto actualizado.' : 'Producto registrado.');
            editingID = null;
            currentTab = 'products';
            render();
        });
    }

    function renderAdminProfile(content) {
        const administrator = M.getSession();
        content.innerHTML = `
            <h2>Perfil del administrador</h2>
            <form id="admin-profile-form" class="form-grid">
                <div class="field">
                    <label for="admin-name">Nombre</label>
                    <input id="admin-name" required maxlength="80"
                           value="${M.escapeHTML(administrator.name)}">
                </div>
                <div class="field">
                    <label for="admin-email">Correo electrónico</label>
                    <input id="admin-email" type="email" readonly
                           value="${M.escapeHTML(administrator.email)}">
                </div>
                <div class="span-2">
                    <button type="submit" class="button">Guardar perfil</button>
                </div>
            </form>
        `;

        content.querySelector('#admin-profile-form').addEventListener('submit', event => {
            event.preventDefault();
            const name = content.querySelector('#admin-name').value.trim();
            if (!name) return;
            M.setSession({ ...M.getSession(), name });
            M.toast('Perfil administrativo actualizado.');
            render();
        });
    }

    renderShell();
})();
