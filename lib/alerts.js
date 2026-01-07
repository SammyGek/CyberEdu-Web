/**
 * ==============================================================================
 * ARCHIVO: lib/alerts.js
 * DESCRIPCIÓN: Sistema de notificación a Discord vía Webhooks.
 * USO: Para reportar ataques, errores críticos o spam detectado.
 * ==============================================================================
 */

// Mapa de colores hexadecimales para el borde del mensaje en Discord
const SEVERITY_COLORS = {
  low: 5763719,      // Verde (Info)
  medium: 16776960,  // Amarillo (Warning)
  high: 15548997     // Rojo (Critical)
};

const SEVERITY_EMOJIS = {
  low: '🟢',
  medium: '🟡',
  high: '🔴'
};

/**
 * Envía una alerta estructurada al canal de seguridad.
 * * @param {Object} params
 * @param {string} params.type - Tipo de evento (ej: 'rate-limit', 'honeypot')
 * @param {string} params.message - Descripción legible para humanos
 * @param {Array} params.details - Array de objetos con datos técnicos [{ip: '...'}, {ua: '...'}]
 * @param {string} params.severity - 'low' | 'medium' | 'high'
 */
export async function sendAlert({ type, message, details = [], severity = 'medium' }) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  // Si no hay webhook configurado (ej: en local), logueamos en consola y salimos.
  if (!webhookUrl) {
    console.log(`[ALERT MOCKED] ${severity.toUpperCase()}: ${message}`);
    return;
  }

  // Construir los campos (Fields) del Embed de Discord
  // Discord limita a 25 fields, así que tomamos los primeros 5 por seguridad.
  const fields = details.slice(0, 5).map(d => {
    // Convertir objeto {clave: valor} a string "clave: valor"
    const content = typeof d === 'object' 
      ? Object.entries(d).map(([k, v]) => `**${k}**: ${v}`).join('\n')
      : String(d);
      
    return {
      name: 'Detalle Técnico',
      value: content || 'N/A',
      inline: false
    };
  });

  // Payload que espera la API de Discord
  const payload = {
    embeds: [{
      title: `${SEVERITY_EMOJIS[severity]} Security Alert: ${type}`,
      description: message,
      color: SEVERITY_COLORS[severity] || SEVERITY_COLORS.medium,
      fields: fields,
      footer: {
        text: 'Hakiu Security System v2.0',
        icon_url: 'https://hakiu.es/favicon.ico' // Opcional
      },
      timestamp: new Date().toISOString()
    }]
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error(`[ALERT ERROR] Discord respondió: ${response.status}`);
    }
  } catch (error) {
    console.error('[ALERT ERROR] Fallo de red al enviar a Discord:', error);
  }
}