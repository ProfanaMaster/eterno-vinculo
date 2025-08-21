import { Router } from 'express'
import ordersRouter from './orders.js'
import profilesRouter from './profiles.js'
import uploadRouter from './uploadRoutes.js'
import adminRouter from './admin.js'
import { supabaseAdmin } from '../config/supabase.js'

const router = Router()

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' })
})

// Test endpoint para verificar rutas
router.get('/test', (req, res) => {
  res.json({ 
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    routes: [
      'GET /api/health',
      'GET /api/profiles/public/:slug',
      'GET /api/profiles/my-profiles',
      'POST /api/profiles'
    ]
  })
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

// Registrar rutas de upload
router.use('/upload', uploadRouter)

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

// Endpoint temporal de debug - REMOVER EN PRODUCCIÓN
router.get('/debug/profiles/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data: profiles, error } = await supabaseAdmin
      .from('memorial_profiles')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    
    if (error) {
      return res.status(500).json({ error: 'Error al obtener perfiles', details: error });
    }
    
    res.json({
      success: true,
      data: profiles || [],
      debug: true
    });
    
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint para obtener plantillas
router.get('/templates', async (req, res) => {
  try {
    const templates = [
      {
        id: 'general-1',
        name: 'Plantilla General #1',
        description: 'Diseño elegante con paloma y flores',
        background: {
          mobile: '/assets/templates/fondo-paloma-flores.png',
          desktop: '/assets/templates/fondo-general-pantalla-grande.png'
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