/* ============================================================
   HAKIU LOGO ANIMATION - UX Enhancements
   ============================================================
   Características:
   - OPCIÓN A+C: Randomización + Persistencia de Estado
   - Primera visita: Delays aleatorios (0-10s)
   - Navegación: Continúa desde donde se quedó
   - Timeout: 30s de inactividad = reset
   
   Uso:
   1. Incluir logo-animado.svg inline en el HTML
   2. Cargar este script: <script src="assets/logo-animation.js"></script>
   
   Versión: 1.0
   Fecha: Enero 2026
============================================================ */

(function() {
  'use strict';
  
  // ============================================================
  // CONFIGURACIÓN
  // ============================================================
  
  const CONFIG = {
    STORAGE_KEY: 'hakiu_logo_state',
    SESSION_DURATION: 30000, // 30 segundos (30000ms)
    MAX_RANDOM_DELAY: 10,    // Máximo delay aleatorio (segundos)
    SELECTOR: '.block-animated' // Selector de bloques animados
  };
  
  // ============================================================
  // FUNCIONES DE ESTADO
  // ============================================================
  
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
    } catch (error) {
      console.warn('[Hakiu Logo] Error al leer estado guardado:', error);
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
    } catch (error) {
      console.warn('[Hakiu Logo] Error al guardar estado:', error);
    }
  }
  
  // ============================================================
  // LÓGICA DE ANIMACIÓN
  // ============================================================
  
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
      
      if (savedState && savedState.delays && savedState.delays[index] !== undefined) {
        // CASO 1: Continuar desde estado guardado
        const savedDelay = savedState.delays[index];
        const elapsed = (Date.now() - savedState.timestamp) / 1000;
        
        // Obtener duración de la animación del bloque
        const computedStyle = window.getComputedStyle(block);
        const duration = parseFloat(computedStyle.animationDuration);
        
        if (isNaN(duration) || duration === 0) {
          console.warn('[Hakiu Logo] Duración de animación inválida para bloque:', block.id);
          delay = 0;
        } else {
          // Calcular nuevo delay (continuando la animación)
          delay = (savedDelay - elapsed) % duration;
          if (delay < 0) delay += duration;
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
  
  /**
   * Actualizar estado antes de que el usuario salga de la página
   */
  function updateStateBeforeUnload() {
    const blocks = document.querySelectorAll(CONFIG.SELECTOR);
    if (blocks.length === 0) return;
    
    const delays = Array.from(blocks).map(block => {
      const delay = parseFloat(block.style.animationDelay);
      return isNaN(delay) ? 0 : delay;
    });
    
    saveState(delays);
  }
  
  // ============================================================
  // INICIALIZACIÓN
  // ============================================================
  
  /**
   * Inicializar animación del logo
   */
  function init() {
    // Esperar a que el DOM esté completamente cargado
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', applyDelays);
    } else {
      // DOM ya está listo, aplicar inmediatamente
      applyDelays();
    }
    
    // Actualizar estado antes de salir
    window.addEventListener('beforeunload', updateStateBeforeUnload);
    
    // Actualizar estado también al ocultar la página (mobile Safari)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        updateStateBeforeUnload();
      }
    });
  }
  
  // Ejecutar inicialización
  init();
  
  // ============================================================
  // API PÚBLICA (opcional, para debugging)
  // ============================================================
  
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
