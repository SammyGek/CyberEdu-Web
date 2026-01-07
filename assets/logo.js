/**
 * HAKIU LOGO MODULE
 * Contiene el SVG del logo y la lógica de animación persistente.
 * * Fusionado con lógica de: HAKIU LOGO ANIMATION - UX Enhancements
 * Características preservadas:
 * - OPCIÓN A+C: Randomización + Persistencia de Estado
 * - Primera visita: Delays aleatorios (0-10s)
 * - Navegación: Continúa desde donde se quedó
 * - Timeout: 30s de inactividad = reset
 */

(function() {
    'use strict';

    // 1. DEFINICIÓN DEL SVG (Tu diseño original con todos los comentarios)
    const LOGO_SVG_CONTENT = `
    <svg 
        viewBox="0 0 8385 1555" 
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        class="logo-hakiu w-24 h-6 md:w-32 md:h-8 lg:w-40 lg:h-10"
        aria-label="Hakiu Logo"
        style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
        
        <defs>
            <style>
                /* ANIMACIONES ASÍNCRONAS POR FILA */
                
                /* FILA 1: Loop 6s */
                @keyframes blockLoadRow1 {
                    0% { fill: #216678; opacity: 0.4; }
                    3% { fill: #227281; opacity: 0.43; }
                    6% { fill: #23788a; opacity: 0.46; }
                    9% { fill: #247e93; opacity: 0.49; }
                    12% { fill: #25849c; opacity: 0.52; }
                    15% { fill: #288aa2; opacity: 0.58; }
                    18% { fill: #2c8fa8; opacity: 0.65; }
                    21% { fill: #3095ae; opacity: 0.72; }
                    24% { fill: #349bb4; opacity: 0.79; }
                    27% { fill: #38a1ba; opacity: 0.86; }
                    30% { fill: #3ca7c0; opacity: 0.90; }
                    33% { fill: #40adc6; opacity: 0.93; }
                    36% { fill: #44dff6; opacity: 0.95; }
                    60% { fill: #44dff6; opacity: 0.95; }
                    70% { fill: #44dff6; opacity: 0.95; }
                    73% { fill: #40adc6; opacity: 0.90; }
                    76% { fill: #3ca1ba; opacity: 0.83; }
                    79% { fill: #389bb4; opacity: 0.76; }
                    82% { fill: #3495ae; opacity: 0.70; }
                    85% { fill: #2f8fa8; opacity: 0.65; }
                    88% { fill: #2b89a2; opacity: 0.60; }
                    91% { fill: #27839c; opacity: 0.55; }
                    94% { fill: #247d93; opacity: 0.50; }
                    97% { fill: #22778a; opacity: 0.45; }
                    100% { fill: #216678; opacity: 0.4; }
                }
                
                /* FILA 2: Loop 8.5s */
                @keyframes blockLoadRow2 {
                    0% { fill: #216678; opacity: 0.4; }
                    3% { fill: #227281; opacity: 0.43; }
                    6% { fill: #23788a; opacity: 0.46; }
                    9% { fill: #247e93; opacity: 0.49; }
                    12% { fill: #25849c; opacity: 0.52; }
                    15% { fill: #288aa2; opacity: 0.58; }
                    18% { fill: #2c8fa8; opacity: 0.65; }
                    21% { fill: #3095ae; opacity: 0.72; }
                    24% { fill: #349bb4; opacity: 0.79; }
                    27% { fill: #38a1ba; opacity: 0.86; }
                    30% { fill: #3ca7c0; opacity: 0.90; }
                    33% { fill: #40adc6; opacity: 0.93; }
                    36% { fill: #44dff6; opacity: 0.95; }
                    62% { fill: #44dff6; opacity: 0.95; }
                    72% { fill: #44dff6; opacity: 0.95; }
                    75% { fill: #40adc6; opacity: 0.90; }
                    78% { fill: #3ca1ba; opacity: 0.83; }
                    81% { fill: #389bb4; opacity: 0.76; }
                    84% { fill: #3495ae; opacity: 0.70; }
                    87% { fill: #2f8fa8; opacity: 0.65; }
                    90% { fill: #2b89a2; opacity: 0.60; }
                    93% { fill: #27839c; opacity: 0.55; }
                    96% { fill: #247d93; opacity: 0.50; }
                    98% { fill: #22778a; opacity: 0.45; }
                    100% { fill: #216678; opacity: 0.4; }
                }
                
                /* FILA 3: Loop 10s */
                @keyframes blockLoadRow3 {
                    0% { fill: #216678; opacity: 0.4; }
                    3% { fill: #227281; opacity: 0.43; }
                    6% { fill: #23788a; opacity: 0.46; }
                    9% { fill: #247e93; opacity: 0.49; }
                    12% { fill: #25849c; opacity: 0.52; }
                    15% { fill: #288aa2; opacity: 0.58; }
                    18% { fill: #2c8fa8; opacity: 0.65; }
                    21% { fill: #3095ae; opacity: 0.72; }
                    24% { fill: #349bb4; opacity: 0.79; }
                    27% { fill: #38a1ba; opacity: 0.86; }
                    30% { fill: #3ca7c0; opacity: 0.90; }
                    33% { fill: #40adc6; opacity: 0.93; }
                    36% { fill: #44dff6; opacity: 0.95; }
                    65% { fill: #44dff6; opacity: 0.95; }
                    75% { fill: #44dff6; opacity: 0.95; }
                    78% { fill: #40adc6; opacity: 0.90; }
                    81% { fill: #3ca1ba; opacity: 0.83; }
                    84% { fill: #389bb4; opacity: 0.76; }
                    87% { fill: #3495ae; opacity: 0.70; }
                    90% { fill: #2f8fa8; opacity: 0.65; }
                    93% { fill: #2b89a2; opacity: 0.60; }
                    95% { fill: #27839c; opacity: 0.55; }
                    97% { fill: #247d93; opacity: 0.50; }
                    99% { fill: #22778a; opacity: 0.45; }
                    100% { fill: #216678; opacity: 0.4; }
                }
                
                /* Base para todos los bloques */
                .block-animated {
                    fill: #216678;
                    opacity: 0.4;
                    will-change: fill, opacity;
                }
                
                /* FILA 1 - 4 bloques */
                #block-r1-c1 { animation: blockLoadRow1 6s linear infinite; animation-delay: 0s; }
                #block-r1-c2 { animation: blockLoadRow1 6s linear infinite; animation-delay: 0s; }
                #block-r1-c3 { animation: blockLoadRow1 6s linear infinite; animation-delay: 0s; }
                #block-r1-c4 { animation: blockLoadRow1 6s linear infinite; animation-delay: 0s; }
                
                /* FILA 2 - 7 bloques */
                #block-r2-c1 { animation: blockLoadRow2 8.5s linear infinite; animation-delay: 0s; }
                #block-r2-c2 { animation: blockLoadRow2 8.5s linear infinite; animation-delay: 0s; }
                #block-r2-c3 { animation: blockLoadRow2 8.5s linear infinite; animation-delay: 0s; }
                #block-r2-c4 { animation: blockLoadRow2 8.5s linear infinite; animation-delay: 0s; }
                #block-r2-c5 { animation: blockLoadRow2 8.5s linear infinite; animation-delay: 0s; }
                #block-r2-c6 { animation: blockLoadRow2 8.5s linear infinite; animation-delay: 0s; }
                #block-r2-c7 { animation: blockLoadRow2 8.5s linear infinite; animation-delay: 0s; }
                
                /* FILA 3 - 9 bloques */
                #block-r3-c1 { animation: blockLoadRow3 10s linear infinite; animation-delay: 0s; }
                #block-r3-c2 { animation: blockLoadRow3 10s linear infinite; animation-delay: 0s; }
                #block-r3-c3 { animation: blockLoadRow3 10s linear infinite; animation-delay: 0s; }
                #block-r3-c4 { animation: blockLoadRow3 10s linear infinite; animation-delay: 0s; }
                #block-r3-c5 { animation: blockLoadRow3 10s linear infinite; animation-delay: 0s; }
                #block-r3-c6 { animation: blockLoadRow3 10s linear infinite; animation-delay: 0s; }
                #block-r3-c7 { animation: blockLoadRow3 10s linear infinite; animation-delay: 0s; }
                #block-r3-c8 { animation: blockLoadRow3 10s linear infinite; animation-delay: 0s; }
                #block-r3-c9 { animation: blockLoadRow3 10s linear infinite; animation-delay: 0s; }
            </style>
        </defs>
        
        <g id="Banner-default">
            <g id="Texto">
                <path d="M7219.053,125.243c-18.13,-0.642 -141.501,10.281 -139.976,135.818c1.222,100.568 94.819,133.046 140.669,133.739c45.85,0.693 139.078,-33.328 139.283,-131.661c0.269,-129.158 -117.692,-137.108 -139.976,-137.897Z" style="fill:#fff;"/>
                <path d="M8165.11,1286.942c-0.089,-0.122 4.992,-0.464 4.992,-0.464l0,126.512l214.033,0l0,-909.381l-222.03,0c0,0 11.802,475.681 0,536.395c-11.216,57.696 -25.99,175.625 -210.388,192.823c-185.311,17.283 -213.5,-175.671 -213.5,-175.671l0,-553.546l-217.448,0c-0.515,204.001 -3.493,368.318 1.128,618.552c-0.722,36.946 107.141,415.534 522.302,267.211c49.048,-17.523 121,-102.307 120.911,-102.429Z" style="fill:#fefefe;"/>
                <path d="M6154.105,141.214l217.265,0l0,745.421l336.919,-383.007l270.859,0l-386.835,429.021l425.514,480.341l-292.98,0l-353.559,-408.575l0,403.924l-217.39,0l0.207,-1267.125Z" style="fill:#fcfefd;"/>
                <clipPath id="_clip1">
                    <path d="M6154.105,141.214l217.265,0l0,745.421l336.919,-383.007l270.859,0l-386.835,429.021l425.514,480.341l-292.98,0l-353.559,-408.575l0,403.924l-217.39,0l0.207,-1267.125Z"/>
                </clipPath>
                <g clip-path="url(#_clip1)">
                    <path d="M6153.959,141.012l0,480.409l217.357,217.357l0,-697.872l-217.357,0.106Z" style="fill:#26cbe1;"/>
                </g>
                <path d="M7108.214,503.608l217.765,0l0,909.381l-217.848,0l0.083,-909.381Z" style="fill:#fdfffe;"/>
                <path d="M4021.502,178.109l-225.964,0.284l0,1225.543l225.783,0.45l0,-516.68l594.719,0l0,520.633l226.077,0l0,-1230.041l-221.411,0l0,500.27l-599.204,0l0,-500.459Z" style="fill:#fefefe;"/>
                <path d="M5341.899,1422.122c-363.713,-83.535 -350.933,-454.36 -350.933,-454.36c0,0 -14.125,-444.307 418.019,-479.506c0,0 215.675,-29.088 335.176,149.423l0,-134.947l214.645,0l0,905.608l-213.891,0l0,-130.838c0,0 -148.492,203.079 -403.017,144.621Zm-127.831,-488.233c0,0 -22.398,299.789 268.776,296.343c285.767,-3.382 270.499,-286.005 270.499,-286.005c-20.675,-270.499 -265.33,-270.499 -265.33,-270.499c-279.114,0 -273.945,260.161 -273.945,260.161Z" style="fill:#fefefe;"/>
            </g>
            
            <g id="Bloques">
                <!-- FILA 1 (Y=0) - 4 bloques -->
                <rect id="block-r1-c1" class="block-animated" x="1742.214" y="0" width="280.548" height="398.806"/>
                <rect id="block-r1-c2" class="block-animated" x="2119.363" y="0" width="273.017" height="397.004"/>
                <rect id="block-r1-c3" class="block-animated" x="2496.735" y="0" width="272.138" height="397.004"/>
                <rect id="block-r1-c4" class="block-animated" x="2871.682" y="0" width="273.42" height="397.004"/>
                
                <!-- FILA 2 (Y≈568-569) - 7 bloques -->
                <rect id="block-r2-c1" class="block-animated" x="616.15" y="568.841" width="272.778" height="397.65"/>
                <rect id="block-r2-c2" class="block-animated" x="991.873" y="568.841" width="272.503" height="397.65"/>
                <rect id="block-r2-c3" class="block-animated" x="1367.609" y="568.841" width="272.643" height="397.65"/>
                <rect id="block-r2-c4" class="block-animated" x="1742.214" y="568.841" width="272.777" height="397.65"/>
                <rect id="block-r2-c5" class="block-animated" x="2119.363" y="569.863" width="273.017" height="398.998"/>
                <rect id="block-r2-c6" class="block-animated" x="2495.386" y="568.841" width="273.488" height="398.998"/>
                <rect id="block-r2-c7" class="block-animated" x="2871.412" y="568.841" width="273.69" height="398.998"/>
                
                <!-- FILA 3 (Y≈1155) - 9 bloques -->
                <rect id="block-r3-c1" class="block-animated" x="0" y="1155.206" width="136.71" height="398.998"/>
                <rect id="block-r3-c2" class="block-animated" x="240.056" y="1155.206" width="273.368" height="397.65"/>
                <rect id="block-r3-c3" class="block-animated" x="616.15" y="1155.206" width="272.778" height="397.65"/>
                <rect id="block-r3-c4" class="block-animated" x="991.253" y="1155.206" width="273.123" height="397.65"/>
                <rect id="block-r3-c5" class="block-animated" x="1367.609" y="1155.206" width="272.643" height="397.65"/>
                <rect id="block-r3-c6" class="block-animated" x="1742.214" y="1155.206" width="272.777" height="397.65"/>
                <rect id="block-r3-c7" class="block-animated" x="2119.363" y="1155.206" width="273.017" height="397.65"/>
                <rect id="block-r3-c8" class="block-animated" x="2479.197" y="1155.206" width="289.677" height="397.65"/>
                <rect id="block-r3-c9" class="block-animated" x="2871.412" y="1155.206" width="273.42" height="397.65"/>
            </g>
        </g>
    </svg>
    `;

    // 2. CONFIGURACIÓN DE ANIMACIÓN
    /* === CONFIGURACIÓN === */
    const CONFIG = {
        STORAGE_KEY: 'hakiu_logo_state',
        SESSION_DURATION: 30000, // 30 segundos (30000ms)
        MAX_RANDOM_DELAY: 10,    // Máximo delay aleatorio (segundos)
        SELECTOR: '.block-animated',
        CONTAINER_ID: 'hakiu-logo-container'
    };

    // 3. FUNCIONES DE LÓGICA (Estado y Animación)
    /* === FUNCIONES DE ESTADO === */

    /**
     * Obtener estado guardado de sessionStorage
     * @returns {Object|null} Estado guardado o null si no existe/expiró
     */
    function getSavedState() {
        try {
            const saved = sessionStorage.getItem(CONFIG.STORAGE_KEY);
            if (!saved) return null;
            
            const data = JSON.parse(saved);
            const elapsed = Date.now() - data.timestamp;

            // Si pasó mucho tiempo, considera como "nueva sesión"
            if (elapsed > CONFIG.SESSION_DURATION) {
                sessionStorage.removeItem(CONFIG.STORAGE_KEY);
                return null;
            }
            return data;
        } catch (e) { 
            console.warn('[Hakiu Logo] Error al leer estado guardado:', e);
            return null; 
        }
    }

    /**
     * Guardar estado actual en sessionStorage
     * @param {Array<number>} delays - Array de delays en segundos
     */
    function saveState(delays) {
        try {
            sessionStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify({
                delays: delays,
                timestamp: Date.now()
            }));
        } catch (e) { console.warn('[Hakiu Logo] Error al guardar estado:', e); }
    }

    /* === LÓGICA DE ANIMACIÓN === */
    
    /**
     * Aplicar delays a los bloques del logo
     */
    function applyDelays() {
        const blocks = document.querySelectorAll(CONFIG.SELECTOR);
        if (blocks.length === 0) {
            console.warn('[Hakiu Logo] No se encontraron bloques con clase .block-animated');
            return;
        }

        const savedState = getSavedState();
        const delays = [];

        blocks.forEach((block, index) => {
            let delay;
            
            // Lógica expandida para preservar comentarios
            if (savedState && savedState.delays && savedState.delays[index] !== undefined) {
                // CASO 1: Continuar desde estado guardado
                const savedDelay = savedState.delays[index];
                const elapsed = (Date.now() - savedState.timestamp) / 1000;
                const duration = parseFloat(window.getComputedStyle(block).animationDuration) || 0;
                
                if (duration > 0) {
                    // Calcular nuevo delay (continuando la animación)
                    delay = (savedDelay - elapsed) % duration;
                    if (delay < 0) delay += duration;
                } else {
                    console.warn('[Hakiu Logo] Duración de animación inválida para bloque:', block.id);
                    delay = 0;
                }
            } else {
                // CASO 2: Primera visita - Delay completamente aleatorio
                delay = Math.random() * CONFIG.MAX_RANDOM_DELAY;
            }
            
            block.style.animationDelay = delay + 's';
            delays.push(delay);
        });
        
        // Guardar nuevos delays
        saveState(delays);
        console.log(`[Hakiu Logo] Delays aplicados a ${blocks.length} bloques`);
    }

    function updateStateBeforeUnload() {
        const blocks = document.querySelectorAll(CONFIG.SELECTOR);
        if (blocks.length === 0) return;
        const delays = Array.from(blocks).map(block => {
            const delay = parseFloat(block.style.animationDelay);
            return isNaN(delay) ? 0 : delay;
        });
        saveState(delays);
    }

    // 4. FUNCIÓN PRINCIPAL DE RENDERIZADO
    function renderAndInit() {
        const container = document.getElementById(CONFIG.CONTAINER_ID);
        if (container) {
            // A) Inyectar el SVG
            container.innerHTML = LOGO_SVG_CONTENT;
            
            // B) Iniciar lógica de animación
            applyDelays();
            
            // Actualizar estado antes de salir
            window.addEventListener('beforeunload', updateStateBeforeUnload);
            
            // Actualizar estado también al ocultar la página (mobile Safari)
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) updateStateBeforeUnload();
            });
        }
    }

    // 5. INICIALIZACIÓN
    /* === INICIALIZACIÓN === */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderAndInit);
    } else {
        renderAndInit();
    }

    // 6. API PÚBLICA (Restaurada)
    /* === API PÚBLICA (opcional, para debugging) === */
    window.HakiuLogo = {
        resetAnimation: function() {
            sessionStorage.removeItem(CONFIG.STORAGE_KEY);
            applyDelays();
            console.log('[Hakiu Logo] Animación reiniciada');
        },
        getState: function() {
            return getSavedState();
        },
        config: CONFIG
    };

})();