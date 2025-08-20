import { useState, useEffect } from 'react'
import { TEMPLATE_BACKGROUNDS, MOBILE_BREAKPOINT, getTemplateBackground } from '@/utils/templateBackgrounds'

export const useResponsiveBackground = (templateId: string | undefined) => {
  const [background, setBackground] = useState<string>('')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const updateBackground = () => {
      if (!templateId) return

      const width = window.innerWidth
      const mobile = width < MOBILE_BREAKPOINT
      setIsMobile(mobile)

      const bg = getTemplateBackground(templateId, mobile)
      setBackground(bg)
    }

    updateBackground()
    window.addEventListener('resize', updateBackground)
    
    return () => window.removeEventListener('resize', updateBackground)
  }, [templateId])

  return { background, isMobile }
}