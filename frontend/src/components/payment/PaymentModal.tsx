import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'
import { useSettings } from '@/contexts/SettingsContext'
import { supabase } from '@/config/supabase'
import Modal from '@/components/ui/Modal'
import { Button } from '@/components/ui'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * Modal de pago por transferencia bancaria
 * Maneja Transfiya, Nequi, Bancolombia
 */
function PaymentModal({ isOpen, onClose }: PaymentModalProps) {
  const navigate = useNavigate()
  const [paymentData, setPaymentData] = useState({
    method: '',
    reference: '',
    amount: '',
    date: '',
    name: ''
  })
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [step, setStep] = useState(1) // 1: Instrucciones, 2: Comprobante

  const { items, getTotal, clearCart } = useCartStore()
  const { user } = useAuthStore()
  const { settings } = useSettings()

  const paymentMethods = settings.payment_methods || {
    bancolombia: {
      name: 'Bancolombia',
      account: '123-456-789-01',
      type: 'Cuenta de Ahorros',
      owner: 'Eterno Vínculo SAS'
    },
    nequi: {
      name: 'Nequi',
      account: '319 665 0357',
      type: 'Cuenta Digital',
      owner: 'Eterno Vínculo'
    },
    transfiya: {
      name: 'Transfiya',
      account: 'eternovinculo@transfiya.com',
      type: 'Cuenta Transfiya',
      owner: 'Eterno Vínculo'
    }
  }

  const selectedMethod = paymentData.method ? paymentMethods[paymentData.method as keyof typeof paymentMethods] : null
  const total = getTotal()

  const handleSubmitPayment = async () => {
    setLoading(true)
    
    try {
      // Obtener token de Supabase
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3002/api'
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          package_id: items[0]?.package.id,
          amount: total,
          payment_method: paymentData.method,
          payment_reference: paymentData.reference,
          payer_name: paymentData.name,
          payment_date: paymentData.date
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al procesar el pago')
      }

      const result = await response.json()
      
      clearCart()
      onClose()
      
      // Redirigir al dashboard con mensaje de éxito
      navigate('/dashboard?payment=success')
      
    } catch (error: any) {
      console.error('Error:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const resetModal = () => {
    setStep(1)
    setPaymentData({
      method: '',
      reference: '',
      amount: '',
      date: '',
      name: ''
    })
  }

  const handleClose = () => {
    onClose()
    resetModal()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Pago por Transferencia"
      size="lg"
    >
      {step === 1 ? (
        // Paso 1: Instrucciones de pago
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">
              💳 Instrucciones de Pago
            </h3>
            <p className="text-blue-800 text-sm">
              Realiza la transferencia y luego ingresa los datos del comprobante para validar tu pago.
            </p>
          </div>

          {/* Selección de método */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Selecciona tu método de pago:
            </label>
            <div className="grid grid-cols-1 gap-3">
              {Object.entries(paymentMethods).map(([key, method]) => (
                <label key={key} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={key}
                    checked={paymentData.method === key}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, method: e.target.value }))}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">{method.name}</div>
                    <div className="text-sm text-gray-600">{method.type}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Datos de transferencia - Solo si hay método seleccionado */}
          {selectedMethod && (
            <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 shadow-lg overflow-hidden">
              {/* Borde animado */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 via-pink-500 via-red-500 via-yellow-500 via-green-500 via-cyan-500 to-blue-500 bg-[length:400%_400%] animate-pulse-border p-[2px]">
                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl"></div>
              </div>
              {/* Contenido */}
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-xl text-gray-800">💳 Datos para la transferencia</h4>
                </div>
                
                <div className="grid gap-4">
                  {/* Método de pago */}
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 font-bold text-sm">💰</span>
                        </div>
                        <span className="text-sm font-medium text-gray-600">Método de pago</span>
                      </div>
                      <span className="font-bold text-lg text-gray-800">{selectedMethod.name}</span>
                    </div>
                  </div>

                  {/* Número de cuenta */}
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 font-bold text-sm">#</span>
                        </div>
                        <span className="text-sm font-medium text-gray-600">Número de cuenta</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-lg text-gray-800 font-mono">{selectedMethod.account}</span>
                        <button 
                          onClick={() => navigator.clipboard.writeText(selectedMethod.account)}
                          className="ml-2 text-blue-600 hover:text-blue-800 text-xs"
                          title="Copiar número"
                        >
                          📋 Copiar
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Tipo de cuenta */}
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                          <span className="text-yellow-600 font-bold text-sm">🏦</span>
                        </div>
                        <span className="text-sm font-medium text-gray-600">Tipo de cuenta</span>
                      </div>
                      <span className="font-semibold text-gray-800">{selectedMethod.type}</span>
                    </div>
                  </div>

                  {/* Titular */}
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 font-bold text-sm">👤</span>
                        </div>
                        <span className="text-sm font-medium text-gray-600">Titular de la cuenta</span>
                      </div>
                      <span className="font-semibold text-gray-800">{selectedMethod.owner}</span>
                    </div>
                  </div>

                  {/* Monto destacado */}
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-6 text-white shadow-lg">
                    <div className="text-center">
                      <p className="text-sm font-medium opacity-90 mb-1">💸 Monto a transferir</p>
                      <p className="text-3xl font-bold tracking-tight">${total.toLocaleString()}</p>
                      <p className="text-xs opacity-80 mt-1">COP (Pesos Colombianos)</p>
                    </div>
                  </div>
                </div>

                {/* Instrucción importante */}
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <span className="text-amber-600 text-sm">⚠️</span>
                    <p className="text-xs text-amber-800">
                      <strong>Importante:</strong> Transfiere exactamente <strong>${total.toLocaleString()}</strong> para agilizar la validación.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Mensaje cuando no hay método seleccionado */}
          {!selectedMethod && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-gray-600">👆 Por favor selecciona un método de pago para ver los datos de transferencia</p>
            </div>
          )}

          <Button
            onClick={() => setStep(2)}
            className="w-full btn-primary"
            disabled={!selectedMethod}
          >
            {selectedMethod ? 'Ya realicé la transferencia →' : 'Selecciona un método de pago'}
          </Button>
        </div>
      ) : (
        // Paso 2: Comprobante
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">
              📄 Datos del Comprobante
            </h3>
            <p className="text-green-800 text-sm">
              Ingresa los datos de tu transferencia para verificar el pago.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de referencia *
              </label>
              <input
                type="text"
                value={paymentData.reference}
                onChange={(e) => setPaymentData(prev => ({ ...prev, reference: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: 123456789"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del pagador *
              </label>
              <input
                type="text"
                value={paymentData.name}
                onChange={(e) => setPaymentData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nombre completo"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de transferencia *
              </label>
              <input
                type="date"
                value={paymentData.date}
                onChange={(e) => setPaymentData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto transferido *
              </label>
              <input
                type="text"
                value={paymentData.amount}
                onChange={(e) => setPaymentData(prev => ({ ...prev, amount: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`$${total.toLocaleString()}`}
                required
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setStep(1)}
              className="flex-1 btn-secondary"
            >
              ← Volver
            </Button>
            
            <Button
              onClick={handleSubmitPayment}
              className="flex-1 btn-primary"
              disabled={loading || !paymentData.reference || !paymentData.name || !paymentData.date || !paymentData.amount}
            >
              {loading ? 'Procesando...' : 'Enviar Comprobante'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default PaymentModal