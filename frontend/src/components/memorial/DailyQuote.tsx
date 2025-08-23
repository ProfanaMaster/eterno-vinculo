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
    <div className={`rounded-lg p-6 shadow-sm ${styles.container} ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className={`text-xl mr-3 ${styles.icon}`}>💫</div>
          <h3 className="text-sm font-medium opacity-75">
            Reflexión del día
          </h3>
        </div>
        
        {showRefresh && (
          <button
            onClick={loadRandomQuote}
            className={`text-xs ${styles.refresh} hover:underline transition-colors duration-200`}
            title="Nueva frase"
          >
            🔄 Cambiar
          </button>
        )}
      </div>

      {/* Quote */}
      <blockquote className="mb-4">
        <div className={`text-lg leading-relaxed ${styles.quote} font-medium mb-3`}>
          "{quote.text}"
        </div>
        <footer className={`text-sm ${styles.author} font-medium`}>
          — {quote.author}
        </footer>
      </blockquote>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs opacity-60">
        <span>Cada día trae una nueva reflexión</span>
        <span>🕰️ {new Date().toLocaleDateString('es-ES', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</span>
      </div>
    </div>
  )
}

export default DailyQuote
