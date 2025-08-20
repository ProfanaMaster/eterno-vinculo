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
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
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