interface Quote {
  text: string
  author: string
  html: string
}

/**
 * Servicio para obtener frases motivacionales via proxy backend
 * Evita problemas de CORS usando nuestro backend como proxy
 */
class QuotesService {
  private readonly baseUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3002/api'}/quotes`
  private readonly cache = new Map<string, { quote: Quote; timestamp: number }>()
  private readonly cacheTime = 24 * 60 * 60 * 1000 // 24 horas en ms

  /**
   * Obtiene la frase del día desde el backend
   * El backend se encarga de la consistencia diaria
   */
  async getDailyQuote(): Promise<Quote> {
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    const cacheKey = `daily_${today}`

    // Verificar cache local
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.cacheTime) {
      return cached.quote
    }

    try {
      const response = await fetch(`${this.baseUrl}/daily`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success || !result.data) {
        return this.getFallbackQuote()
      }

      const quote: Quote = result.data

      // Guardar en cache local
      this.cache.set(cacheKey, {
        quote,
        timestamp: Date.now()
      })

      return quote

    } catch (error) {
      console.error('Error fetching daily quote:', error)
      return this.getFallbackQuote()
    }
  }

  /**
   * Obtiene una frase aleatoria desde el backend
   */
  async getRandomQuote(): Promise<Quote> {
    try {
      const response = await fetch(`${this.baseUrl}/random`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success || !result.data) {
        return this.getFallbackQuote()
      }

      return result.data

    } catch (error) {
      console.error('Error fetching random quote:', error)
      return this.getFallbackQuote()
    }
  }



  /**
   * Genera hash de string para consistency
   */
  private hashCode(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return hash
  }

  /**
   * Frases de respaldo en español cuando el backend no está disponible
   */
  private getFallbackQuote(): Quote {
    const fallbacks = [
      {
        text: "Los recuerdos son la única forma de eternidad que podemos conocer.",
        author: "Anónimo",
        html: "Los recuerdos son la única forma de eternidad que podemos conocer."
      },
      {
        text: "El amor verdadero nunca tiene fin. Es eterno.",
        author: "Anónimo", 
        html: "El amor verdadero nunca tiene fin. Es eterno."
      },
      {
        text: "Los que amamos no se van, caminan a nuestro lado cada día.",
        author: "Anónimo",
        html: "Los que amamos no se van, caminan a nuestro lado cada día."
      },
      {
        text: "El tiempo puede sanar heridas, pero los hermosos recuerdos duran para siempre.",
        author: "Anónimo",
        html: "El tiempo puede sanar heridas, pero los hermosos recuerdos duran para siempre."
      },
      {
        text: "La vida es muy corta para desperdiciarla viviendo la vida de otra persona.",
        author: "Steve Jobs",
        html: "La vida es muy corta para desperdiciarla viviendo la vida de otra persona."
      },
      {
        text: "No llores porque ya se terminó, sonríe porque sucedió.",
        author: "Dr. Seuss",
        html: "No llores porque ya se terminó, sonríe porque sucedió."
      },
      {
        text: "Vivir en los corazones que dejamos atrás es no morir.",
        author: "Thomas Campbell",
        html: "Vivir en los corazones que dejamos atrás es no morir."
      }
    ]

    // Usar fecha para seleccionar frase de respaldo consistente
    const today = new Date().toISOString().split('T')[0]
    const dateHash = this.hashCode(today)
    const index = Math.abs(dateHash) % fallbacks.length

    return fallbacks[index]
  }

  /**
   * Limpiar cache antiguo
   */
  clearOldCache(): void {
    const now = Date.now()
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheTime) {
        this.cache.delete(key)
      }
    }
  }
}

// Instancia singleton
export const quotesService = new QuotesService()

// Limpiar cache cada hora
setInterval(() => {
  quotesService.clearOldCache()
}, 60 * 60 * 1000)

export type { Quote }
