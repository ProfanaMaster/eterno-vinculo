import { useState, useEffect } from 'react'
import { quotesService, Quote } from '@/services/quotesService'

interface DailyQuoteProps {
  className?: string
  theme?: 'light' | 'dark' | 'memorial'
  showRefresh?: boolean
}

function DailyQuote({ 
  className = '', 
  theme = 'memorial',
  showRefresh = false 
}: DailyQuoteProps) {
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar frase del día
  const loadDailyQuote = async () => {
    try {
      setLoading(true)
      setError(null)
      const dailyQuote = await quotesService.getDailyQuote()
      setQuote(dailyQuote)
    } catch (err) {
      console.error('Error loading daily quote:', err)
      setError('No se pudo cargar la frase del día')
    } finally {
      setLoading(false)
    }
  }

  // Cargar frase aleatoria (para refresh)
  const loadRandomQuote = async () => {
    try {
      setLoading(true)
      setError(null)
      const randomQuote = await quotesService.getRandomQuote()
      setQuote(randomQuote)
    } catch (err) {
      console.error('Error loading random quote:', err)
      setError('No se pudo cargar una nueva frase')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDailyQuote()
  }, [])

  // Definir estilos por tema
  const getThemeStyles = () => {
    switch (theme) {
      case 'light':
        return {
          container: 'bg-white border border-gray-200 text-gray-800',
          quote: 'text-gray-700',
          author: 'text-gray-500',
          icon: 'text-blue-500',
          refresh: 'text-blue-600 hover:text-blue-800'
        }
      case 'dark':
        return {
          container: 'bg-gray-800 border border-gray-700 text-white',
          quote: 'text-gray-100',
          author: 'text-gray-400',
          icon: 'text-blue-400',
          refresh: 'text-blue-400 hover:text-blue-300'
        }
      case 'memorial':
      default:
        return {
          container: 'bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 text-gray-800',
          quote: 'text-gray-700',
          author: 'text-purple-600',
          icon: 'text-purple-500',
          refresh: 'text-purple-600 hover:text-purple-800'
        }
    }
  }

  const styles = getThemeStyles()

  if (loading) {
    return (
      <div className={`rounded-lg p-6 ${styles.container} ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center mb-4">
            <div className="w-6 h-6 bg-gray-300 rounded-full mr-3"></div>
            <div className="h-4 bg-gray-300 rounded w-32"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 rounded w-full"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>
          <div className="mt-4 h-3 bg-gray-300 rounded w-24"></div>
        </div>
      </div>
    )
  }

  if (error || !quote) {
    return (
      <div className={`rounded-lg p-6 ${styles.container} ${className}`}>
        <div className="text-center">
          <div className={`text-2xl mb-2 ${styles.icon}`}>💭</div>
          <p className={`text-sm ${styles.quote}`}>
            {error || 'No se pudo cargar la frase del día'}
          </p>
          {showRefresh && (
            <button
              onClick={loadDailyQuote}
              className={`text-xs ${styles.refresh} underline mt-2`}
            >
              Intentar de nuevo
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      {/* Contenido con estilo elegante */}
      <div className="bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-100/50 shadow-sm">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400/30 via-amber-300/30 to-yellow-400/30 rounded-t-xl"></div>
        
        {/* Header dentro del cuadro */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="text-xl mr-3">💫</div>
            <h3 className="text-sm font-medium bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-600 bg-clip-text text-transparent tracking-wide">
              Reflexión del día
            </h3>
          </div>
          
          {showRefresh && (
            <button
              onClick={loadRandomQuote}
              className="text-xs text-amber-600/70 hover:text-amber-600 transition-colors duration-200 font-medium"
              title="Nueva frase"
            >
              🔄 Cambiar
            </button>
          )}
        </div>

        {/* Fecha */}
        <div className="mb-4 text-xs text-gray-500 font-medium">
          {new Date().toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
        
        {/* Quote */}
        <blockquote className="mb-4">
          <div className="text-gray-800 text-base leading-relaxed font-medium mb-3 tracking-wide">
            "{quote.text}"
          </div>
          <footer className="text-sm text-gray-600 font-medium">
            — {quote.author}
          </footer>
        </blockquote>

        {/* Footer */}
        <div className="mt-4 flex justify-end">
          <div className="flex items-center gap-2 text-amber-600/70">
            <span className="text-xs font-medium tracking-wider">CADA DÍA UNA NUEVA REFLEXIÓN</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DailyQuote
