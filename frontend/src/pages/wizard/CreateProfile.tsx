import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useProfileStore } from '@/stores/profileStore'
import WizardContainer from '@/components/wizard/WizardContainer'
import TemplateStep from '@/components/wizard/steps/TemplateStep'
import BasicInfoStep from '@/components/wizard/steps/BasicInfoStep'
import MediaStep from '@/components/wizard/steps/MediaStep'
import ReviewStep from '@/components/wizard/steps/ReviewStep'

/**
 * Página principal del wizard de creación de perfiles
 * Gestiona el flujo completo desde información básica hasta publicación
 */
const CreateProfile = () => {
  const navigate = useNavigate()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { resetProfile } = useProfileStore()

  // Verificar autenticación
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, authLoading, navigate])

  // Resetear perfil al montar el componente
  useEffect(() => {
    resetProfile()
  }, [resetProfile])

  // Definición de pasos del wizard
  const wizardSteps = [
    {
      id: 'template',
      title: 'Seleccionar Plantilla',
      description: 'Elige el diseño que mejor represente el memorial',
      component: TemplateStep
    },
    {
      id: 'basic-info',
      title: 'Información Básica',
      description: 'Completa los datos principales del perfil memorial',
      component: BasicInfoStep
    },
    {
      id: 'media',
      title: 'Fotos y Videos',
      description: 'Sube las imágenes y video que formarán parte del memorial',
      component: MediaStep
    },
    {
      id: 'review',
      title: 'Revisión Final',
      description: 'Revisa toda la información antes de publicar',
      component: ReviewStep
    }
  ]

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Se redirigirá al login
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Crear Perfil Memorial
          </h1>
          <p className="text-lg text-gray-600">
            Crea un hermoso memorial para honrar la memoria de tu ser querido
          </p>
        </div>

        {/* Wizard */}
        <WizardContainer steps={wizardSteps} />
      </div>
    </div>
  )
}

export default CreateProfile