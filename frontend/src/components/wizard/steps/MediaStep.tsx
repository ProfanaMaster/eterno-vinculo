import { motion } from 'framer-motion'
import { Button } from '@/components/ui'
import { useProfileStore } from '@/stores/profileStore'
import ImageUpload from '@/components/editor/ImageUpload'
import GalleryUpload from '@/components/editor/GalleryUpload'
import VideoUpload from '@/components/editor/VideoUpload'

interface MediaStepProps {
  onNext: () => void
  onPrev: () => void
  canGoNext: boolean
  canGoPrev: boolean
}

/**
 * Segundo paso del wizard - Subida de medios
 * Gestiona foto de perfil, galería y video
 */
const MediaStep = ({ onNext, onPrev, canGoNext, canGoPrev }: MediaStepProps) => {
  const { profileData, updateProfile, saving, error } = useProfileStore()

  /**
   * Actualizar imagen de perfil
   */
  const handleProfileImageChange = (url: string) => {
    updateProfile({ profile_image_url: url })
  }



  /**
   * Actualizar galería de imágenes
   */
  const handleGalleryChange = (images: string[]) => {
    updateProfile({ gallery_images: images })
  }

  /**
   * Actualizar video memorial
   */
  const handleVideoChange = (url: string) => {
    updateProfile({ memorial_video_url: url })
  }

  /**
   * Validar que al menos tenga una imagen de perfil
   */
  const canContinue = () => {
    return !!profileData.profile_image_url
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Error general */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Imágenes principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ImageUpload
          label="Foto de perfil"
          type="profile"
          currentImage={profileData.profile_image_url}
          onImageUploaded={handleProfileImageChange}
          maxSize={2}
        />


      </div>

      {/* Información sobre imágenes principales */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">
              Imágenes principales
            </h4>
            <p className="text-sm text-blue-700">
              La foto de perfil es <strong>obligatoria</strong> y será la imagen principal del memorial. 

            </p>
          </div>
        </div>
      </div>

      {/* Galería de fotos */}
      <div>
        <GalleryUpload
          images={profileData.gallery_images}
          onImagesChange={handleGalleryChange}
          maxImages={6}
        />
      </div>

      {/* Video memorial */}
      <div>
        <VideoUpload
          currentVideo={profileData.memorial_video_url}
          onVideoUploaded={handleVideoChange}
          maxSize={65}
          maxDuration={180}
        />
      </div>

      {/* Resumen de medios */}
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          Resumen de medios subidos
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${
              profileData.profile_image_url ? 'bg-green-500' : 'bg-gray-300'
            }`}></div>
            <span className={profileData.profile_image_url ? 'text-green-700' : 'text-gray-500'}>
              Foto de perfil
            </span>
          </div>
          

          
          <div className="text-center">
            <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${
              profileData.gallery_images.length > 0 ? 'bg-green-500' : 'bg-gray-300'
            }`}></div>
            <span className={profileData.gallery_images.length > 0 ? 'text-green-700' : 'text-gray-500'}>
              Galería ({profileData.gallery_images.length})
            </span>
          </div>
          
          <div className="text-center">
            <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${
              profileData.memorial_video_url ? 'bg-green-500' : 'bg-gray-300'
            }`}></div>
            <span className={profileData.memorial_video_url ? 'text-green-700' : 'text-gray-500'}>
              Video
            </span>
          </div>
        </div>
      </div>

      {/* Botones de navegación */}
      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={onPrev}
          disabled={saving}
        >
          Anterior
        </Button>
        
        <Button
          onClick={onNext}
          disabled={saving || !canContinue()}
          loading={saving}
        >
          {canGoNext ? 'Continuar' : 'Siguiente'}
        </Button>
      </div>

      {/* Mensaje de validación */}
      {!canContinue() && (
        <p className="text-sm text-red-600 text-center">
          Debes subir al menos una foto de perfil para continuar
        </p>
      )}
    </motion.div>
  )
}

export default MediaStep