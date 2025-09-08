import { SUPABASE_TEMPLATE_URLS, getSupabaseUrl } from '@/services/storage';

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
  },
  'template-5': {
    get mobile() { return getSupabaseUrl('templates', 'fondo-gatos.png'); },
    desktop: SUPABASE_TEMPLATE_URLS.desktop
  },
  'template-6': {
    get mobile() { return getSupabaseUrl('templates', 'fondo-perros.png'); },
    desktop: SUPABASE_TEMPLATE_URLS.desktop
  },
  'template-7': {
    get mobile() { return getSupabaseUrl('templates', 'fondo-america.png'); },
    desktop: SUPABASE_TEMPLATE_URLS.desktop
  },
  'template-8': {
    get mobile() { return getSupabaseUrl('templates', 'fondo-cali.png'); },
    desktop: SUPABASE_TEMPLATE_URLS.desktop
  },
  'family-1': {
    get mobile() { return getSupabaseUrl('templates', 'fondo-familiar.png'); }, // Archivo correcto que SÍ existe
    get desktop() { return getSupabaseUrl('templates', 'fondo-general-pantalla-grande.png'); }
  },
  'family-2': {
    get mobile() { return getSupabaseUrl('templates', 'fondo-familiar-2.png'); },
    get desktop() { return getSupabaseUrl('templates', 'fondo-general-pantalla-grande.png'); }
  },
  'couple-1': {
    get mobile() { return getSupabaseUrl('templates', 'fondo-pareja.png'); },
    get desktop() { return getSupabaseUrl('templates', 'fondo-pareja.png'); }
  }
}

export const TEMPLATE_VIDEOS: Record<string, string> = {
  'template-1': SUPABASE_TEMPLATE_URLS.videos['template-1'],
  'template-2': SUPABASE_TEMPLATE_URLS.videos['template-2'],
  'template-3': SUPABASE_TEMPLATE_URLS.videos['template-3'],
  'template-4': SUPABASE_TEMPLATE_URLS.videos['template-4'],
  'template-5': SUPABASE_TEMPLATE_URLS.videos['template-5'],
  'template-6': SUPABASE_TEMPLATE_URLS.videos['template-6'],
  'template-7': SUPABASE_TEMPLATE_URLS.videos['template-7'],
  'template-8': SUPABASE_TEMPLATE_URLS.videos['template-8'],
  'family-1': SUPABASE_TEMPLATE_URLS.videos['family-1'],
  'family-2': SUPABASE_TEMPLATE_URLS.videos['family-2'],
  'couple-1': SUPABASE_TEMPLATE_URLS.videos['couple-1']
}

export const MOBILE_BREAKPOINT = 460

export const getTemplateBackground = (templateId: string, isMobile: boolean): string => {
  const config = TEMPLATE_BACKGROUNDS[templateId]
  if (!config) return ''
  
  return isMobile ? config.mobile : config.desktop
}