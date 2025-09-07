// Configuración para Make.com webhook
const makeConfig = {
  // URL del webhook de Make.com
  webhookUrl: process.env.MAKE_WEBHOOK_URL || '',
  
  // API Key para autenticación
  apiKey: process.env.MAKE_API_KEY || '',
  
  // Habilitar/deshabilitar el webhook
  enabled: process.env.MAKE_WEBHOOK_ENABLED === 'true' || false
};

export { makeConfig };
