import { useAuthStore } from '@/stores/authStore';
import { useUserOrders } from './useUserOrders';

export const useDebugAuth = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuthStore();
  const { orders, hasConfirmedOrders, loading: ordersLoading } = useUserOrders();

  return {
    isAuthenticated,
    authLoading,
    user,
    ordersLoading,
    orders,
    hasConfirmedOrders
  };
};
