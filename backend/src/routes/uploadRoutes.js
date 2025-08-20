import { Router } from 'express'
import multer from 'multer'
import { supabaseAdmin, getUserFromToken } from '../config/supabase.js'
import sharp from 'sharp'

const router = Router()

// Middleware de autenticación
const requireAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ error: 'Token requerido' })
    }

    const user = await getUserFromToken(token)
    req.user = user
    next()
  } catch (error) {
    console.error('Error in auth middleware:', error)
    res.status(401).json({ error: 'Token inválido' })
  }
}

// Configuración de multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = {
      image: ['image/jpeg', 'image/png', 'image/webp'],
      video: ['video/mp4', 'video/webm', 'video/quicktime']
    }
    
    const isImage = allowedTypes.image.includes(file.mimetype)
    const isVideo = allowedTypes.video.includes(file.mimetype)
    
    if (req.route.path.includes('image') && !isImage) {
      return cb(new Error('Formato de imagen no válido'))
    }
    
    if (req.route.path.includes('video') && !isVideo) {
      return cb(new Error('Formato de video no válido'))
    }
    
    cb(null, true)
  }
})

// Función para optimizar imagen
const optimizeImage = async (buffer, type) => {
  const maxSizes = {
    profile: { width: 400, height: 400 },
    gallery: { width: 1200 } // Solo ancho máximo para galería
  }
  
  const config = maxSizes[type] || maxSizes.gallery
  
  if (type === 'profile') {
    // Para perfil mantener cuadrado con fit inside
    return await sharp(buffer)
      .resize(config.width, config.height, { fit: 'inside', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .webp({ quality: 85 })
      .toBuffer()
  } else {
    // Para galería solo redimensionar por ancho manteniendo proporción
    return await sharp(buffer)
      .resize(config.width, null, { fit: 'inside' })
      .webp({ quality: 85 })
      .toBuffer()
  }
}

// Upload de imagen
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ningún archivo' })
    }
    
    const { type } = req.params
    const userId = req.user?.id
    
    if (!['profile', 'gallery'].includes(type)) {
      return res.status(400).json({ error: 'Tipo de imagen no válido' })
    }
    
    // Optimizar imagen
    const optimizedBuffer = await optimizeImage(req.file.buffer, type)
    const fileName = `${userId}/${type}/${Date.now()}.webp`
    
    const { data, error } = await supabaseAdmin.storage
      .from('memorial-media')
      .upload(fileName, optimizedBuffer, {
        contentType: 'image/webp',
        upsert: true
      })

    if (error) {
      throw new Error(`Upload failed: ${error.message}`)
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('memorial-media')
      .getPublicUrl(fileName)

    const result = { publicUrl }
    
    res.json({
      success: true,
      data: { url: result.publicUrl },
      message: 'Imagen subida exitosamente'
    })
  } catch (error) {
    console.error('Error uploading image:', error)
    res.status(500).json({ error: 'Error al subir la imagen' })
  }
}

// Upload de video
const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ningún archivo' })
    }
    
    const userId = req.user?.id
    const fileName = `${userId}/videos/${Date.now()}-${req.file.originalname}`
    
    const { data, error } = await supabaseAdmin.storage
      .from('memorial-media')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true
      })

    if (error) {
      throw new Error(`Upload failed: ${error.message}`)
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('memorial-media')
      .getPublicUrl(fileName)

    const result = { publicUrl }
    
    res.json({
      success: true,
      data: { url: result.publicUrl },
      message: 'Video subido exitosamente'
    })
  } catch (error) {
    console.error('Error uploading video:', error)
    res.status(500).json({ error: 'Error al subir el video' })
  }
}

router.post('/image/:type', requireAuth, upload.single('image'), uploadImage)
router.post('/video', requireAuth, upload.single('video'), uploadVideo)

export default router