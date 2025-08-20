import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui'
import PaymentModal from '@/components/payment/PaymentModal'
import { useState } from 'react'

/**
 * Sidebar del carrito de compras
 * Muestra productos, total y proceso de pago
 */
function CartSidebar() {
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const { 
    items, 
    isOpen, 
    toggleCart, 
    removeItem, 
    getTotal, 
    processPayment 
  } = useCartStore()
  
  const { isAuthenticated } = useAuthStore()

  const handleCheckout = () => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para continuar')
      return
    }
    setPaymentModalOpen(true)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={toggleCart}
      />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-screen w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-white flex-shrink-0">
          <h2 className="text-lg font-semibold">Carrito de Compras</h2>
          <button 
            onClick={toggleCart}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 min-h-0">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <div className="text-6xl mb-4">🛒</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Tu carrito está vacío
                </h3>
                <p className="text-gray-600">
                  Selecciona un plan para comenzar
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Items - Scrollable */}
              <div className="flex-1 overflow-y-auto p-4">
                {items.map((item) => (
                  <div key={item.package.id} className="bg-gray-50 rounded-lg p-3 mb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {item.package.name}
                        </h3>
                        <p className="text-xs text-gray-600 mb-2">
                          {item.package.description}
                        </p>
                        
                        {/* Features - Limitadas */}
                        <ul className="text-xs text-gray-500 space-y-1">
                          {item.package.features.slice(0, 2).map((feature, index) => (
                            <li key={index} className="flex items-center">
                              <span className="text-green-500 mr-2">✓</span>
                              {feature}
                            </li>
                          ))}
                          {item.package.features.length > 2 && (
                            <li className="text-gray-400">
                              +{item.package.features.length - 2} más...
                            </li>
                          )}
                        </ul>
                      </div>
                      
                      <div className="text-right ml-3">
                        <div className="text-sm font-bold text-gray-900">
                          ${item.package.price.toLocaleString()}
                        </div>
                        <button
                          onClick={() => removeItem(item.package.id)}
                          className="text-red-500 hover:text-red-700 text-xs mt-1"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer - Fijo en la parte inferior */}
              <div className="border-t bg-white p-4 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-base font-semibold">Total:</span>
                  <span className="text-lg font-bold text-primary-600">
                    ${getTotal().toLocaleString()}
                  </span>
                </div>
                
                <Button
                  onClick={handleCheckout}
                  className="w-full btn-primary mb-2"
                  disabled={!isAuthenticated}
                >
                  {isAuthenticated ? 'Proceder al Pago' : 'Inicia Sesión'}
                </Button>
                
                {!isAuthenticated && (
                  <p className="text-xs text-gray-500 text-center mb-1">
                    Necesitas una cuenta para continuar
                  </p>
                )}
                
                <div className="flex items-center justify-center text-xs text-gray-500">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Pago seguro
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Modal de Pago */}
      <PaymentModal 
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
      />
    </>
  )
}

export default CartSidebar