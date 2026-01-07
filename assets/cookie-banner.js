/**
 * ==============================================================================
 * ARCHIVO: assets/cookie-banner.js
 * DESCRIPCIÓN: UI del Banner de Cookies (Reemplazo nativo de Silktide).
 * FUNCIONALIDAD:
 * 1. Renderiza el HTML del banner con Tailwind CSS.
 * 2. Inyecta el campo Honeypot CAMUFLADO (#website) para seguridad anti-bot.
 * 3. Gestiona la lógica visual de Aceptar/Rechazar/Configurar.
 * 4. Comunica las acciones al 'cookie-handler.js' mediante eventos del DOM.
 * ==============================================================================
 */

(function() {
    'use strict';

    // ==========================================================================
    // 1. CONFIGURACIÓN VISUAL Y TEXTOS
    // ==========================================================================
    const CONFIG = {
        TEXT: {
            TITLE: "🍪 Control de Privacidad",
            DESCRIPTION: "Usamos cookies para mejorar tu experiencia en Hakiu y analizar el tráfico. Puedes aceptar todas o ajustar tus preferencias.",
            ACCEPT_ALL: "Aceptar todas",
            REJECT_ALL: "Solo necesarias",
            SETTINGS: "Configurar",
            SAVE: "Guardar preferencias"
        },
        STYLES: {
            // Contenedor principal: Fijo abajo, fondo oscuro, borde superior, sombra suave.
            // Inicialmente desplazado hacia abajo (translate-y-full) para animar la entrada.
            BANNER: "fixed bottom-0 left-0 right-0 bg-slate-950 border-t border-slate-800 p-4 md:p-6 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] z-50 transition-transform duration-500 ease-in-out transform translate-y-full",
            
            // Clase para hacer visible el banner (deslizar hacia arriba)
            BANNER_VISIBLE: "translate-y-0",
            
            // Botones: Estilos base de Tailwind (Sky para primario, Slate para secundario)
            BUTTON_PRIMARY: "bg-sky-500 hover:bg-sky-400 text-white font-bold py-2 px-4 rounded transition-colors text-sm",
            BUTTON_SECONDARY: "bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2 px-4 rounded border border-slate-700 transition-colors text-sm",
            BUTTON_TEXT: "text-slate-400 hover:text-sky-400 text-sm font-medium transition-colors underline decoration-slate-600 underline-offset-4"
        }
    };

    // ==========================================================================
    // 2. SEGURIDAD: HONEYPOT CAMUFLADO
    // ==========================================================================
    /**
     * Inyecta un campo de input invisible llamado "website".
     * ESTRATEGIA:
     * - Nombre: "website" (parece legítimo para un bot).
     * - Visibilidad: Oculto por CSS absoluto (no display:none, para engañar a bots listos).
     * - Propósito: Si este campo llega con texto al backend, sabemos que es un BOT.
     */
    function injectHoneypot() {
        const input = document.createElement('input');
        input.type = 'text';     // Tipo text para parecer un campo normal
        input.id = 'website';    // ID genérico
        input.name = 'website';  // Nombre genérico atractivo para bots
        input.tabIndex = -1;     // Sacarlo de la navegación por teclado (Accesibilidad)
        input.setAttribute('autocomplete', 'off'); // Evitar autocompletado del navegador
        input.setAttribute('aria-hidden', 'true'); // Ocultarlo a lectores de pantalla
        
        // Estilos para hacerlo invisible al ojo humano
        input.style.position = 'absolute';
        input.style.left = '-9999px';
        input.style.opacity = '0';
        input.style.height = '0';
        input.style.width = '0';
        input.style.pointerEvents = 'none';

        document.body.appendChild(input);
        // console.debug('[Cookie Banner] Honeypot injected.');
    }

    // ==========================================================================
    // 3. RENDERIZADO DEL BANNER
    // ==========================================================================
    /**
     * Crea los elementos del DOM y los añade a la página.
     * Solo se ejecuta si no existe consentimiento previo en localStorage.
     */
    function renderBanner() {
        // Chequeo de seguridad: Si ya hay datos guardados, no mostramos nada.
        // La key 'hakiu_consent_data' la gestiona el cookie-handler.js
        if (localStorage.getItem('hakiu_consent_data')) {
            return; 
        }

        const banner = document.createElement('div');
        banner.id = 'hakiu-cookie-banner';
        banner.className = CONFIG.STYLES.BANNER;

        // Estructura HTML interna (Tailwind)
        banner.innerHTML = `
            <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
                <!-- Texto descriptivo -->
                <div class="flex-1">
                    <h3 class="text-sky-400 font-bold mb-1 flex items-center gap-2">
                        <i class="fas fa-shield-halved"></i> ${CONFIG.TEXT.TITLE}
                    </h3>
                    <p class="text-slate-300 text-sm leading-relaxed">
                        ${CONFIG.TEXT.DESCRIPTION}
                        <a href="/cookies-policy" class="text-sky-400 hover:underline ml-1">Leer política</a>.
                    </p>
                </div>
                
                <!-- Botones Principales -->
                <div class="flex flex-wrap gap-3 justify-center md:justify-end shrink-0">
                    <button id="btn-settings" class="${CONFIG.STYLES.BUTTON_TEXT}">
                        ${CONFIG.TEXT.SETTINGS}
                    </button>
                    <button id="btn-reject" class="${CONFIG.STYLES.BUTTON_SECONDARY}">
                        ${CONFIG.TEXT.REJECT_ALL}
                    </button>
                    <button id="btn-accept" class="${CONFIG.STYLES.BUTTON_PRIMARY}">
                        ${CONFIG.TEXT.ACCEPT_ALL}
                    </button>
                </div>
            </div>
            
            <!-- Panel de Configuración Avanzada (Oculto por defecto) -->
            <div id="cookie-settings-panel" class="hidden mt-6 pt-6 border-t border-slate-800 animate-fade-in">
                <div class="grid md:grid-cols-2 gap-4 text-sm text-slate-300 mb-6">
                    <!-- Opción 1: Necesarias (Siempre activas) -->
                    <label class="flex items-start gap-3 p-3 bg-slate-900/50 rounded border border-slate-800 cursor-not-allowed opacity-75">
                        <input type="checkbox" checked disabled class="mt-1 accent-sky-500">
                        <div>
                            <span class="block font-bold text-slate-200">Necesarias</span>
                            <span class="text-xs text-slate-400">Esenciales para que la web funcione (Sesión, Seguridad).</span>
                        </div>
                    </label>
                    
                    <!-- Opción 2: Analíticas -->
                    <label class="flex items-start gap-3 p-3 bg-slate-900 rounded border border-slate-700 cursor-pointer hover:border-sky-500/50 transition-colors">
                        <input type="checkbox" id="chk-analytics" class="mt-1 accent-sky-500 w-4 h-4">
                        <div>
                            <span class="block font-bold text-slate-200">Analíticas</span>
                            <span class="text-xs text-slate-400">Nos ayudan a mejorar entendiendo cómo usas la web (Google Analytics).</span>
                        </div>
                    </label>
                    
                    <!-- Opción 3: Marketing -->
                    <label class="flex items-start gap-3 p-3 bg-slate-900 rounded border border-slate-700 cursor-pointer hover:border-sky-500/50 transition-colors">
                        <input type="checkbox" id="chk-marketing" class="mt-1 accent-sky-500 w-4 h-4">
                        <div>
                            <span class="block font-bold text-slate-200">Marketing</span>
                            <span class="text-xs text-slate-400">Para mostrarte contenido relevante de nuestros cursos.</span>
                        </div>
                    </label>
                </div>
                
                <!-- Botón Guardar Configuración -->
                <div class="text-right">
                    <button id="btn-save-settings" class="${CONFIG.STYLES.BUTTON_PRIMARY}">
                        ${CONFIG.TEXT.SAVE}
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(banner);

        // Animación de entrada: Pequeño delay para que el navegador procese el CSS transition
        setTimeout(() => {
            banner.classList.add('translate-y-0');
            banner.classList.remove('translate-y-full');
        }, 100);

        // Activar listeners de los botones
        attachEventListeners();
    }

    // ==========================================================================
    // 4. LÓGICA DE EVENTOS (LISTENERS)
    // ==========================================================================
    function attachEventListeners() {
        const banner = document.getElementById('hakiu-cookie-banner');
        
        // --- BOTÓN: ACEPTAR TODO ---
        document.getElementById('btn-accept').addEventListener('click', () => {
            closeBanner();
            dispatchConsent({
                necessary: true,
                analytics: true,
                marketing: true
            });
        });

        // --- BOTÓN: RECHAZAR (SOLO NECESARIAS) ---
        document.getElementById('btn-reject').addEventListener('click', () => {
            closeBanner();
            dispatchConsent({
                necessary: true,
                analytics: false,
                marketing: false
            });
        });

        // --- BOTÓN: CONFIGURAR (ABRIR PANEL) ---
        document.getElementById('btn-settings').addEventListener('click', () => {
            const panel = document.getElementById('cookie-settings-panel');
            panel.classList.toggle('hidden');
        });

        // --- BOTÓN: GUARDAR PREFERENCIAS ---
        document.getElementById('btn-save-settings').addEventListener('click', () => {
            // Leer estado de los checkboxes
            const analytics = document.getElementById('chk-analytics').checked;
            const marketing = document.getElementById('chk-marketing').checked;
            
            closeBanner();
            dispatchConsent({
                necessary: true,
                analytics: analytics,
                marketing: marketing
            });
        });
    }

    /**
     * Cierra el banner con una animación de deslizamiento hacia abajo.
     * Elimina el elemento del DOM al terminar la animación.
     */
    function closeBanner() {
        const banner = document.getElementById('hakiu-cookie-banner');
        if (!banner) return;

        banner.classList.remove('translate-y-0');
        banner.classList.add('translate-y-full');

        // Esperar 500ms (duración de transition CSS) antes de borrar
        setTimeout(() => {
            banner.remove();
        }, 500);
    }

    /**
     * Envía un evento personalizado que el 'cookie-handler.js' está escuchando.
     * @param {Object} categories - Objeto con las categorías aceptadas.
     */
    function dispatchConsent(categories) {
        // Disparar evento estándar 'CookieControl.consent'
        const event = new CustomEvent('CookieControl.consent', {
            detail: categories
        });
        window.dispatchEvent(event);
    }

    // ==========================================================================
    // 5. INICIALIZACIÓN
    // ==========================================================================
    // Asegurarse de que el DOM está listo antes de inyectar nada
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            injectHoneypot();
            renderBanner();
        });
    } else {
        injectHoneypot();
        renderBanner();
    }

})();