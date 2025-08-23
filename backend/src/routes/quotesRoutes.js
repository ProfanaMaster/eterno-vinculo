import { Router } from 'express'
import { quotesService } from '../services/quotesService.js'

const router = Router()

/**
 * GET /api/quotes/daily
 * Obtener frase del día
 */
router.get('/daily', async (req, res) => {
  try {
    const quote = await quotesService.getDailyQuote()
    
    res.json({
      success: true,
      data: quote,
      cached: false, // TODO: implementar detección de cache
      message: 'Frase del día obtenida exitosamente'
    })

  } catch (error) {
    console.error('❌ Error en /quotes/daily:', error)
    
    // En caso de error, devolver frase de respaldo
    const fallback = quotesService.getFallbackQuote()
    
    res.json({
      success: true,
      data: fallback,
      cached: false,
      fallback: true,
      message: 'Frase de respaldo (error en API externa)'
    })
  }
})

/**
 * GET /api/quotes/random
 * Obtener frase aleatoria
 */
router.get('/random', async (req, res) => {
  try {
    const quote = await quotesService.getRandomQuote()
    
    res.json({
      success: true,
      data: quote,
      message: 'Frase aleatoria obtenida exitosamente'
    })

  } catch (error) {
    console.error('❌ Error en /quotes/random:', error)
    
    // En caso de error, devolver frase de respaldo
    const fallback = quotesService.getFallbackQuote()
    
    res.json({
      success: true,
      data: fallback,
      fallback: true,
      message: 'Frase de respaldo (error en API externa)'
    })
  }
})

/**
 * GET /api/quotes/health
 * Verificar estado del servicio de quotes
 */
router.get('/health', async (req, res) => {
  try {
    // Intentar obtener una frase para verificar conectividad
    const quote = await quotesService.getRandomQuote()
    
    res.json({
      success: true,
      status: 'healthy',
      api_accessible: true,
      cache_size: quotesService.cache.size,
      sample_quote: {
        text: quote.text.substring(0, 50) + '...',
        author: quote.author
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    res.json({
      success: false,
      status: 'degraded',
      api_accessible: false,
      error: error.message,
      fallback_available: true,
      timestamp: new Date().toISOString()
    })
  }
})

export default router
