import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/config/supabase'

function VerifyEmail() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const { checkAuth } = useAuthStore()

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        // Obtener el hash de la URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')

        if (accessToken && refreshToken) {
          // Establecer la sesión con los tokens
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })

          if (error) {
            throw error
          }

          // Actualizar el estado de autenticación
          await checkAuth()
          
          setStatus('success')
          setMessage('¡Email verificado exitosamente! Ya puedes usar tu cuenta.')
          
          // Redirigir después de 3 segundos
          setTimeout(() => {
            window.location.href = '/'
          }, 3000)
          
        } else {
          throw new Error('Tokens de verificación no encontrados')
        }
      } catch (error: any) {
        console.error('Error verificando email:', error)
        setStatus('error')
        setMessage(error.message || 'Error al verificar el email')
      }
    }

    handleEmailVerification()
  }, [checkAuth])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
            {status === 'loading' && (
              <svg className="animate-spin h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {status === 'success' && (
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {status === 'error' && (
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {status === 'loading' && 'Verificando email...'}
            {status === 'success' && '¡Email verificado!'}
            {status === 'error' && 'Error de verificación'}
          </h2>
          
          <p className="mt-2 text-sm text-gray-600">
            {message}
          </p>
        </div>

        {status === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Cuenta activada
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>
                    Tu cuenta ha sido verificada exitosamente. Ahora puedes:
                  </p>
                  <ul className="list-disc list-inside mt-2">
                    <li>Comprar el paquete memorial</li>
                    <li>Crear perfiles memoriales</li>
                    <li>Acceder a todas las funciones</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error de verificación
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    No pudimos verificar tu email. Esto puede deberse a:
                  </p>
                  <ul className="list-disc list-inside mt-2">
                    <li>El enlace ha expirado</li>
                    <li>El enlace ya fue usado</li>
                    <li>Error en el servidor</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <button 
                onClick={() => window.location.href = '/'}
                className="btn btn-secondary"
              >
                Volver al inicio
              </button>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Serás redirigido automáticamente en unos segundos...
            </p>
            <button 
              onClick={() => window.location.href = '/'}
              className="mt-4 btn btn-primary"
            >
              Ir al inicio ahora
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default VerifyEmail