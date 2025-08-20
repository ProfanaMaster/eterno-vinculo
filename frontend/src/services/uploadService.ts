import { api } from './api'

export class UploadService {
  static async uploadImage(file: File, type: 'profile' | 'gallery'): Promise<string> {
    const formData = new FormData()
    formData.append('image', file)

    const response = await api.post(`/upload/image/${type}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data.data.url
  }

  static async uploadVideo(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('video', file)

    const response = await api.post('/upload/video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data.data.url
  }

  static async uploadGalleryImages(files: File[]): Promise<string[]> {
    const uploadPromises = files.map(file => this.uploadImage(file, 'gallery'))
    return Promise.all(uploadPromises)
  }

  static validateImageFile(file: File): boolean {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Formato de imagen no válido. Use JPG, PNG o WebP.')
    }

    if (file.size > maxSize) {
      throw new Error('La imagen es demasiado grande. Máximo 10MB.')
    }

    return true
  }

  static validateVideoFile(file: File): boolean {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime']
    const maxSize = 50 * 1024 * 1024 // 50MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Formato de video no válido. Use MP4, WebM o MOV.')
    }

    if (file.size > maxSize) {
      throw new Error('El video es demasiado grande. Máximo 50MB.')
    }

    return true
  }
}

export default UploadService