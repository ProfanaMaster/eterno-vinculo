import { Router } from 'express'
import ordersRouter from './orders.js'
import profilesRouter from './profiles.js'
import familyProfilesRouter from './familyProfiles.js'
import familyMembersRouter from './familyMembers.js'
import uploadRouter from './uploadRoutes.js'
import adminRouter from './admin.js'
import { supabaseAdmin } from '../config/supabase.js'

const router = Router()

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' })
})

// Settings endpoint
router.get('/settings', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .select('*')
      .order('key')

    if (error) throw error

    res.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    res.status(500).json({ error: 'Error al obtener configuraciones' })
  }
})

// Rutas básicas
router.get('/', (req, res) => {
  res.json({ message: 'Eterno Vínculo API' })
})

// Registrar rutas de órdenes
router.use('/orders', ordersRouter)

// Registrar rutas de perfiles
router.use('/profiles', profilesRouter)

// Registrar rutas de perfiles familiares
router.use('/family-profiles', familyProfilesRouter)

// Registrar rutas de miembros familiares (nested bajo family-profiles)
router.use('/family-profiles', familyMembersRouter)

// Registrar rutas de upload
router.use('/upload', uploadRouter)

// Proxy optimizado para subida de archivos
import uploadProxyRouter from './uploadProxy.js'
router.use('/upload-proxy', uploadProxyRouter)

// Proxy para frases motivacionales
import quotesRouter from './quotesRoutes.js'
router.use('/quotes', quotesRouter)

// Registrar proxy de imágenes para servir desde R2
import imageProxyRouter from './imageProxy.js'
router.use('/image-proxy', imageProxyRouter)

// Registrar rutas de admin
router.use('/admin', adminRouter)


// Registrar rutas de memories (públicas)
import memoriesRouter from './memories.js'
router.use('/memories', memoriesRouter)

// Registrar rutas de templates
import templatesRouter from './templates.js'
router.use('/templates', templatesRouter)

// Ruta pública para obtener paquetes
router.get('/packages', async (req, res) => {
  try {
    const { data: packages, error } = await supabaseAdmin
      .from('packages')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      data: packages
    });
  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({ error: 'Error al obtener paquetes' });
  }
});



// Endpoint para obtener plantillas
router.get('/templates', async (req, res) => {
  try {
    const templates = [
      {
        id: 'template-1',
        name: 'Olas atardecer',
        description: 'Video de olas con fondo móvil',
        icons: ['🌊'],
        background: {
          mobile: 'https://via.placeholder.com/400x600',
          desktop: 'https://via.placeholder.com/800x600'
        },
        colors: {
          primary: '#6b7280',
          secondary: '#f9fafb',
          accent: '#374151'
        }
      },
      {
        id: 'template-2',
        name: 'Un Viaje',
        description: 'Video de viaje con fondo móvil',
        icons: ['✈️'],
        background: {
          mobile: 'https://via.placeholder.com/400x600',
          desktop: 'https://via.placeholder.com/800x600'
        },
        colors: {
          primary: '#6b7280',
          secondary: '#f9fafb',
          accent: '#374151'
        }
      },
      {
        id: 'template-3',
        name: 'Nubes',
        description: 'Video de nubes con fondo móvil',
        icons: ['☁️'],
        background: {
          mobile: 'https://via.placeholder.com/400x600',
          desktop: 'https://via.placeholder.com/800x600'
        },
        colors: {
          primary: '#6b7280',
          secondary: '#f9fafb',
          accent: '#374151'
        }
      },
      {
        id: 'template-4',
        name: 'Girasoles',
        description: 'Video de girasoles con fondo móvil',
        icons: ['🌻'],
        background: {
          mobile: 'https://via.placeholder.com/400x600',
          desktop: 'https://via.placeholder.com/800x600'
        },
        colors: {
          primary: '#6b7280',
          secondary: '#f9fafb',
          accent: '#374151'
        }
      },
      {
        id: 'template-5',
        name: 'Gatos',
        description: 'Para amantes de los felinos',
        icons: ['🐱'],
        background: {
          mobile: 'https://via.placeholder.com/400x600',
          desktop: 'https://via.placeholder.com/800x600'
        },
        colors: {
          primary: '#6b7280',
          secondary: '#f9fafb',
          accent: '#374151'
        }
      },
      {
        id: 'template-6',
        name: 'Perros',
        description: 'Para amantes de los caninos',
        icons: ['🐶'],
        background: {
          mobile: 'https://via.placeholder.com/400x600',
          desktop: 'https://via.placeholder.com/800x600'
        },
        colors: {
          primary: '#6b7280',
          secondary: '#f9fafb',
          accent: '#374151'
        }
      },
      {
        id: 'template-7',
        name: 'América',
        description: 'Temática del equipo América',
        icons: ['⚽'],
        background: {
          mobile: 'https://via.placeholder.com/400x600',
          desktop: 'https://via.placeholder.com/800x600'
        },
        colors: {
          primary: '#6b7280',
          secondary: '#f9fafb',
          accent: '#374151'
        }
      },
      {
        id: 'template-8',
        name: 'Cali',
        description: 'Temática del equipo Deportivo Cali',
        icons: ['🌴'],
        background: {
          mobile: 'https://via.placeholder.com/400x600',
          desktop: 'https://via.placeholder.com/800x600'
        },
        colors: {
          primary: '#6b7280',
          secondary: '#f9fafb',
          accent: '#374151'
        }
      }
    ]
    
    res.json({ success: true, templates })
  } catch (error) {
    console.error('Error in GET /templates:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})



export default router