import express from 'express'

const router = express.Router()

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

router.get('/', (req, res) => {
  res.json({
    success: true,
    templates
  })
})

// Obtener configuración de fondo según el tamaño de pantalla
router.get('/:templateId/background', (req, res) => {
  const { templateId } = req.params
  const { width } = req.query
  
  const template = templates.find(t => t.id === templateId)
  if (!template) {
    return res.status(404).json({ error: 'Template not found' })
  }
  
  const isMobile = parseInt(width) < 900
  const background = isMobile ? template.background.mobile : template.background.desktop
  
  res.json({
    success: true,
    background,
    isMobile
  })
})

export default router