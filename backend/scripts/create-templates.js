import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const templates = [
  {
    name: 'Músico',
    description: 'Diseño musical con notas y colores vibrantes',
    layout: {
      type: 'single-column',
      sections: ['header', 'photo', 'info', 'description', 'gallery', 'video'],
      spacing: 'comfortable',
      icons: ['🎵', '🎼', '🎤', '🎸'],
      typography: {
        title: 'text-2xl font-bold text-purple-900',
        subtitle: 'text-lg text-purple-700',
        body: 'text-base text-gray-800 leading-relaxed'
      }
    },
    styles: {
      background: 'bg-gradient-to-b from-purple-100 via-pink-50 to-white',
      card: 'bg-white/90 backdrop-blur rounded-xl shadow-lg border border-purple-200',
      accent: 'text-purple-600',
      button: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full px-6 py-3'
    },
    mobile_optimized: true,
    is_active: true
  },
  {
    name: 'Médico Hombre',
    description: 'Diseño profesional médico con tonos azules',
    layout: {
      type: 'single-column',
      sections: ['header', 'photo', 'info', 'description', 'gallery', 'video'],
      spacing: 'professional',
      icons: ['⚕️', '🩺', '💊', '🏥'],
      typography: {
        title: 'text-2xl font-bold text-blue-900',
        subtitle: 'text-lg text-blue-700',
        body: 'text-base text-gray-800 leading-relaxed'
      }
    },
    styles: {
      background: 'bg-gradient-to-b from-blue-50 via-cyan-25 to-white',
      card: 'bg-white rounded-lg shadow-md border-l-4 border-blue-500',
      accent: 'text-blue-600',
      button: 'bg-blue-600 text-white rounded-lg px-6 py-3 font-medium'
    },
    mobile_optimized: true,
    is_active: true
  },
  {
    name: 'Médica Mujer',
    description: 'Diseño profesional médico con tonos rosados suaves',
    layout: {
      type: 'single-column',
      sections: ['header', 'photo', 'info', 'description', 'gallery', 'video'],
      spacing: 'professional',
      icons: ['⚕️', '🩺', '💊', '🏥'],
      typography: {
        title: 'text-2xl font-bold text-rose-900',
        subtitle: 'text-lg text-rose-700',
        body: 'text-base text-gray-800 leading-relaxed'
      }
    },
    styles: {
      background: 'bg-gradient-to-b from-rose-50 via-pink-25 to-white',
      card: 'bg-white rounded-lg shadow-md border-l-4 border-rose-400',
      accent: 'text-rose-600',
      button: 'bg-rose-500 text-white rounded-lg px-6 py-3 font-medium'
    },
    mobile_optimized: true,
    is_active: true
  },
  {
    name: 'Maestro',
    description: 'Diseño educativo con elementos académicos',
    layout: {
      type: 'single-column',
      sections: ['header', 'photo', 'info', 'description', 'gallery', 'video'],
      spacing: 'educational',
      icons: ['📚', '✏️', '🎓', '📝'],
      typography: {
        title: 'text-2xl font-bold text-green-900',
        subtitle: 'text-lg text-green-700',
        body: 'text-base text-gray-800 leading-relaxed'
      }
    },
    styles: {
      background: 'bg-gradient-to-b from-green-50 via-emerald-25 to-white',
      card: 'bg-white rounded-lg shadow-md border-t-4 border-green-500',
      accent: 'text-green-600',
      button: 'bg-green-600 text-white rounded-lg px-6 py-3 font-medium'
    },
    mobile_optimized: true,
    is_active: true
  },
  {
    name: 'Fuerzas del Orden',
    description: 'Diseño honorífico para servicios públicos',
    layout: {
      type: 'single-column',
      sections: ['header', 'photo', 'info', 'description', 'gallery', 'video'],
      spacing: 'honor',
      icons: ['🛡️', '⭐', '🎖️', '🚔'],
      typography: {
        title: 'text-2xl font-bold text-slate-900',
        subtitle: 'text-lg text-slate-700',
        body: 'text-base text-gray-800 leading-relaxed'
      }
    },
    styles: {
      background: 'bg-gradient-to-b from-slate-100 via-blue-50 to-white',
      card: 'bg-white rounded-lg shadow-lg border border-slate-300',
      accent: 'text-slate-700',
      button: 'bg-slate-700 text-white rounded-lg px-6 py-3 font-bold'
    },
    mobile_optimized: true,
    is_active: true
  },
  {
    name: 'Mascota',
    description: 'Diseño tierno para compañeros de cuatro patas',
    layout: {
      type: 'single-column',
      sections: ['header', 'photo', 'info', 'description', 'gallery', 'video'],
      spacing: 'playful',
      icons: ['🐕', '🐱', '🐴', '❤️'],
      typography: {
        title: 'text-2xl font-bold text-orange-900',
        subtitle: 'text-lg text-orange-700',
        body: 'text-base text-gray-800 leading-relaxed'
      }
    },
    styles: {
      background: 'bg-gradient-to-b from-orange-100 via-yellow-50 to-white',
      card: 'bg-white rounded-2xl shadow-lg border-2 border-orange-200',
      accent: 'text-orange-600',
      button: 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-full px-6 py-3'
    },
    mobile_optimized: true,
    is_active: true
  },
  {
    name: 'Niño/Niña',
    description: 'Diseño dulce y colorido para los más pequeños',
    layout: {
      type: 'single-column',
      sections: ['header', 'photo', 'info', 'description', 'gallery', 'video'],
      spacing: 'gentle',
      icons: ['🌈', '⭐', '🦋', '🌸'],
      typography: {
        title: 'text-2xl font-bold text-indigo-900',
        subtitle: 'text-lg text-indigo-700',
        body: 'text-base text-gray-800 leading-relaxed'
      }
    },
    styles: {
      background: 'bg-gradient-to-b from-indigo-100 via-purple-50 to-pink-50',
      card: 'bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-indigo-200',
      accent: 'text-indigo-600',
      button: 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full px-6 py-3'
    },
    mobile_optimized: true,
    is_active: true
  }
]

async function createTemplates() {
  try {
    // Primero verificar si la tabla existe, si no, crearla
    const { data: existingTemplates } = await supabase
      .from('templates')
      .select('id')
      .limit(1)
    
    // Si no hay error, la tabla existe, proceder con inserción
    const { data, error } = await supabase
      .from('templates')
      .insert(templates)
      .select()

    if (error) {
      console.error('Error insertando plantillas:', error)
      console.log('Nota: Es posible que necesites crear la tabla templates manualmente')
      return
    }

    console.log('✅ Plantillas creadas exitosamente:', data?.length || templates.length)
    
    // Verificar plantillas creadas
    const { data: allTemplates } = await supabase
      .from('templates')
      .select('*')
      .eq('mobile_optimized', true)

    console.log('📱 Plantillas móviles disponibles:', allTemplates?.length)
    
  } catch (error) {
    console.error('Error:', error)
  }
}

createTemplates()