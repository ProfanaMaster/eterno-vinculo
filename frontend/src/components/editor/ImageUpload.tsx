import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui'
import { sanitizeFilename } from '@/utils/sanitize'

interface ImageUploadProps {
  label: string
  type: 'profile' | 'gallery'
  currentImage?: string
  onImageUploaded: (url: string) => void
  maxSize?: number // MB
  aspectRatio?: string
}

/**
 * Componente reutilizable para subida de imágenes
 * Incluye preview, validación y optimización
 */
const ImageUpload = ({ 
  label, 
  type, 
  currentImage, 
  onImageUploaded,
  maxSize = 2,
  aspectRatio = 'auto'
}: ImageUploadProps) => {
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Configuración por tipo de imagen
  const typeConfig = {
    profile: { width: 400, height: 400, ratio: 'aspect-square' },

    gallery: { width: 800, height: 600, ratio: 'aspect-[4/3]' }
  }

  const config = typeConfig[type]

  /**
   * Maneja la selección de archivo
   */
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validaciones de formato
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setError('Solo se permiten archivos JPG y PNG')
      return
    }

    // Validación de tamaño
    if (file.size > maxSize * 1024 * 1024) {
      setError(`La imagen debe ser menor a ${maxSize}MB`)
      return
    }

    // Sanitizar nombre de archivo
    const sanitizedName = sanitizeFilename(file.name)
    if (!sanitizedName) {
      setError('Nombre de archivo no válido')
      return
    }

    setError(null)
    
    // Crear preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Subir archivo
    uploadFile(file)
  }

  /**
   * Sube el archivo al servidor usando Cloudflare R2
   */
  const uploadFile = async (file: File) => {
    setUploading(true)
    setError('')
    
    try {
      const { default: UploadService } = await import('@/services/uploadService')
      
      // Validar archivo antes de subir
      UploadService.validateImageFile(file)
      
      // Subir a Cloudflare R2
      const imageUrl = await UploadService.uploadImage(
        file, 
        type as 'profile' | 'gallery'
      )
      
      onImageUploaded(imageUrl)
      
    } catch (err: any) {
      const message = err.message || 'Error al subir la imagen'
      setError(message)
      setPreview(currentImage || null)
      console.error('Error uploading image:', err)
    } finally {
      setUploading(false)
    }
  }

  /**
   * Abre el selector de archivos
   */
  const openFileSelector = () => {
    fileInputRef.current?.click()
  }

  /**
   * Elimina la imagen actual
   */
  const removeImage = () => {
    setPreview(null)
    onImageUploaded('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      {/* Área de preview/upload */}
      <div className={`
        relative border-2 border-dashed border-gray-300 rounded-lg
        ${config.ratio} w-full max-w-md mx-auto
        ${!preview ? 'hover:border-gray-400 cursor-pointer' : ''}
        transition-colors duration-200
      `}>
        {preview ? (
          // Preview de imagen
          <div className="relative w-full h-full">
            <img
              src={preview}
              alt={`Preview ${label}`}
              className="w-full h-full object-cover rounded-lg"
            />
            
            {/* Overlay con acciones */}
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center space-x-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={openFileSelector}
                disabled={uploading}
              >
                Cambiar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={removeImage}
                disabled={uploading}
              >
                Eliminar
              </Button>
            </div>

            {/* Indicador de carga */}
            {uploading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Subiendo...</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Área de drop/click
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="w-full h-full flex flex-col items-center justify-center p-6 cursor-pointer"
            onClick={openFileSelector}
          >
            <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <p className="text-sm text-gray-600 text-center">
              Haz clic para seleccionar una imagen
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Solo JPG y PNG • Máximo {maxSize}MB • {config.width}x{config.height}px recomendado
            </p>
          </motion.div>
        )}
      </div>

      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default ImageUpload