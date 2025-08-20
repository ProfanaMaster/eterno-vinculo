import { useState, useEffect } from 'react'
import { api } from '@/services/api'

interface Order {
  id: string
  user_id: string
  package_id: string
  status: 'pending' | 'completed' | 'cancelled' | 'failed'
  payment_intent_id?: string
  total_amount: number
  currency?: string
  payment_method?: string
  paid_at?: string
  created_at: string
  users?: {
    first_name: string
    last_name: string
    email: string
  }
}

interface OrdersResponse {
  orders: Order[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })

  const fetchOrders = async (page = 1, search = '', status = 'all') => {
    setLoading(true)
    setError(null)
    
    try {
      const params: any = { page, limit: 10, search }
      if (status !== 'all') {
        params.status = status
      }
      
      const response = await api.get('/admin/orders', {
        params
      })
      
      const responseData = response.data
      setOrders(responseData.data)
      setPagination(responseData.pagination)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar órdenes')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string, userId?: string) => {
    try {
      const response = await api.patch(`/admin/orders/${orderId}`, {
        status,
        verified_by: userId
      })
      
      
      if (response.data.success) {
        // Actualizar orden en el estado local
        setOrders(prev => prev.map(order => 
          order.id === orderId 
            ? { ...order, status: status as any }
            : order
        ))
        return true
      }
      
      return false
    } catch (err: any) {
      console.error('Error updating order status:', err)
      console.error('Error details:', err.response?.data)
      console.error('Status code:', err.response?.status)
      setError(err.response?.data?.message || 'Error al actualizar orden')
      return false
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  return {
    orders,
    loading,
    error,
    pagination,
    fetchOrders,
    updateOrderStatus,
    clearError: () => setError(null)
  }
}