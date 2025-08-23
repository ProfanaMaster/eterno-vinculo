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

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`)
  console.log(`🔗 Cloudflare R2 Bucket: ${process.env.R2_BUCKET_NAME}`)
  console.log(`📡 API Health: http://localhost:${PORT}/api/health`)
  console.log(`📤 Upload Health: http://localhost:${PORT}/api/upload/health`)
})