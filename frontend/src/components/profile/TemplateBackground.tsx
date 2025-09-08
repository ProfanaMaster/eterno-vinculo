import { getTemplateBackground, MOBILE_BREAKPOINT, TEMPLATE_VIDEOS } from '@/utils/templateBackgrounds'
import { useEffect, useState } from 'react'

interface TemplateBackgroundProps {
  templateId: string
  className?: string
}

const TemplateBackground = ({ templateId, className = '' }: TemplateBackgroundProps) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= MOBILE_BREAKPOINT)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const backgroundImage = getTemplateBackground(templateId, isMobile)
  const templateVideo = TEMPLATE_VIDEOS[templateId]

  if (!backgroundImage && !templateVideo) return null

  return (
    <div className={`absolute inset-x-0 top-0 ${className}`} style={{ height: isMobile ? '40vh' : '50vh', zIndex: -1 }}>
      {templateVideo && isMobile ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          onError={(e) => {
            console.warn('Error cargando video template:', templateVideo, e);
            e.currentTarget.style.display = 'none';
          }}
        >
          <source src={templateVideo} type="video/mp4" />
        </video>
      ) : (
        <div 
          className={`w-full h-full ${
            ['template-7', 'template-8', 'family-1', 'family-2', 'couple-1'].includes(templateId)
              ? 'bg-repeat-y bg-center bg-contain' // Templates 7-8, familiares y parejas: mantienen proporciones naturales y se repiten verticalmente
              : ['template-5', 'template-6'].includes(templateId)
                ? 'bg-contain bg-center bg-no-repeat' // Plantillas 5-6 usan bg-contain para evitar estiramiento
                : 'bg-cover bg-center bg-no-repeat' // Otras plantillas usan bg-cover
          }`}
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}
    </div>
  )
}

export default TemplateBackground