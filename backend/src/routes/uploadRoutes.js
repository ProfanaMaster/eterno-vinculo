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

      // Verificar si tiene órdenes pagadas (necesarias para subir archivos)
      const { data: paidOrders, error: orderError } = await supabaseAdmin
        .from('orders')
        .select('id')
        .eq('user_id', userId)
        .not('paid_at', 'is', null)

      const totalQuotas = paidOrders?.length || 0

      if (totalQuotas === 0) {
        console.log(`🚫 Usuario ${userId} intentó subir ${type} sin órdenes pagadas`)
        return res.status(403).json({ 
          success: false,
          error: 'Necesitas al menos una orden pagada para subir archivos.' 
        })
      }

      // Verificar cuotas usadas (historial de creaciones) y memoriales activos
      const { data: createdHistory, error: historyError } = await supabaseAdmin
        .from('user_memorial_history')
        .select('id')
        .eq('user_id', userId)
        .eq('action', 'created')

      const { data: activeMemorials, error: memorialsError } = await supabaseAdmin
        .from('memorial_profiles')
        .select('id')
        .eq('user_id', userId)
        .is('deleted_at', null)

      let usedQuotas = 0
      const activeCount = activeMemorials?.length || 0
      
      if (historyError) {
        // Fallback: usar todos los perfiles creados
        const { data: allMemorials } = await supabaseAdmin
          .from('memorial_profiles')
          .select('id')
          .eq('user_id', userId)
        usedQuotas = allMemorials?.length || 0
      } else {
        usedQuotas = createdHistory?.length || 0
      }

      const availableQuotas = totalQuotas - usedQuotas

      if (activeCount > 0) {
        console.log(`✅ Usuario ${userId} puede subir ${type} - tiene memoriales activos`)
      } else if (availableQuotas > 0) {
        console.log(`✅ Usuario ${userId} puede subir ${type} - tiene cuotas disponibles para crear memoriales`)
      } else {
        console.log(`🚫 Usuario ${userId} intentó subir ${type} sin cuotas disponibles`)
        return res.status(403).json({ 
          success: false,
          error: 'No tienes cuotas disponibles para subir archivos.' 
        })
      }


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