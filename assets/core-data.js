/**
 * ==============================================================================
 * ARCHIVO: assets/core-data.js
 * (Anteriormente conocido como cookie-handler.js)
 * * DESCRIPCIÓN: 
 * Gestor Central de Preferencias y Datos del Sistema.
 * Actúa como el "cerebro" lógico que conecta la UI con el Backend y los scripts de terceros.
 * * ESTRATEGIA DE CAMUFLAJE (ANTI-ADBLOCK):
 * 1. Nombre de archivo: 'core-data.js' (Suena a infraestructura esencial).
 * 2. Variables: Usamos 'prefs', 'sid', 'modules' en lugar de 'consent', 'cookie', 'tracking'.
 * 3. Eventos: Escucha 'Hakiu.pref' en lugar de eventos estándar de CMPs.
 * ==============================================================================
 */

(function() {
    'use strict';
  
    // ==========================================================================
    // 1. CONFIGURACIÓN DEL SISTEMA
    // ==========================================================================
    const CONFIG = {
      API_ENDPOINT: '/api/consent',       // Ruta a nuestra API segura en Vercel
      CONSENT_VERSION: 'v1.0',            // Versión de la política (para invalidar caches antiguos)
      SESSION_ID_KEY: 'hakiu_sid',        // Key en localStorage para el ID de sesión anónimo
      DATA_KEY: 'hakiu_app_prefs',        // Key en localStorage para guardar las preferencias
      GTM_ID: 'GTM-KDSZ98QV'              // ID de Google Tag Manager
    };
  
    // ==========================================================================
    // 2. GESTIÓN DE MÓDULOS DE TERCEROS (EL "PORTERO")
    // ==========================================================================
  
    /**
     * Carga dinámica de Google Tag Manager.
     * Contiene el snippet estándar de Google, pero envuelto en una función
     * para que SOLO se ejecute cuando el usuario da permiso.
     */
    function loadGoogleTagManager() {
      // Evitar doble carga si el usuario pulsa aceptar varias veces
      if (window.gtmLoaded) return;
      
      // console.log('[System] Loading analytics core...'); // Debug (comentado en prod)
      
      (function(w,d,s,l,i){
          w[l]=w[l]||[];
          w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
          var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
          j.async=true;
          j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
          f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer', CONFIG.GTM_ID);
  
      window.gtmLoaded = true;
    }
  
    /**
     * Activa los módulos (scripts) según las preferencias del usuario.
     * @param {Object} prefs - Objeto con flags { analytics: bool, marketing: bool }
     */
    function enableModules(prefs) {
        // Si el usuario aceptó analíticas, cargamos GTM
        if (prefs.analytics) loadGoogleTagManager();
        
        // Aquí se pueden añadir más condiciones para otros scripts (Pixel, Hotjar, etc.)
        // if (prefs.marketing) loadMarketingScripts();
    }
  
    // ==========================================================================
    // 3. GESTIÓN DE IDENTIDAD ANÓNIMA
    // ==========================================================================
  
    /**
     * Generador de UUID v4 para identificar la sesión.
     * Usa crypto API si está disponible, o un fallback matemático robusto.
     */
    function generateUUID() {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
    }
  
    /**
     * Obtiene o crea un ID de sesión persistente.
     * Este ID permite al backend contar límites de tasa (Rate Limiting) sin saber quién es el usuario.
     */
    function getSessionId() {
      let sid = localStorage.getItem(CONFIG.SESSION_ID_KEY);
      if (!sid) {
        sid = generateUUID();
        localStorage.setItem(CONFIG.SESSION_ID_KEY, sid);
      }
      return sid;
    }
  
    // ==========================================================================
    // 4. LÓGICA DE PERSISTENCIA Y ESTADO
    // ==========================================================================
  
    /**
     * Verifica el estado actual de las preferencias al cargar la página.
     * Comprueba si existen datos guardados y si no han caducado (12 meses).
     * @returns {Object|null} Las preferencias válidas o null.
     */
    function checkStatus() {
      const stored = localStorage.getItem(CONFIG.DATA_KEY);
      if (!stored) return null; // No hay datos previos
  
      try {
        const parsed = JSON.parse(stored);
        
        // Verificar caducidad
        if (new Date() > new Date(parsed.expires_at)) {
          // Si caducó, borramos todo para forzar que salga el banner de nuevo
          localStorage.removeItem(CONFIG.DATA_KEY);
          return null;
        }
        return parsed.prefs;
      } catch (e) { return null; }
    }
  
    /**
     * FUNCIÓN PRINCIPAL DE SINCRONIZACIÓN (SYNC)
     * --------------------------------------------------------------------------
     * 1. Guarda en LocalStorage (para recordar la decisión).
     * 2. Activa los scripts permitidos (Inyección inmediata).
     * 3. Envía los datos al Backend (API) para registro legal y auditoría.
     * * @param {Object} prefs - Preferencias aceptadas.
     * @param {string} source - Origen del evento ('ui_accept', 'ui_update').
     */
    async function sync(prefs, source) {
      const sid = getSessionId();
      
      // SEGURIDAD: Capturamos el valor del Honeypot (campo trampa 'website')
      // Si el banner inyectó este campo y un bot lo rellenó, lo enviamos al backend.
      const honeypotVal = document.getElementById('website')?.value || '';
  
      // 1. Guardar Localmente
      const localData = {
        prefs: prefs,
        saved_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // +1 año
      };
      localStorage.setItem(CONFIG.DATA_KEY, JSON.stringify(localData));

      // 2. Activar Módulos (Inmediatamente para mejor UX/Data)
      enableModules(prefs);
  
      // 3. Enviar a API (Background)
      try {
        // FIX: Normalizar source a mayúsculas para cumplir CHECK CONSTRAINT de DB
        // ui_accept -> UI_ACCEPT
        const method = source ? source.toUpperCase() : 'UNKNOWN';

        await fetch(CONFIG.API_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sid,
            accepted_categories: prefs,
            consent_version: CONFIG.CONSENT_VERSION,
            consent_method: method, // Enviamos valor normalizado
            page_url: window.location.href,
            website: honeypotVal // Enviamos el campo trampa
          }),
          keepalive: true // Asegura que el envío termine aunque el usuario cambie de página
        });
      } catch (err) { 
          /* Fallo silencioso: Si la API cae, no molestamos al usuario. 
             La preferencia se guardó localmente y los scripts cargaron, que es lo importante. */
          console.warn('[Core Data] Error enviando log de consentimiento (no crítico):', err);
      }
    }
  
    // ==========================================================================
    // 5. INICIALIZACIÓN
    // ==========================================================================
  
    // A. Al arranque: ¿Ya tenemos permiso?
    const currentPrefs = checkStatus();
    if (currentPrefs) {
        // Sí: Cargar scripts silenciosamente sin mostrar UI
        enableModules(currentPrefs);
    }
  
    // B. Escuchar eventos de la UI (ui-feedback.js)
    // Usamos nombres de eventos personalizados para evitar conflictos y bloqueos.
    window.addEventListener('Hakiu.pref', e => sync(e.detail, 'ui_accept'));
    window.addEventListener('Hakiu.update', e => sync(e.detail, 'ui_update'));
  
})();