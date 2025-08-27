import { supabase } from '@/config/supabase';

export interface TemplateAssets {
  mobile: string;
  desktop: string;
  video: string;
}

export const getSupabaseUrl = (bucket: string, path: string): string => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

export const getTemplateAssets = (templateId: string): TemplateAssets => {
  const bucket = 'templates';
  
  return {
    mobile: getSupabaseUrl(bucket, 'fondo-general-moviles.png'),
    desktop: getSupabaseUrl(bucket, 'fondo-general-pantalla-grande.png'),
    video: getSupabaseUrl(bucket, getTemplateVideo(templateId))
  };
};

const getTemplateVideo = (templateId: string): string => {
  const videoMap: Record<string, string> = {
    'template-1': 'fondo-olas.mp4',
    'template-2': 'fondo-viaje.mp4', 
    'template-3': 'fondo-nubes.mp4',
    'template-4': 'fondo-girasoles.mp4'
  };
  
  return videoMap[templateId] || 'fondo-olas.mp4';
};

// URLs generadas dinámicamente para evitar problemas de inicialización
export const SUPABASE_TEMPLATE_URLS = {
  get mobile() {
    return getSupabaseUrl('templates', 'fondo-general-moviles.png');
  },
  get desktop() {
    return getSupabaseUrl('templates', 'fondo-general-pantalla-grande.png');
  },
  videos: {
    get 'template-1'() {
      return getSupabaseUrl('templates', 'fondo-olas.mp4');
    },
    get 'template-2'() {
      return getSupabaseUrl('templates', 'fondo-viaje.mp4');
    },
    get 'template-3'() {
      return getSupabaseUrl('templates', 'fondo-nubes.mp4');
    },
    get 'template-4'() {
      return getSupabaseUrl('templates', 'fondo-girasoles.mp4');
    }
  }
};
