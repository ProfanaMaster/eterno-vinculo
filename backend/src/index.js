import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import routes from './routes/index.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3002

// Middleware de seguridad y parsing
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' ? 'https://www.eternovinculo.com' : 'http://localhost:5173'),
  credentials: true
}))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Rutas principales
app.use('/api', routes)

// Middleware de errores
app.use(notFoundHandler)
app.use(errorHandler)

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`🌐 NODE_ENV: ${process.env.NODE_ENV}`)
  console.log(`🔑 FRONTEND_URL: ${process.env.FRONTEND_URL}`)
  console.log(`🔑 CORS_ORIGIN: ${process.env.CORS_ORIGIN}`)
})

// Manejar errores de puerto ocupado
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Puerto ${PORT} ya está en uso`)
    process.exit(1)
  } else {
    console.error('❌ Error del servidor:', err)
    process.exit(1)
  }
})

// Manejar cierre graceful
process.on('SIGTERM', () => {
  server.close(() => {
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  server.close(() => {
    process.exit(0)
  })
})