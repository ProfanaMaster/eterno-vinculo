import { useState, useEffect } from 'react'
import { supabase } from '@/config/supabase'

interface DashboardData {
  users: number
  orders: number
  pending_orders: number
  total_revenue: number
}

interface RecentActivity {
  id: string
  type: 'payment' | 'user' | 'order'
  message: string
  details: string
  created_at: string
}

type AdminView = 'dashboard' | 'users' | 'orders' | 'settings'

interface DashboardStatsProps {
  onViewChange?: (view: AdminView) => void
}

function DashboardStats({ onViewChange }: DashboardStatsProps) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Usar endpoint del backend
        const token = (await supabase.auth.getSession()).data.session?.access_token
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api'
        const response = await fetch(`${API_URL}/admin/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        const result = await response.json()
        
        if (result.success) {
          setData({
            users: result.data.users || 0,
            orders: result.data.orders || 0,
            pending_orders: 0, // No incluido en el endpoint
            total_revenue: result.data.revenue || 0
          })
        }

        // Obtener actividad reciente
        const activities: RecentActivity[] = []
        
        // Últimas órdenes pagadas
        const { data: recentPaidOrders } = await supabase
          .from('orders')
          .select('*, users(email)')
          .not('paid_at', 'is', null)
          .order('paid_at', { ascending: false })
          .limit(3)
        
        recentPaidOrders?.forEach(order => {
          activities.push({
            id: order.id,
            type: 'payment',
            message: 'Pago verificado',
            details: `Usuario: ${order.users?.email} - $${order.total_amount ? parseFloat(order.total_amount).toLocaleString() : 'N/A'}`,
            created_at: order.paid_at || order.created_at
          })
        })
        
        // Últimos usuarios registrados
        const { data: recentUsers } = await supabase
          .from('users')
          .select('email, created_at')
          .order('created_at', { ascending: false })
          .limit(2)
        
        recentUsers?.forEach(user => {
          activities.push({
            id: user.email,
            type: 'user',
            message: 'Nuevo usuario registrado',
            details: user.email,
            created_at: user.created_at
          })
        })
        
        // Últimas órdenes pendientes
        const { data: recentPendingOrders } = await supabase
          .from('orders')
          .select('*, users(email)')
          .eq('status', 'pending_verification')
          .order('created_at', { ascending: false })
          .limit(2)
        
        recentPendingOrders?.forEach(order => {
          activities.push({
            id: order.id,
            type: 'order',
            message: 'Pago pendiente',
            details: `${order.users?.email} - Ref: ${order.payment_reference || 'Sin ref'}`,
            created_at: order.created_at
          })
        })
        
        // Ordenar por fecha y tomar los 6 más recientes
        const sortedActivities = activities
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 6)
        
        setRecentActivity(sortedActivities)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const stats = [
    {
      name: 'Total Usuarios',
      value: data?.users || 0,
      icon: '👥',
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      name: 'Órdenes Totales',
      value: data?.orders || 0,
      icon: '📦',
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      name: 'Pagos Pendientes',
      value: data?.pending_orders || 0,
      icon: '⏳',
      color: 'bg-yellow-500',
      change: '-3%'
    },
    {
      name: 'Ingresos Totales',
      value: `$${(data?.total_revenue || 0).toLocaleString('es-CO')}`,
      icon: '💰',
      color: 'bg-purple-500',
      change: '+15%'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <span className="text-white text-xl">{stat.icon}</span>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className={`text-sm font-medium ${
                stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
              <span className="text-sm text-gray-500 ml-2">vs mes anterior</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => onViewChange?.('orders')}
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600">💳</span>
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">Revisar Pagos</div>
              <div className="text-sm text-gray-500">Validar transferencias</div>
            </div>
          </button>

          <button 
            onClick={() => onViewChange?.('users')}
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600">👥</span>
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">Gestionar Usuarios</div>
              <div className="text-sm text-gray-500">Roles y permisos</div>
            </div>
          </button>

          <button 
            onClick={() => onViewChange?.('settings')}
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600">⚙️</span>
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">Configurar Sitio</div>
              <div className="text-sm text-gray-500">Textos y precios</div>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
        <div className="space-y-4">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity) => {
              const getActivityIcon = (type: string) => {
                switch (type) {
                  case 'payment':
                    return { bg: 'bg-green-100', icon: '✓', color: 'text-green-600' }
                  case 'user':
                    return { bg: 'bg-blue-100', icon: '👤', color: 'text-blue-600' }
                  case 'order':
                    return { bg: 'bg-yellow-100', icon: '⏳', color: 'text-yellow-600' }
                  default:
                    return { bg: 'bg-gray-100', icon: '•', color: 'text-gray-600' }
                }
              }
              
              const iconConfig = getActivityIcon(activity.type)
              const timeAgo = new Date(activity.created_at).toLocaleString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              })
              
              return (
                <div key={activity.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-8 h-8 ${iconConfig.bg} rounded-full flex items-center justify-center`}>
                    <span className={`${iconConfig.color} text-sm`}>{iconConfig.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.details}</p>
                  </div>
                  <span className="text-xs text-gray-400">{timeAgo}</span>
                </div>
              )
            })
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No hay actividad reciente</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardStats