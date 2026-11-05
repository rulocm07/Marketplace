/* ==========================================================
   Productos: inicio, catálogo, detalle y favoritos.
   ========================================================== */
(() => {
    'use strict';

    const M = window.Market;
    const page = document.body.dataset.page;

    // ===== Página de inicio =====
    function home() {
        const categoriesGrid = document.getElementById('home-categories');
        const featuredGrid = document.getElementById('featured-products');
        if (!categoriesGrid || !featuredGrid) return;

        categoriesGrid.innerHTML = M.categories.map(category => `
            <a class="category-card" href="productos.html?categoria=${encodeURIComponent(category.name)}">
                ${M.escapeHTML(category.name)}
            </a>
        `).join('');

        function renderFeatured() {
            const products = M.getProducts().filter(product => product.featured).slice(0, 8);
            featuredGrid.innerHTML = products.length
                ? products.map(M.productCard).join('')
                : '<p class="muted">Sin productos destacados.</p>';
        }

        renderFeatured();
        window.addEventListener('market:change', renderFeatured);
    }

    // ===== Catálogo: categorías, búsqueda, precio y orden =====
    function catalog() {
        const grid = document.getElementById('catalog-results');
        if (!grid) return;

        const categoryList = document.getElementById('category-filter');
        const priceInput = document.getElementById('price-filter');
        const priceLabel = document.getElementById('price-label');
        const sortSelect = document.getElementById('sort-filter');
        const clearButton = document.getElementById('clear-filters');
        const searchInput = document.getElementById('catalog-search');
        const params = new URLSearchParams(location.search);
        const selectedCategory = params.get('categoria') || '';

        categoryList.innerHTML = `
            <label>
                <input type="radio" name="category" value="" ${!selectedCategory ? 'checked' : ''}>
                Todas las categorías
            </label>
        ` + M.categories.map(category => `
            <label>
                <input type="radio" name="category" value="${M.escapeHTML(category.name)}"
                       ${category.name === selectedCategory ? 'checked' : ''}>
                ${M.escapeHTML(category.name)}
            </label>
        `).join('');

        searchInput.value = params.get('busqueda') || '';

        function render() {
            const category = categoryList.querySelector('input[name="category"]:checked')?.value || '';
            const term = searchInput.value.trim().toLowerCase();
            const maximum = Number(priceInput.value);
            priceLabel.textContent = M.money(maximum);

            const filtered = M.getProducts().filter(product => {
                const matchesCategory = !category || product.category === category;
                const matchesPrice = product.price <= maximum;
                const searchable = `${product.name} ${product.category} ${product.description || ''}`.toLowerCase();
                return matchesCategory && matchesPrice && (!term || searchable.includes(term));
            });

            if (sortSelect.value === 'min') filtered.sort((a, b) => a.price - b.price);
            if (sortSelect.value === 'max') filtered.sort((a, b) => b.price - a.price);

            document.getElementById('result-count').textContent = `${filtered.length} productos`;
            grid.innerHTML = filtered.length
                ? filtered.map(M.productCard).join('')
                : '<div class="empty empty-full"><strong>Sin resultados</strong>Prueba con otros filtros o palabras.</div>';
        }

        categoryList.addEventListener('change', render);
        searchInput.addEventListener('input', render);
        priceInput.addEventListener('input', render);
        sortSelect.addEventListener('change', render);
        clearButton.addEventListener('click', () => {
            categoryList.querySelector('input[value=""]').checked = true;
            searchInput.value = '';
            priceInput.value = '20000';
            sortSelect.value = 'default';
            history.replaceState({}, '', 'productos.html');
            render();
        });
        window.addEventListener('market:change', render);
        render();
    }

    // ===== Detalle del producto =====
    function detail() {
        const container = document.getElementById('detail-content');
        if (!container) return;
        const id = new URLSearchParams(location.search).get('id') || 'tenis';

        function render() {
            const product = M.findProduct(id);
            if (!product) {
                container.innerHTML = `
                    <div class="empty">
                        <strong>Producto no encontrado</strong>
                        <a href="productos.html">Volver al catálogo</a>
                    </div>
                `;
                return;
            }

            const favorite = M.getFavs().includes(id);
            container.innerHTML = `
                <div class="detail-layout">
                    <div>${M.productVisual(product, true)}</div>
                    <div class="detail-copy">
                        <span class="tag">${M.escapeHTML(product.category)}</span>
                        <h1>${M.escapeHTML(product.name)}</h1>
                        <div class="price">${M.money(product.price)}</div>
                        <p class="muted">${M.escapeHTML(product.description || '')}</p>
                        <div class="detail-actions">
                            <button class="button" type="button" data-action="cart"
                                    data-id="${M.escapeHTML(id)}">Agregar al carrito</button>
                            <button class="btn-secondary" type="button" data-action="favorite"
                                    data-id="${M.escapeHTML(id)}">
                                ${favorite ? '♥ Quitar de favoritos' : '♡ Agregar a favoritos'}
                            </button>
                        </div>
                        <a href="productos.html">← Volver a productos</a>
                    </div>
                </div>
            `;
            document.title = `${product.name} - Marketplace`;
        }

        render();
        window.addEventListener('market:change', render);
    }

    // ===== Lista de favoritos =====
    function favorites() {
        const grid = document.getElementById('favorites-results');
        if (!grid) return;

        function render() {
            const ids = M.getFavs();
            const products = M.getProducts().filter(product => ids.includes(product.id));
            grid.innerHTML = products.length
                ? products.map(M.productCard).join('')
                : `
                    <div class="empty empty-full">
                        <strong>Sin favoritos todavía</strong>
                        Presiona ♡ en un producto para guardarlo aquí.
                        <p class="empty-action"><a class="button" href="productos.html">Explorar productos</a></p>
                    </div>
                `;
        }

        render();
        window.addEventListener('market:change', render);
    }

    if (page === 'home') home();
    if (page === 'products') catalog();
    if (page === 'detail') detail();
    if (page === 'favorites') favorites();
})();
