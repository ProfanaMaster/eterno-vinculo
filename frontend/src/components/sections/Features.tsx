function Features() {
  const features = [
    {
      icon: "🎨",
      title: "Diseño Personalizado",
      description: "Elige entre múltiples plantillas elegantes y selecciona la que más te guste."
    },
    {
      icon: "📱",
      title: "Código QR Único",
      description: "Cada memorial incluye un código QR personalizado para compartir fácilmente en lápidas o tarjetas."
    },
    {
      icon: "🖼️",
      title: "Galería Multimedia",
      description: "Sube fotos, videos y documentos para crear una galería completa de recuerdos especiales."
    },
    {
      icon: "🔒",
      title: "Privacidad Segura",
      description: "Control total sobre quién puede ver el memorial con opciones de privacidad flexibles."
    },
    {
      icon: "💬",
      title: "Muro de los Recuerdos",
      description: "Permite que familiares y amigos dejen mensajes de condolencias y compartan recuerdos."
    },
    {
      icon: "🌐",
      title: "Acceso Permanente",
      description: "Tu memorial estará disponible 24/7 desde cualquier dispositivo con conexión a internet."
    }
  ]

  return (
    <section id="caracteristicas" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Todo lo que necesitas para crear un 
            <span className="text-gradient"> memorial perfecto</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Herramientas profesionales y fáciles de usar para honrar la memoria de tus seres queridos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="card text-center group hover:scale-105 transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              ¿Listo para comenzar?
            </h3>
            <p className="text-gray-600 mb-6">
              Crea tu primer memorial en menos de 10 minutos
            </p>
            <button 
              onClick={() => {
                const pricingSection = document.getElementById('precios')
                if (pricingSection) {
                  pricingSection.scrollIntoView({ behavior: 'smooth' })
                }
              }}
              className="btn btn-primary btn-lg"
            >
              Ver Paquetes
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Features