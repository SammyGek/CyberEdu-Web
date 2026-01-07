/**
 * ==============================================================================
 * ARCHIVO: api/consent.js (Vercel API Route)
 * DESCRIPCIÓN: Endpoint principal para recibir consentimientos de cookies.
 * SEGURIDAD:
 * - CORS Check (Origen)
 * - Rate Limiting (IP + Sesión)
 * - Honeypot (Anti-Bot)
 * - Validación de Esquema
 * - Sanitización
 * ==============================================================================
 */

import { createClient } from '@supabase/supabase-js';
import { incrementRateLimit, checkRateLimit } from '../lib/kv.js'; // Ajusta la ruta relativa según tu estructura
import { sendAlert } from '../lib/alerts.js';

// Inicializar Supabase con SERVICE_ROLE_KEY
// IMPORTANTE: Esta key tiene permisos de superadmin. Nunca exponer en cliente.
// Se usa aquí para poder hacer INSERT en la tabla protegida 'consent_logs'.
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// CONFIGURACIÓN DE LÍMITES
const RATE_LIMITS = {
  SESSION: 10,   // Max cambios por sesión (navegador) por hora
  IP: 100        // Max peticiones por IP por hora (Ajustado para aulas/clases)
};

// CONFIGURACIÓN DE ORIGENES PERMITIDOS
const ALLOWED_ORIGINS = {
  production: 'https://hakiu.es',
  development: 'http://localhost' // Se permite localhost solo en modo DEV
};

export default async function handler(req, res) {
  // 1. MÉTODO HTTP
  // Solo aceptamos POST. Cualquier otra cosa se rechaza.
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // ==================================================================
    // CAPA 1: VALIDACIÓN DE ORIGEN (CORS Manual)
    // ==================================================================
    const origin = req.headers.origin || req.headers.referer || '';
    const isDev = process.env.NODE_ENV === 'development';
    const allowedPrefix = isDev ? ALLOWED_ORIGINS.development : ALLOWED_ORIGINS.production;

    if (!origin.startsWith(allowedPrefix)) {
      console.warn(`[SECURITY] Origen inválido detectado: ${origin}`);
      return res.status(403).json({ error: 'Forbidden origin' });
    }

    // ==================================================================
    // CAPA 2: EXTRACCIÓN DE DATOS REALES (Infraestructura)
    // ==================================================================
    // Obtenemos la IP real desde los headers de Vercel/Proxy.
    // Ignoramos cualquier IP enviada en el body (anti-spoofing).
    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const ip = rawIp.split(',')[0].trim(); // Tomamos la primera IP si hay lista
    
    const userAgent = req.headers['user-agent'] || 'Unknown';

    if (!ip) {
      return res.status(400).json({ error: 'Could not determine Client IP' });
    }

    // ==================================================================
    // CAPA 3: HONEYPOT (Anti-Bot)
    // ==================================================================
    const { website_url } = req.body; // Campo trampa invisible
    
    if (website_url && website_url.trim() !== '') {
      console.warn(`[HONEYPOT] Bot detectado desde IP: ${ip}`);
      
      // Guardamos la detección para análisis futuro
      await supabase.from('honeypot_detections').insert({
        ip_address: ip,
        user_agent: userAgent,
        honeypot_value: website_url
      });

      // Incrementamos contador de detecciones para alertar si hay ataque masivo
      const detections = await incrementRateLimit('honeypot:detections-last-hour');
      if (detections % 10 === 0) { // Alerta cada 10 bots
        await sendAlert({
          type: 'honeypot-triggered',
          message: `🍯 Honeypot ha atrapado ${detections} bots en la última hora.`,
          severity: 'low'
        });
      }

      // RESPUESTA FALSA: Devolvemos 200 OK para que el bot crea que tuvo éxito
      // y no intente otras vías de ataque.
      return res.status(200).json({ success: true, mocked: true });
    }

    // ==================================================================
    // CAPA 4: RATE LIMITING (Vercel KV)
    // ==================================================================
    const { session_id } = req.body;
    const sessionKey = `ratelimit:session:${session_id}`;
    const ipKey = `ratelimit:ip:${ip}`;

    // A. Límite por Sesión (Frena al usuario molesto)
    if (await checkRateLimit(sessionKey, RATE_LIMITS.SESSION)) {
      console.warn(`[RATE LIMIT] Sesión bloqueada: ${session_id}`);
      return res.status(429).json({ error: 'Too many requests from this session' });
    }

    // B. Límite por IP (Frena ataques, permite aulas con limite 100/h)
    if (await checkRateLimit(ipKey, RATE_LIMITS.IP)) {
      const blocks = await incrementRateLimit('ratelimit:blocks-last-hour');
      
      console.warn(`[RATE LIMIT] IP bloqueada: ${ip}`);
      
      // Alerta si el ataque es volumétrico (>200 bloqueos/hora globalmente)
      if (blocks === 200) {
        await sendAlert({
          type: 'rate-limit-attack',
          message: `⚠️ Posible ataque DDoS L7: 200 peticiones bloqueadas en última hora.`,
          severity: 'high',
          details: [{ SourceIP: ip }]
        });
      }
      
      return res.status(429).json({ error: 'Too many requests from this IP' });
    }

    // ==================================================================
    // CAPA 5: VALIDACIÓN Y SANITIZACIÓN
    // ==================================================================
    const { 
      user_id, 
      accepted_categories, 
      consent_version, 
      page_url, 
      consent_method 
    } = req.body;

    // Validación UUID simple (Regex)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!session_id || !uuidRegex.test(session_id)) {
      return res.status(400).json({ error: 'Invalid session_id format' });
    }

    // Validación de categorías (Debe ser objeto)
    if (!accepted_categories || typeof accepted_categories !== 'object') {
      return res.status(400).json({ error: 'Invalid accepted_categories format' });
    }

    // Sanitización de Strings largos
    const cleanUserAgent = userAgent.substring(0, 500); // Cortar a 500 chars
    const cleanPageUrl = (page_url || '').substring(0, 200);

    // ==================================================================
    // CAPA 6: PERSISTENCIA (Supabase)
    // ==================================================================
    const { data, error } = await supabase
      .from('consent_logs')
      .insert({
        user_id: user_id || null, // Convertir undefined/vacío a NULL SQL
        session_id,
        ip_address: ip,
        user_agent: cleanUserAgent,
        consent_version,
        accepted_categories,
        consent_method: consent_method || 'banner_accept',
        page_url: cleanPageUrl
        // expires_at se genera automáticamente por el trigger SQL
      })
      .select('id')
      .single();

    if (error) {
      console.error('[DB ERROR] Supabase insert falló:', error);
      throw error; // Salta al catch global
    }

    // ==================================================================
    // CAPA 7: ACTUALIZAR CONTADORES (Post-Éxito)
    // ==================================================================
    // Solo incrementamos si todo salió bien.
    await incrementRateLimit(sessionKey);
    await incrementRateLimit(ipKey);

    // Respuesta final exitosa
    return res.status(201).json({ success: true, id: data.id });

  } catch (err) {
    console.error('[SERVER ERROR]', err);
    // Alertar solo si es un error interno grave
    if (err.code !== 'PGRST116') { // Ignorar errores menores de Supabase
         /* Opcional: sendAlert(...) */ 
    }
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}