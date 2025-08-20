import { useState, useEffect } from 'react'
import { TEMPLATE_BACKGROUNDS, MOBILE_BREAKPOINT } from '@/utils/templateBackgrounds'

interface HybridBackgroundProps {
  templateId: string
  children: React.ReactNode
  className?: string
}

const HybridBackground = ({ templateId, children, className = '' }: HybridBackgroundProps) => {
  const [isMobile, setIsMobile] = useState(false)
  const [videoSrc, setVideoSrc] = useState('')

  useEffect(() => {
    const updateBackground = () => {
      const width = window.innerWidth
      const mobile = width < MOBILE_BREAKPOINT
      setIsMobile(mobile)

      if (mobile && TEMPLATE_BACKGROUNDS[templateId]) {
        setVideoSrc(TEMPLATE_BACKGROUNDS[templateId].mobile)
      } else {
        setVideoSrc('')
      }
    }

    updateBackground()
    window.addEventListener('resize', updateBackground)
    return () => window.removeEventListener('resize', updateBackground)
  }, [templateId])

  const getGradientColors = (templateId: string) => {
    const gradients = {
      'atardecer': 'from-orange-50 via-amber-25 to-orange-100',
      'camino': 'from-green-50 via-emerald-25 to-green-100', 
      'defecto': 'from-gray-50 via-slate-25 to-gray-100',
      'olas': 'from-blue-50 via-cyan-25 to-blue-100',
      'buda': 'from-purple-50 via-violet-25 to-purple-100'
    }
    return gradients[templateId as keyof typeof gradients] || gradients['defecto']
  }

  return (
    <div className={`relative ${className}`}>
      {/* Parte superior: Degradado */}
      <div className={`absolute inset-x-0 top-0 h-[60vh] bg-gradient-to-b ${getGradientColors(templateId)}`} />
      
      {/* Parte inferior: Solo video en móviles < 900px */}
      {isMobile && videoSrc && (
        <div className="absolute inset-x-0 top-[60vh] bottom-0 overflow-hidden">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        </div>
      )}
      
      {/* Contenido */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

export default HybridBackground