import { useState, useCallback } from 'react'

interface UseVideoThumbnailReturn {
  generateThumbnail: (file: File | string, timeInSeconds?: number) => Promise<string>
  isGenerating: boolean
  error: string | null
}

/**
 * Hook para generar thumbnails WebP de videos del lado del cliente
 * No consume recursos del backend - todo se hace en el browser
 */
export const useVideoThumbnail = (): UseVideoThumbnailReturn => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateThumbnail = useCallback(async (
    source: File | string, 
    timeInSeconds: number = 2
  ): Promise<string> => {
    setIsGenerating(true)
    setError(null)

    try {
      return new Promise((resolve, reject) => {
        const video = document.createElement('video')
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          reject(new Error('No se pudo crear el contexto del canvas'))
          return
        }

        video.addEventListener('loadedmetadata', () => {
          // Configurar dimensiones del thumbnail
          const aspectRatio = video.videoWidth / video.videoHeight
          const maxWidth = 400
          const maxHeight = 300
          
          let width = maxWidth
          let height = maxWidth / aspectRatio
          
          if (height > maxHeight) {
            height = maxHeight
            width = maxHeight * aspectRatio
          }

          canvas.width = width
          canvas.height = height

          // Buscar el frame en el tiempo especificado
          video.currentTime = Math.min(timeInSeconds, video.duration * 0.1)
        })

        video.addEventListener('seeked', () => {
          try {
            // Dibujar el frame en el canvas
            ctx!.drawImage(video, 0, 0, canvas.width, canvas.height)
            
            // Convertir a WebP con alta calidad pero tamaño optimizado
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const thumbnailUrl = URL.createObjectURL(blob)
                  resolve(thumbnailUrl)
                } else {
                  reject(new Error('No se pudo generar el thumbnail'))
                }
              },
              'image/webp',
              0.8 // 80% calidad para balance tamaño/calidad
            )
          } catch (err) {
            reject(new Error('Error procesando el frame del video'))
          }
        })

        video.addEventListener('error', () => {
          reject(new Error('Error cargando el video'))
        })

        // Configurar el video
        video.crossOrigin = 'anonymous'
        video.muted = true
        video.preload = 'metadata'
        
        if (source instanceof File) {
          video.src = URL.createObjectURL(source)
        } else {
          video.src = source
        }

        // Cleanup en caso de que falle
        setTimeout(() => {
          reject(new Error('Timeout generando thumbnail'))
        }, 10000) // 10 segundos timeout
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      throw err
    } finally {
      setIsGenerating(false)
    }
  }, [])

  return {
    generateThumbnail,
    isGenerating,
    error
  }
}

/**
 * Función utilitaria para generar múltiples thumbnails de un video
 */
export const generateMultipleThumbnails = async (
  source: File | string,
  timePoints: number[] = [1, 5, 10]
): Promise<string[]> => {
  const thumbnails: string[] = []
  
  for (const time of timePoints) {
    try {
      const video = document.createElement('video')
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) continue

      const thumbnail = await new Promise<string>((resolve, reject) => {
        video.addEventListener('loadedmetadata', () => {
          canvas.width = 200
          canvas.height = 150
          video.currentTime = Math.min(time, video.duration * 0.9)
        })

        video.addEventListener('seeked', () => {
          ctx.drawImage(video, 0, 0, 200, 150)
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(URL.createObjectURL(blob))
              } else {
                reject(new Error('No se pudo generar thumbnail'))
              }
            },
            'image/webp',
            0.7
          )
        })

        if (source instanceof File) {
          video.src = URL.createObjectURL(source)
        } else {
          video.src = source
        }
      })

      thumbnails.push(thumbnail)
    } catch (error) {
      console.warn(`Error generando thumbnail en ${time}s:`, error)
    }
  }

  return thumbnails
}

export default useVideoThumbnail
