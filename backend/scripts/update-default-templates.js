import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const newTemplates = [
  {
    id: 'atardecer',
    name: 'Por defecto - Atardecer',
    description: 'Fondo sereno de atardecer',
    preview_image_url: '/assets/templates/fondo-general-pantalla-grande.png',
    css_styles: {
      background: {
        mobile: '/assets/templates/fondo-atardecer.mp4',
        desktop: '/assets/templates/fondo-general-pantalla-grande.png'
      },
      colors: {
        primary: '#f59e0b',
        secondary: '#fef3c7',
        accent: '#d97706'
      }
    },
    layout_config: {
      type: 'single-column',
      sections: ['header', 'photo', 'info', 'description', 'gallery'],
      spacing: 'comfortable'
    },
    is_premium: false
  },
  {
    id: 'camino',
    name: 'Por defecto - Camino',
    description: 'Sendero hacia la eternidad',
    preview_image_url: '/assets/templates/fondo-general-pantalla-grande.png',
    css_styles: {
      background: {
        mobile: '/assets/templates/fondo-camino.mp4',
        desktop: '/assets/templates/fondo-general-pantalla-grande.png'
      },
      colors: {
        primary: '#059669',
        secondary: '#d1fae5',
        accent: '#047857'
      }
    },
    layout_config: {
      type: 'single-column',
      sections: ['header', 'photo', 'info', 'description', 'gallery'],
      spacing: 'comfortable'
    },
    is_premium: false
  },
  {
    id: 'defecto',
    name: 'Por defecto - Clásico',
    description: 'Diseño elegante y sereno',
    preview_image_url: '/assets/templates/fondo-general-pantalla-grande.png',
    css_styles: {
      background: {
        mobile: '/assets/templates/fondo-defecto.mp4',
        desktop: '/assets/templates/fondo-general-pantalla-grande.png'
      },
      colors: {
        primary: '#6b7280',
        secondary: '#f9fafb',
        accent: '#374151'
      }
    },
    layout_config: {
      type: 'single-column',
      sections: ['header', 'photo', 'info', 'description', 'gallery'],
      spacing: 'comfortable'
    },
    is_premium: false
  },
  {
    id: 'olas',
    name: 'Por defecto - Olas',
    description: 'Tranquilidad del océano',
    preview_image_url: '/assets/templates/fondo-general-pantalla-grande.png',
    css_styles: {
      background: {
        mobile: '/assets/templates/fondo-olas.mp4',
        desktop: '/assets/templates/fondo-general-pantalla-grande.png'
      },
      colors: {
        primary: '#0ea5e9',
        secondary: '#e0f2fe',
        accent: '#0284c7'
      }
    },
    layout_config: {
      type: 'single-column',
      sections: ['header', 'photo', 'info', 'description', 'gallery'],
      spacing: 'comfortable'
    },
    is_premium: false
  },
  {
    id: 'buda',
    name: 'Por defecto - Espiritual',
    description: 'Paz y serenidad espiritual',
    preview_image_url: '/assets/templates/fondo-general-pantalla-grande.png',
    css_styles: {
      background: {
        mobile: '/assets/templates/fondo-buda.mp4',
        desktop: '/assets/templates/fondo-general-pantalla-grande.png'
      },
      colors: {
        primary: '#7c3aed',
        secondary: '#f3e8ff',
        accent: '#6d28d9'
      }
    },
    layout_config: {
      type: 'single-column',
      sections: ['header', 'photo', 'info', 'description', 'gallery'],
      spacing: 'comfortable'
    },
    is_premium: false
  }
]

async function updateTemplates() {
  try {
    console.log('🔄 Eliminando plantillas existentes...')
    
    // Eliminar plantillas existentes
    const { error: deleteError } = await supabase
      .from('templates')
      .delete()
      .neq('id', 'non-existent') // Eliminar todas
    
    if (deleteError) {
      console.error('Error eliminando plantillas:', deleteError)
    }

    console.log('✅ Plantillas eliminadas')
    console.log('📝 Insertando nuevas plantillas...')

    // Insertar nuevas plantillas
    const { data, error } = await supabase
      .from('templates')
      .insert(newTemplates)
      .select()

    if (error) {
      console.error('Error insertando plantillas:', error)
      return
    }

    console.log('✅ Plantillas actualizadas exitosamente:', data?.length || newTemplates.length)
    
    // Verificar plantillas creadas
    const { data: allTemplates } = await supabase
      .from('templates')
      .select('id, name')

    console.log('📋 Plantillas disponibles:')
    allTemplates?.forEach(template => {
      console.log(`  - ${template.name} (${template.id})`)
    })
    
  } catch (error) {
    console.error('Error:', error)
  }
}

updateTemplates()