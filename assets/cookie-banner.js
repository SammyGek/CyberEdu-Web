/**
 * ==============================================================================
 * ARCHIVO: assets/cookie-banner.js
 * DESCRIPCIÓN: UI del Banner de Cookies (Reemplazo nativo de Silktide).
 * FUNCIONALIDAD:
 * 1. Renderiza el HTML del banner con Tailwind CSS.
 * 2. Inyecta el campo Honeypot (#website_url) para seguridad.
 * 3. Gestiona la lógica de Aceptar/Rechazar/Configurar.
 * 4. Comunica las acciones al 'cookie-handler.js' mediante eventos custom.
 * ==============================================================================
 */

(function() {
    'use strict';

    const CONFIG = {
        // Colores y textos configurables
        TEXT: {
            TITLE: "🍪 Control de Privacidad",
            DESCRIPTION: "Usamos cookies para mejorar tu experiencia en Hakiu y analizar el tráfico. Puedes aceptar todas o ajustar tus preferencias.",
            ACCEPT_ALL: "Aceptar todas",
            REJECT_ALL: "Solo necesarias",
            SETTINGS: "Configurar",
            SAVE: "Guardar preferencias"
        },
        STYLES: {
            // Clases Tailwind para el contenedor principal
            BANNER: "fixed bottom-0 left-0 right-0 bg-slate-950 border-t border-slate-800 p-4 md:p-6 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] z-50 transition-transform duration-500 ease-in-out transform translate-y-full",
            BANNER_VISIBLE: "translate-y-0",
            BUTTON_PRIMARY: "bg-sky-500 hover:bg-sky-400 text-white font-bold py-2 px-4 rounded transition-colors text-sm",
            BUTTON_SECONDARY: "bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2 px-4 rounded border border-slate-700 transition-colors text-sm",
            BUTTON_TEXT: "text-slate-400 hover:text-sky-400 text-sm font-medium transition-colors underline decoration-slate-600 underline-offset-4"
        }
    };

    /**
     * Inyecta el campo trampa (Honeypot) en el DOM.
     * Es invisible para humanos, pero los bots tontos lo rellenarán.
     */
    function injectHoneypot() {
        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'website_url'; // El ID que busca nuestra API
        input.name = 'website_url';
        input.tabIndex = -1;
        input.setAttribute('autocomplete', 'off');
        input.setAttribute('aria-hidden', 'true');
        
        // Estilos para hacerlo invisible sin usar display:none (que algunos bots detectan)
        input.style.position = 'absolute';
        input.style.left = '-9999px';
        input.style.opacity = '0';
        input.style.height = '0';
        input.style.width = '0';
        input.style.pointerEvents = 'none';

        document.body.appendChild(input);
        console.log('[Cookie Banner] Honeypot injected.');
    }

    /**
     * Crea y muestra el banner en el DOM.
     */
    function renderBanner() {
        // Verificar si ya existe consentimiento previo (leyendo la key del handler)
        if (localStorage.getItem('hakiu_consent_data')) {
            return; // Ya aceptó/rechazó, no molestamos.
        }

        const banner = document.createElement('div');
        banner.id = 'hakiu-cookie-banner';
        banner.className = CONFIG.STYLES.BANNER;

        banner.innerHTML = `
            <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
                <div class="flex-1">
                    <h3 class="text-sky-400 font-bold mb-1 flex items-center gap-2">
                        <i class="fas fa-shield-halved"></i> ${CONFIG.TEXT.TITLE}
                    </h3>
                    <p class="text-slate-300 text-sm leading-relaxed">
                        ${CONFIG.TEXT.DESCRIPTION}
                        <a href="/legal/cookies" class="text-sky-400 hover:underline ml-1">Leer política</a>.
                    </p>
                </div>
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
            
            <!-- Panel de Configuración (Oculto por defecto) -->
            <div id="cookie-settings-panel" class="hidden mt-6 pt-6 border-t border-slate-800 animate-fade-in">
                <div class="grid md:grid-cols-2 gap-4 text-sm text-slate-300 mb-6">
                    <label class="flex items-start gap-3 p-3 bg-slate-900/50 rounded border border-slate-800 cursor-not-allowed opacity-75">
                        <input type="checkbox" checked disabled class="mt-1 accent-sky-500">
                        <div>
                            <span class="block font-bold text-slate-200">Necesarias</span>
                            <span class="text-xs text-slate-400">Esenciales para que la web funcione (Sesión, Seguridad).</span>
                        </div>
                    </label>
                    <label class="flex items-start gap-3 p-3 bg-slate-900 rounded border border-slate-700 cursor-pointer hover:border-sky-500/50 transition-colors">
                        <input type="checkbox" id="chk-analytics" class="mt-1 accent-sky-500 w-4 h-4">
                        <div>
                            <span class="block font-bold text-slate-200">Analíticas</span>
                            <span class="text-xs text-slate-400">Nos ayudan a mejorar entendiendo cómo usas la web.</span>
                        </div>
                    </label>
                    <label class="flex items-start gap-3 p-3 bg-slate-900 rounded border border-slate-700 cursor-pointer hover:border-sky-500/50 transition-colors">
                        <input type="checkbox" id="chk-marketing" class="mt-1 accent-sky-500 w-4 h-4">
                        <div>
                            <span class="block font-bold text-slate-200">Marketing</span>
                            <span class="text-xs text-slate-400">Para mostrarte contenido relevante de nuestros cursos.</span>
                        </div>
                    </label>
                </div>
                <div class="text-right">
                    <button id="btn-save-settings" class="${CONFIG.STYLES.BUTTON_PRIMARY}">
                        ${CONFIG.TEXT.SAVE}
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(banner);

        // Pequeño delay para la animación de entrada
        setTimeout(() => {
            banner.classList.add('translate-y-0');
            banner.classList.remove('translate-y-full');
        }, 100);

        attachEventListeners();
    }

    /**
     * Asigna lógica a los botones.
     */
    function attachEventListeners() {
        const banner = document.getElementById('hakiu-cookie-banner');
        
        // Botón: Aceptar Todo
        document.getElementById('btn-accept').addEventListener('click', () => {
            closeBanner();
            dispatchConsent({
                necessary: true,
                analytics: true,
                marketing: true
            });
        });

        // Botón: Rechazar (Solo necesarias)
        document.getElementById('btn-reject').addEventListener('click', () => {
            closeBanner();
            dispatchConsent({
                necessary: true,
                analytics: false,
                marketing: false
            });
        });

        // Botón: Configurar (Toggle panel)
        document.getElementById('btn-settings').addEventListener('click', () => {
            const panel = document.getElementById('cookie-settings-panel');
            panel.classList.toggle('hidden');
        });

        // Botón: Guardar Configuración Personalizada
        document.getElementById('btn-save-settings').addEventListener('click', () => {
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
     * Cierra el banner con animación y lo elimina del DOM.
     */
    function closeBanner() {
        const banner = document.getElementById('hakiu-cookie-banner');
        if (!banner) return;

        banner.classList.remove('translate-y-0');
        banner.classList.add('translate-y-full');

        // Eliminar del DOM tras la animación CSS (500ms)
        setTimeout(() => {
            banner.remove();
        }, 500);
    }

    /**
     * Dispara el evento que escucha 'cookie-handler.js'.
     * @param {Object} categories - Las categorías aceptadas.
     */
    function dispatchConsent(categories) {
        // Disparar evento estándar para que nuestro handler lo capture
        const event = new CustomEvent('CookieControl.consent', {
            detail: categories
        });
        window.dispatchEvent(event);
        
        console.log('[Cookie Banner] Preferencias guardadas y evento disparado.');
    }

    // INICIALIZACIÓN
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