import { Router } from 'express'
import { getUserFromToken } from '../config/supabase.js'
import { r2Client, BUCKET_NAME, ALLOWED_TYPES, MAX_FILE_SIZES } from '../config/cloudflare.js'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import multer from 'multer'
import { logger } from '../utils/logger.js'

const router = Router()

// Configuración de multer para memoria (SOLO fallback temporal)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 70 * 1024 * 1024 // 70MB
  }
})

// Middleware de autenticación
const requireAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'Token de autenticación requerido' 
      })
    }

    const user = await getUserFromToken(token)
    req.user = user
    next()
  } catch (error) {
    console.error('❌ Error en middleware de auth:', error)
    res.status(401).json({ 
      success: false,
      error: 'Token inválido o expirado' 
    })
  }
}

// Proxy optimizado para subida de archivos
const uploadFileProxy = async (req, res) => {
  try {
    const { type } = req.body
    const file = req.file
    const userId = req.user?.id || 'anonymous'

    logger.log(`📤 PROXY: Subiendo ${file?.originalname} para usuario ${userId}`)

    if (!file) {
      return res.status(400).json({ 
        success: false,
        error: 'Archivo requerido' 
      })
    }

    if (!['profile', 'gallery', 'video', 'memory'].includes(type)) {
      return res.status(400).json({ 
        success: false,
        error: 'Tipo de archivo no válido' 
      })
    }

    // Validar tipo MIME y tamaño según la categoría
    let allowedMimeTypes = []
    let maxSize = 0
    
    if (['profile', 'gallery', 'memory'].includes(type)) {
      allowedMimeTypes = ALLOWED_TYPES.image
      maxSize = MAX_FILE_SIZES.image
    } else if (type === 'video') {
      allowedMimeTypes = ALLOWED_TYPES.video
      maxSize = MAX_FILE_SIZES.video
    }
    
    // Validar tipo MIME
    if (!allowedMimeTypes.includes(file.mimetype)) {
      const allowedFormats = allowedMimeTypes.map(mime => mime.split('/')[1].toUpperCase()).join(', ')
      return res.status(400).json({ 
        success: false,
        error: `Formato no permitido. Solo se permiten: ${allowedFormats}` 
      })
    }
    
    // Validar tamaño del archivo
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / 1024 / 1024)
      return res.status(400).json({ 
        success: false,
        error: `Archivo demasiado grande. Máximo permitido: ${maxSizeMB}MB` 
      })
    }

    logger.log(`📤 Procesando archivo ${file.originalname} (${Math.round(file.size / 1024)}KB)`)

    // Generar key único
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).substring(2, 8)
    const sanitizedFileName = file.originalname
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .toLowerCase()
    
    const key = `${userId}/${type}/${timestamp}-${randomSuffix}-${sanitizedFileName}`

    // Subir a R2
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      CacheControl: 'max-age=31536000'
    })

    await r2Client.send(command)

    // Generar URL pública usando la función del config
    const { getPublicUrl } = await import('../config/cloudflare.js')
    const publicUrl = getPublicUrl(key)

    logger.log(`✅ Archivo subido exitosamente: ${publicUrl}`)

    res.json({
      success: true,
      data: {
        publicUrl,
        key
      },
      message: 'Archivo subido via fallback temporal (configurar CORS en R2)'
    })

  } catch (error) {
    console.error('❌ Error en proxy fallback:', error)
    res.status(500).json({ 
      success: false,
      error: 'Error al subir archivo via proxy',
      details: error.message
    })
  }
}

// Rutas proxy optimizadas
router.post('/proxy', requireAuth, upload.single('file'), uploadFileProxy)
router.post('/proxy-public', upload.single('file'), uploadFileProxy)

export default router
