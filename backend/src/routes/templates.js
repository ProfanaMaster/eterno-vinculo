import express from 'express'

const router = express.Router()

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