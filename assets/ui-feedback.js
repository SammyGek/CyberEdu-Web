/**
 * ==============================================================================
 * ARCHIVO: assets/ui-feedback.js (Anteriormente cookie-banner.js)
 * PROYECTO: Hakiu.es
 * DESCRIPCIÓN: UI del Sistema de Preferencias de Privacidad.
 * * ESTRATEGIA ANTI-BLOQUEO (ADBLOCKERS):
 * 1. Nombres Genéricos: Usamos 'ui-feedback', 'app-ui-layer', 'core-data'.
 * Evitamos palabras como 'cookie', 'banner', 'consent', 'tracking'.
 * 2. Terminología UI: Los botones dicen "Core", "Feedback", no "Cookies".
 * 3. Honeypot: Inyectamos un campo trampa para bots llamado 'website'.
 * ==============================================================================
 */

(function() {
    'use strict';

    // ==========================================================================
    // 1. CONFIGURACIÓN VISUAL Y TEXTOS
    // ==========================================================================
    const UI_CONFIG = {
        TEXT: {
            TITLE: "🛡️ Control de Privacidad",
            DESCRIPTION: "Usamos tecnología para mejorar tu experiencia en Hakiu y analizar el tráfico. Tú controlas tus datos.",
            ACCEPT_ALL: "Aceptar todo",
            REJECT_ALL: "Solo necesario",
            SETTINGS: "Personalizar",
            SAVE: "Guardar cambios"
        },
        IDS: {
            // ID del contenedor principal. Usamos un nombre genérico de UI.
            // Si usamos 'cookie-banner', los AdBlockers lo ocultan automáticamente.
            CONTAINER: "app-ui-layer", 
            PANEL: "app-settings-panel"
        }
    };

    /**
     * INYECCIÓN DE TRAMPA PARA BOTS (HONEYPOT)
     * --------------------------------------------------------------------------
     * Crea un input invisible llamado 'website'.
     * - Los usuarios humanos no lo ven (CSS oculto).
     * - Los bots tontos lo rellenan pensando que es un campo legítimo.
     * - Si llega con datos al backend, sabemos que es un bot y lo bloqueamos.
     */
    function injectTrap() {
        const input = document.createElement('input');
        input.type = 'text';      // Tipo 'text' para parecer un campo normal
        input.id = 'website';     // ID común en formularios
        input.name = 'website';   // Nombre atractivo para bots
        input.tabIndex = -1;      // Sacar de la navegación por teclado (Accesibilidad)
        input.setAttribute('autocomplete', 'off');
        input.setAttribute('aria-hidden', 'true'); // Ocultar a lectores de pantalla
        
        // Estilos inline para ocultarlo visualmente sin usar display:none
        // (Algunos bots ignoran campos con display:none, así que usamos posición absoluta)
        input.style.cssText = 'position:absolute;left:-9999px;opacity:0;height:0;width:0;pointer-events:none;';
        
        document.body.appendChild(input);
    }

    /**
     * RENDERIZADO DE LA INTERFAZ
     * --------------------------------------------------------------------------
     * Construye el HTML del banner y lo inyecta en el DOM.
     * Solo se ejecuta si el usuario NO tiene preferencias guardadas.
     */
    function renderUI() {
        // Verificar si ya existe la key de preferencias en localStorage
        // Nota: El nombre de la key también es genérico ('hakiu_app_prefs')
        if (localStorage.getItem('hakiu_app_prefs')) return;

        const layer = document.createElement('div');
        layer.id = UI_CONFIG.IDS.CONTAINER;
        
        // Clases Tailwind:
        // - fixed bottom-0: Pegado abajo
        // - z-50: Por encima de todo
        // - translate-y-full: Inicialmente oculto (desplazado abajo) para animar la entrada
        layer.className = "fixed bottom-0 left-0 right-0 bg-slate-950 border-t border-slate-800 p-4 md:p-6 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] z-50 transition-transform duration-500 ease-in-out transform translate-y-full";

        // Estructura HTML interna
        layer.innerHTML = `
            <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
                <!-- Texto descriptivo -->
                <div class="flex-1">
                    <h3 class="text-sky-400 font-bold mb-1 flex items-center gap-2">
                        ${UI_CONFIG.TEXT.TITLE}
                    </h3>
                    <p class="text-slate-300 text-sm leading-relaxed">
                        ${UI_CONFIG.TEXT.DESCRIPTION}
                        <a href="/legal/cookies" class="text-sky-400 hover:underline ml-1">Más info</a>.
                    </p>
                </div>
                
                <!-- Botones Principales -->
                <div class="flex flex-wrap gap-3 justify-center md:justify-end shrink-0">
                    <button id="ui-btn-set" class="text-slate-400 hover:text-sky-400 text-sm font-medium transition-colors underline decoration-slate-600 underline-offset-4">
                        ${UI_CONFIG.TEXT.SETTINGS}
                    </button>
                    <button id="ui-btn-min" class="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2 px-4 rounded border border-slate-700 transition-colors text-sm">
                        ${UI_CONFIG.TEXT.REJECT_ALL}
                    </button>
                    <button id="ui-btn-all" class="bg-sky-500 hover:bg-sky-400 text-white font-bold py-2 px-4 rounded transition-colors text-sm">
                        ${UI_CONFIG.TEXT.ACCEPT_ALL}
                    </button>
                </div>
            </div>
            
            <!-- Panel de Configuración (Oculto por defecto) -->
            <div id="${UI_CONFIG.IDS.PANEL}" class="hidden mt-6 pt-6 border-t border-slate-800 animate-fade-in">
                <div class="grid md:grid-cols-2 gap-4 text-sm text-slate-300 mb-6">
                    
                    <!-- Opción 1: Core (Necesarias) -->
                    <label class="flex items-start gap-3 p-3 bg-slate-900/50 rounded border border-slate-800 cursor-not-allowed opacity-75">
                        <input type="checkbox" checked disabled class="mt-1 accent-sky-500">
                        <div>
                            <span class="block font-bold text-slate-200">Core</span>
                            <span class="text-xs text-slate-400">Funcionalidad básica del sistema.</span>
                        </div>
                    </label>
                    
                    <!-- Opción 2: Analítica (Performance) -->
                    <label class="flex items-start gap-3 p-3 bg-slate-900 rounded border border-slate-700 cursor-pointer hover:border-sky-500/50 transition-colors">
                        <input type="checkbox" id="chk-perf" class="mt-1 accent-sky-500 w-4 h-4">
                        <div>
                            <span class="block font-bold text-slate-200">Analítica</span>
                            <span class="text-xs text-slate-400">Mejora del servicio y métricas.</span>
                        </div>
                    </label>
                    
                    <!-- Opción 3: Promoción (Marketing) -->
                    <label class="flex items-start gap-3 p-3 bg-slate-900 rounded border border-slate-700 cursor-pointer hover:border-sky-500/50 transition-colors">
                        <input type="checkbox" id="chk-mkt" class="mt-1 accent-sky-500 w-4 h-4">
                        <div>
                            <span class="block font-bold text-slate-200">Promoción</span>
                            <span class="text-xs text-slate-400">Contenido relevante para ti.</span>
                        </div>
                    </label>
                </div>
                <div class="text-right">
                    <button id="ui-btn-save" class="bg-sky-500 hover:bg-sky-400 text-white font-bold py-2 px-4 rounded transition-colors text-sm">
                        ${UI_CONFIG.TEXT.SAVE}
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(layer);

        // Animación de entrada: Esperar 100ms para aplicar la clase que lo desliza hacia arriba
        setTimeout(() => { 
            layer.classList.add('translate-y-0'); 
            layer.classList.remove('translate-y-full'); 
        }, 100);

        bindEvents();
    }

    /**
     * ASIGNACIÓN DE EVENTOS
     * --------------------------------------------------------------------------
     * Escucha los clics en los botones y dispara eventos personalizados.
     */
    function bindEvents() {
        // Botón: Aceptar Todo
        document.getElementById('ui-btn-all').addEventListener('click', () => {
            hide(); 
            emit({ necessary: true, analytics: true, marketing: true });
        });

        // Botón: Solo Necesarias (Rechazar)
        document.getElementById('ui-btn-min').addEventListener('click', () => {
            hide(); 
            emit({ necessary: true, analytics: false, marketing: false });
        });

        // Botón: Personalizar (Abrir panel)
        document.getElementById('ui-btn-set').addEventListener('click', () => {
            document.getElementById(UI_CONFIG.IDS.PANEL).classList.toggle('hidden');
        });

        // Botón: Guardar Selección Personalizada
        document.getElementById('ui-btn-save').addEventListener('click', () => {
            const ana = document.getElementById('chk-perf').checked; // Analytics
            const mkt = document.getElementById('chk-mkt').checked;  // Marketing
            hide(); 
            emit({ necessary: true, analytics: ana, marketing: mkt });
        });
    }

    /**
     * OCULTAR INTERFAZ
     * --------------------------------------------------------------------------
     * Anima la salida del banner hacia abajo y lo elimina del DOM.
     */
    function hide() {
        const el = document.getElementById(UI_CONFIG.IDS.CONTAINER);
        if(el) { 
            // Animación CSS: Deslizar hacia abajo
            el.classList.remove('translate-y-0'); 
            el.classList.add('translate-y-full'); 
            // Esperar a que termine la transición (500ms) antes de borrar el nodo
            setTimeout(() => el.remove(), 500); 
        }
    }

    /**
     * COMUNICACIÓN ENTRE MÓDULOS
     * --------------------------------------------------------------------------
     * Dispara un evento personalizado ('Hakiu.pref') que escucha el core-data.js.
     * Usamos nombres de eventos propios para evitar conflictos.
     */
    function emit(data) {
        window.dispatchEvent(new CustomEvent('Hakiu.pref', { detail: data }));
    }

    // INICIALIZACIÓN SEGURA
    // Esperamos a que el DOM esté listo antes de intentar inyectar nada
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => { injectTrap(); renderUI(); });
    } else { 
        injectTrap(); 
        renderUI(); 
    }
})();