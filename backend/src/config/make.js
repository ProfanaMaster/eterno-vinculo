// Configuración para Make Webhook
export const makeConfig = {
  webhookUrl: process.env.MAKE_WEBHOOK_URL || 'https://hook.us2.make.com/9m802x4cecs3o3wq4udsn02mnkv47day',
  apiKey: process.env.MAKE_API_KEY || '54DA9CB336E9D275D8EB7A665A293C3284287365F75369B54D8979B83BD44595',
  enabled: process.env.MAKE_WEBHOOK_ENABLED !== 'false' // Habilitado por defecto
};
