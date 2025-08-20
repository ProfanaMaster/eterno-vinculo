function Examples() {
  const examples = [
    {
      name: "María Elena González",
      years: "1945 - 2023",
      description: "Una vida dedicada a la familia y la enseñanza",
      image: "👩‍🏫",
      template: "Clásico",
      color: "from-blue-100 to-purple-100"
    },
    {
      name: "Roberto Martínez",
      years: "1960 - 2024",
      description: "Músico apasionado y padre amoroso",
      image: "🎵",
      template: "Moderno",
      color: "from-green-100 to-blue-100"
    },
    {
      name: "Ana Sofía Ruiz",
      years: "1978 - 2023",
      description: "Doctora comprometida con su comunidad",
      image: "👩‍⚕️",
      template: "Elegante",
      color: "from-pink-100 to-orange-100"
    }
  ]

  return (
    <section id="ejemplos" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Ejemplos de 
            <span className="text-gradient"> memoriales reales</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Descubre cómo otras familias han honrado la memoria de sus seres queridos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {examples.map((example, index) => (
            <div 
              key={index}
              className="group cursor-pointer"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Memorial Preview */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2">
                <div className={`bg-gradient-to-br ${example.color} h-48 flex items-center justify-center relative`}>
                  <div className="text-center">
                    <div className="text-4xl mb-3">{example.image}</div>
                    <h3 className="font-bold text-gray-800 text-lg">{example.name}</h3>
                    <p className="text-gray-600">{example.years}</p>
                  </div>
                  
                  {/* Template badge */}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700">
                    {example.template}
                  </div>
                </div>
                
                <div className="p-6">
                  <p className="text-gray-600 text-sm mb-4">{example.description}</p>
                  
                  {/* Mock elements */}
                  <div className="space-y-2 mb-4">
                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                    <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  
                  {/* Mock gallery */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="aspect-square bg-gray-200 rounded"></div>
                    <div className="aspect-square bg-gray-200 rounded"></div>
                    <div className="aspect-square bg-gray-200 rounded"></div>
                  </div>
                  
                  <button className="btn btn-secondary w-full text-sm">
                    Ver Memorial Completo
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Demo */}
        <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            ¿Quieres ver cómo funciona?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Prueba nuestro demo interactivo y descubre lo fácil que es crear un memorial hermoso
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn btn-primary">
              🎮 Demo Interactivo
            </button>
            <button className="btn btn-secondary">
              📋 Ver Todas las Plantillas
            </button>
          </div>
        </div>

        {/* Features showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-primary text-xl">📱</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Responsive</h4>
            <p className="text-sm text-gray-600">Se ve perfecto en todos los dispositivos</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-primary text-xl">⚡</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Rápido</h4>
            <p className="text-sm text-gray-600">Carga instantánea desde cualquier lugar</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-primary text-xl">🔒</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Seguro</h4>
            <p className="text-sm text-gray-600">Tus datos están protegidos y respaldados</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-primary text-xl">♾️</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Permanente</h4>
            <p className="text-sm text-gray-600">Disponible para siempre, sin límite de tiempo</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Examples