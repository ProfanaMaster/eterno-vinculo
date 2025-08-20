function Testimonials() {
  const testimonials = [
    {
      name: "Carmen López",
      role: "Hija de María Elena",
      content: "Crear el memorial de mi madre fue muy fácil y el resultado es hermoso. Toda la familia puede visitarlo y compartir recuerdos. El código QR en su lápida ha sido una bendición.",
      rating: 5,
      avatar: "👩"
    },
    {
      name: "José Martínez",
      role: "Hermano de Roberto",
      content: "La calidad del servicio es excepcional. El equipo nos ayudó en cada paso y el memorial quedó exactamente como lo imaginábamos. Muy recomendado.",
      rating: 5,
      avatar: "👨"
    },
    {
      name: "Dr. Patricia Ruiz",
      role: "Hermana de Ana Sofía",
      content: "Como médica, valoro la privacidad y seguridad. Este servicio cumple con todos mis estándares. El memorial de mi hermana es perfecto y está siempre disponible.",
      rating: 5,
      avatar: "👩‍⚕️"
    }
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Lo que dicen nuestras 
            <span className="text-gradient"> familias</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Miles de familias han confiado en nosotros para honrar la memoria de sus seres queridos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="card bg-white p-6 text-center group hover:scale-105 transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Stars */}
              <div className="flex justify-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-lg">⭐</span>
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-700 mb-6 italic leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 bg-gradient rounded-full flex items-center justify-center text-white text-lg">
                  {testimonial.avatar}
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">4.9/5</div>
              <div className="text-sm text-gray-600">Calificación promedio</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">1,200+</div>
              <div className="text-sm text-gray-600">Memoriales creados</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">98%</div>
              <div className="text-sm text-gray-600">Clientes satisfechos</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <div className="text-sm text-gray-600">Soporte disponible</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Únete a miles de familias satisfechas
          </h3>
          <p className="text-gray-600 mb-6">
            Comienza a crear el memorial de tu ser querido hoy mismo
          </p>
          <button className="btn btn-primary btn-lg">
            Crear Mi Memorial Ahora
          </button>
        </div>
      </div>
    </section>
  )
}

export default Testimonials