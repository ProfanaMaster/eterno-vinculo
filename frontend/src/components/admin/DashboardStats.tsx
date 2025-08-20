import { useState, useEffect } from 'react'
import { supabase } from '@/config/supabase'

interface DashboardData {
  users: number
  orders: number
  pending_orders: number
  total_revenue: number
}

type AdminView = 'dashboard' | 'users' | 'orders' | 'settings'

interface DashboardStatsProps {
  onViewChange?: (view: AdminView) => void
}

function DashboardStats({ onViewChange }: DashboardStatsProps) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token
        
        if (!token) return

        const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3002/api'
        const response = await fetch(`${API_URL}/admin/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const result = await response.json()
          setData(result.data)
        }
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
      value: `$${(data?.total_revenue || 0).toLocaleString()}`,
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
          <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-sm">✓</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Pago verificado</p>
              <p className="text-xs text-gray-500">Usuario: juan@email.com - $150.000</p>
            </div>
            <span className="text-xs text-gray-400">Hace 2 horas</span>
          </div>

          <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm">👤</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Nuevo usuario registrado</p>
              <p className="text-xs text-gray-500">maria@email.com</p>
            </div>
            <span className="text-xs text-gray-400">Hace 4 horas</span>
          </div>

          <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-yellow-600 text-sm">⏳</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Pago pendiente</p>
              <p className="text-xs text-gray-500">carlos@email.com - Ref: 123456789</p>
            </div>
            <span className="text-xs text-gray-400">Hace 6 horas</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardStats