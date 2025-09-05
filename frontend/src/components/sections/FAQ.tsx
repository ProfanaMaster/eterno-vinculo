import { useState } from 'react'

function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      question: "¿Cómo funciona el código QR?",
      answer: "Cada memorial incluye un código QR único que puedes imprimir y colocar en la lápida, tarjetas de recordatorio o cualquier lugar. Al escanearlo con un teléfono, las personas acceden directamente al memorial digital."
    },
    {
      question: "¿El memorial estará disponible para siempre?",
      answer: "Sí, una vez que pagas por tu memorial, estará disponible permanentemente. No hay costos mensuales ni anuales. Tu memorial se mantendrá activo indefinidamente."
    },
    {
      question: "¿Qué tipos de archivos puedo subir?",
      answer: "Puedes subir fotos (JPG, PNG), videos (MP4, WebM, MOV, AVI). Para video un peso maximo de 65M, e imagenes un peso maximo de 2M cada una."
    },
    
    {
      question: "¿Ofrecen soporte técnico?",
      answer: "Sí, ofrecemos soporte por email para todos los planes, respuesta en 24 horas."
    },
    ,
    {
      question: "¿Cómo se comparte el memorial?",
      answer: "Puedes compartir tu memorial a través de un enlace único, código QR, redes sociales, email, o imprimiendo tarjetas con el código QR incluido."
    }
  ]

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Preguntas 
            <span className="text-gradient"> frecuentes</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Encuentra respuestas a las preguntas más comunes sobre nuestro servicio
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="border border-gray-200 rounded-lg mb-4 overflow-hidden"
            >
              <button
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-semibold text-gray-900 pr-4">
                  {faq.question}
                </span>
                <span className={`text-primary transition-transform duration-200 ${
                  openIndex === index ? 'rotate-180' : ''
                }`}>
                  ▼
                </span>
              </button>
              
              {openIndex === index && (
                <div className="px-6 pb-4 animate-fade-in">
                  <p className="text-gray-700 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              ¿No encuentras la respuesta que buscas?
            </h3>
            <p className="text-gray-600 mb-6">
              Nuestro equipo de soporte está aquí para ayudarte con cualquier pregunta
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                className="btn btn-primary"
                onClick={() => window.open('mailto:contacto@eternovinculo.com?subject=Consulta de Soporte', '_blank')}
              >
                Contactar Soporte
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FAQ