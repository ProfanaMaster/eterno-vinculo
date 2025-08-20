import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui'
import { sanitizeFilename } from '@/utils/sanitize'

interface VideoUploadProps {
  currentVideo?: string
  onVideoUploaded: (url: string) => void
  maxSize?: number // MB
  maxDuration?: number // seconds
}

/**
 * Componente para subida y gestión de video memorial
 * Incluye validación de tamaño, duración y preview
 */
const VideoUpload = ({ 
  currentVideo, 
  onVideoUploaded, 
  maxSize = 50, 
  maxDuration = 180 
}: VideoUploadProps) => {
  const [video, setVideo] = useState<string | null>(currentVideo || null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  /**
   * Validar archivo de video
   */
  const validateVideo = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      // Validar tipo
      const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        setError('Solo se permiten videos MP4, WebM, MOV y AVI')
        resolve(false)
        return
      }

      // Validar tamaño
      if (file.size > maxSize * 1024 * 1024) {
        const compressionMessage = `El video debe ser menor a ${maxSize}MB. \n\n📱 Puedes usar apps como:\n• Video Compressor (Android/iOS)\n• Compress Videos & Resize Video\n\n💻 O sitios web como:\n• cloudconvert.com\n• freeconvert.com\n• compressvideo.io`
        setError(compressionMessage)
        resolve(false)
        return
      }

      // Sanitizar nombre de archivo
      const sanitizedName = sanitizeFilename(file.name)
      if (!sanitizedName) {
        setError('Nombre de archivo no válido')
        resolve(false)
        return
      }

      // Validar duración
      const video = document.createElement('video')
      video.preload = 'metadata'
      
      video.onloadedmetadata = () => {
        if (video.duration > maxDuration) {
          setError(`El video debe durar menos de ${Math.floor(maxDuration / 60)} minutos`)
          resolve(false)
        } else {
          resolve(true)
        }
      }

      video.onerror = () => {
        setError('Error al procesar el video')
        resolve(false)
      }

      video.src = URL.createObjectURL(file)
    })
  }

  /**
   * Manejar selección de archivo
   */
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)
    
    const isValid = await validateVideo(file)
    if (!isValid) return

    // Crear preview
    const videoUrl = URL.createObjectURL(file)
    setVideo(videoUrl)

    // Subir archivo
    uploadVideo(file)
  }

  /**
   * Subir video al servidor
   */
  const uploadVideo = async (file: File) => {
    setUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('video', file)

      const xhr = new XMLHttpRequest()

      // Progreso de subida
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100)
          setUploadProgress(progress)
        }
      }

      // Respuesta
      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText)
          onVideoUploaded(response.data.url)
          setVideo(response.data.url)
        } else {
          throw new Error('Error al subir el video')
        }
        setUploading(false)
      }

      xhr.onerror = () => {
        setError('Error al subir el video')
        setUploading(false)
      }

      xhr.open('POST', '/api/upload/video')
      xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`)
      xhr.send(formData)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir el video')
      setUploading(false)
    }
  }

  /**
   * Abrir selector de archivos
   */
  const openFileSelector = () => {
    fileInputRef.current?.click()
  }

  /**
   * Eliminar video
   */
  const removeVideo = () => {
    setVideo(null)
    onVideoUploaded('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  /**
   * Formatear duración
   */
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Video memorial
        <span className="text-gray-500 font-normal ml-1">(opcional)</span>
      </label>

      {video ? (
        // Preview del video
        <div className="relative">
          <video
            ref={videoRef}
            src={video}
            controls
            className="w-full max-w-2xl mx-auto rounded-lg shadow-sm"
            onLoadedMetadata={() => {
              if (videoRef.current) {
              }
            }}
          >
            Tu navegador no soporta la reproducción de video.
          </video>

          {/* Overlay de carga */}
          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
              <div className="text-center text-white">
                <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-sm mb-2">Subiendo video...</p>
                <div className="w-48 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs mt-2">{uploadProgress}%</p>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          {!uploading && (
            <div className="flex justify-center space-x-2 mt-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={openFileSelector}
              >
                Cambiar video
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={removeVideo}
              >
                Eliminar
              </Button>
            </div>
          )}
        </div>
      ) : (
        // Área de subida
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
          onClick={openFileSelector}
        >
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Sube un video memorial
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Comparte un momento especial en video
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Máximo {maxSize}MB</p>
            <p>• Duración máxima: {Math.floor(maxDuration / 60)} minutos</p>
            <p>• Formatos: MP4, WebM, MOV, AVI</p>
          </div>
        </motion.div>
      )}

      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".mp4,.webm,.mov,.avi"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          <div className="whitespace-pre-line">{error}</div>
        </div>
      )}

      {/* Información adicional */}
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-gray-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">
              Consejos para el video
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Usa videos con buena calidad de imagen y sonido</li>
              <li>• Evita contenido con derechos de autor en el audio</li>
              <li>• El video se reproducirá automáticamente sin sonido</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoUpload