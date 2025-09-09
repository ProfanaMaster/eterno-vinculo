import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/services/api';

interface Order {
  id: string;
  status: string;
  total_amount: number;
  payment_intent_id?: string;
  paid_at: string | null;
  created_at: string;
}

export const useUserOrders = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasConfirmedOrders, setHasConfirmedOrders] = useState(false);

  const fetchUserOrders = async () => {
    // No hacer petición si aún está cargando la autenticación
    if (authLoading) {
      return;
    }

    if (!isAuthenticated || !user) {
      setOrders([]);
      setHasConfirmedOrders(false);
      return;
    }

    setLoading(true);
    try {
      // Esperar un poco más para asegurar que el token esté disponible
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const response = await api.get('/orders');
      const userOrders = response.data.data || [];
      setOrders(userOrders);
      
      // Verificar si tiene órdenes confirmadas (completed) o pendientes
      const confirmedOrders = userOrders.filter((order: Order) => 
        order.status === 'completed' && order.paid_at
      );
      const pendingOrders = userOrders.filter((order: Order) => 
        order.status === 'pending' || order.status === 'pending_verification'
      );
      setHasConfirmedOrders(confirmedOrders.length > 0 || pendingOrders.length > 0);
    } catch (error) {
      setOrders([]);
      setHasConfirmedOrders(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Solo hacer la petición cuando la autenticación esté completamente cargada
    if (!authLoading && isAuthenticated && user) {
      // Esperar un poco más para asegurar que el token esté disponible
      const timer = setTimeout(() => {
        fetchUserOrders();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, authLoading]);

  return {
    orders,
    loading,
    hasConfirmedOrders,
    refetch: fetchUserOrders
  };
};
