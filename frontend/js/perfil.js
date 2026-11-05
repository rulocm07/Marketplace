/* =======================================================
   Perfil de usuario: consulta y edición de datos.
   ======================================================= */
(() => {
    'use strict';
    if (document.body.dataset.page !== 'profile') return;

    const M = window.Market;
    const root = document.getElementById('profile-root');
    const session = M.getSession();

    if (!session || session.role !== 'user') {
        root.innerHTML = `
            <div class="empty">
                <strong>Inicia sesión para ver tu perfil</strong>
                <button class="button" type="button" data-auth="login">Iniciar sesión</button>
            </div>
        `;
        return;
    }

    function render() {
        const active = M.getSession();
        if (!active) {
            location.href = 'index.html';
            return;
        }
        const profile = M.getProfiles()[active.email] || {};
        root.innerHTML = `
            <div class="profile-layout">
                <aside class="panel">
                    <div class="profile-card-header">
                        <div class="avatar">${M.escapeHTML(active.name[0]?.toUpperCase() || 'U')}</div>
                        <div>
                            <strong>${M.escapeHTML(active.name)}</strong>
                            <div class="small muted">Cuenta de usuario</div>
                        </div>
                    </div>
                    <nav class="profile-menu" aria-label="Menú de usuario">
                        <a href="#mis-datos">Mis datos</a>
                        <a href="favoritos.html">Mis favoritos (${M.getFavs().length})</a>
                        <a href="carrito.html">Mi carrito</a>
                        <a href="productos.html">Explorar productos</a>
                        <button type="button" class="btn-ghost" data-action="logout">Cerrar sesión</button>
                    </nav>
                </aside>
                <section class="panel" id="mis-datos">
                    <h2>Mi perfil</h2>
                    <p class="muted">Consulta o modifica tus datos personales.</p>
                    <form id="profile-form" class="form-grid">
                        <div class="field">
                            <label for="profile-name">Nombre completo</label>
                            <input id="profile-name" required maxlength="80"
                                   value="${M.escapeHTML(profile.name || active.name)}">
                        </div>
                        <div class="field">
                            <label for="profile-email">Correo electrónico</label>
                            <input id="profile-email" type="email" readonly
                                   value="${M.escapeHTML(active.email)}">
                        </div>
                        <div class="field">
                            <label for="profile-phone">Teléfono (opcional)</label>
                            <input id="profile-phone" autocomplete="tel" maxlength="30"
                                   value="${M.escapeHTML(profile.phone || '')}">
                        </div>
                        <div class="field">
                            <label for="profile-city">Ciudad (opcional)</label>
                            <input id="profile-city" maxlength="100"
                                   value="${M.escapeHTML(profile.city || '')}">
                        </div>
                        <div class="span-2">
                            <button class="button" type="submit">Guardar cambios</button>
                        </div>
                    </form>
                </section>
            </div>
        `;

        document.getElementById('profile-form').addEventListener('submit', event => {
            event.preventDefault();
            const name = document.getElementById('profile-name').value.trim();
            const phone = document.getElementById('profile-phone').value.trim();
            const city = document.getElementById('profile-city').value.trim();
            if (!name) return;

            const profiles = M.getProfiles();
            profiles[active.email] = { ...profiles[active.email], email: active.email, name, phone, city };
            M.setProfiles(profiles);
            M.setSession({ ...active, name });
            M.toast('Perfil guardado.');
            render();
        });
    }

    render();
})();
