
import { S3Client } from '@aws-sdk/client-s3'
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'
import dotenv from 'dotenv'

dotenv.config()

// Configuración de Cloudflare R2
const R2_ENDPOINT = process.env.R2_ENDPOINT
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY
const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'eternovinculo-media'
const CDN_URL = process.env.R2_PUBLIC_URL || 'https://pub-6a50d2dd90e14a1ab5d78f934e4d65c9.r2.dev'

// Validar variables de entorno requeridas
if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
  console.error('❌ Variables de entorno R2 requeridas no configuradas')
  console.error('Configurar: R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY')
  process.exit(1)
}

// Cliente R2 optimizado
const r2Client = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY
  },
  forcePathStyle: true,
  // Configuraciones de rendimiento
  maxAttempts: 3,
  retryDelayOptions: {
    base: 300
  }
})

// Log de configuración
console.log('🔧 Cloudflare R2 Configuration:')
console.log(`   📦 Bucket: ${BUCKET_NAME}`)
console.log(`   🌐 Endpoint: ${R2_ENDPOINT}`)
console.log(`   🔑 Access Key: ${R2_ACCESS_KEY_ID.substring(0, 8)}...`)
console.log(`   💿 CDN URL: ${CDN_URL}`)

// Generar URL prefirmada optimizada para diferentes tipos de archivo
export const generatePresignedUrl = async (key, contentType, fileSize = 0) => {
  try {
    console.log(`🔗 Generando URL prefirmada para: ${key}`)
    
    // Determinar límite de tamaño basado en tipo de contenido
    let maxSize = MAX_FILE_SIZES.image // Por defecto usar límite de imagen
    
    if (contentType.startsWith('image/')) {
      maxSize = MAX_FILE_SIZES.image // 2MB para imágenes
    } else if (contentType.startsWith('video/')) {
      maxSize = MAX_FILE_SIZES.video // 65MB para videos
    }
    
    // Validar tamaño del archivo si se proporciona
    if (fileSize > maxSize) {
      throw new Error(`Archivo demasiado grande. Máximo permitido: ${Math.round(maxSize / 1024 / 1024)}MB`)
    }

    const conditions = [
      ['content-length-range', 1, maxSize], // Mínimo 1 byte, máximo según tipo
      ['starts-with', '$Content-Type', contentType.split('/')[0]], // Tipo base (image/, video/)
      ['starts-with', '$key', key.split('/')[0]] // Debe empezar con el prefijo del usuario
    ]

    const { url, fields } = await createPresignedPost(r2Client, {
      Bucket: BUCKET_NAME,
      Key: key,
      Conditions: conditions,
      Fields: {
        'Content-Type': contentType
      },
      Expires: 1800 // 30 minutos
    })

    console.log('✅ URL prefirmada generada exitosamente')
    return { url, fields }
  } catch (error) {
    console.error('❌ Error generando URL prefirmada:', error)
    throw new Error(`No se pudo generar URL de subida: ${error.message}`)
  }
}

// Obtener URL pública optimizada (usando la URL pública de R2)
export const getPublicUrl = (key) => {
  // Usar la URL pública de R2 para acceso directo
  const publicUrl = `${CDN_URL}/${key}`
  console.log(`🔗 URL pública generada: ${publicUrl}`)
  return publicUrl
}

// Generar key único y organizado
export const generateFileKey = (userId, type, originalFileName) => {
  const timestamp = Date.now()
  const randomSuffix = Math.random().toString(36).substring(2, 8)
  const sanitizedFileName = originalFileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .toLowerCase()
  
  return `${userId}/${type}/${timestamp}-${randomSuffix}-${sanitizedFileName}`
}

// Validar tipo de archivo
export const validateFileType = (contentType, allowedTypes) => {
  if (!allowedTypes.includes(contentType)) {
    throw new Error(`Tipo de archivo no permitido: ${contentType}`)
  }
  return true
}

// Configuración de tipos permitidos
export const ALLOWED_TYPES = {
  image: [
    'image/jpeg',
    'image/jpg', 
    'image/png'
  ],
  video: [
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-msvideo'
  ]
}

// Tamaños máximos permitidos
export const MAX_FILE_SIZES = {
  image: 2 * 1024 * 1024,    // 2MB para imágenes
  video: 65 * 1024 * 1024    // 65MB para videos
}

export { r2Client, BUCKET_NAME, CDN_URL }