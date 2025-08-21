import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/config/supabase'
import AdminSidebar from '@/components/admin/AdminSidebar'
import DashboardStats from '@/components/admin/DashboardStats'
import UsersManagement from '@/components/admin/UsersManagement'
import OrdersManagement from '@/components/admin/OrdersManagement'
import SiteSettings from '@/components/admin/SiteSettings'
import NotificationBell from '@/components/admin/NotificationBell'

type AdminView = 'dashboard' | 'users' | 'orders' | 'settings'

function AdminDashboard() {
  const [currentView, setCurrentView] = useState<AdminView>('dashboard')
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const { user, isAuthenticated } = useAuthStore()

  // Suscripción en tiempo real para admin
  useEffect(() => {
    if (!isAuthorized) return

    const subscription = supabase
      .channel('admin_dashboard')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'users' },
        () => window.location.reload()
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' },
        () => window.location.reload()
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'memorial_profiles' },
        () => window.location.reload()
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [isAuthorized])

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!isAuthenticated || !user) {
        setLoading(false)
        return
      }

      // Verificar si el email del usuario es admin
      const adminEmails = ['carolupe23@gmail.com'] // Agregar más emails admin aquí
      
      if (adminEmails.includes(user.email)) {
        setIsAuthorized(true)
        setLoading(false)
        return
      }

      // Si no es admin por email, intentar verificar con API
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token
        
        if (!token) {
          setLoading(false)
          return
        }

        const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3002/api'
        const response = await fetch(`${API_URL}/admin/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          setIsAuthorized(true)
        }
      } catch (error) {
        console.error('Error checking admin access:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAdminAccess()
  }, [isAuthenticated, user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
          <p className="text-gray-600 mb-6">No tienes permisos para acceder al panel de administración.</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="btn btn-primary"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardStats onViewChange={setCurrentView} />
      case 'users':
        return <UsersManagement />
      case 'orders':
        return <OrdersManagement />
      case 'settings':
        return <SiteSettings />
      default:
        return <DashboardStats onViewChange={setCurrentView} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <AdminSidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                Panel de Administración
              </h1>
              <div className="flex items-center space-x-4">
                <NotificationBell />
                <span className="text-sm text-gray-600">
                  Bienvenido, {user?.name}
                </span>
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderCurrentView()}
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard