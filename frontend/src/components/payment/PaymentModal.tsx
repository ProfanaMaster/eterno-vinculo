import { useState } from 'react'
import { Modal, Button, Input } from '@/components/ui'
import SuccessModal from '@/components/ui/SuccessModal'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'
import { useSettings } from '@/contexts/SettingsContext'
import { supabase } from '@/config/supabase'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * Modal de pago por transferencia bancaria
 * Maneja Transfiya, Nequi, Bancolombia
 */
function PaymentModal({ isOpen, onClose }: PaymentModalProps) {
  const [paymentData, setPaymentData] = useState({
    method: 'bancolombia',
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
      account: '300-123-4567',
      type: 'Cuenta Nequi',
      owner: 'Eterno Vínculo'
    },
    transfiya: {
      name: 'Transfiya',
      account: 'eternovinculo@transfiya.com',
      type: 'Cuenta Transfiya',
      owner: 'Eterno Vínculo'
    }
  }

  const selectedMethod = paymentMethods[paymentData.method as keyof typeof paymentMethods]
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
      
      setShowSuccess(true)
      
    } catch (error) {
      console.error('Error:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const resetModal = () => {
    setStep(1)
    setPaymentData({
      method: 'bancolombia',
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

          {/* Datos de transferencia */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold mb-3">📋 Datos para la transferencia:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Método:</span>
                <span className="font-medium">{selectedMethod.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cuenta:</span>
                <span className="font-medium">{selectedMethod.account}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tipo:</span>
                <span className="font-medium">{selectedMethod.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Titular:</span>
                <span className="font-medium">{selectedMethod.owner}</span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="text-gray-600">Monto a transferir:</span>
                <span className="font-bold text-lg text-primary-600">${total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <Button
            onClick={() => setStep(2)}
            className="w-full btn-primary"
          >
            Ya realicé la transferencia →
          </Button>
        </div>
      ) : (
        // Paso 2: Comprobante
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">
              ✅ Ingresa los datos del comprobante
            </h3>
            <p className="text-green-800 text-sm">
              Necesitamos estos datos para validar tu pago y activar tu cuenta.
            </p>
          </div>

          <div className="space-y-4">
            <Input
              label="Número de referencia o comprobante"
              value={paymentData.reference}
              onChange={(e) => setPaymentData(prev => ({ ...prev, reference: e.target.value }))}
              placeholder="Ej: 123456789"
              required
            />

            <Input
              label="Monto transferido"
              value={paymentData.amount}
              onChange={(e) => setPaymentData(prev => ({ ...prev, amount: e.target.value }))}
              placeholder={`$${total.toLocaleString()}`}
              required
            />

            <Input
              label="Fecha de la transferencia"
              type="date"
              value={paymentData.date}
              onChange={(e) => setPaymentData(prev => ({ ...prev, date: e.target.value }))}
              required
            />

            <Input
              label="Nombre del titular que realizó la transferencia"
              value={paymentData.name}
              onChange={(e) => setPaymentData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nombre completo"
              required
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              ⏱️ <strong>Tiempo de validación:</strong> 2-24 horas hábiles. 
              Te notificaremos por email cuando tu pago sea confirmado.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setStep(1)}
              variant="secondary"
              className="flex-1"
            >
              ← Volver
            </Button>
            <Button
              onClick={handleSubmitPayment}
              loading={loading}
              className="flex-1 btn-primary"
              disabled={!paymentData.reference || !paymentData.amount || !paymentData.date || !paymentData.name}
            >
              Enviar Comprobante
            </Button>
          </div>
        </div>
      )}
      
      {/* Modal de éxito */}
      <SuccessModal 
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
      />
    </Modal>
  )
}

export default PaymentModal