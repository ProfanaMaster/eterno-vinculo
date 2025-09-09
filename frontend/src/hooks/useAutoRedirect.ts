import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useUserOrders } from './useUserOrders';

export const useAutoRedirect = () => {
  const { isAuthenticated, loading: authLoading, user } = useAuthStore();
  const { hasConfirmedOrders, loading: ordersLoading, orders } = useUserOrders();
  const navigate = useNavigate();
  const location = useLocation();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Solo redirigir cuando:
    // 1. No esté cargando la autenticación
    // 2. No esté cargando las órdenes
    // 3. El usuario esté autenticado
    // 4. Tenga órdenes confirmadas
    // 5. No haya redirigido ya
    // 6. Estemos en la página de inicio (no en otras páginas)
    // 7. No hayamos redirigido ya en esta sesión de login
    if (!authLoading && !ordersLoading && isAuthenticated && hasConfirmedOrders && !hasRedirected && location.pathname === '/') {
      // Verificar si ya redirigimos en esta sesión de login
      const redirectKey = `autoRedirect_${user?.id}`;
      const hasRedirectedThisSession = localStorage.getItem(redirectKey);
      
      if (!hasRedirectedThisSession) {
        setHasRedirected(true);
        localStorage.setItem(redirectKey, 'true');
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, hasConfirmedOrders, authLoading, ordersLoading, navigate, hasRedirected, orders, location.pathname, user?.id]);

  // Limpiar el flag de redirección cuando el usuario cierre sesión
  useEffect(() => {
    if (!isAuthenticated && user?.id) {
      const redirectKey = `autoRedirect_${user.id}`;
      localStorage.removeItem(redirectKey);
    }
  }, [isAuthenticated, user?.id]);

  return {
    shouldRedirect: isAuthenticated && hasConfirmedOrders && !authLoading && !ordersLoading && !hasRedirected && location.pathname === '/'
  };
};
