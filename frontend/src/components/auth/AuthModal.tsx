import { useState } from 'react'
import { Modal, Button, Input } from '@/components/ui'
import { useAuthStore } from '@/stores/authStore'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultMode?: 'login' | 'register'
}

/**
 * Modal de autenticación con login y registro
 * Maneja validación, estados de carga y errores
 */
function AuthModal({ isOpen, onClose, defaultMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showSuccess, setShowSuccess] = useState(false)

  const { login, register, loading, error, clearError } = useAuthStore()

  /**
   * Validar formulario
   */
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida'
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
    }

    if (mode === 'register') {
      if (!formData.name.trim()) {
        newErrors.name = 'El nombre es requerido'
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * Manejar envío del formulario
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', { mode, email: formData.email, hasPassword: !!formData.password })
    
    // Validar que los campos no estén vacíos antes de enviar
    if (!formData.email.trim() || !formData.password.trim()) {
      console.log('Campos vacíos detectados')
      return
    }
    
    if (mode === 'register' && !formData.name.trim()) {
      console.log('Nombre vacío en registro')
      return
    }
    
    if (!validateForm()) {
      console.log('Validación fallida')
      return
    }

    console.log('Iniciando proceso de autenticación...')
    try {
      if (mode === 'login') {
        await login(formData.email, formData.password)
        
        // Si llegamos aquí sin excepción, el login fue exitoso
        onClose()
        resetForm()
        // Scroll suave a la sección de precios
        setTimeout(() => {
          const pricingSection = document.getElementById('precios')
          if (pricingSection) {
            pricingSection.scrollIntoView({ behavior: 'smooth' })
          }
        }, 100)
      } else {
        await register(formData.email, formData.password, formData.name)
        
        // Si llegamos aquí sin excepción, el registro fue exitoso
        setShowSuccess(true)
      }
    } catch (err) {
      // Error manejado por el store - el modal permanece abierto
      // para mostrar el mensaje de error
      console.error('Error en autenticación:', err)
    }
  }

  /**
   * Resetear formulario
   */
  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      name: '',
      confirmPassword: ''
    })
    setErrors({})
    setShowSuccess(false)
    clearError()
  }

  /**
   * Cambiar modo (login/register)
   */
  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login')
    resetForm()
  }

  /**
   * Manejar cierre del modal
   */
  const handleClose = () => {
    onClose()
    resetForm()
  }

  // Si el registro fue exitoso, mostrar mensaje de éxito
  if (showSuccess) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="¡Registro Exitoso!"
        size="md"
      >
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            ¡Cuenta creada exitosamente!
          </h3>
          <p className="text-gray-600 mb-6">
            Hemos enviado un enlace de verificación a <strong>{formData.email}</strong>.
            <br />Revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm">
              📬 Si no ves el email, revisa tu carpeta de spam o correo no deseado.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="btn btn-primary w-full"
          >
            Entendido
          </button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error general */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Campos del formulario */}
        <div className="space-y-4">
          {mode === 'register' && (
            <Input
              label="Nombre completo"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              error={errors.name}
              placeholder="Tu nombre completo"
              required
            />
          )}

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            error={errors.email}
            placeholder="tu@email.com"
            required
          />

          <Input
            label="Contraseña"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            error={errors.password}
            placeholder="Mínimo 6 caracteres"
            required
          />

          {mode === 'register' && (
            <Input
              label="Confirmar contraseña"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              error={errors.confirmPassword}
              placeholder="Repite tu contraseña"
              required
            />
          )}
        </div>

        {/* Botones */}
        <div className="space-y-4">
          <Button
            type="submit"
            className="w-full btn-primary"
            loading={loading}
            disabled={loading}
            onClick={(e) => {
              console.log('Botón clickeado', { loading, disabled: loading })
              if (loading) {
                e.preventDefault()
                console.log('Click bloqueado por loading')
              }
            }}
          >
            {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={switchMode}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              {mode === 'login' 
                ? '¿No tienes cuenta? Regístrate' 
                : '¿Ya tienes cuenta? Inicia sesión'
              }
            </button>
          </div>
        </div>

        {/* Información adicional para registro */}
        {mode === 'register' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              Al registrarte, aceptas nuestros términos de servicio y política de privacidad. 
              Podrás crear un memorial gratuito inmediatamente.
            </p>
          </div>
        )}
      </form>
    </Modal>
  )
}

export default AuthModal