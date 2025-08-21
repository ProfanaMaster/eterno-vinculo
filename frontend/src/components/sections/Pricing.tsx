import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'
import { useState } from 'react'
import AuthModal from '@/components/auth/AuthModal'
import { useSettings } from '@/contexts/SettingsContext'
import { useSettingsRefresh } from '@/hooks/useSettingsRefresh'

function Pricing() {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [showUpdateIndicator, setShowUpdateIndicator] = useState(false)
  const { addItem } = useCartStore()
  const { isAuthenticated } = useAuthStore()
  const { settings, loading } = useSettings()
  const { refreshSettings } = useSettingsRefresh()
  
  const pricingPlan = settings.pricing_plan || {}
  
  const packageData = {
    id: 'e454b0bf-ba21-4a38-8149-1b3c0dbc2a91',
    name: pricingPlan.name || "Memorial Digital Completo",
    type: 'complete' as const,
    price: pricingPlan.price || 150000,
    displayPrice: `$${(pricingPlan.price || 150000).toLocaleString('es-CO')}`,
    period: "pago único",
    description: pricingPlan.subtitle || "Todo lo que necesitas para honrar la memoria",
    features: pricingPlan.features || [
      "Perfil memorial personalizado",
      "Galería de fotos ilimitada",
      "Videos conmemorativos",
      "Código QR personalizado",
      "Libro de condolencias digital",
      "Acceso permanente",
      "Soporte técnico incluido",
      "Diseño profesional"
    ],
    cta: "Adquirir Memorial"
  }
  
  const handleSelectPackage = () => {
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
          <div className="flex items-center justify-center gap-4 mb-4">
            <h2 className="text-4xl font-bold text-gray-900">
              Precios simples y 
              <span className="text-gradient"> transparentes</span>
            </h2>
            {/* Botón de actualización (solo en desarrollo) */}
            {(import.meta as any).env.DEV && (
              <button
                onClick={async () => {
                  await refreshSettings()
                  setShowUpdateIndicator(true)
                  setTimeout(() => setShowUpdateIndicator(false), 2000)
                }}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Actualizar precios"
              >
                🔄
              </button>
            )}
            {/* Indicador de actualización */}
            {showUpdateIndicator && (
              <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
                ✅ Precios actualizados
              </div>
            )}
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Sin suscripciones mensuales. Paga una vez y mantén el memorial para siempre.
          </p>
          
          {/* Money back guarantee */}
          
        </div>

        <div className="max-w-lg mx-auto">
          <div className="card relative ring-2 ring-primary-500 transform hover:scale-105 transition-all duration-300">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient text-white px-6 py-2 rounded-full text-sm font-medium">
                ✨ Único Paquete Disponible
              </span>
            </div>

            <div className="text-center mb-6 pt-4">
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{packageData.name}</h3>
              <p className="text-gray-600 mb-6">{packageData.description}</p>
              <div className="mb-6">
                <span className="text-5xl font-bold text-primary-600">{packageData.displayPrice}</span>
                <span className="text-gray-600 ml-2 text-lg">{packageData.period}</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              {packageData.features.map((feature: string, index: number) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <span className="text-gray-700 font-medium">{feature}</span>
                </li>
              ))}
            </ul>

            <button 
              onClick={handleSelectPackage}
              className="btn btn-primary w-full text-lg py-4"
            >
              {packageData.cta}
            </button>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                💳 Pago por transferencia bancaria
              </p>
            </div>
          </div>
        </div>

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
            <span className="text-2xl">💳</span>
            <span className="text-sm">Nequi</span>
            <span className="text-sm">Daviplata</span>
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