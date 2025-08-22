import { uploadToCloudflare } from './cloudflareUpload'
import { uploadViaProxy } from './uploadProxy'
import { logger } from '@/utils/logger'

interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export class UploadService {
  static async uploadImage(
    file: File, 
    type: 'profile' | 'gallery',
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    this.validateImageFile(file)
    
    // Usar proxy temporal hasta que CORS esté configurado
    try {
      return await uploadViaProxy(file, type, onProgress)
    } catch (error) {
      logger.log('🔄 Proxy failed, trying direct upload:', error)
      return await uploadToCloudflare(file, type, onProgress)
    }
  }

  static async uploadVideo(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    this.validateVideoFile(file)
    
    // Usar proxy temporal hasta que CORS esté configurado
    try {
      return await uploadViaProxy(file, 'video', onProgress)
    } catch (error) {
      logger.log('🔄 Proxy failed, trying direct upload:', error)
      return await uploadToCloudflare(file, 'video', onProgress)
    }
  }

  static async uploadGalleryImages(
    files: File[],
    onProgress?: (fileIndex: number, progress: UploadProgress) => void,
    onComplete?: (fileIndex: number, url: string) => void
  ): Promise<string[]> {
    // Validar todos los archivos primero
    files.forEach(file => this.validateImageFile(file))
    
    // Usar proxy para cada archivo individualmente
    const urls: string[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      try {
        // Intentar usar proxy primero
        const url = await uploadViaProxy(file, 'gallery', (progress) => {
          if (onProgress) onProgress(i, progress)
        })
        
        urls.push(url)
        if (onComplete) onComplete(i, url)
        
      } catch (proxyError) {
        console.log(`🔄 Proxy failed for file ${i}, trying direct upload:`, proxyError)
        
        try {
          // Fallback a upload directo
          const url = await uploadToCloudflare(file, 'gallery', (progress) => {
            if (onProgress) onProgress(i, progress)
          })
          
          urls.push(url)
          if (onComplete) onComplete(i, url)
          
        } catch (directError) {
          console.error(`❌ Both proxy and direct upload failed for file ${i}:`, directError)
          throw new Error(`Error subiendo ${file.name}: ${directError.message}`)
        }
      }
    }
    
    return urls
  }

  static async uploadMemoryImage(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    this.validateImageFile(file)
    
    // Usar proxy temporal hasta que CORS esté configurado
    try {
      return await uploadViaProxy(file, 'memory', onProgress)
    } catch (error) {
      logger.log('🔄 Proxy failed, trying direct upload:', error)
      return await uploadToCloudflare(file, 'memory', onProgress)
    }
  }

  static validateImageFile(file: File): boolean {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
    const maxSize = 2 * 1024 * 1024 // 2MB

    if (!allowedTypes.includes(file.type.toLowerCase())) {
      throw new Error('Formato de imagen no válido. Solo se permiten JPG y PNG.')
    }

    if (file.size > maxSize) {
      throw new Error('La imagen es demasiado grande. Máximo 2MB.')
    }

    if (file.size === 0) {
      throw new Error('El archivo está vacío.')
    }

    return true
  }

  static validateVideoFile(file: File): boolean {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
    const maxSize = 65 * 1024 * 1024 // 65MB

    if (!allowedTypes.includes(file.type.toLowerCase())) {
      throw new Error('Formato de video no válido. Solo se permiten MP4, WebM, MOV y AVI.')
    }

    if (file.size > maxSize) {
      throw new Error('El video es demasiado grande. Máximo 65MB.')
    }

    if (file.size === 0) {
      throw new Error('El archivo está vacío.')
    }

    return true
  }

  // Utilidades para formatear tamaños de archivo
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Obtener tipo de archivo basado en extensión
  static getFileType(fileName: string): 'image' | 'video' | 'unknown' {
    const extension = fileName.split('.').pop()?.toLowerCase()
    
    if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension || '')) {
      return 'image'
    }
    
    if (['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(extension || '')) {
      return 'video'
    }
    
    return 'unknown'
  }
}

export default UploadService