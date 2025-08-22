import { api } from './api'
import { logger } from '@/utils/logger'

interface PresignedUrlResponse {
  uploadUrl: string
  fields: Record<string, string>
  publicUrl: string
  key: string
}

interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export const uploadToCloudflare = async (
  file: File, 
  type: 'profile' | 'gallery' | 'video' | 'memory',
  onProgress?: (progress: UploadProgress) => void
): Promise<string> => {
  try {
    // 1. Obtener URL prefirmada del backend
    logger.log(`🚀 Solicitando URL prefirmada para ${type}:`, file.name)
    const response = await api.post('/upload/presigned-url', {
      type,
      fileName: file.name,
      contentType: file.type,
      fileSize: file.size
    })

    const { uploadUrl, fields, publicUrl, key }: PresignedUrlResponse = response.data.data
    logger.log('✅ URL prefirmada obtenida:', { key, publicUrl })

    // 2. Crear FormData para subir a R2
    const formData = new FormData()
    
    // Agregar campos requeridos por la URL prefirmada
    Object.entries(fields).forEach(([fieldKey, value]) => {
      formData.append(fieldKey, value)
    })
    
    // Agregar el archivo al final
    formData.append('file', file)

    // 3. Subir directamente a Cloudflare R2 con progreso
    logger.log('📤 Subiendo archivo a Cloudflare R2...')
    logger.log('🔗 Upload URL:', uploadUrl)
    logger.log('📋 Form fields:', fields)
    
    const uploadResponse = await new Promise<Response>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      
      // Configurar progreso si se proporciona callback
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress: UploadProgress = {
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded / event.total) * 100)
            }
            onProgress(progress)
          }
        })
      }
      
      xhr.addEventListener('load', () => {
        logger.log('📡 Upload response status:', xhr.status)
        logger.log('📡 Upload response:', xhr.responseText)
        
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(new Response(xhr.response, { status: xhr.status }))
        } else {
          console.error('❌ Upload failed:', xhr.status, xhr.statusText)
          console.error('❌ Response body:', xhr.responseText)
          reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`))
        }
      })
      
      xhr.addEventListener('error', (event) => {
        console.error('❌ Network error during upload:', event)
        reject(new Error('Error de red al subir archivo'))
      })
      
      xhr.open('POST', uploadUrl)
      xhr.send(formData)
    })

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      console.error('❌ Error en respuesta de Cloudflare:', errorText)
      throw new Error(`Error al subir archivo: ${uploadResponse.status} ${uploadResponse.statusText}`)
    }

    logger.log('✅ Archivo subido exitosamente a:', publicUrl)
    
    // 4. Retornar URL pública
    return publicUrl
  } catch (error) {
    console.error('❌ Error uploading to Cloudflare:', error)
    throw error
  }
}

// Función auxiliar para subir múltiples archivos con progreso
export const uploadMultipleFiles = async (
  files: File[],
  type: 'gallery',
  onProgress?: (fileIndex: number, progress: UploadProgress) => void,
  onComplete?: (fileIndex: number, url: string) => void
): Promise<string[]> => {
  const urls: string[] = []
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    logger.log(`📸 Subiendo imagen ${i + 1}/${files.length}:`, file.name)
    
    try {
      const url = await uploadToCloudflare(
        file, 
        type, 
        (progress) => onProgress?.(i, progress)
      )
      
      urls.push(url)
      onComplete?.(i, url)
      logger.log(`✅ Imagen ${i + 1} subida:`, url)
    } catch (error) {
      console.error(`❌ Error subiendo imagen ${i + 1}:`, error)
      throw new Error(`Error subiendo ${file.name}: ${error.message}`)
    }
  }
  
  return urls
}