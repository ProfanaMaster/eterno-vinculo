import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button, Modal } from '@/components/ui'
import { sanitizeFilename } from '@/utils/sanitize'

interface GalleryUploadProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
}

/**
 * Componente para gestionar galería de imágenes
 * Permite subir, reordenar y eliminar hasta 6 imágenes
 */
const GalleryUpload = ({ images, onImagesChange, maxImages = 6 }: GalleryUploadProps) => {
  const [uploading, setUploading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  /**
   * Validar archivo de imagen
   */
  const validateImage = (file: File): string | null => {
    // Validar formato
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return 'Solo se permiten archivos JPG y PNG'
    }

    // Validar tamaño (5MB máximo para galería)
    if (file.size > 5 * 1024 * 1024) {
      return 'La imagen debe ser menor a 5MB'
    }

    // Sanitizar nombre
    const sanitizedName = sanitizeFilename(file.name)
    if (!sanitizedName) {
      return 'Nombre de archivo no válido'
    }

    return null
  }

  /**
   * Subir nueva imagen
   */
  const uploadImage = async (file: File) => {
    // Validar archivo
    const validationError = validateImage(file)
    if (validationError) {
      alert(validationError)
      return
    }

    setUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/upload/image/gallery', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      })

      if (!response.ok) throw new Error('Error al subir imagen')

      const data = await response.json()
      onImagesChange([...images, data.data.url])
      
    } catch (error) {
      console.error('Error uploading image:', error)
    } finally {
      setUploading(false)
    }
  }

  /**
   * Manejar selección de archivos
   */
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const remainingSlots = maxImages - images.length
    
    // Validar cada archivo antes de subirlo
    const validFiles = files.slice(0, remainingSlots).filter(file => {
      const error = validateImage(file)
      if (error) {
        alert(`${file.name}: ${error}`)
        return false
      }
      return true
    })
    
    validFiles.forEach(uploadImage)
  }

  /**
   * Eliminar imagen
   */
  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
  }

  /**
   * Reordenar imágenes por drag & drop
   */
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (draggedIndex === null) return
    
    const newImages = [...images]
    const draggedImage = newImages[draggedIndex]
    
    newImages.splice(draggedIndex, 1)
    newImages.splice(dropIndex, 0, draggedImage)
    
    onImagesChange(newImages)
    setDraggedIndex(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Galería de fotos ({images.length}/{maxImages})
        </label>
        
        {images.length < maxImages && (
          <label className="cursor-pointer">
            <input
              type="file"
              multiple
              accept=".jpg,.jpeg,.png"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
            <Button
              as="span"
              size="sm"
              disabled={uploading}
              loading={uploading}
            >
              Agregar fotos
            </Button>
          </label>
        )}
      </div>

      {/* Grid de imágenes */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <AnimatePresence>
          {images.map((image, index) => (
            <motion.div
              key={`${image}-${index}`}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative aspect-square group cursor-pointer"
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
            >
              <img
                src={image}
                alt={`Galería ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
                onClick={() => setSelectedImage(image)}
              />
              
              {/* Overlay con acciones */}
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedImage(image)
                  }}
                  className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeImage(index)
                  }}
                  className="p-2 bg-red-500 bg-opacity-80 rounded-full hover:bg-opacity-100 transition-colors"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              {/* Indicador de posición */}
              <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                {index + 1}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Placeholder para agregar más imágenes */}
        {images.length < maxImages && (
          <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
            <input
              type="file"
              multiple
              accept=".jpg,.jpeg,.png"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
            <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="text-sm text-gray-500">Agregar foto</span>
          </label>
        )}
      </div>

      {/* Información */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
        <p className="text-sm text-blue-800 mb-1">
          <strong>Formatos permitidos:</strong> Solo JPG y PNG
        </p>
        <p className="text-sm text-blue-700">
          Arrastra las imágenes para reordenarlas. Máximo 5MB por imagen.
        </p>
      </div>

      {/* Modal para vista completa */}
      <Modal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        size="lg"
      >
        {selectedImage && (
          <div className="text-center">
            <img
              src={selectedImage}
              alt="Vista completa"
              className="max-w-full max-h-[70vh] mx-auto rounded-lg"
            />
          </div>
        )}
      </Modal>
    </div>
  )
}

export default GalleryUpload