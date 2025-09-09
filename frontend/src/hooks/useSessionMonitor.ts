import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/config/supabase';
import { useAuthStore } from '@/stores/authStore';

export function useSessionMonitor() {
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) return;

    // Función para verificar si la sesión sigue siendo válida
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        // Si no hay sesión o hay error, el usuario fue eliminado o la sesión expiró
        if (!session || error) {
          console.log('Sesión inválida detectada, cerrando sesión...');
          await logout();
          navigate('/', { replace: true });
          return;
        }

        // Verificar si el usuario aún existe en la base de datos
        const response = await fetch('/api/users/me', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (response.status === 401 || response.status === 404) {
          console.log('Usuario eliminado detectado, cerrando sesión...');
          await logout();
          navigate('/', { replace: true });
        }
      } catch (error) {
        console.error('Error verificando sesión:', error);
        // En caso de error de red, no hacer nada para evitar cierres falsos
      }
    };

    // Verificar cada 30 segundos
    checkIntervalRef.current = setInterval(checkSession, 30000);

    // Verificar inmediatamente
    checkSession();

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [user, logout, navigate]);

  // También escuchar cambios en el estado de autenticación de Supabase
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || (!session && user)) {
        console.log('Cambio de estado de auth detectado, cerrando sesión...');
        await logout();
        navigate('/', { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [user, logout, navigate]);
}
