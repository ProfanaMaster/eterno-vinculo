import { SUPABASE_TEMPLATE_URLS } from '@/services/storage';

export interface BackgroundConfig {
  mobile: string
  desktop: string
}

export const TEMPLATE_BACKGROUNDS: Record<string, BackgroundConfig> = {
  'template-1': {
    mobile: SUPABASE_TEMPLATE_URLS.mobile,
    desktop: SUPABASE_TEMPLATE_URLS.desktop
  },
  'template-2': {
    mobile: SUPABASE_TEMPLATE_URLS.mobile,
    desktop: SUPABASE_TEMPLATE_URLS.desktop
  },
  'template-3': {
    mobile: SUPABASE_TEMPLATE_URLS.mobile,
    desktop: SUPABASE_TEMPLATE_URLS.desktop
  },
  'template-4': {
    mobile: SUPABASE_TEMPLATE_URLS.mobile,
    desktop: SUPABASE_TEMPLATE_URLS.desktop
  }
}

export const TEMPLATE_VIDEOS: Record<string, string> = {
  'template-1': SUPABASE_TEMPLATE_URLS.videos['template-1'],
  'template-2': SUPABASE_TEMPLATE_URLS.videos['template-2'],
  'template-3': SUPABASE_TEMPLATE_URLS.videos['template-3'],
  'template-4': SUPABASE_TEMPLATE_URLS.videos['template-4']
}

export const MOBILE_BREAKPOINT = 460

export const getTemplateBackground = (templateId: string, isMobile: boolean): string => {
  const config = TEMPLATE_BACKGROUNDS[templateId]
  if (!config) return ''
  
  return isMobile ? config.mobile : config.desktop
}