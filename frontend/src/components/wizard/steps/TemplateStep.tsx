import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useProfileStore } from '@/stores/profileStore'

interface Template {
  id: string
  name: string
  description: string
  background?: {
    mobile: string
    desktop: string
  }
  colors: {
    primary: string
    secondary: string
    accent: string
  }
}

interface TemplateStepProps {
  onNext: () => void
  onBack: () => void
}

const TemplateStep = ({ onNext, onBack }: TemplateStepProps) => {
  const { profileData, updateProfile } = useProfileStore()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3002/api'
      const response = await fetch(`${API_URL}/templates`)
      const data = await response.json()
      if (data.success) {
        setTemplates(data.templates)
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
      // Fallback templates si falla la API
      const { SUPABASE_TEMPLATE_URLS } = await import('@/services/storage')
      setTemplates([
        {
          id: 'template-1',
          name: 'Olas atardecer',
          description: 'Video de olas con fondo móvil',
          background: {
            mobile: SUPABASE_TEMPLATE_URLS.mobile,
            desktop: SUPABASE_TEMPLATE_URLS.desktop
          },
          colors: {
            primary: '#6b7280',
            secondary: '#f9fafb',
            accent: '#374151'
          }
        },
        {
          id: 'template-2',
          name: 'Un Viaje',
          description: 'Video de viaje con fondo móvil',
          background: {
            mobile: SUPABASE_TEMPLATE_URLS.mobile,
            desktop: SUPABASE_TEMPLATE_URLS.desktop
          },
          colors: {
            primary: '#6b7280',
            secondary: '#f9fafb',
            accent: '#374151'
          }
        },
        {
          id: 'template-3',
          name: 'Nubes',
          description: 'Video de nubes con fondo móvil',
          background: {
            mobile: SUPABASE_TEMPLATE_URLS.mobile,
            desktop: SUPABASE_TEMPLATE_URLS.desktop
          },
          colors: {
            primary: '#6b7280',
            secondary: '#f9fafb',
            accent: '#374151'
          }
        },
        {
          id: 'template-4',
          name: 'Girasoles',
          description: 'Video de girasoles con fondo móvil',
          background: {
            mobile: SUPABASE_TEMPLATE_URLS.mobile,
            desktop: SUPABASE_TEMPLATE_URLS.desktop
          },
          colors: {
            primary: '#6b7280',
            secondary: '#f9fafb',
            accent: '#374151'
          }
        },
        {
          id: 'template-5',
          name: 'Gatos',
          description: 'Para amantes de los felinos',
          background: {
            mobile: SUPABASE_TEMPLATE_URLS.mobile,
            desktop: SUPABASE_TEMPLATE_URLS.desktop
          },
          colors: {
            primary: '#6b7280',
            secondary: '#f9fafb',
            accent: '#374151'
          }
        },
        {
          id: 'template-6',
          name: 'Perros',
          description: 'Para amantes de los caninos',
          background: {
            mobile: SUPABASE_TEMPLATE_URLS.mobile,
            desktop: SUPABASE_TEMPLATE_URLS.desktop
          },
          colors: {
            primary: '#6b7280',
            secondary: '#f9fafb',
            accent: '#374151'
          }
        },
        {
          id: 'template-7',
          name: 'América',
          description: 'Temática del equipo América',
          background: {
            mobile: SUPABASE_TEMPLATE_URLS.mobile,
            desktop: SUPABASE_TEMPLATE_URLS.desktop
          },
          colors: {
            primary: '#6b7280',
            secondary: '#f9fafb',
            accent: '#374151'
          }
        },
        {
          id: 'template-8',
          name: 'Cali',
          description: 'Temática del equipo Deportivo Cali',
          background: {
            mobile: SUPABASE_TEMPLATE_URLS.mobile,
            desktop: SUPABASE_TEMPLATE_URLS.desktop
          },
          colors: {
            primary: '#6b7280',
            secondary: '#f9fafb',
            accent: '#374151'
          }
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleTemplateSelect = (templateId: string) => {
    updateProfile({ template_id: templateId })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Elige una Plantilla
        </h2>
        <p className="text-gray-600">
          Selecciona el diseño que mejor represente el memorial
        </p>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No se pudieron cargar las plantillas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
          <motion.div
            key={template.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              relative cursor-pointer rounded-lg border-2 transition-all
              ${profileData.template_id === template.id 
                ? 'border-blue-500 ring-2 ring-blue-200' 
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
            onClick={() => handleTemplateSelect(template.id)}
          >
            {/* Preview */}
            <div className="relative h-48 rounded-t-lg overflow-hidden">
              {/* Background preview */}
              <div 
                className={`absolute inset-0 bg-center ${
                  // Plantillas 5-8 usan bg-contain para evitar estiramiento
                  ['template-5', 'template-6', 'template-7', 'template-8'].includes(template.id) 
                    ? 'bg-contain' 
                    : 'bg-cover'
                }`}
                style={{ 
                  backgroundImage: `url(${template.background?.desktop || '/assets/templates/fondo-general-pantalla-grande.png'})`,
                  filter: 'brightness(0.7)'
                }}
              />
              
              {/* Content overlay */}
              <div className="relative z-10 p-4 flex flex-col justify-between h-full">
                <div className="bg-white/90 backdrop-blur p-3 rounded-lg">
                  <div className="w-12 h-12 bg-gray-300 rounded-full mb-2"></div>
                  <div className="h-3 bg-gray-600 rounded mb-1"></div>
                  <div className="h-2 bg-gray-400 rounded w-3/4"></div>
                </div>
                <div className="flex space-x-1">
                  <div className="w-8 h-8 bg-white/80 rounded"></div>
                  <div className="w-8 h-8 bg-white/80 rounded"></div>
                  <div className="w-8 h-8 bg-white/80 rounded"></div>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="p-4 bg-white rounded-b-lg">
              <h3 className="font-semibold text-gray-900 mb-1">
                {template.name}
              </h3>
              <p className="text-sm text-gray-600">
                {template.description}
              </p>
            </div>

            {/* Selected indicator */}
            {profileData.template_id === template.id && (
              <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </motion.div>
          ))}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Anterior
        </button>
        <button
          onClick={onNext}
          disabled={!profileData.template_id}
          className={`
            px-6 py-2 rounded-lg font-medium
            ${profileData.template_id
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          Continuar
        </button>
      </div>
    </div>
  )
}

export default TemplateStep