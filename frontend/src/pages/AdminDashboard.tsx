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
  const [sidebarOpen, setSidebarOpen] = useState(false)
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

      // Verificar permisos de admin con API (usando roles de BD)
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
      {/* Sidebar móvil */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-64 bg-white">
            <AdminSidebar 
              currentView={currentView} 
              onViewChange={(view) => {
                setCurrentView(view)
                setSidebarOpen(false)
              }} 
            />
          </div>
        </div>
      )}
      
      {/* Sidebar desktop */}
      <div className="hidden lg:block lg:w-64 lg:flex-shrink-0">
        <AdminSidebar 
          currentView={currentView} 
          onViewChange={setCurrentView} 
        />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden mr-3 p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-0">
                  Panel de Administración
                </h1>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-4">
                <NotificationBell />
                <span className="text-xs sm:text-sm text-gray-600 hidden sm:block">
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
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {renderCurrentView()}
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard