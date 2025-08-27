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
          className={`absolute inset-0 w-full h-full bg-center bg-no-repeat ${
            // Plantillas 5-8 usan bg-contain para evitar estiramiento
            ['template-5', 'template-6', 'template-7', 'template-8'].includes(templateId) 
              ? 'bg-contain' 
              : 'bg-cover'
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