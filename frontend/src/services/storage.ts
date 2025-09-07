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

export const checkFileExists = async (bucket: string, path: string): Promise<boolean> => {
  try {
    // Intentar obtener el archivo directamente
    const { data, error } = await supabase.storage.from(bucket).download(path);
    
    if (error) {
      // Si hay error, verificar si es porque el archivo no existe
      if (error.message?.includes('Object not found') || error.message?.includes('not found')) {
        return false;
      }
      console.warn('Error verificando archivo:', path, error);
      return false;
    }
    
    // Si no hay error y hay data, el archivo existe
    return data !== null;
  } catch (error) {
    console.warn('Error verificando archivo:', path, error);
    return false;
  }
};

export const getTemplateAssets = (templateId: string): TemplateAssets => {
  const bucket = 'templates';
  
  // Mapeo de fondos móviles específicos para plantillas 5-8
  const mobileBackgroundMap: Record<string, string> = {
    'template-5': 'fondo-gatos.png',
    'template-6': 'fondo-perros.png', 
    'template-7': 'fondo-america.png',
    'template-8': 'fondo-cali.png',
    'family-1': 'fondo-familiar.png', // Archivo correcto que SÍ existe
    'family-2': 'fondo-familiar-2.png'
  };
  
  // Plantillas 1-4 usan fondo general móvil, 5-8 usan fondos específicos
  const mobileBackground = mobileBackgroundMap[templateId] || 'fondo-general-moviles.png';
  
  return {
    mobile: getSupabaseUrl(bucket, mobileBackground),
    desktop: getSupabaseUrl(bucket, 'fondo-general-pantalla-grande.png'), // Desktop siempre el mismo
    video: getSupabaseUrl(bucket, getTemplateVideo(templateId))
  };
};

const getTemplateVideo = (templateId: string): string => {
  const videoMap: Record<string, string> = {
    'template-1': 'fondo-olas.mp4',
    'template-2': 'fondo-viaje.mp4', 
    'template-3': 'fondo-nubes.mp4',
    'template-4': 'fondo-girasoles.mp4',
    'template-5': 'fondo-gatos.mp4',
    'template-6': 'fondo-perros.mp4',
    'template-7': 'fondo-america.mp4',
    'template-8': 'fondo-cali.mp4',
    'family-1': 'fondo-familiar.mp4', // Video que SÍ existe
    'family-2': 'fondo-familiar-2.mp4'  // Video que SÍ existe
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
    },
    get 'template-5'() {
      return getSupabaseUrl('templates', 'fondo-gatos.mp4');
    },
    get 'template-6'() {
      return getSupabaseUrl('templates', 'fondo-perros.mp4');
    },
    get 'template-7'() {
      return getSupabaseUrl('templates', 'fondo-america.mp4');
    },
    get 'template-8'() {
      return getSupabaseUrl('templates', 'fondo-cali.mp4');
    },
    get 'family-1'() {
      return getSupabaseUrl('templates', 'fondo-familiar.mp4'); // Video que SÍ existe
    },
    get 'family-2'() {
      return getSupabaseUrl('templates', 'fondo-familiar-2.mp4'); // Video que SÍ existe
    }
  }
};
