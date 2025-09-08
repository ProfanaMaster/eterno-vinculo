import { useResponsiveBackground } from '@/hooks/useResponsiveBackground'
import { TEMPLATE_VIDEOS } from '@/utils/templateBackgrounds'

interface ResponsiveBackgroundProps {
  templateId: string
  children: React.ReactNode
  className?: string
}

const ResponsiveBackground = ({ templateId, children, className = '' }: ResponsiveBackgroundProps) => {
  const { background, isMobile } = useResponsiveBackground(templateId)
  const videoUrl = TEMPLATE_VIDEOS[templateId]
  
  if (!background && !videoUrl) {
    return <div className={className}>{children}</div>
  }

  return (
    <div className={`relative ${className}`}>
      {/* Imagen de fondo */}
      {background && (
        <div
          className={`absolute inset-0 w-full h-full ${
            ['template-7', 'template-8', 'family-1', 'family-2', 'couple-1'].includes(templateId)
              ? 'bg-repeat-y bg-center bg-contain' // Templates 7-8, familiares y parejas: mantienen proporciones naturales y se repiten verticalmente
              : ['template-5', 'template-6'].includes(templateId)
                ? 'bg-contain bg-center bg-no-repeat' // Plantillas 5-6 usan bg-contain para evitar estiramiento
                : 'bg-cover bg-center bg-no-repeat' // Otras plantillas usan bg-cover
          }`}
          style={{ 
            backgroundImage: `url(${background})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'repeat-y',
            backgroundPosition: 'center'
          }}
        />
      )}
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

export default ResponsiveBackground