/**
 * ==============================================================================
 * ARCHIVO: assets/cookie-handler.js
 * DESCRIPCIÓN: Gestor Lógico de Consentimiento.
 * FUNCIONES:
 * 1. Portero de Scripts: Inyecta GTM y otros scripts SOLO si hay permiso.
 * 2. Gestión de Sesión: Genera ID anónimo y verifica caducidad.
 * 3. Comunicación API: Envía los logs al backend de forma segura.
 * ==============================================================================
 */

(function() {
    'use strict';
  
    // ==========================================================================
    // 1. CONFIGURACIÓN
    // ==========================================================================
    const CONFIG = {
      API_ENDPOINT: '/api/consent',         // Endpoint del backend
      CONSENT_VERSION: 'v1.0',              // Versión de la política (útil para invalidar caches)
      SESSION_ID_KEY: 'hakiu_consent_sid',  // Key localStorage para ID de sesión
      DATA_KEY: 'hakiu_consent_data',       // Key localStorage para categorías aceptadas
      GTM_ID: 'GTM-KDSZ98QV'                // ID de Google Tag Manager (Hakiu)
    };
  
    // ==========================================================================
    // 2. GESTIÓN DE SCRIPTS (EL "PORTERO")
    // ==========================================================================
  
    /**
     * Inyecta el snippet de Google Tag Manager (GTM) en el head.
     * Esta función contiene el código estándar de Google, adaptado para carga dinámica.
     */
    function loadGoogleTagManager() {
      // Evitar doble inyección si el usuario pulsa aceptar varias veces
      if (window.googleTagManagerLoaded) return;
      
      console.log('[Hakiu Cookies] 🟢 Inyectando Google Tag Manager...');
      
      (function(w,d,s,l,i){
          w[l]=w[l]||[];
          w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
          var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),
              dl=l!='dataLayer'?'&l='+l:'';
          j.async=true;
          j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
          f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer', CONFIG.GTM_ID);
  
      window.googleTagManagerLoaded = true;
    }
  
    /**
     * Activa los scripts de terceros según las categorías que el usuario aceptó.
     * @param {Object} categories - { analytics: boolean, marketing: boolean, ... }
     */
    function enableScripts(categories) {
        if (categories.analytics) {
            loadGoogleTagManager();
            // Futuro: Aquí cargaríamos Hotjar, Clarity, etc.
        }
        
        if (categories.marketing) {
            // Futuro: Aquí cargaríamos Pixel de Facebook, LinkedIn, etc.
            // console.log('Cargando scripts de marketing...');
        }
    }
  
    // ==========================================================================
    // 3. UTILIDADES DE SESIÓN
    // ==========================================================================
  
    /**
     * Genera un UUID v4 para identificar la sesión del navegador.
     * Usa crypto.randomUUID si está disponible, o un fallback matemático.
     */
    function generateUUID() {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
          return crypto.randomUUID();
      }
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
    }
  
    /**
     * Obtiene el ID de sesión del localStorage o crea uno nuevo.
     * Este ID es anónimo y persistente por dispositivo.
     */
    function getOrCreateSessionId() {
      let sessionId = localStorage.getItem(CONFIG.SESSION_ID_KEY);
      if (!sessionId) {
        sessionId = generateUUID();
        localStorage.setItem(CONFIG.SESSION_ID_KEY, sessionId);
      }
      return sessionId;
    }
  
    /**
     * Verifica si el consentimiento guardado ha caducado (12 meses).
     * @returns {Object|null} Las categorías aceptadas si son válidas, o null si caducó.
     */
    function checkExpiration() {
      const storedData = localStorage.getItem(CONFIG.DATA_KEY);
      if (!storedData) return null; // No hay datos previos
  
      try {
        const parsed = JSON.parse(storedData);
        const expiresAt = new Date(parsed.expires_at);
        
        // Si la fecha actual es mayor a la de expiración
        if (new Date() > expiresAt) {
          console.info('[Hakiu Cookies] El consentimiento ha caducado. Solicitando renovación.');
          localStorage.removeItem(CONFIG.DATA_KEY); // Borrar datos locales
          window.location.reload(); // Recargar para mostrar el banner de nuevo
          return null;
        }
        return parsed.accepted_categories;
      } catch (e) {
        // Si el JSON está corrupto, borramos y empezamos de cero
        return null;
      }
    }
  
    // ==========================================================================
    // 4. COMUNICACIÓN CON BACKEND
    // ==========================================================================
  
    /**
     * Envía el log de consentimiento a la API y guarda en local.
     * @param {Object} categories - Categorías aceptadas.
     * @param {string} method - Método de consentimiento ('banner_accept', 'settings_updated').
     */
    async function sendToBackend(categories, method) {
      const sessionId = getOrCreateSessionId();
      
      // CAPTURAR HONEYPOT: Buscamos el campo 'website' inyectado por el banner.
      // Si el banner no ha cargado aún, enviamos cadena vacía.
      const honeypotVal = document.getElementById('website')?.value || '';
  
      // 1. Guardar localmente INMEDIATAMENTE (UX rápida)
      const localData = {
        accepted_categories: categories,
        saved_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // +1 año
      };
      localStorage.setItem(CONFIG.DATA_KEY, JSON.stringify(localData));

      // 2. Activar scripts INMEDIATAMENTE
      enableScripts(categories);
  
      // 3. Enviar a la API en segundo plano
      try {
        await fetch(CONFIG.API_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            accepted_categories: categories,
            consent_version: CONFIG.CONSENT_VERSION,
            consent_method: method,
            page_url: window.location.href,
            website: honeypotVal // Enviamos lo que haya en el campo trampa
          }),
          keepalive: true // Permite que la petición termine aunque el usuario cambie de página
        });
      } catch (error) {
        console.error('[Hakiu Cookies] Error enviando log a API:', error);
        // No bloqueamos la UX aunque la API falle
      }
    }
  
    // ==========================================================================
    // 5. INICIALIZACIÓN
    // ==========================================================================
    
    // A. Al cargar la página: ¿Tenemos consentimiento válido previo?
    const savedCategories = checkExpiration();
    if (savedCategories) {
        // Sí: Activar scripts silenciosamente (sin mostrar banner)
        enableScripts(savedCategories);
    }
  
    // B. Escuchar eventos del Banner (CookieControl.*)
    // Estos eventos los dispara el archivo cookie-banner.js
    window.addEventListener('CookieControl.consent', e => sendToBackend(e.detail, 'banner_accept'));
    window.addEventListener('CookieControl.update', e => sendToBackend(e.detail, 'settings_updated'));
  
    // console.log('[Hakiu Cookies] Handler inicializado.');
  
})();