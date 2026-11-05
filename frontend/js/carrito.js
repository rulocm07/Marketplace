/* =======================================================
   Carrito de compras: cantidades, productos y subtotal.
   ======================================================= */
(() => {
    'use strict';
    if (document.body.dataset.page !== 'cart') return;

    const M = window.Market;
    const list = document.getElementById('cart-items');
    const summary = document.getElementById('cart-summary');

    function render() {
        const items = M.getCart()
            .map(item => ({ item, product: M.findProduct(item.id) }))
            .filter(entry => entry.product);

        if (!items.length) {
            list.innerHTML = `
                <div class="empty">
                    <strong>Tu carrito está vacío</strong>
                    Explora el catálogo para agregar productos.
                    <p class="empty-action"><a class="button" href="productos.html">Ver productos</a></p>
                </div>
            `;
            summary.innerHTML = `
                <h3>Resumen de compra</h3>
                <p class="muted">Agrega productos para ver tu total.</p>
            `;
            return;
        }

        list.innerHTML = items.map(({ item, product }) => `
            <article class="cart-item">
                <div class="cart-item-left">
                    <div class="cart-item-art">
                        <img class="product-photo" src="${M.escapeHTML(M.imagePath(product))}"
                             alt="${M.escapeHTML(product.name)}" loading="lazy">
                    </div>
                    <div>
                        <a href="detalle.html?id=${encodeURIComponent(product.id)}">
                            <h3>${M.escapeHTML(product.name)}</h3>
                        </a>
                        <p class="small muted">${M.escapeHTML(product.category)}</p>
                        <strong>${M.money(product.price)}</strong>
                    </div>
                </div>
                <div class="cart-item-controls">
                    <button class="qty-btn" type="button" data-cart-change="-1"
                            data-id="${M.escapeHTML(product.id)}" aria-label="Quitar una unidad">−</button>
                    <strong>${item.qty}</strong>
                    <button class="qty-btn" type="button" data-cart-change="1"
                            data-id="${M.escapeHTML(product.id)}" aria-label="Agregar una unidad">+</button>
                    <button class="btn-danger small-button" type="button"
                            data-cart-remove="${M.escapeHTML(product.id)}">Eliminar</button>
                </div>
            </article>
        `).join('');

        const total = items.reduce((sum, { item, product }) => sum + item.qty * product.price, 0);
        const quantity = items.reduce((sum, { item }) => sum + item.qty, 0);
        summary.innerHTML = `
            <h3>Resumen de compra</h3>
            <div class="summary-row"><span>Subtotal (${quantity} unidades)</span><span>${M.money(total)}</span></div>
            <div class="summary-row"><span>Envío</span><span>Por calcular</span></div>
            <div class="summary-row summary-total"><span>Total estimado</span><span>${M.money(total)}</span></div>
            <button id="continue-checkout" class="button full checkout-button" type="button">Continuar compra</button>
            <a class="btn-secondary full" href="productos.html">Seguir comprando</a>
        `;
    }

    list.addEventListener('click', event => {
        const change = event.target.closest('[data-cart-change]');
        const remove = event.target.closest('[data-cart-remove]');
        if (!change && !remove) return;

        let cart = M.getCart();
        if (remove) {
            cart = cart.filter(item => item.id !== remove.dataset.cartRemove);
        } else {
            const item = cart.find(product => product.id === change.dataset.id);
            if (!item) return;
            item.qty = Math.max(0, item.qty + Number(change.dataset.cartChange));
            cart = cart.filter(product => product.qty > 0);
        }
        M.setCart(cart);
    });

    summary.addEventListener('click', event => {
        if (event.target.closest('#continue-checkout')) {
            // Feedback funcional sin simular un cobro ni confirmar un pedido inexistente.
            M.toast('La compra en línea aún no está disponible.');
        }
    });

    window.addEventListener('market:change', render);
    render();
})();
