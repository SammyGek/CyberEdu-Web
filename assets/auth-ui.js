/**
 * UI MANAGER FOR AUTHENTICATION
 * Version: 5.0 (Full Registration Data - Fixed & Commented)
 * - Nombre y Apellidos obligatorios
 * - País obligatorio
 * - Verificación Edad (+14)
 * - Checks Legales Separados
 */

// 1. INYECCIÓN DEL MODAL EN EL HTML
// Esta función crea dinámicamente el modal de autenticación si no existe.
function initAuthUI() {
    if (document.getElementById('auth-modal')) return;

    const modalsHTML = `
        <div id="auth-modal" class="modal-overlay hidden fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 transition-opacity duration-300">
            <div class="modal-container bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg p-6 relative shadow-2xl transform transition-all scale-100 max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
                
                <!-- Botón Cerrar -->
                <button onclick="closeAuthModal()" class="modal-close absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1 z-10">
                    <iconify-icon icon="mdi:close" class="text-2xl"></iconify-icon>
                </button>
                
                <!-- LOGIN FORM (Simple) -->
                <!-- Formulario de inicio de sesión estándar -->
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
                
                <!-- REGISTER FORM (COMPLETO) -->
                <!-- Formulario de registro ampliado con validaciones legales y de edad -->
                <div id="register-form" class="auth-form hidden">
                     <div class="text-center mb-4">
                        <h2 class="text-2xl font-bold text-white">Crear Cuenta</h2>
                        <p class="text-slate-400 text-sm">Únete a la comunidad profesional</p>
                    </div>

                    <div id="register-error" class="error-message hidden bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm text-center flex items-center justify-center gap-2">
                        <iconify-icon icon="mdi:alert-circle"></iconify-icon>
                        <span id="register-error-text"></span>
                    </div>
                    <div id="register-success" class="success-message hidden bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-lg mb-4 text-sm text-center flex items-center justify-center gap-2">
                        <iconify-icon icon="mdi:check-circle"></iconify-icon>
                        <span>¡Cuenta creada! Revisa tu email.</span>
                    </div>
                    
                    <form onsubmit="handleRegister(event)" class="space-y-3">
                        
                        <!-- 1. Credenciales -->
                        <div class="form-group">
                            <label class="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Email <span class="text-red-400">*</span></label>
                            <input type="email" id="register-email" required class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none">
                        </div>
                        
                        <div class="form-group">
                            <label class="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Contraseña (Min 8) <span class="text-red-400">*</span></label>
                            <input type="password" id="register-password" required minlength="8" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" placeholder="********">
                        </div>

                        <!-- 2. Identidad (Fila Doble) -->
                        <div class="grid grid-cols-2 gap-3">
                            <div class="form-group">
                                <label class="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Nombre <span class="text-red-400">*</span></label>
                                <input type="text" id="register-firstname" required class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none">
                            </div>
                            <div class="form-group">
                                <label class="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Apellidos <span class="text-red-400">*</span></label>
                                <input type="text" id="register-lastname" required class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none">
                            </div>
                        </div>

                        <!-- 3. Alias (Opcional) -->
                        <div class="form-group">
                            <label class="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Username (Alias)</label>
                            <input type="text" id="register-username" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Ej: NeoHacker">
                        </div>

                        <!-- 4. Datos Demográficos (Fila Doble) -->
                        <div class="grid grid-cols-2 gap-3">
                            <div class="form-group">
                                <label class="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Nacimiento <span class="text-red-400">*</span></label>
                                <input type="date" id="register-dob" required class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none appearance-none" style="color-scheme: dark;">
                            </div>
                            <div class="form-group">
                                <label class="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">País <span class="text-red-400">*</span></label>
                                <select id="register-country" required class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none">
                                    <option value="">Seleccionar...</option>
                                    <option value="ES">🇪🇸 España</option>
                                    <option value="MX">🇲🇽 México</option>
                                    <option value="AR">🇦🇷 Argentina</option>
                                    <option value="CO">🇨🇴 Colombia</option>
                                    <option value="CL">🇨🇱 Chile</option>
                                    <option value="PE">🇵🇪 Perú</option>
                                    <option value="US">🇺🇸 Estados Unidos</option>
                                    <option value="OTHER">🌍 Otro</option>
                                </select>
                            </div>
                        </div>

                        <!-- 5. Marketing (Opcional) -->
                        <div class="form-group">
                             <label class="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">¿Cómo nos conociste?</label>
                             <select id="register-referral" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm">
                                <option value="">(Opcional)</option>
                                <option value="google">Buscador (Google/Bing)</option>
                                <option value="social">Redes Sociales</option>
                                <option value="friend">Recomendación</option>
                                <option value="youtube">YouTube</option>
                                <option value="other">Otro</option>
                            </select>
                        </div>

                        <!-- 6. Checks Legales -->
                        <div class="space-y-2 mt-4 pt-2 border-t border-slate-800">
                            <label class="flex items-start gap-2 cursor-pointer group">
                                <input type="checkbox" id="check-terms" required class="mt-1 w-4 h-4 rounded bg-slate-800 border-slate-600 text-emerald-500 focus:ring-emerald-500">
                                <span class="text-xs text-slate-400 group-hover:text-slate-300">
                                    Acepto los <a href="/legal/terminos.html" target="_blank" class="text-emerald-400 hover:underline">Términos y Condiciones</a> <span class="text-red-400">*</span>
                                </span>
                            </label>
                            
                            <label class="flex items-start gap-2 cursor-pointer group">
                                <input type="checkbox" id="check-privacy" required class="mt-1 w-4 h-4 rounded bg-slate-800 border-slate-600 text-emerald-500 focus:ring-emerald-500">
                                <span class="text-xs text-slate-400 group-hover:text-slate-300">
                                    Acepto la <a href="/legal/privacidad.html" target="_blank" class="text-emerald-400 hover:underline">Política de Privacidad</a> <span class="text-red-400">*</span>
                                </span>
                            </label>

                            <label class="flex items-start gap-2 cursor-pointer group">
                                <input type="checkbox" id="check-marketing" class="mt-1 w-4 h-4 rounded bg-slate-800 border-slate-600 text-emerald-500 focus:ring-emerald-500">
                                <span class="text-xs text-slate-400 group-hover:text-slate-300">
                                    Quiero recibir novedades, ofertas y consejos de seguridad. (Opcional)
                                </span>
                            </label>
                        </div>

                        <button type="submit" class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-lg transition-all shadow-lg shadow-emerald-900/20 hover:shadow-emerald-500/20 active:scale-[0.98] flex items-center justify-center gap-2 mt-4">
                            <iconify-icon icon="mdi:rocket-launch"></iconify-icon>
                            <span>Crear Cuenta</span>
                        </button>
                    </form>

                    <div class="mt-4 pt-4 border-t border-slate-800 text-center">
                        <p class="text-sm text-slate-400">
                            ¿Ya tienes cuenta? <button onclick="switchToLogin()" class="text-sky-400 hover:text-sky-300 font-medium hover:underline ml-1">Inicia sesión</button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalsHTML);

    const overlay = document.getElementById('auth-modal');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeAuthModal();
        });
    }
}

// 2. FUNCIONES GLOBALES (Control de Modal y Scroll)
window.openAuthModal = () => {
    const modal = document.getElementById('auth-modal');
    if(modal) {
        modal.classList.remove('hidden');
        // Fix agresivo para evitar scroll
        document.body.style.setProperty('overflow', 'hidden', 'important');
    }
};

window.closeAuthModal = () => {
    const modal = document.getElementById('auth-modal');
    if(modal) modal.classList.add('hidden');
    // Restaurar scroll de forma robusta
    document.body.style.setProperty('overflow', 'auto', 'important');
    document.body.style.removeProperty('overflow');
    document.body.classList.remove('overflow-hidden', 'menu-open');
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

// Handler de Inicio de Sesión
window.handleLogin = async (e) => {
    e.preventDefault();
    if (!window.hakiuAuth) return;

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const btn = e.target.querySelector('button[type="submit"]');
    const originalContent = btn.innerHTML;
    
    // UI de carga
    btn.disabled = true;
    btn.innerHTML = `<iconify-icon icon="mdi:loading" class="animate-spin text-xl"></iconify-icon><span>Entrando...</span>`;

    const result = await window.hakiuAuth.signIn(email, password);
    
    if (result.success) {
        closeAuthModal();
        updateUserMenu();
    } else {
        const errorDiv = document.getElementById('login-error');
        document.getElementById('login-error-text').textContent = "Credenciales incorrectas o error de conexión.";
        errorDiv.classList.remove('hidden');
    }
    btn.disabled = false;
    btn.innerHTML = originalContent;
}

// Handler de Registro (Validaciones Críticas)
window.handleRegister = async (e) => {
    e.preventDefault();
    if (!window.hakiuAuth) return;

    // 3.1. Obtener valores del formulario
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    
    const firstName = document.getElementById('register-firstname').value;
    const lastName = document.getElementById('register-lastname').value;
    const username = document.getElementById('register-username').value;
    const dobValue = document.getElementById('register-dob').value;
    const country = document.getElementById('register-country').value;
    const referral = document.getElementById('register-referral').value;

    const termsOk = document.getElementById('check-terms').checked;
    const privacyOk = document.getElementById('check-privacy').checked;
    const marketingOk = document.getElementById('check-marketing').checked;
    
    const errorDiv = document.getElementById('register-error');
    const errorText = document.getElementById('register-error-text');
    errorDiv.classList.add('hidden');

    // 3.2. Validaciones previas
    
    // Campos vacíos (Aunque HTML tiene required, doble check)
    if (!firstName || !lastName || !country) {
        errorText.textContent = "Por favor, completa todos los campos obligatorios.";
        errorDiv.classList.remove('hidden');
        return;
    }

    // Validación de Edad (Lógica Crítica +14)
    if (!dobValue) {
        errorText.textContent = "Fecha de nacimiento requerida.";
        errorDiv.classList.remove('hidden');
        return;
    }
    const birthDate = new Date(dobValue);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;

    if (age < 14) {
        errorText.textContent = "Es necesario el consentimiento de tus padres para poder crear un usuario y navegar por la web. Por favor, pide a un adulto que te ayude.";
        errorDiv.classList.remove('hidden');
        return;
    }

    // Checks Legales
    if (!termsOk || !privacyOk) {
        errorText.textContent = "Debes aceptar los Términos y la Política de Privacidad.";
        errorDiv.classList.remove('hidden');
        return;
    }

    // 3.3. Envío de datos al Backend
    const btn = e.target.querySelector('button[type="submit"]');
    const originalContent = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<iconify-icon icon="mdi:loading" class="animate-spin text-xl"></iconify-icon><span>Creando perfil...</span>`;

    // Estructuramos los metadatos para Supabase
    const metaData = {
        first_name: firstName,
        last_name: lastName,
        username: username || '',
        birthdate: dobValue,
        country: country,
        referral_source: referral || '',
        app_version: 'v1.0',
        registered_at: new Date().toISOString(),
        locale: 'es_ES',
        
        // Objeto de consentimientos
        agreements: {
            terms: true,
            privacy: true,
            marketing: marketingOk
        }
    };

    const result = await window.hakiuAuth.signUp(email, password, metaData);
    
    if (result.success) {
        const successDiv = document.getElementById('register-success');
        successDiv.classList.remove('hidden');
        // Ocultar form para que no le den click de nuevo
        document.querySelector('#register-form form').classList.add('hidden');
        
        setTimeout(() => { 
            switchToLogin(); 
            successDiv.classList.add('hidden');
            // Restaurar form por si quieren registrar otro
            document.querySelector('#register-form form').classList.remove('hidden');
        }, 4000);
    } else {
        errorText.textContent = result.error || "Error al registrarse. Intenta de nuevo.";
        errorDiv.classList.remove('hidden');
    }

    btn.disabled = false;
    btn.innerHTML = originalContent;
}

// 4. ACTUALIZACIÓN DE BOTONES
// Actualiza el menú de usuario según el estado de autenticación
window.updateUserMenu = () => {
    const authButtons = document.querySelectorAll('.auth-btn-dynamic');
    const user = window.hakiuAuth?.user;

    authButtons.forEach(btn => {
        if (user) {
            // Preferir nombre o username del perfil, si no, email
            let displayName = user.email;
            
            // Si tenemos el perfil cargado (gracias a initAuth actualizado)
            if (window.hakiuAuth.profile && window.hakiuAuth.profile.first_name) {
                displayName = window.hakiuAuth.profile.first_name;
            } else if (user.user_metadata?.first_name) {
                displayName = user.user_metadata.first_name;
            } else if (user.email.length > 15) {
                displayName = user.email.substring(0, 12) + '...';
            }
            
            btn.innerHTML = `<iconify-icon icon="mdi:account-circle" class="mr-2 text-lg"></iconify-icon><span>${displayName}</span>`;
            btn.onclick = () => { if(confirm("¿Cerrar sesión?")) window.hakiuAuth.signOut(); };
            btn.classList.remove('bg-sky-600', 'hover:bg-sky-500');
            btn.classList.add('bg-slate-700', 'hover:bg-slate-600', 'border', 'border-slate-600');
        } else {
            btn.innerHTML = `<iconify-icon icon="mdi:login" class="mr-2"></iconify-icon><span>Iniciar Sesión</span>`;
            btn.onclick = () => { openAuthModal(); const m = document.getElementById('mobile-menu'); if(m && !m.classList.contains('max-h-0')) document.getElementById('mobile-menu-btn').click(); };
            btn.classList.add('bg-sky-600', 'hover:bg-sky-500');
            btn.classList.remove('bg-slate-700', 'hover:bg-slate-600', 'border', 'border-slate-600');
        }
    });
}

// 5. INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', () => {
    initAuthUI();
    if (window.hakiuAuth) updateUserMenu();
    window.addEventListener('authStateChanged', updateUserMenu);
});

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initAuthUI();
    if (window.hakiuAuth) updateUserMenu();
}