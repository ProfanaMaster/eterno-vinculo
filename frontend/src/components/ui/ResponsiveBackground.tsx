import { useResponsiveBackground } from '@/hooks/useResponsiveBackground'

interface ResponsiveBackgroundProps {
  templateId: string
  children: React.ReactNode
  className?: string
}

const ResponsiveBackground = ({ templateId, children, className = '' }: ResponsiveBackgroundProps) => {
  const { background, isMobile } = useResponsiveBackground(templateId)

  if (!background) {
    return <div className={className}>{children}</div>
  }

  return (
    <div className={`relative ${className}`}>
      {background && (
        <div
          className={`absolute inset-0 w-full h-full ${
            ['template-7', 'template-8'].includes(templateId)
              ? 'bg-repeat-y bg-center bg-contain' // Templates 7-8: mantienen proporciones naturales y se repiten verticalmente
              : ['template-5', 'template-6'].includes(templateId)
                ? 'bg-contain bg-center bg-no-repeat' // Plantillas 5-6 usan bg-contain para evitar estiramiento
                : 'bg-cover bg-center bg-no-repeat' // Otras plantillas usan bg-cover
          }`}
          style={{ backgroundImage: `url(${background})` }}
        />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

export default ResponsiveBackground