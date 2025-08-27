import { api } from './api'
import { logger } from '@/utils/logger'

interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export const uploadViaProxy = async (
  file: File, 
  type: 'profile' | 'gallery' | 'video' | 'memory',
  onProgress?: (progress: UploadProgress) => void
): Promise<string> => {
  try {
    logger.log(`📤 Subiendo via proxy optimizado: ${file.name}`)
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    // Usar endpoint público para galería y memorias, autenticado para otros
    const endpoint = ['gallery', 'memory'].includes(type) ? '/upload-proxy/proxy-public' : '/upload-proxy/proxy'
    const response = await api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress: UploadProgress = {
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            percentage: Math.round((progressEvent.loaded / progressEvent.total) * 100)
          }
          onProgress(progress)
        }
      }
    })

    if (response.data.success) {
      logger.log('✅ Archivo subido exitosamente:', response.data.publicUrl || response.data.data?.publicUrl)
      return response.data.publicUrl || response.data.data?.publicUrl
    } else {
      throw new Error(response.data.error || 'Error al subir archivo')
    }

  } catch (error: any) {
    console.error('❌ Error uploading via proxy:', error)
    throw new Error(error.response?.data?.error || error.message || 'Error al subir archivo')
  }
}
