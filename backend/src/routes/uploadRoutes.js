import { Router } from 'express'
import { getUserFromToken } from '../config/supabase.js'
import { 
  generatePresignedUrl, 
  getPublicUrl, 
  generateFileKey, 
  validateFileType,
  ALLOWED_TYPES 
} from '../config/cloudflare.js'

const router = Router()

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

// Generar URL prefirmada para subida directa a Cloudflare R2
const getPresignedUrlHandler = async (req, res) => {
  try {
    const { type, fileName, contentType, fileSize } = req.body
    const userId = req.user?.id
    
    console.log('📤 Solicitud de URL prefirmada:', { 
      type, 
      fileName, 
      contentType, 
      fileSize: fileSize ? `${Math.round(fileSize / 1024)}KB` : 'N/A',
      userId 
    })
    
    // Validar tipo de upload
    const validTypes = ['profile', 'gallery', 'video', 'memory']
    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        success: false,
        error: `Tipo de archivo no válido. Permitidos: ${validTypes.join(', ')}` 
      })
    }

    // Verificar restricciones de usuario para uploads de perfil
    if (['profile', 'gallery', 'video'].includes(type)) {
      const { supabaseAdmin } = await import('../config/supabase.js')
      
      // Verificar si tiene un memorial activo
      const { data: activeProfile, error: activeError } = await supabaseAdmin
        .from('memorial_profiles')
        .select('id')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .limit(1)
        .single()

      // Verificar si ya eliminó un memorial anteriormente
      const { data: deletedHistory, error: historyError } = await supabaseAdmin
        .from('user_memorial_history')
        .select('id')
        .eq('user_id', userId)
        .eq('action', 'deleted')
        .limit(1)

      const hasDeletedProfile = !historyError && deletedHistory && deletedHistory.length > 0

      if (hasDeletedProfile) {
        console.log(`🚫 Usuario ${userId} intentó subir ${type} pero ya eliminó un memorial`)
        return res.status(403).json({ 
          success: false,
          error: 'No puedes subir archivos porque ya eliminaste un memorial anteriormente.' 
        })
      }

      // Verificar si tiene orden completada (necesaria para subir archivos)
      const { data: completedOrder, error: orderError } = await supabaseAdmin
        .from('orders')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .limit(1)
        .single()

      const hasCompletedOrder = !orderError && completedOrder

      if (!hasCompletedOrder) {
        console.log(`🚫 Usuario ${userId} intentó subir ${type} sin orden completada`)
        return res.status(403).json({ 
          success: false,
          error: 'Necesitas una orden completada para subir archivos.' 
        })
      }

      // Los videos ahora se permiten durante la creación del perfil
      // Solo se bloquean si el usuario ya eliminó un memorial (validado arriba)
      console.log(`✅ Usuario ${userId} puede subir ${type} - tiene orden completada y no ha eliminado memoriales`)
    }
    
    // Validar nombre de archivo
    if (!fileName || fileName.trim() === '') {
      return res.status(400).json({ 
        success: false,
        error: 'Nombre de archivo requerido' 
      })
    }
    
    // Validar tipo MIME según categoría
    let allowedMimeTypes = []
    if (['profile', 'gallery', 'memory'].includes(type)) {
      allowedMimeTypes = ALLOWED_TYPES.image
    } else if (type === 'video') {
      allowedMimeTypes = ALLOWED_TYPES.video
    }
    
    try {
      validateFileType(contentType, allowedMimeTypes)
    } catch (error) {
      return res.status(400).json({ 
        success: false,
        error: error.message 
      })
    }
    
    // Generar key único y organizado
    const key = generateFileKey(userId, type, fileName)
    console.log('🔑 Key generada:', key)
    
    // Generar URL prefirmada con validaciones
    const { url, fields } = await generatePresignedUrl(key, contentType, fileSize)
    const publicUrl = getPublicUrl(key)
    
    console.log('✅ URLs generadas exitosamente')
    
    res.json({
      success: true,
      data: {
        uploadUrl: url,
        fields,
        publicUrl,
        key,
        expiresIn: 1800, // 30 minutos
        maxFileSize: contentType.startsWith('image/') ? '10MB' : '100MB'
      },
      message: 'URL prefirmada generada exitosamente'
    })
  } catch (error) {
    console.error('❌ Error generando URL prefirmada:', error)
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor al generar URL de subida',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

// Verificar estado de subida (opcional)
const verifyUploadHandler = async (req, res) => {
  try {
    const { key } = req.body
    const userId = req.user?.id
    
    // Verificar que la key pertenezca al usuario
    if (!key.startsWith(`${userId}/`)) {
      return res.status(403).json({ 
        success: false,
        error: 'No autorizado para verificar este archivo' 
      })
    }
    
    const publicUrl = getPublicUrl(key)
    
    // Aquí podrías agregar lógica adicional para verificar si el archivo existe
    // Por ejemplo, hacer una HEAD request a la URL
    
    res.json({
      success: true,
      data: {
        key,
        publicUrl,
        verified: true
      },
      message: 'Archivo verificado exitosamente'
    })
  } catch (error) {
    console.error('❌ Error verificando upload:', error)
    res.status(500).json({ 
      success: false,
      error: 'Error verificando estado del archivo' 
    })
  }
}

// Obtener información de archivo subido
const getFileInfoHandler = async (req, res) => {
  try {
    const { key } = req.params
    const userId = req.user?.id
    
    // Verificar que la key pertenezca al usuario
    if (!key.startsWith(`${userId}/`)) {
      return res.status(403).json({ 
        success: false,
        error: 'No autorizado para acceder a este archivo' 
      })
    }
    
    const publicUrl = getPublicUrl(key)
    
    // Extraer información de la key
    const [userIdPart, type, filenamePart] = key.split('/')
    const [timestamp, randomSuffix, ...filenameParts] = filenamePart.split('-')
    const originalFilename = filenameParts.join('-')
    
    res.json({
      success: true,
      data: {
        key,
        publicUrl,
        type,
        originalFilename,
        uploadedAt: new Date(parseInt(timestamp)).toISOString()
      }
    })
  } catch (error) {
    console.error('❌ Error obteniendo info de archivo:', error)
    res.status(500).json({ 
      success: false,
      error: 'Error obteniendo información del archivo' 
    })
  }
}

// Rutas
router.post('/presigned-url', requireAuth, getPresignedUrlHandler)
router.post('/verify', requireAuth, verifyUploadHandler)
router.get('/file/:key', requireAuth, getFileInfoHandler)

// Ruta de health check
router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Upload service is running',
    timestamp: new Date().toISOString()
  })
})

export default router