import { TEMPLATE_BACKGROUNDS, MOBILE_BREAKPOINT } from '@/utils/templateBackgrounds'
import { useState, useEffect } from 'react'

interface TemplateSelectorProps {
  selectedTemplate: string
  onTemplateSelect: (templateId: string) => void
}

const templates = [
  {
    id: 'template-1',
    name: 'Olas atardecer',
    description: 'Video de olas con fondo móvil'
  },
  {
    id: 'template-2', 
    name: 'Un Viaje',
    description: 'Video de viaje con fondo móvil'
  },
  {
    id: 'template-3',
    name: 'Nubes', 
    description: 'Video de nubes con fondo móvil'
  },
  {
    id: 'template-4',
    name: 'Girasoles',
    description: 'Video de girasoles con fondo móvil'
  },
  {
    id: 'template-5',
    name: 'Gatos',
    description: 'Para amantes de los felinos'
  },
  {
    id: 'template-6',
    name: 'Perros',
    description: 'Para amantes de los caninos'
  },
  {
    id: 'template-7',
    name: 'América',
    description: 'Temática del equipo América'
  },
  {
    id: 'template-8',
    name: 'Cali',
    description: 'Temática del equipo Deportivo Cali'
  }
]

const TemplateSelector = ({ selectedTemplate, onTemplateSelect }: TemplateSelectorProps) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= MOBILE_BREAKPOINT)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Selecciona una plantilla</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {templates.map((template) => {
          const backgroundConfig = TEMPLATE_BACKGROUNDS[template.id]
          const backgroundImage = isMobile ? backgroundConfig?.mobile : backgroundConfig?.desktop
          
          return (
            <div
              key={template.id}
              className={`relative cursor-pointer rounded-lg border-2 transition-all ${
                selectedTemplate === template.id
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onTemplateSelect(template.id)}
            >
              <div className="aspect-[3/4] rounded-lg overflow-hidden">
                <div
                  className={`w-full h-full bg-center ${
                    // Plantillas 5-8 usan bg-contain para evitar estiramiento
                    ['template-5', 'template-6', 'template-7', 'template-8'].includes(template.id) 
                      ? 'bg-contain' 
                      : 'bg-cover'
                  }`}
                  style={{ backgroundImage: `url(${backgroundImage})` }}
                >
                  <div className="absolute inset-0 bg-black/20 rounded-lg" />
                </div>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm p-3 rounded-b-lg">
                <h4 className="font-medium text-gray-900">{template.name}</h4>
                <p className="text-sm text-gray-600">{template.description}</p>
              </div>
              
              {selectedTemplate === template.id && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default TemplateSelector