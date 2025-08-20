import { useEffect } from 'react'
import Modal from './Modal'

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message?: string
}

function SuccessModal({ 
  isOpen, 
  onClose, 
  title = "¡Pago Registrado!",
  message = "Te contactaremos una vez validemos la transferencia (2-24 horas hábiles)."
}: SuccessModalProps) {

  useEffect(() => {
    if (isOpen) {
      // Auto cerrar después de 5 segundos
      const timer = setTimeout(() => {
        onClose()
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [isOpen, onClose])

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center p-6">
        {/* Icono de éxito animado */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
          <svg 
            className="h-8 w-8 text-green-600 animate-bounce" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 13l4 4L19 7" 
            />
          </svg>
        </div>

        {/* Título */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>

        {/* Mensaje */}
        <p className="text-gray-600 mb-6">
          {message}
        </p>

        {/* Información adicional */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 text-left">
              <h4 className="text-sm font-medium text-blue-800">
                ¿Qué sigue?
              </h4>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Validaremos tu comprobante de pago</li>
                  <li>Te enviaremos un email de confirmación</li>
                  <li>Podrás crear tu memorial una vez aprobado</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Botón de cerrar */}
        <button
          onClick={onClose}
          className="w-full btn btn-primary"
        >
          Entendido
        </button>

        {/* Contador de auto-cierre */}
        <p className="text-xs text-gray-400 mt-3">
          Esta ventana se cerrará automáticamente en 5 segundos
        </p>
      </div>
    </Modal>
  )
}

export default SuccessModal