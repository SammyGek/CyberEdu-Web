/**
 * ==============================================================================
 * ARCHIVO: assets/cookie-handler.js
 * DESCRIPCIÓN: Gestor de Consentimiento e Inyección de Scripts.
 * ==============================================================================
 */

(function() {
    'use strict';
  
    // CONFIGURACIÓN GLOBAL
    const CONFIG = {
      API_ENDPOINT: '/api/consent',
      CONSENT_VERSION: 'v1.0',
      SESSION_ID_KEY: 'hakiu_consent_sid',
      DATA_KEY: 'hakiu_consent_data',
      
      // ⚠️ AQUÍ TUS IDs DE TERCEROS
      GTM_ID: 'GTM-KDSZ98QV' // Tu ID de Google Tag Manager
    };
  
    // ==========================================================================
    // 1. GESTIÓN DE SCRIPTS DE TERCEROS (EL "PORTERO")
    // ==========================================================================
  
    /**
     * Inyecta Google Tag Manager dinámicamente.
     * Solo se llama si el usuario ha aceptado la categoría 'analytics'.
     */
    function loadGoogleTagManager() {
      if (window.googleTagManagerLoaded) return; // Evitar doble carga
      
      console.log('[Hakiu Cookies] 🟢 Cargando Google Tag Manager...');
      
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer', CONFIG.GTM_ID);
  
      window.googleTagManagerLoaded = true;
    }
  
    /**
     * Activa los scripts según las categorías permitidas.
     * @param {Object} categories - { analytics: boolean, marketing: boolean }
     */
    function enableScripts(categories) {
        if (categories.analytics) {
            loadGoogleTagManager();
            // Aquí podrías cargar otros de analytics (ej: Hotjar)
        }
        
        if (categories.marketing) {
            console.log('[Hakiu Cookies] 🟢 Cargando Scripts de Marketing...');
            // Aquí cargarías Pixel de Facebook, LinkedIn, Ads, etc.
            // loadFacebookPixel();
        }
    }
  
    // ==========================================================================
    // 2. UTILIDADES (UUID, API, Expiración) - (Igual que versión anterior)
    // ==========================================================================
  
    function generateUUID() {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
    }
  
    function getOrCreateSessionId() {
      let sessionId = localStorage.getItem(CONFIG.SESSION_ID_KEY);
      if (!sessionId) {
        sessionId = generateUUID();
        localStorage.setItem(CONFIG.SESSION_ID_KEY, sessionId);
      }
      return sessionId;
    }
  
    function checkExpiration() {
      const storedData = localStorage.getItem(CONFIG.DATA_KEY);
      if (!storedData) return null; // No hay datos
  
      try {
        const parsed = JSON.parse(storedData);
        const expiresAt = new Date(parsed.expires_at);
        if (new Date() > expiresAt) {
          console.info('[Hakiu Cookies] Consentimiento caducado.');
          localStorage.removeItem(CONFIG.DATA_KEY);
          window.location.reload();
          return null;
        }
        return parsed.accepted_categories; // Retornamos categorías válidas
      } catch (e) {
        return null;
      }
    }
  
    async function sendToBackend(categories, method) {
      const sessionId = getOrCreateSessionId();
      const honeypotVal = document.getElementById('website_url')?.value || '';
  
      // Guardar localmente INMEDIATAMENTE para que la UX sea rápida
      const localData = {
        accepted_categories: categories,
        saved_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      };
      localStorage.setItem(CONFIG.DATA_KEY, JSON.stringify(localData));

      // Activar scripts INMEDIATAMENTE (sin esperar a la API)
      enableScripts(categories);
  
      // Enviar a la API en segundo plano
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
            website_url: honeypotVal
          }),
          keepalive: true
        });
      } catch (error) {
        console.error('[Hakiu Cookies] Error enviando log:', error);
      }
    }
  
    // ==========================================================================
    // 3. INICIALIZACIÓN
    // ==========================================================================
    
    // A. Verificar si ya hay consentimiento guardado al cargar la página
    const savedCategories = checkExpiration();
    if (savedCategories) {
        // ¡SÍ! El usuario ya aceptó en el pasado. Cargamos scripts ya.
        console.log('[Hakiu Cookies] Consentimiento previo detectado.');
        enableScripts(savedCategories);
    }
  
    // B. Escuchar eventos del Banner (para nuevos consentimientos)
    window.addEventListener('CookieControl.consent', e => sendToBackend(e.detail, 'banner_accept'));
    window.addEventListener('CookieControl.update', e => sendToBackend(e.detail, 'settings_updated'));
  
    console.log('[Hakiu Cookies] Handler v2.1 (Inyector GTM) listo.');
  
  })();