import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Button, Modal } from '@/components/ui'
import { useProfileStore } from '@/stores/profileStore'

interface ReviewStepProps {
  onNext?: () => void
  onPrev: () => void
  canGoNext: boolean
  canGoPrev: boolean
}

/**
 * Último paso del wizard - Revisión y publicación
 * Muestra preview del perfil y permite publicar
 */
const ReviewStep = ({ onPrev }: ReviewStepProps) => {
  const navigate = useNavigate()
  const { profileData, publishProfile, loading, error } = useProfileStore()
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [published, setPublished] = useState(false)

  /**
   * Formatear fecha para mostrar
   */
  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  /**
   * Calcular años vividos
   */
  const calculateAge = () => {
    if (!profileData.birth_date || !profileData.death_date) return ''
    
    const birth = new Date(profileData.birth_date)
    const death = new Date(profileData.death_date)
    const years = death.getFullYear() - birth.getFullYear()
    
    return `${years} años`
  }

  /**
   * Publicar perfil
   */
  const handlePublish = async () => {
    try {
      await publishProfile()
      setPublished(true)
      setShowConfirmModal(false)
    } catch (err) {
      console.error('Error publishing profile:', err)
    }
  }

  /**
   * Ir al perfil publicado
   */
  const goToProfile = () => {
    // Aquí iríamos al perfil público
    navigate('/')
  }

  if (published) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          ¡Perfil Publicado!
        </h2>
        
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          El perfil memorial de <strong>{profileData.profile_name}</strong> ha sido publicado exitosamente. 
          Ya está disponible para que familiares y amigos puedan visitarlo.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 max-w-md mx-auto">
          <h3 className="font-semibold text-blue-900 mb-2">Código QR en proceso</h3>
          <p className="text-sm text-blue-700">
            Tu código QR personalizado se está generando y estará disponible en tu panel de usuario en unos minutos.
          </p>
        </div>

        <div className="space-x-4">
          <Button onClick={goToProfile}>
            Ver Perfil
          </Button>
          <Button variant="outline" onClick={() => navigate('/')}>
            Ir al Inicio
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Revisión Final
        </h2>
        <p className="text-gray-600">
          Revisa toda la información antes de publicar el perfil memorial
        </p>
      </div>

      {/* Preview del perfil */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {/* Banner */}
        {profileData.banner_image_url && (
          <div className="h-48 bg-gray-200 relative">
            <img
              src={profileData.banner_image_url}
              alt="Banner"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6">
          {/* Información principal */}
          <div className="flex items-start space-x-6 mb-6">
            {/* Foto de perfil */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
                {profileData.profile_image_url ? (
                  <img
                    src={profileData.profile_image_url}
                    alt={profileData.profile_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Información */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {profileData.profile_name}
              </h1>
              
              <div className="text-gray-600 space-y-1">
                <p>
                  {formatDate(profileData.birth_date)} - {formatDate(profileData.death_date)}
                  {calculateAge() && (
                    <span className="ml-2 text-sm">({calculateAge()})</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Descripción */}
          {profileData.description && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Descripción</h3>
              <p className="text-gray-700 leading-relaxed">
                {profileData.description}
              </p>
            </div>
          )}

          {/* Galería */}
          {profileData.gallery_images.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                Galería ({profileData.gallery_images.length} fotos)
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {profileData.gallery_images.slice(0, 6).map((image, index) => (
                  <div key={index} className="aspect-square">
                    <img
                      src={image}
                      alt={`Galería ${index + 1}`}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Video */}
          {profileData.memorial_video_url && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Video Memorial</h3>
              <video
                src={profileData.memorial_video_url}
                controls
                className="w-full max-w-md rounded"
              >
                Tu navegador no soporta la reproducción de video.
              </video>
            </div>
          )}
        </div>
      </div>

      {/* Información importante */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-yellow-900 mb-1">
              Antes de publicar
            </h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Una vez publicado, el perfil será visible públicamente</li>
              <li>• Podrás editarlo solo una vez más después de la publicación</li>
              <li>• Se generará un código QR único para compartir</li>
              <li>• La información será permanente en nuestros servidores</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Botones de navegación */}
      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={onPrev}
          disabled={loading}
        >
          Anterior
        </Button>
        
        <Button
          onClick={() => setShowConfirmModal(true)}
          disabled={loading}
          loading={loading}
        >
          Publicar Perfil
        </Button>
      </div>

      {/* Modal de confirmación */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirmar Publicación"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            ¿Estás seguro de que quieres publicar el perfil memorial de{' '}
            <strong>{profileData.profile_name}</strong>?
          </p>
          
          <p className="text-sm text-gray-600">
            Una vez publicado, el perfil será visible públicamente y solo podrás editarlo una vez más.
          </p>

          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handlePublish}
              loading={loading}
              className="flex-1"
            >
              Sí, Publicar
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  )
}

export default ReviewStep