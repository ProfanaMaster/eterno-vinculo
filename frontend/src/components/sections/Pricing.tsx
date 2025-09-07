import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'
import { useState, useEffect } from 'react'
import AuthModal from '@/components/auth/AuthModal'
import { api } from '@/services/api'

interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  features: string[];
  is_active: boolean;
  package_type?: string;
}

function Pricing() {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const { addItem } = useCartStore()
  const { isAuthenticated } = useAuthStore()
  
  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      const response = await api.get('/packages')
      setPackages(response.data.data || [])
    } catch (error) {
      console.error('Error fetching packages:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleSelectPackage = (pkg: Package) => {
    const packageData = {
      id: pkg.id,
      name: pkg.name,
      type: (pkg.package_type || 'individual') as const,
      price: pkg.price,
      displayPrice: `$${pkg.price.toLocaleString('es-CO')}`,
      period: "pago único",
      description: pkg.description,
      features: pkg.features,
      cta: "Adquirir Memorial"
    }

    if (!isAuthenticated) {
      setAuthModalOpen(true)
    } else {
      addItem(packageData)
    }
  }

  if (loading) {
    return (
      <section id="precios" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Cargando precios...</p>
        </div>
      </section>
    )
  }

  return (
    <section id="precios" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Precios simples y 
            <span className="text-gradient"> transparentes</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Sin suscripciones mensuales. Paga una vez y mantén el memorial para siempre.
          </p>
        </div>

        {packages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No hay paquetes disponibles en este momento.</p>
          </div>
        ) : (
          <div className={`grid gap-8 ${packages.length === 1 ? 'max-w-lg mx-auto' : packages.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
            {packages.map((pkg, index) => (
              <div key={pkg.id} className={`card relative ${index === 0 && packages.length > 1 ? 'ring-2 ring-primary-500' : ''} transform hover:scale-105 transition-all duration-300`}>
                {index === 0 && packages.length > 1 && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient text-white px-6 py-2 rounded-full text-sm font-medium">
                      ✨ Más Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6 pt-4">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                  <p className="text-gray-600 mb-6">{pkg.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-primary-600">
                      ${pkg.price.toLocaleString('es-CO')}
                    </span>
                    <span className="text-gray-600 ml-2 text-lg">pago único</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {(pkg.features || []).map((feature: string, featureIndex: number) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-green-600 text-xs">✓</span>
                      </div>
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => handleSelectPackage(pkg)}
                  className="btn btn-primary w-full text-lg py-3"
                >
                  Adquirir Memorial
                </button>
                
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">
                    💳 Pago por transferencia bancaria
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FAQ Link */}
        <div className="text-center mt-12">
          <p className="text-gray-600">
            ¿Tienes preguntas? 
            <a href="#faq" className="text-primary hover:underline ml-1">
              Consulta nuestras preguntas frecuentes
            </a>
          </p>
        </div>

        {/* Payment methods */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 mb-4">Métodos de pago aceptados:</p>
          <div className="flex justify-center items-center gap-6 opacity-60">
            <span className="text-sm">Nequi</span>
            <span className="text-sm">Transfiya</span>
            <span className="text-sm">Bancolombia</span>
          </div>
        </div>

      </div>
      
      {/* Modal de Autenticación */}
      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode="register"
      />
    </section>
  )
}

export default Pricing