export interface BackgroundConfig {
  mobile: string
  desktop: string
}

export const TEMPLATE_BACKGROUNDS: Record<string, BackgroundConfig> = {
  'template-1': {
    mobile: '/assets/templates/fondo-general-moviles.png',
    desktop: '/assets/templates/fondo-general-pantalla-grande.png'
  },
  'template-2': {
    mobile: '/assets/templates/fondo-general-moviles.png',
    desktop: '/assets/templates/fondo-general-pantalla-grande.png'
  },
  'template-3': {
    mobile: '/assets/templates/fondo-general-moviles.png',
    desktop: '/assets/templates/fondo-general-pantalla-grande.png'
  },
  'template-4': {
    mobile: '/assets/templates/fondo-general-moviles.png',
    desktop: '/assets/templates/fondo-general-pantalla-grande.png'
  }
}

export const TEMPLATE_VIDEOS: Record<string, string> = {
  'template-1': '/assets/templates/fondo-olas.mp4',
  'template-2': '/assets/templates/fondo-viaje.mp4',
  'template-3': '/assets/templates/fondo-nubes.mp4',
  'template-4': '/assets/templates/fondo-girasoles.mp4'
}

export const MOBILE_BREAKPOINT = 460

export const getTemplateBackground = (templateId: string, isMobile: boolean): string => {
  const config = TEMPLATE_BACKGROUNDS[templateId]
  if (!config) return ''
  
  return isMobile ? config.mobile : config.desktop
}