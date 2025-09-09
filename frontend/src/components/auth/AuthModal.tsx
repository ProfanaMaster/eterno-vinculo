import React, { useState } from 'react'
import { Modal, Button, Input } from '@/components/ui'
import { useAuthStore } from '@/stores/authStore'
import { useUserOrders } from '@/hooks/useUserOrders'
import { useNavigate } from 'react-router-dom'

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
  const [mode, setMode] = useState<'login' | 'register' | 'forgot-password'>(defaultMode)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showSuccess, setShowSuccess] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)

  const { login, register, resetPassword, loading, error, clearError, isAuthenticated } = useAuthStore()
  const { hasConfirmedOrders, loading: ordersLoading } = useUserOrders()
  const navigate = useNavigate()

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
    
    if (mode === 'forgot-password') {
      // Validar solo email para restablecimiento
      if (!formData.email.trim()) {
        setErrors({ email: 'El email es requerido' })
        return
      }
      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        setErrors({ email: 'Email inválido' })
        return
      }
      
      try {
        await resetPassword(formData.email)
        setResetEmailSent(true)
      } catch (err) {
        // Error manejado por el store
      }
      return
    }
    
    // Validar que los campos no estén vacíos antes de enviar
    if (!formData.email.trim() || !formData.password.trim()) {
      return
    }
    
    if (mode === 'register' && !formData.name.trim()) {
      return
    }
    
    if (!validateForm()) return
    try {
      if (mode === 'login') {
        await login(formData.email, formData.password)
        
        // Si llegamos aquí sin excepción, el login fue exitoso
        onClose()
        resetForm()
        
        // Lógica simplificada: solo redirigir si tiene órdenes
        const checkAndRedirect = () => {
          if (ordersLoading) {
            // Si aún está cargando, esperar un poco más
            setTimeout(checkAndRedirect, 200);
            return;
          }
          
          if (isAuthenticated && hasConfirmedOrders) {
            navigate('/dashboard');
          }
        };
        
        // Iniciar la verificación después de un pequeño delay
        setTimeout(checkAndRedirect, 100);
      } else {
        await register(formData.email, formData.password, formData.name)
        
        // Si llegamos aquí sin excepción, el registro fue exitoso
        setShowSuccess(true)
      }
    } catch (err) {
      // Error manejado por el store - el modal permanece abierto
      // para mostrar el mensaje de error
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
    setResetEmailSent(false)
    clearError()
  }

  /**
   * Cambiar modo (login/register/forgot-password)
   */
  const switchMode = () => {
    if (mode === 'login') {
      setMode('register')
    } else if (mode === 'register') {
      setMode('login')
    } else {
      setMode('login')
    }
    resetForm()
  }

  /**
   * Ir a modo de restablecimiento de contraseña
   */
  const goToForgotPassword = () => {
    setMode('forgot-password')
    resetForm()
  }

  /**
   * Volver al login desde restablecimiento
   */
  const backToLogin = () => {
    setMode('login')
    resetForm()
  }

  /**
   * Manejar cierre del modal
   */
  const handleClose = () => {
    onClose()
    resetForm()
  }

  // Resetear loading cuando se abre el modal
  React.useEffect(() => {
    if (isOpen) {
      useAuthStore.setState({ loading: false, error: null })
    }
  }, [isOpen])

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

  // Si se envió el email de restablecimiento, mostrar mensaje de éxito
  if (resetEmailSent) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Email Enviado"
        size="md"
      >
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            ¡Enlace enviado!
          </h3>
          <p className="text-gray-600 mb-6">
            Hemos enviado un enlace para restablecer tu contraseña a <strong>{formData.email}</strong>.
            <br />Revisa tu bandeja de entrada y haz clic en el enlace.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm">
              📬 Si no ves el email, revisa tu carpeta de spam o correo no deseado.
            </p>
          </div>
          <div className="space-y-3">
            <button
              onClick={backToLogin}
              className="btn btn-primary w-full"
            >
              Volver al Login
            </button>
            <button
              onClick={handleClose}
              className="btn btn-outline w-full"
            >
              Cerrar
            </button>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        mode === 'login' ? 'Iniciar Sesión' : 
        mode === 'register' ? 'Crear una Nueva Cuenta' : 
        'Restablecer Contraseña'
      }
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

          {mode !== 'forgot-password' && (
            <Input
              label="Contraseña"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              error={errors.password}
              placeholder="Mínimo 6 caracteres"
              required
            />
          )}

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
          >
            {mode === 'login' ? 'Iniciar Sesión' : 
             mode === 'register' ? 'Crear una Nueva Cuenta' : 
             'Enviar Enlace'}
          </Button>

          {mode === 'forgot-password' ? (
            <div className="text-center">
              <button
                type="button"
                onClick={backToLogin}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                ← Volver al Login
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <Button
                type="button"
                onClick={switchMode}
                variant="outline"
                className="w-full"
              >
                {mode === 'login' 
                  ? '¿No tienes cuenta? Regístrate' 
                  : '¿Ya tienes cuenta? Inicia sesión'
                }
              </Button>
              {mode === 'login' && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={goToForgotPassword}
                    className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Información adicional */}
        {mode === 'register' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              Al registrarte, aceptas nuestros términos de servicio y política de privacidad. 
              Podrás crear un memorial gratuito inmediatamente.
            </p>
          </div>
        )}
        
        {mode === 'forgot-password' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              Te enviaremos un enlace seguro para restablecer tu contraseña. 
              El enlace expirará en 1 hora por seguridad.
            </p>
          </div>
        )}
      </form>
    </Modal>
  )
}

export default AuthModal