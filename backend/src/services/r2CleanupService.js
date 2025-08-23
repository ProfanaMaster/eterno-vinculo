// Servicio para limpiar archivos multimedia de Cloudflare R2
import { S3Client, DeleteObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3'
import { r2Client } from '../config/cloudflare.js'

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'eternovinculo-media'

/**
 * Extrae la key de R2 desde una URL
 */
export const extractR2KeyFromUrl = (url) => {
  if (!url || typeof url !== 'string') return null
  
  try {
    // URLs públicas de R2: https://pub-xxx.r2.dev/key
    if (url.includes('r2.dev/')) {
      return url.split('r2.dev/')[1]
    }
    
    // URLs privadas de R2: https://xxx.r2.cloudflarestorage.com/bucket/key
    if (url.includes('r2.cloudflarestorage.com/')) {
      const parts = url.split('r2.cloudflarestorage.com/')
      if (parts.length > 1) {
        // Remover el nombre del bucket del path
        const pathParts = parts[1].split('/')
        if (pathParts.length > 1) {
          return pathParts.slice(1).join('/')
        }
      }
    }
    
    return null
  } catch (error) {
    console.error('Error extracting R2 key from URL:', url, error)
    return null
  }
}

/**
 * Elimina un archivo individual de R2
 */
export const deleteR2File = async (url) => {
  const key = extractR2KeyFromUrl(url)
  if (!key) {
    console.log('⚠️ No se pudo extraer key de URL:', url)
    return false
  }
  
  try {
    console.log(`🗑️ Eliminando archivo R2: ${key}`)
    
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    })
    
    await r2Client.send(command)
    console.log(`✅ Archivo eliminado exitosamente: ${key}`)
    return true
    
  } catch (error) {
    console.error(`❌ Error eliminando archivo ${key}:`, error)
    return false
  }
}

/**
 * Elimina múltiples archivos de R2
 */
export const deleteR2Files = async (urls) => {
  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return { success: [], failed: [] }
  }
  
  const keys = urls
    .map(url => extractR2KeyFromUrl(url))
    .filter(key => key !== null)
  
  if (keys.length === 0) {
    console.log('⚠️ No se encontraron keys válidas para eliminar')
    return { success: [], failed: urls }
  }
  
  console.log(`🗑️ Eliminando ${keys.length} archivos de R2:`, keys)
  
  // Eliminar hasta 1000 archivos por lote (límite de AWS S3/R2)
  const batchSize = 1000
  const results = { success: [], failed: [] }
  
  for (let i = 0; i < keys.length; i += batchSize) {
    const batch = keys.slice(i, i + batchSize)
    
    try {
      const command = new DeleteObjectsCommand({
        Bucket: BUCKET_NAME,
        Delete: {
          Objects: batch.map(key => ({ Key: key })),
          Quiet: false
        }
      })
      
      const response = await r2Client.send(command)
      
      // Procesar resultados
      if (response.Deleted) {
        response.Deleted.forEach(deleted => {
          results.success.push(deleted.Key)
        })
      }
      
      if (response.Errors) {
        response.Errors.forEach(error => {
          console.error(`❌ Error eliminando ${error.Key}:`, error.Message)
          results.failed.push(error.Key)
        })
      }
      
    } catch (error) {
      console.error('❌ Error en lote de eliminación:', error)
      results.failed.push(...batch)
    }
  }
  
  console.log(`✅ Eliminación completada: ${results.success.length} exitosos, ${results.failed.length} fallidos`)
  return results
}

/**
 * Recolecta todas las URLs multimedia de un memorial
 */
export const collectMemorialMediaUrls = (memorial) => {
  const urls = []
  
  // Foto de perfil
  if (memorial.profile_image_url) {
    urls.push(memorial.profile_image_url)
  }
  
  // ✅ AGREGADO: Banner/imagen de fondo
  if (memorial.banner_image_url) {
    urls.push(memorial.banner_image_url)
  }
  
  // Video conmemorativo
  if (memorial.memorial_video_url) {
    urls.push(memorial.memorial_video_url)
  }
  
  // ✅ AGREGADO: Código QR
  if (memorial.qr_code_url) {
    urls.push(memorial.qr_code_url)
  }
  
  // Galería de imágenes
  if (memorial.gallery_images && Array.isArray(memorial.gallery_images)) {
    urls.push(...memorial.gallery_images)
  }
  
  return urls.filter(url => url && typeof url === 'string')
}

/**
 * Elimina todos los archivos multimedia de un memorial
 */
export const cleanupMemorialMedia = async (memorial) => {
  console.log(`🧹 Iniciando limpieza de archivos para memorial: ${memorial.id}`)
  
  const mediaUrls = collectMemorialMediaUrls(memorial)
  
  if (mediaUrls.length === 0) {
    console.log('✅ No hay archivos multimedia para eliminar')
    return { success: [], failed: [] }
  }
  
  console.log(`📋 Archivos a eliminar (${mediaUrls.length}):`, mediaUrls)
  
  const results = await deleteR2Files(mediaUrls)
  
  console.log(`🎉 Limpieza completada para memorial ${memorial.id}`)
  return results
}

/**
 * Elimina archivos multimedia de memorias (recuerdos)
 */
export const cleanupMemoriesMedia = async (memories) => {
  if (!memories || !Array.isArray(memories) || memories.length === 0) {
    return { success: [], failed: [] }
  }
  
  console.log(`🧹 Iniciando limpieza de ${memories.length} recuerdos`)
  
  const mediaUrls = memories
    .map(memory => memory.photo_url)
    .filter(url => url && typeof url === 'string')
  
  if (mediaUrls.length === 0) {
    console.log('✅ No hay archivos multimedia en recuerdos para eliminar')
    return { success: [], failed: [] }
  }
  
  console.log(`📋 Archivos de recuerdos a eliminar (${mediaUrls.length}):`, mediaUrls)
  
  const results = await deleteR2Files(mediaUrls)
  
  console.log(`🎉 Limpieza de recuerdos completada`)
  return results
}
