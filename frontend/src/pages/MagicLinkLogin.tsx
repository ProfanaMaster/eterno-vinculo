import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/config/supabase';
import { useAuthStore } from '@/stores/authStore';

function MagicLinkLogin() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    const handleMagicLink = async () => {
      try {
        // Obtener los parámetros de la URL
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token');
        const type = urlParams.get('type');

        if (type === 'magiclink' && accessToken && refreshToken) {
          // Establecer la sesión con los tokens
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            throw error;
          }

          // Actualizar el estado de autenticación
          await checkAuth();
          
          setStatus('success');
          setMessage('¡Inicio de sesión exitoso! Redirigiendo al dashboard...');
          
          // Redirigir al dashboard después de 2 segundos
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
          
        } else {
          throw new Error('Enlace de acceso inválido');
        }
      } catch (error: any) {
        console.error('Error en magic link:', error);
        setStatus('error');
        setMessage(error.message || 'Error al procesar el enlace de acceso');
        
        // Redirigir a la página principal después de 3 segundos
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    };

    handleMagicLink();
  }, [checkAuth, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center">
            {status === 'loading' && (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            )}
            {status === 'success' && (
              <div className="rounded-full h-12 w-12 bg-green-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            {status === 'error' && (
              <div className="rounded-full h-12 w-12 bg-red-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
          </div>
          
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {status === 'loading' && 'Procesando enlace de acceso...'}
            {status === 'success' && '¡Acceso exitoso!'}
            {status === 'error' && 'Error de acceso'}
          </h2>
          
          <p className="mt-2 text-sm text-gray-600">
            {message}
          </p>
          
          {status === 'loading' && (
            <p className="mt-4 text-xs text-gray-500">
              Por favor espera mientras procesamos tu enlace de acceso...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default MagicLinkLogin;
