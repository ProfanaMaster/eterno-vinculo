import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import routes from './routes/index.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import emailNotificationService from './services/emailNotificationService.js'
import logger from './utils/logger.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3002

// Middleware de seguridad y parsing
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json({ limit: '70mb' }))
app.use(express.urlencoded({ extended: true, limit: '70mb' }))

// Rutas principales
app.use('/api', routes)

// Middleware de errores
app.use(notFoundHandler)
app.use(errorHandler)

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`)
  console.log(`🔗 Cloudflare R2 Bucket: ${process.env.R2_BUCKET_NAME}`)
  console.log(`📡 API Health: http://localhost:${PORT}/api/health`)
  console.log(`📤 Upload Health: http://localhost:${PORT}/api/upload/health`)
  
  // Inicializar servicio de notificaciones por email
  try {
    const emailConnected = await emailNotificationService.testConnection();
    if (emailConnected) {
      await emailNotificationService.startListening();
      logger.info('📧 Email notification service initialized successfully');
    } else {
      logger.warn('⚠️ Email service not available - notifications disabled');
    }
  } catch (error) {
    logger.error('❌ Failed to initialize email notification service:', error);
  }
})

// Manejo de cierre graceful
process.on('SIGTERM', async () => {
  logger.info('🛑 SIGTERM received, shutting down gracefully');
  await emailNotificationService.stopListening();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('🛑 SIGINT received, shutting down gracefully');
  await emailNotificationService.stopListening();
  process.exit(0);
});