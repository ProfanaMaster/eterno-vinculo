/**
 * Servicio para frases motivacionales en español
 * Especializado en temas de tiempo, memoria y vida eterna
 */
class QuotesService {
  constructor() {
    this.cache = new Map()
    this.cacheTime = 24 * 60 * 60 * 1000 // 24 horas
  }

  /**
   * Obtiene la frase del día en español basada en la fecha
   */
  async getDailyQuote() {
    const today = new Date().toISOString().split('T')[0]
    const cacheKey = `daily_${today}`

    // Verificar cache
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.cacheTime) {
      return cached.quote
    }

    // Usar directamente frases en español (no llamar API externa)
    console.log('💫 Seleccionando frase del día en español...')
    
    const quotes = this.getSpanishQuotes()
    const dateHash = this.hashCode(today)
    const selectedQuote = quotes[Math.abs(dateHash) % quotes.length]

    // Guardar en cache
    this.cache.set(cacheKey, {
      quote: selectedQuote,
      timestamp: Date.now()
    })

    console.log(`✅ Frase del día en español: "${selectedQuote.text.substring(0, 50)}..."`)
    return selectedQuote
  }

  /**
   * Obtiene una frase aleatoria en español
   */
  async getRandomQuote() {
    console.log('🎲 Seleccionando frase aleatoria en español...')
    
    const quotes = this.getSpanishQuotes()
    const randomIndex = Math.floor(Math.random() * quotes.length)
    const selectedQuote = quotes[randomIndex]

    console.log(`✅ Frase aleatoria en español: "${selectedQuote.text.substring(0, 50)}..."`)
    return selectedQuote
  }

  /**
   * Hash de string para consistencia
   */
  hashCode(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return hash
  }

  /**
   * Frases motivacionales en español sobre tiempo, memoria y vida
   */
  getSpanishQuotes() {
    return [
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
        text: "El momento adecuado para hacer lo correcto es siempre ahora.",
        author: "Martin Luther King Jr.",
        html: "El momento adecuado para hacer lo correcto es siempre ahora."
      },
      {
        text: "El tiempo permanece el suficiente para quien sepa aprovecharlo.",
        author: "Leonardo da Vinci",
        html: "El tiempo permanece el suficiente para quien sepa aprovecharlo."
      },
      {
        text: "No llores porque ya se terminó, sonríe porque sucedió.",
        author: "Dr. Seuss",
        html: "No llores porque ya se terminó, sonríe porque sucedió."
      },
      {
        text: "La muerte no es lo contrario de la vida, sino parte de ella.",
        author: "Haruki Murakami",
        html: "La muerte no es lo contrario de la vida, sino parte de ella."
      },
      {
        text: "Un momento puede cambiar un día, un día puede cambiar una vida.",
        author: "Anónimo",
        html: "Un momento puede cambiar un día, un día puede cambiar una vida."
      },
      {
        text: "Los recuerdos no envejecen, permanecen frescos en el corazón.",
        author: "Anónimo",
        html: "Los recuerdos no envejecen, permanecen frescos en el corazón."
      },
      {
        text: "El tiempo que perdemos con la gente que amamos nunca es tiempo perdido.",
        author: "John Lennon",
        html: "El tiempo que perdimos con la gente que amamos nunca es tiempo perdido."
      },
      {
        text: "Vivir en los corazones que dejamos atrás es no morir.",
        author: "Thomas Campbell",
        html: "Vivir en los corazones que dejamos atrás es no morir."
      },
      {
        text: "El tiempo no cura las heridas, pero nos enseña a vivir con ellas.",
        author: "Anónimo",
        html: "El tiempo no cura las heridas, pero nos enseña a vivir con ellas."
      },
      {
        text: "La memoria es el diario que todos llevamos con nosotros.",
        author: "Oscar Wilde",
        html: "La memoria es el diario que todos llevamos con nosotros."
      },
      {
        text: "Las personas especiales nunca se van, viven para siempre en nuestros corazones.",
        author: "Anónimo",
        html: "Las personas especiales nunca se van, viven para siempre en nuestros corazones."
      },
      {
        text: "El tiempo es el regalo más valioso que podemos dar a alguien.",
        author: "Anónimo",
        html: "El tiempo es el regalo más valioso que podemos dar a alguien."
      },
      {
        text: "Los momentos felices son tesoros que guardamos en el alma.",
        author: "Anónimo",
        html: "Los momentos felices son tesoros que guardamos en el alma."
      },
      {
        text: "No hay despedidas para nosotros. Donde quiera que estés, siempre estarás en mi corazón.",
        author: "Mahatma Gandhi",
        html: "No hay despedidas para nosotros. Donde quiera que estés, siempre estarás en mi corazón."
      },
      {
        text: "La vida es como una vela; no importa cuánto dure, sino cuánta luz dé.",
        author: "Anónimo",
        html: "La vida es como una vela; no importa cuánto dure, sino cuánta luz dé."
      }
    ]
  }

  /**
   * Obtiene frase en español del día
   */
  getFallbackQuote() {
    const quotes = this.getSpanishQuotes()
    const today = new Date().toISOString().split('T')[0]
    const dateHash = this.hashCode(today)
    const index = Math.abs(dateHash) % quotes.length

    console.log('💫 Usando frase en español del día')
    return quotes[index]
  }

  /**
   * Limpiar cache antiguo
   */
  clearOldCache() {
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
