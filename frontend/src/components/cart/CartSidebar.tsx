import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui'
import PaymentModal from '@/components/payment/PaymentModal'
import { useState } from 'react'

/**
 * Sidebar del carrito de compras
 * Versión reconstruida sin conflictos de estado
 */
function CartSidebar() {
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const { 
    items, 
    isOpen, 
    toggleCart, 
    removeItem, 
    getTotal 
  } = useCartStore()
  
  const { isAuthenticated } = useAuthStore()

  const handleCheckout = () => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para continuar')
      return
    }
    setPaymentModalOpen(true)
    // NO cerramos el carrito aquí - dejamos que el usuario vea ambos
  }

  const handlePaymentClose = () => {
    setPaymentModalOpen(false)
    // Cerrar el carrito solo después de cerrar el modal de pago
    toggleCart()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay principal del carrito */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={toggleCart}
      />
      
      {/* Sidebar del carrito */}
      <div className="fixed right-0 top-0 h-screen w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
        {/* Header del carrito */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div>
            <h2 className="text-xl font-bold">🛒 Carrito</h2>
            <p className="text-sm opacity-90">
              {items.length} {items.length === 1 ? 'artículo' : 'artículos'}
            </p>
          </div>
          <button 
            onClick={toggleCart}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido del carrito */}
        <div className="flex flex-col flex-1 min-h-0">
          {items.length === 0 ? (
            // Carrito vacío
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <div className="text-8xl mb-4 opacity-50">🛒</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Tu carrito está vacío
                </h3>
                <p className="text-gray-600 mb-6">
                  Explora nuestros paquetes y encuentra el memorial perfecto
                </p>
                <button
                  onClick={toggleCart}
                  className="btn btn-primary px-6 py-3"
                >
                  Ver Paquetes
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Lista de productos */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div 
                      key={item.package.id} 
                      className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-5 border-2 border-blue-100 hover:border-blue-200 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-800 mb-1">
                            ✨ {item.package.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">
                            {item.package.description || 'Memorial digital completo'}
                          </p>
                        </div>
                        
                        <div className="text-right ml-4">
                          <div className="text-xl font-bold text-blue-600 mb-2">
                            ${item.package.price.toLocaleString()}
                          </div>
                          <button
                            onClick={() => removeItem(item.package.id)}
                            className="text-red-500 hover:text-red-700 text-sm bg-red-50 hover:bg-red-100 px-3 py-1 rounded-full transition-colors"
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      </div>
                      

                    </div>
                  ))}
                </div>
              </div>

              {/* Footer con total y botón de pago */}
              <div className="border-t bg-gradient-to-r from-gray-50 to-blue-50 p-6 space-y-4">
                {/* Resumen */}
                <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold">${getTotal().toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Descuentos:</span>
                    <span className="text-green-600">$0</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-gray-800">Total:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ${getTotal().toLocaleString()}
                    </span>
                  </div>
                </div>
                
                {/* Botón de checkout */}
                <Button
                  onClick={handleCheckout}
                  className="w-full btn-primary text-lg py-4 font-bold"
                  disabled={!isAuthenticated}
                >
                  {isAuthenticated ? '💳 Proceder al Pago' : '🔐 Inicia Sesión para Continuar'}
                </Button>
                
                {!isAuthenticated && (
                  <p className="text-xs text-gray-500 text-center">
                    Necesitas una cuenta para realizar la compra
                  </p>
                )}
                
                {/* Garantía */}
                <div className="flex items-center justify-center text-xs text-gray-500 bg-green-50 p-2 rounded-lg">
                  <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>🛡️ Pago 100% seguro y garantizado</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Modal de Pago */}
      <PaymentModal 
        isOpen={paymentModalOpen}
        onClose={handlePaymentClose}
      />
    </>
  )
}

export default CartSidebar