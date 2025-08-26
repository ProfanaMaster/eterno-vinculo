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
 * Modal de pago por transferencia - Versión reconstruida
 * UI/UX mejorada y sin bugs de estado
 */
function PaymentModal({ isOpen, onClose }: PaymentModalProps) {
  const navigate = useNavigate()
  const [selectedMethod, setSelectedMethod] = useState('')
  const [formData, setFormData] = useState({
    reference: '',
    amount: '',
    date: '',
    name: ''
  })

  // Función para sanitizar y validar entrada numérica
  const sanitizeNumericInput = (value: string) => {
    // Remover todo excepto números
    const numbers = value.replace(/[^\d]/g, '')
    return numbers
  }

  // Función para formatear número con separadores de miles
  const formatNumber = (value: string) => {
    if (!value) return ''
    const number = parseInt(value)
    return number.toLocaleString()
  }

  // Handler para el campo de monto
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeNumericInput(e.target.value)
    setFormData(prev => ({ ...prev, amount: sanitized }))
  }

  // Handler para referencia (solo alfanumérico)
  const handleReferenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = e.target.value.replace(/[^a-zA-Z0-9]/g, '')
    setFormData(prev => ({ ...prev, reference: sanitized }))
  }

  // Handler para nombre (solo letras y espacios)
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
    setFormData(prev => ({ ...prev, name: sanitized }))
  }
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1) // 1: Método, 2: Transferencia, 3: Comprobante, 4: Confirmación
  const [showConfirmation, setShowConfirmation] = useState(false)

  const { items, getTotal, clearCart } = useCartStore()
  const { user } = useAuthStore()
  const { settings } = useSettings()

  const total = getTotal()

  // Métodos de pago desde el Panel Administrativo
  const basePaymentMethods = settings.payment_methods || {
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

  // Agregar iconos y colores a los métodos del admin
  const getMethodIcon = (key: string) => {
    const icons: { [key: string]: string } = {
      nequi: '📱',
      bancolombia: '🏦',
      transfiya: '💸',
      daviplata: '💳'
    }
    return icons[key] || '💰'
  }

  const getMethodColor = (key: string) => {
    const colors: { [key: string]: string } = {
      nequi: 'from-purple-500 to-pink-500',
      bancolombia: 'from-yellow-500 to-orange-500',
      transfiya: 'from-green-500 to-blue-500',
      daviplata: 'from-blue-500 to-indigo-500'
    }
    return colors[key] || 'from-gray-500 to-gray-600'
  }

  const paymentMethods = Object.fromEntries(
    Object.entries(basePaymentMethods).map(([key, method]) => [
      key,
      {
        ...method,
        icon: getMethodIcon(key),
        color: getMethodColor(key)
      }
    ])
  )

  const selectedPaymentMethod = selectedMethod ? paymentMethods[selectedMethod as keyof typeof paymentMethods] : null

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method)
    setCurrentStep(2)
  }

  const handleTransferDone = () => {
    setCurrentStep(3)
  }

  const handleConfirmationContinue = () => {
    // Limpiar y cerrar
    clearCart()
    handleClose()
    
    // Redirigir al dashboard
    navigate('/dashboard')
  }

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
          payment_method: selectedMethod,
          payment_reference: formData.reference,
          payer_name: formData.name,
          payment_date: formData.date,
          transferred_amount: parseInt(formData.amount)
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al procesar el pago')
      }

      const result = await response.json()
      
      // Mostrar modal de confirmación
      setShowConfirmation(true)
      setCurrentStep(4)
      
    } catch (error: any) {
      console.error('Error:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const resetModal = () => {
    setCurrentStep(1)
    setSelectedMethod('')
    setShowConfirmation(false)
    setFormData({
      reference: '',
      amount: '',
      date: '',
      name: ''
    })
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  // Validación mejorada del formulario
  const isFormValid = formData.reference && 
                     formData.name && 
                     formData.date && 
                     formData.amount && 
                     parseInt(formData.amount) === total

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="💳 Pago por Transferencia"
      size="lg"
    >
      <div className="space-y-6">
        {/* Indicador de pasos */}
        <div className="flex items-center justify-center space-x-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                  currentStep >= step 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step}
              </div>
              {step < 3 && (
                <div 
                  className={`w-8 h-1 mx-2 ${
                    currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Paso 1: Selección de método */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Selecciona tu método de pago
              </h3>
              <p className="text-gray-600">
                Elige cómo quieres realizar la transferencia
              </p>
            </div>

            <div className="grid gap-4">
              {Object.entries(paymentMethods).map(([key, method]) => (
                <button
                  key={key}
                  onClick={() => handleMethodSelect(key)}
                  className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all p-6 text-left hover:shadow-lg"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${method.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                  
                  <div className="relative flex items-center space-x-4">
                    <div className="text-4xl">{method.icon}</div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-800">{method.name}</h4>
                      <p className="text-gray-600">{method.type}</p>
                      <p className="text-sm text-gray-500">{method.account}</p>
                    </div>
                    <div className="text-gray-400 group-hover:text-blue-600 transition-colors">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Paso 2: Datos de transferencia */}
        {currentStep === 2 && selectedPaymentMethod && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Realiza la transferencia
              </h3>
              <p className="text-gray-600">
                Usa estos datos para transferir desde tu app bancaria
              </p>
            </div>

            {/* Tarjeta de datos con borde animado */}
            <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 shadow-lg overflow-hidden">
              {/* Borde animado */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 via-pink-500 via-red-500 via-yellow-500 via-green-500 via-cyan-500 to-blue-500 bg-[length:400%_400%] animate-pulse-border p-[2px]">
                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl"></div>
              </div>
              
              {/* Contenido */}
              <div className="relative z-10 space-y-4">
                <div className="text-center mb-6">
                  <div className="text-4xl mb-2">{selectedPaymentMethod.icon}</div>
                  <h4 className="text-xl font-bold text-gray-800">{selectedPaymentMethod.name}</h4>
                </div>

                <div className="grid gap-4">
                  {/* Cuenta */}
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Cuenta:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-lg">{selectedPaymentMethod.account}</span>
                        <button 
                          onClick={() => navigator.clipboard.writeText(selectedPaymentMethod.account)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Copiar"
                        >
                          📋
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Tipo */}
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Tipo:</span>
                      <span className="font-semibold">{selectedPaymentMethod.type}</span>
                    </div>
                  </div>

                  {/* Titular */}
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Titular:</span>
                      <span className="font-semibold">{selectedPaymentMethod.owner}</span>
                    </div>
                  </div>

                  {/* Monto */}
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-6 text-white text-center">
                    <p className="text-sm opacity-90 mb-1">💸 Monto a transferir</p>
                    <p className="text-4xl font-bold">${total.toLocaleString()}</p>
                    <p className="text-xs opacity-80 mt-1">COP (Pesos Colombianos)</p>
                  </div>
                </div>

                {/* Instrucción */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <span className="text-amber-600">⚠️</span>
                    <div className="text-sm text-amber-800">
                      <p className="font-semibold">Importante:</p>
                      <p>Transfiere exactamente <strong>${total.toLocaleString()}</strong> para agilizar la validación.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex space-x-3">
              <Button
                onClick={() => setCurrentStep(1)}
                className="flex-1 btn-secondary"
              >
                ← Cambiar método
              </Button>
              <Button
                onClick={handleTransferDone}
                className="flex-1 btn-primary"
              >
                Ya transferí →
              </Button>
            </div>
          </div>
        )}

        {/* Paso 3: Comprobante */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Ingresa los datos del comprobante
              </h3>
              <p className="text-gray-600">
                Completa la información para validar tu pago
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✅</span>
                <div className="text-sm text-green-800">
                  <p className="font-semibold">Transferencia realizada</p>
                  <p>Ahora completa los datos de tu comprobante</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de referencia *
                </label>
                <input
                  type="text"
                  value={formData.reference}
                  onChange={handleReferenceChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: 123456789"
                  maxLength={20}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del pagador *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={handleNameChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nombre completo"
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de transferencia *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto transferido *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.amount ? `$${formatNumber(formData.amount)}` : ''}
                    onChange={handleAmountChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      formData.amount && parseInt(formData.amount) !== total 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300'
                    }`}
                    placeholder={`Ejemplo: $${total.toLocaleString()}`}
                    maxLength={15}
                  />
                  {formData.amount && parseInt(formData.amount) !== total && (
                    <p className="text-red-500 text-xs mt-1">
                      El monto debe ser exactamente ${total.toLocaleString()}
                    </p>
                  )}
                  {formData.amount && parseInt(formData.amount) === total && (
                    <p className="text-green-500 text-xs mt-1">
                      ✓ Monto correcto
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex space-x-3">
              <Button
                onClick={() => setCurrentStep(2)}
                className="flex-1 btn-secondary"
              >
                ← Volver
              </Button>
              
              <Button
                onClick={handleSubmitPayment}
                className="flex-1 btn-primary"
                disabled={loading || !isFormValid}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Procesando...</span>
                  </div>
                ) : (
                  'Enviar Comprobante'
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Modal de Confirmación */}
        {currentStep === 4 && showConfirmation && (
          <div className="text-center p-8 space-y-6">
            {/* Icono de éxito */}
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl">✓</span>
              </div>
            </div>

            {/* Título */}
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Comprobante Enviado!
            </h3>

            {/* Mensaje principal */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="text-lg text-blue-800 leading-relaxed">
                Estamos validando tu pago, en pocos minutos podrás crear tu memorial 
                en tu cuenta de usuario.
              </p>
            </div>

            {/* Información adicional */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>📧</span>
                <span>Te enviaremos una confirmación por email</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 mt-2">
                <span>⏱️</span>
                <span>Tiempo de validación: máximo 30 minutos</span>
              </div>
            </div>

            {/* Botón de continuar */}
            <Button
              onClick={handleConfirmationContinue}
              className="w-full btn-primary text-lg py-4 mt-6"
            >
              Ir a Mi Dashboard
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default PaymentModal