/* ==========================================================
   MARKETPLACE - Funciones compartidas
   Catálogo, carrito, favoritos, acceso, navegación y modales.
   La arquitectura futura del backend se explica en README.md.
   ========================================================== */
(() => {
    'use strict';

    // Se conservan las claves para no perder datos de la versión anterior.
    const KEYS = {
        products: 'marketplace_demo_products_v1',
        cart: 'marketplace_demo_cart_v1',
        favorites: 'marketplace_demo_favs_v1',
        session: 'marketplace_demo_session_v1',
        profiles: 'marketplace_demo_profiles_v1'
    };

    const categories = [
        { name: 'Ropa', accent: '#e9dfd8' },
        { name: 'Tecnología', accent: '#dfe2e8' },
        { name: 'Audio', accent: '#e6dedb' },
        { name: 'Accesorios', accent: '#efe5dc' },
        { name: 'Hogar', accent: '#e1e9da' },
        { name: 'Deportes', accent: '#e8d9de' },
        { name: 'Belleza', accent: '#f4e0e9' },
        { name: 'Juguetes', accent: '#efe4d8' }
    ];

    // Reemplaza cada JPG en img/productos/ por tu foto con el mismo nombre.
    const initialProducts = [
        { id: 'tenis', name: 'Tenis casuales blancos', price: 1199, category: 'Deportes', image: 'img/productos/tenis.jpg', description: 'Tenis cómodos para uso diario, con un estilo clásico.', featured: true },
        { id: 'reloj', name: 'Smartwatch', price: 2499, category: 'Tecnología', image: 'img/productos/reloj.jpg', description: 'Reloj inteligente para organizar tu día.', featured: true },
        { id: 'bolso', name: 'Bolso de mano', price: 899, category: 'Accesorios', image: 'img/productos/bolso.jpg', description: 'Bolso de mano elegante y práctico.', featured: true },
        { id: 'sudadera', name: 'Sudadera', price: 699, category: 'Ropa', image: 'img/productos/sudadera.jpg', description: 'Sudadera cómoda de corte clásico.', featured: true },
        { id: 'top', name: 'Top de ropa', price: 549, category: 'Ropa', image: 'img/productos/top.jpg', description: 'Prenda ligera para combinar con tu estilo.' },
        { id: 'audifonos', name: 'Audífonos inalámbricos', price: 1799, category: 'Audio', image: 'img/productos/audifonos.jpg', description: 'Audífonos cómodos con conexión inalámbrica.' },
        { id: 'laptop', name: 'Laptop', price: 12999, category: 'Tecnología', image: 'img/productos/laptop.jpg', description: 'Computadora portátil para estudiar y trabajar.' },
        { id: 'lampara', name: 'Lámpara de mesa', price: 599, category: 'Hogar', image: 'img/productos/lampara.jpg', description: 'Iluminación cálida para cualquier escritorio.' },
        { id: 'crema', name: 'Kit de cuidado facial', price: 459, category: 'Belleza', image: 'img/productos/crema.jpg', description: 'Kit básico de cuidado personal.' },
        { id: 'peluche', name: 'Oso de peluche', price: 399, category: 'Juguetes', image: 'img/productos/peluche.jpg', description: 'Peluche suave para regalar.' },
        { id: 'pesas', name: 'Kit de ejercicio', price: 849, category: 'Deportes', image: 'img/productos/pesas.jpg', description: 'Accesorios para actividades de ejercicio.' },
        { id: 'audiospeaker', name: 'Bocina portátil', price: 1199, category: 'Audio', image: 'img/productos/audiospeaker.jpg', description: 'Música en un formato portátil.' }
    ];

    // ===== Almacenamiento local =====
    function read(key, fallback) {
        try {
            const data = JSON.parse(localStorage.getItem(key));
            return data === null ? fallback : data;
        } catch {
            return fallback;
        }
    }

    function write(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch {
            toast('No fue posible guardar los cambios.');
        }
    }

    function escapeHTML(value) {
        return String(value ?? '').replace(/[&<>"']/g, char => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[char]));
    }

    const money = value => new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        maximumFractionDigits: 0
    }).format(value);

    function getProducts() {
        const items = read(KEYS.products, null);
        return Array.isArray(items) ? items : initialProducts.map(product => ({ ...product }));
    }

    function setProducts(items) {
        write(KEYS.products, items);
        changed();
    }

    const findProduct = id => getProducts().find(product => product.id === id);
    const getCart = () => Array.isArray(read(KEYS.cart, [])) ? read(KEYS.cart, []) : [];
    const getFavs = () => Array.isArray(read(KEYS.favorites, [])) ? read(KEYS.favorites, []) : [];
    const getSession = () => read(KEYS.session, null);
    const getProfiles = () => read(KEYS.profiles, {});
    const setProfiles = profiles => write(KEYS.profiles, profiles);

    function setCart(items) {
        write(KEYS.cart, items);
        changed();
    }

    function setFavs(items) {
        write(KEYS.favorites, items);
        changed();
    }

    function setSession(session) {
        if (session === null) {
            try {
                localStorage.removeItem(KEYS.session);
            } catch { /* No se pudo acceder al almacenamiento. */ }
        } else {
            write(KEYS.session, session);
        }
        changed();
    }

    function toast(message) {
        const notification = document.createElement('div');
        notification.className = 'toast';
        notification.setAttribute('role', 'status');
        notification.textContent = message;
        document.body.append(notification);
        setTimeout(() => notification.remove(), 3500);
    }

    function changed() {
        updateHeader();
        window.dispatchEvent(new Event('market:change'));
    }

    // ===== Productos y fotografías =====
    // Aceptamos rutas dentro de img/. No se aceptan URLs externas ni código HTML.
    function validImagePath(path) {
        return /^img\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_.-]+\.(?:jpg|jpeg|png|webp|svg)$/i.test(path);
    }

    function imagePath(product) {
        let path = product.image;
        if (!path) {
            // Compatibilidad con productos guardados en versiones anteriores.
            path = initialProducts.find(item => item.id === product.id)?.image;
        }
        return path && validImagePath(path) ? path : 'img/imagen-no-disponible.svg';
    }

    function productVisual(product, large = false) {
        const name = escapeHTML(product.name);
        return `
            <div class="product-visual ${large ? 'large' : ''}">
                <img class="product-photo" src="${escapeHTML(imagePath(product))}"
                     alt="${name}" loading="${large ? 'eager' : 'lazy'}">
            </div>
        `;
    }

    function productCard(product) {
        const id = escapeHTML(product.id);
        const url = `detalle.html?id=${encodeURIComponent(product.id)}`;
        const favorite = getFavs().includes(product.id);

        return `
            <article class="product-card">
                <button type="button" class="heart-btn ${favorite ? 'is-favorite' : ''}"
                        data-action="favorite" data-id="${id}"
                        aria-label="${favorite ? 'Quitar de' : 'Agregar a'} favoritos">
                    ${favorite ? '♥' : '♡'}
                </button>
                <a href="${url}" aria-label="Ver ${escapeHTML(product.name)}">
                    ${productVisual(product)}
                </a>
                <div class="product-card-body">
                    <a href="${url}"><h3>${escapeHTML(product.name)}</h3></a>
                    <div class="price">${money(product.price)}</div>
                    <div class="product-actions">
                        <a class="btn-secondary small-button button" href="${url}">Ver detalle</a>
                        <button type="button" class="button small-button" data-action="cart" data-id="${id}">Agregar</button>
                    </div>
                </div>
            </article>
        `;
    }

    function addCart(id) {
        if (!findProduct(id)) return;
        const cart = getCart();
        const item = cart.find(product => product.id === id);
        if (item) item.qty++;
        else cart.push({ id, qty: 1 });
        setCart(cart);
        toast('Producto agregado al carrito.');
    }

    function toggleFavorite(id) {
        const current = getFavs();
        const updated = current.includes(id)
            ? current.filter(value => value !== id)
            : [...current, id];
        setFavs(updated);
        toast(updated.includes(id) ? 'Agregado a favoritos.' : 'Eliminado de favoritos.');
    }

    // ===== Encabezado y cuenta =====
    function headerHTML() {
        const page = document.body.dataset.page || 'home';
        return `
            <header class="site-header">
                <nav class="nav-container" aria-label="Navegación principal">
                    <a href="index.html" class="logo-area">Marketplace</a>
                    <form class="search-bar" action="productos.html">
                        <span aria-hidden="true">⌕</span>
                        <input type="search" name="busqueda" aria-label="Buscar productos"
                               placeholder="Buscar productos, marcas y más...">
                    </form>
                    <button class="mobile-menu btn-ghost small-button" type="button"
                            id="mobile-toggle" aria-expanded="false" aria-controls="nav-links">
                        ☰ Menú
                    </button>
                    <ul class="nav-links" id="nav-links">
                        <li><a class="${page === 'products' ? 'active' : ''}" href="productos.html">Productos</a></li>
                        <li><a href="productos.html#categorias">Categorías</a></li>
                        <li><a class="${page === 'favorites' ? 'active' : ''}" href="favoritos.html">♡ Favoritos</a></li>
                        <li class="cart-nav">
                            <a class="${page === 'cart' ? 'active' : ''}" href="carrito.html">
                                Carrito <span class="count" id="cart-count">0</span>
                            </a>
                        </li>
                        <li class="account-wrap">
                            <button type="button" class="nav-button" id="account-toggle" aria-expanded="false"
                                    aria-controls="account-menu">
                                <span id="account-label">Mi cuenta</span> ▾
                            </button>
                            <div class="account-menu hidden" id="account-menu"></div>
                        </li>
                    </ul>
                </nav>
            </header>
        `;
    }

    function updateHeader() {
        const count = document.getElementById('cart-count');
        if (count) count.textContent = getCart().reduce((sum, product) => sum + product.qty, 0);

        const session = getSession();
        const label = document.getElementById('account-label');
        if (label) label.textContent = session ? (session.name?.split(' ')[0] || 'Mi cuenta') : 'Mi cuenta';

        const menu = document.getElementById('account-menu');
        if (!menu) return;
        if (session) {
            const profileURL = session.role === 'admin' ? 'admin.html' : 'perfil.html';
            menu.innerHTML = `
                <div class="menu-caption">${escapeHTML(session.name)}<br>${escapeHTML(session.email)}</div>
                <a href="${profileURL}">${session.role === 'admin' ? 'Panel de administrador' : 'Mi perfil'}</a>
                ${session.role === 'admin' ? '<a href="index.html">Ir a la tienda</a>' : ''}
                <button type="button" data-action="logout">Cerrar sesión</button>
            `;
        } else {
            menu.innerHTML = `
                <button type="button" data-auth="login">Iniciar sesión</button>
                <button type="button" data-auth="register">Crear cuenta</button>
                <button type="button" data-auth="admin">Acceso administrador</button>
            `;
        }
    }

    // ===== Ventanas emergentes de acceso y registro =====
    function modalHTML() {
        return `
            <dialog class="modal" id="auth-dialog" aria-labelledby="auth-title">
                <div class="modal-body">
                    <div class="modal-head">
                        <h2 id="auth-title">Iniciar sesión</h2>
                        <button class="icon-button" type="button" id="auth-close" aria-label="Cerrar">×</button>
                    </div>
                    <div id="login-content">
                        <div class="role-tabs" aria-label="Tipo de acceso">
                            <button type="button" data-role="user" class="active">Usuario</button>
                            <button type="button" data-role="admin">Administrador</button>
                        </div>
                        <form id="login-form">
                            <div class="form-field">
                                <label for="login-email">Correo electrónico</label>
                                <input type="email" id="login-email" placeholder="ejemplo@correo.com"
                                       autocomplete="email" required>
                            </div>
                            <div class="form-field">
                                <label for="login-password">Contraseña</label>
                                <input type="password" id="login-password" placeholder="Ingresa tu contraseña"
                                       minlength="6" autocomplete="current-password" required>
                            </div>
                            <button class="button full" type="submit">Iniciar sesión</button>
                        </form>
                        <p class="modal-bottom">¿No tienes cuenta?
                            <button class="link-button" type="button" data-auth="register">Regístrate</button>
                        </p>
                    </div>
                    <div id="register-content" class="hidden">
                        <form id="register-form">
                            <div class="form-field">
                                <label for="register-name">Nombre completo</label>
                                <input id="register-name" placeholder="Ingresa tu nombre"
                                       maxlength="80" autocomplete="name" required>
                            </div>
                            <div class="form-field">
                                <label for="register-email">Correo electrónico</label>
                                <input type="email" id="register-email" placeholder="ejemplo@correo.com"
                                       autocomplete="email" required>
                            </div>
                            <div class="form-field">
                                <label for="register-password">Contraseña</label>
                                <input type="password" id="register-password" placeholder="Crea una contraseña"
                                       minlength="6" autocomplete="new-password" required>
                            </div>
                            <div class="form-field">
                                <label for="register-confirm">Confirmar contraseña</label>
                                <input type="password" id="register-confirm" placeholder="Repite tu contraseña"
                                       minlength="6" autocomplete="new-password" required>
                            </div>
                            <button class="button full" type="submit">Registrarse</button>
                        </form>
                        <p class="modal-bottom">¿Ya tienes cuenta?
                            <button class="link-button" type="button" data-auth="login">Inicia sesión</button>
                        </p>
                    </div>
                </div>
            </dialog>
        `;
    }

    let roleMode = 'user';

    function auth(mode = 'login') {
        const dialog = document.getElementById('auth-dialog');
        if (!dialog) return;
        const registering = mode === 'register';
        roleMode = mode === 'admin' ? 'admin' : 'user';
        document.getElementById('login-content').classList.toggle('hidden', registering);
        document.getElementById('register-content').classList.toggle('hidden', !registering);
        document.getElementById('auth-title').textContent = registering
            ? 'Crear cuenta'
            : (roleMode === 'admin' ? 'Acceso administrador' : 'Iniciar sesión');
        document.querySelectorAll('[data-role]').forEach(button => {
            button.classList.toggle('active', button.dataset.role === roleMode);
        });
        document.getElementById('account-menu')?.classList.add('hidden');
        if (!dialog.open) dialog.showModal();
    }

    function logout() {
        setSession(null);
        toast('Sesión cerrada.');
        if (['admin', 'profile'].includes(document.body.dataset.page)) {
            location.href = 'index.html';
        }
    }

    function handleLogin(event) {
        event.preventDefault();
        const email = document.getElementById('login-email').value.trim().toLowerCase();
        const password = document.getElementById('login-password').value;
        if (!email || password.length < 6) return;
        const profile = getProfiles()[email] || {};
        const name = roleMode === 'admin' ? 'Administrador' : (profile.name || email.split('@')[0]);
        setSession({ email, name, role: roleMode });
        document.getElementById('auth-dialog').close();
        toast('Sesión iniciada.');
        location.href = roleMode === 'admin' ? 'admin.html' : 'perfil.html';
    }

    function handleRegister(event) {
        event.preventDefault();
        const name = document.getElementById('register-name').value.trim();
        const email = document.getElementById('register-email').value.trim().toLowerCase();
        const password = document.getElementById('register-password').value;
        const confirmation = document.getElementById('register-confirm').value;
        if (!name) return;
        if (password !== confirmation) {
            toast('Las contraseñas no coinciden.');
            return;
        }
        const profiles = getProfiles();
        profiles[email] = { ...profiles[email], name, email };
        setProfiles(profiles);
        setSession({ name, email, role: 'user' });
        document.getElementById('auth-dialog').close();
        toast('Cuenta creada.');
        location.href = 'perfil.html';
    }

    // ===== Inicialización y eventos generales =====
    function boot() {
        document.getElementById('site-header').innerHTML = headerHTML();
        document.getElementById('site-footer').innerHTML =
            '<footer class="footer">Marketplace · Encuentra lo que necesitas en un solo lugar.</footer>';
        document.body.insertAdjacentHTML('beforeend', modalHTML());
        updateHeader();

        const search = new URLSearchParams(location.search).get('busqueda');
        if (search) {
            const input = document.querySelector('.search-bar input');
            if (input) input.value = search;
        }

        document.getElementById('account-toggle').addEventListener('click', event => {
            event.stopPropagation();
            const menu = document.getElementById('account-menu');
            const willOpen = menu.classList.contains('hidden');
            menu.classList.toggle('hidden', !willOpen);
            event.currentTarget.setAttribute('aria-expanded', String(willOpen));
        });

        document.getElementById('mobile-toggle').addEventListener('click', event => {
            const isOpen = document.getElementById('nav-links').classList.toggle('show-mobile');
            event.currentTarget.setAttribute('aria-expanded', String(isOpen));
        });

        const dialog = document.getElementById('auth-dialog');
        document.getElementById('auth-close').addEventListener('click', () => dialog.close());
        document.getElementById('login-form').addEventListener('submit', handleLogin);
        document.getElementById('register-form').addEventListener('submit', handleRegister);

        // Si se pierde un archivo JPG, mostramos una imagen de respaldo local.
        document.addEventListener('error', event => {
            const image = event.target;
            if (image instanceof HTMLImageElement && image.classList.contains('product-photo')) {
                if (!image.src.endsWith('imagen-no-disponible.svg')) {
                    image.src = 'img/imagen-no-disponible.svg';
                }
            }
        }, true);

        document.addEventListener('click', event => {
            const target = event.target.closest('[data-auth],[data-role],[data-action]');
            if (!event.target.closest('.account-wrap')) {
                document.getElementById('account-menu').classList.add('hidden');
                document.getElementById('account-toggle').setAttribute('aria-expanded', 'false');
            }
            if (!target) return;

            if (target.dataset.auth) {
                auth(target.dataset.auth);
                return;
            }
            if (target.dataset.role) {
                roleMode = target.dataset.role;
                document.querySelectorAll('[data-role]').forEach(button => {
                    button.classList.toggle('active', button.dataset.role === roleMode);
                });
                document.getElementById('auth-title').textContent =
                    roleMode === 'admin' ? 'Acceso administrador' : 'Iniciar sesión';
                return;
            }
            if (target.dataset.action === 'cart') addCart(target.dataset.id);
            if (target.dataset.action === 'favorite') toggleFavorite(target.dataset.id);
            if (target.dataset.action === 'logout') logout();
        });
    }

    window.Market = {
        KEYS, categories, initialProducts, read, write, escapeHTML, money,
        getProducts, setProducts, findProduct, getCart, setCart, getFavs, setFavs,
        getSession, setSession, getProfiles, setProfiles, validImagePath,
        imagePath, productVisual, productCard, addCart, toggleFavorite,
        toast, auth, logout, changed
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
