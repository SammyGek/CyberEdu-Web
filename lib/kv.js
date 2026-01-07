/**
 * ==============================================================================
 * ARCHIVO: lib/kv.js
 * DESCRIPCIÓN: Cliente para Vercel KV (Redis). Maneja el Rate Limiting.
 * ==============================================================================
 */

import { kv } from '@vercel/kv';

/**
 * Verifica si una clave ha superado su límite.
 * NO incrementa el contador, solo consulta.
 * * @param {string} key - La clave única (ej: "ratelimit:ip:192.168.1.1")
 * @param {number} limit - El número máximo permitido
 * @returns {Promise<boolean>} - True si ha superado el límite (bloquear)
 */
export async function checkRateLimit(key, limit) {
  try {
    const count = await kv.get(key);
    // Si no existe, count es null (0). Si existe, verificamos si supera el límite.
    return (count || 0) >= limit;
  } catch (error) {
    console.error('[KV Error] checkRateLimit falló:', error);
    return false; // Fail-open: Si Redis falla, permitimos el tráfico para no tirar la web
  }
}

/**
 * Incrementa el contador para una clave.
 * Si es la primera vez, establece el tiempo de expiración (TTL).
 * * @param {string} key - La clave única
 * @param {number} expirationSeconds - Tiempo en segundos antes de resetear (Default: 3600 = 1h)
 * @returns {Promise<number>} - El nuevo valor del contador
 */
export async function incrementRateLimit(key, expirationSeconds = 3600) {
  try {
    // incr: Incrementa atómicamente. Si no existe, lo crea con valor 1.
    const count = await kv.incr(key);
    
    // Si acaba de crearse (valor 1), asignamos su fecha de caducidad.
    if (count === 1) {
      await kv.expire(key, expirationSeconds);
    }
    
    return count;
  } catch (error) {
    console.error('[KV Error] incrementRateLimit falló:', error);
    return 0;
  }
}

export default kv;