/**
 * UI MANAGER FOR AUTHENTICATION
 * Se encarga de la parte visual: Modales, Botones y Formularios.
 * Depende de: assets/auth.js (window.hakiuAuth)
 * Actualizado: Iconify + Fix Z-Index + Click Outside
 */

// 1. INYECCIÓN DEL MODAL EN EL HTML
function initAuthUI() {
    if (document.getElementById('auth-modal')) return; // Evitar duplicados

    // FIX: z-[9999] para asegurar que esté encima de todo
    // FIX: Iconify en lugar de FontAwesome
    const modalsHTML = `
        <div id="auth-modal" class="modal-overlay hidden fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 transition-opacity duration-300">
            <!-- Click outside handler se añade via JS al overlay -->
            <div class="modal-container bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md p-6 relative shadow-2xl transform transition-all scale-100" onclick="event.stopPropagation()">
                
                <!-- Botón Cerrar Corregido -->
                <button onclick="closeAuthModal()" class="modal-close absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1">
                    <iconify-icon icon="mdi:close" class="text-2xl"></iconify-icon>
                </button>
                
                <!-- LOGIN FORM -->
                <div id="login-form" class="auth-form">
                    <div class="text-center mb-6">
                        <div class="w-12 h-12 bg-sky-500/20 rounded-lg flex items-center justify-center mx-auto mb-3 text-sky-400">
                            <iconify-icon icon="mdi:account-lock" class="text-2xl"></iconify-icon>
                        </div>
                        <h2 class="text-2xl font-bold text-white">Iniciar Sesión</h2>
                        <p class="text-slate-400 text-sm">Accede a tu progreso en Hakiu</p>
                    </div>

                    <div id="login-error" class="error-message hidden bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm text-center flex items-center justify-center gap-2">
                        <iconify-icon icon="mdi:alert-circle"></iconify-icon>
                        <span id="login-error-text"></span>
                    </div>
                    
                    <form onsubmit="handleLogin(event)" class="space-y-4">
                        <div class="form-group">
                            <label class="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Email</label>
                            <input type="email" id="login-email" required class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all placeholder-slate-600" placeholder="tu@email.com">
                        </div>
                        <div class="form-group">
                            <label class="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Contraseña</label>
                            <input type="password" id="login-password" required class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all placeholder-slate-600" placeholder="••••••••">
                        </div>
                        <button type="submit" class="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2.5 rounded-lg transition-all shadow-lg shadow-sky-900/20 hover:shadow-sky-500/20 active:scale-[0.98] flex items-center justify-center gap-2">
                            <iconify-icon icon="mdi:login"></iconify-icon>
                            <span>Entrar</span>
                        </button>
                    </form>
                    
                    <div class="mt-6 pt-6 border-t border-slate-800 text-center">
                        <p class="text-sm text-slate-400">
                            ¿No tienes cuenta? <button onclick="switchToRegister()" class="text-sky-400 hover:text-sky-300 font-medium hover:underline ml-1">Regístrate gratis</button>
                        </p>
                    </div>
                </div>
                
                <!-- REGISTER FORM -->
                <div id="register-form" class="auth-form hidden">
                     <div class="text-center mb-6">
                        <div class="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mx-auto mb-3 text-emerald-400">
                            <iconify-icon icon="mdi:account-plus" class="text-2xl"></iconify-icon>
                        </div>
                        <h2 class="text-2xl font-bold text-white">Crear Cuenta</h2>
                        <p class="text-slate-400 text-sm">Comienza tu carrera en ciberseguridad</p>
                    </div>

                    <div id="register-error" class="error-message hidden bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm text-center flex items-center justify-center gap-2">
                        <iconify-icon icon="mdi:alert-circle"></iconify-icon>
                        <span id="register-error-text"></span>
                    </div>
                    <div id="register-success" class="success-message hidden bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-lg mb-4 text-sm text-center flex items-center justify-center gap-2">
                        <iconify-icon icon="mdi:check-circle"></iconify-icon>
                        <span>¡Cuenta creada! Revisa tu email.</span>
                    </div>
                    
                    <form onsubmit="handleRegister(event)" class="space-y-4">
                        <div class="form-group">
                            <label class="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Email</label>
                            <input type="email" id="register-email" required class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all" placeholder="tu@email.com">
                        </div>
                        <div class="form-group">
                            <label class="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Contraseña</label>
                            <input type="password" id="register-password" required class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all" minlength="6" placeholder="Mínimo 6 caracteres">
                        </div>
                        <button type="submit" class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-lg transition-all shadow-lg shadow-emerald-900/20 hover:shadow-emerald-500/20 active:scale-[0.98] flex items-center justify-center gap-2">
                            <iconify-icon icon="mdi:rocket-launch"></iconify-icon>
                            <span>Crear Cuenta</span>
                        </button>
                    </form>

                    <div class="mt-6 pt-6 border-t border-slate-800 text-center">
                        <p class="text-sm text-slate-400">
                            ¿Ya tienes cuenta? <button onclick="switchToLogin()" class="text-sky-400 hover:text-sky-300 font-medium hover:underline ml-1">Inicia sesión</button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalsHTML);

    // FIX: Click Outside Logic (Cerrar al hacer click en el fondo)
    const overlay = document.getElementById('auth-modal');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeAuthModal();
            }
        });
    }
}

// 2. FUNCIONES GLOBALES (Control de Modal)
window.openAuthModal = () => {
    const modal = document.getElementById('auth-modal');
    if(modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Evitar scroll del body
    }
};

window.closeAuthModal = () => {
    const modal = document.getElementById('auth-modal');
    if(modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = ''; // Restaurar scroll
    }
};

window.switchToRegister = () => {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
    document.getElementById('register-error').classList.add('hidden');
}

window.switchToLogin = () => {
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('login-error').classList.add('hidden');
}

// 3. HANDLERS (Conectan con auth.js)
window.handleLogin = async (e) => {
    e.preventDefault();
    if (!window.hakiuAuth) return console.error("Auth Logic not loaded");

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const btn = e.target.querySelector('button[type="submit"]');
    
    // Guardar contenido original (icono + texto)
    const originalContent = btn.innerHTML;
    
    // Loading state UI (Iconify animate-spin)
    btn.disabled = true;
    btn.innerHTML = `
        <iconify-icon icon="mdi:loading" class="animate-spin text-xl"></iconify-icon>
        <span>Entrando...</span>
    `;

    const result = await window.hakiuAuth.signIn(email, password);
    
    if (result.success) {
        closeAuthModal();
        updateUserMenu();
    } else {
        const errorDiv = document.getElementById('login-error');
        const errorText = document.getElementById('login-error-text');
        errorText.textContent = "Credenciales incorrectas o error de conexión.";
        errorDiv.classList.remove('hidden');
    }
    
    // Reset UI
    btn.disabled = false;
    btn.innerHTML = originalContent;
}

window.handleRegister = async (e) => {
    e.preventDefault();
    if (!window.hakiuAuth) return;

    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const btn = e.target.querySelector('button[type="submit"]');
    const originalContent = btn.innerHTML;

    btn.disabled = true;
    btn.innerHTML = `
        <iconify-icon icon="mdi:loading" class="animate-spin text-xl"></iconify-icon>
        <span>Creando...</span>
    `;

    const result = await window.hakiuAuth.signUp(email, password);
    
    if (result.success) {
        const successDiv = document.getElementById('register-success');
        successDiv.classList.remove('hidden');
        document.getElementById('register-error').classList.add('hidden');
        setTimeout(() => { switchToLogin(); successDiv.classList.add('hidden'); }, 2000);
    } else {
        const errorDiv = document.getElementById('register-error');
        const errorText = document.getElementById('register-error-text');
        errorText.textContent = result.error || "Error al registrarse.";
        errorDiv.classList.remove('hidden');
    }

    btn.disabled = false;
    btn.innerHTML = originalContent;
}

// 4. ACTUALIZACIÓN DE BOTONES (Desktop y Mobile)
window.updateUserMenu = () => {
    const authButtons = document.querySelectorAll('.auth-btn-dynamic');
    const user = window.hakiuAuth?.user;

    authButtons.forEach(btn => {
        if (user) {
            // ESTADO: LOGUEADO
            const shortEmail = user.email.length > 20 ? user.email.substring(0, 18) + '...' : user.email;
            btn.innerHTML = `
                <iconify-icon icon="mdi:account-circle" class="mr-2 text-lg"></iconify-icon>
                <span>${shortEmail}</span>
            `;
            
            // Comportamiento: Logout
            btn.onclick = () => {
                if(confirm("¿Cerrar sesión?")) {
                    window.hakiuAuth.signOut();
                }
            };
            
            // Estilo visual
            btn.classList.remove('bg-sky-600', 'hover:bg-sky-500');
            btn.classList.add('bg-slate-700', 'hover:bg-slate-600', 'border', 'border-slate-600');
            
        } else {
            // ESTADO: NO LOGUEADO
            btn.innerHTML = `
                <iconify-icon icon="mdi:login" class="mr-2"></iconify-icon>
                <span>Iniciar Sesión</span>
            `;
            
            // Comportamiento: Login
            btn.onclick = () => {
                openAuthModal();
                // Cerrar menú móvil si está abierto
                const mobileMenu = document.getElementById('mobile-menu');
                if (mobileMenu && !mobileMenu.classList.contains('max-h-0')) {
                   document.getElementById('mobile-menu-btn').click();
                }
            };
            
            // Estilo visual
            btn.classList.add('bg-sky-600', 'hover:bg-sky-500');
            btn.classList.remove('bg-slate-700', 'hover:bg-slate-600', 'border', 'border-slate-600');
        }
    });
}

// 5. INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', () => {
    initAuthUI();
    if (window.hakiuAuth) updateUserMenu();
    
    // Escuchar el evento que emite auth.js
    window.addEventListener('authStateChanged', updateUserMenu);
});

// Fallback por si el script carga tarde
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initAuthUI();
    if (window.hakiuAuth) updateUserMenu();
}