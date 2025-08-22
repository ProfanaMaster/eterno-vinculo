import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useProfiles } from '@/hooks/useProfiles'
import { api } from '@/services/api'
import { supabase } from '@/config/supabase'
import { useNavigate, useSearchParams } from 'react-router-dom'
import ConfirmModal from '@/components/ui/ConfirmModal'
import MemoriesManager from '@/components/MemoriesManager'
import Modal from '@/components/ui/Modal'
import { logger } from '@/utils/logger'

interface Order {
  id: string
  status: string
  total_amount: number
  payment_intent_id?: string
  created_at: string
}

function UserDashboard() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { memorials, loading: memorialsLoading, deleteMemorial: deleteMemorialHook } = useProfiles()
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [dataFetched, setDataFetched] = useState(false)
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; memorialId: string | null }>({ isOpen: false, memorialId: null })
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false)
  const [showShareSuccess, setShowShareSuccess] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (user && user.id && !dataFetched) {
      fetchOrders()
    } else if (user === null) {
      navigate('/')
    }
    
    // Verificar si viene de pago exitoso
    if (searchParams.get('payment') === 'success') {
      setShowPaymentSuccess(true)
      // Limpiar el parámetro de la URL
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate, dataFetched, searchParams])

  // Suscripción en tiempo real
  useEffect(() => {
    if (!user) return

    const subscription = supabase
      .channel('user_dashboard')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${user.id}` },
        (payload) => {
          logger.log('📦 Orders updated, refetching...', payload.eventType)
          setDataFetched(false)
          fetchOrders()
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'memorial_profiles', filter: `user_id=eq.${user.id}` },
        (payload) => {
          logger.log('🏛️ Memorial profiles updated, refreshing data...', payload.eventType)
          // En lugar de recargar toda la página, refrescar solo los datos
          setDataFetched(false)
          fetchOrders()
          // El hook useProfiles debería actualizarse automáticamente
          setTimeout(() => {
            // Pequeño delay para asegurar que la DB se haya actualizado
            window.location.reload()
          }, 1000)
        }
      )
      .subscribe((status) => {
        logger.log('🔄 Dashboard subscription status:', status)
      })

    return () => {
      subscription.unsubscribe()
    }
  }, [user])

  const fetchOrders = async () => {
    if (dataFetched) return
    
    try {
      setOrdersLoading(true)
      setDataFetched(true)
      
      const ordersRes = await api.get('/orders')
      setOrders(ordersRes.data.data || [])
      
    } catch (error) {
      console.error('Error fetching orders:', error)
      setDataFetched(false)
    } finally {
      setOrdersLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pendiente' },
      completed: { color: 'bg-green-100 text-green-800', text: 'Completado' },
      cancelled: { color: 'bg-red-100 text-red-800', text: 'Cancelado' }
    }
    
    const statusConfig = config[status as keyof typeof config] || config.pending
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig.color}`}>
        {statusConfig.text}
      </span>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleDeleteClick = (memorialId: string) => {
    setConfirmModal({ isOpen: true, memorialId })
  }

  const confirmDelete = async () => {
    if (!confirmModal.memorialId) return

    try {
      await deleteMemorialHook(confirmModal.memorialId)
    } catch (error: any) {
      console.error('Error deleting memorial:', error)
      alert(error.message || 'Error al eliminar el memorial')
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      // Refrescar órdenes
      setDataFetched(false)
      await fetchOrders()
      
      // Refrescar página para cargar todos los datos
      window.location.reload()
    } catch (error) {
      console.error('Error refreshing dashboard:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const hasCompletedOrder = orders?.some(order => order.status === 'completed') || false
  const hasMemorial = memorials?.length > 0
  const canCreateMemorial = hasCompletedOrder && !hasMemorial

  const loading = ordersLoading || memorialsLoading

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          {/* Desktop Header */}
          <div className="hidden md:flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mi Dashboard</h1>
              <p className="text-gray-600">Bienvenido, {user?.name || user?.email}</p>
            </div>
            <div className="flex gap-3">
              {/* Botón de actualización */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                title="Actualizar dashboard"
              >
                {refreshing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Actualizando...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Actualizar página
                  </>
                )}
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Inicio
              </button>
            </div>
          </div>

          {/* Mobile Header */}
          <div className="md:hidden">
            {/* Primera fila - Título */}
            <div className="flex justify-between items-center mb-3">
              <h1 className="text-xl font-bold text-gray-900">Mi Dashboard</h1>
              <button
                onClick={() => navigate('/')}
                className="p-2 text-gray-600 hover:text-gray-800"
                title="Inicio"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </button>
            </div>
            
            {/* Segunda fila - Bienvenida y botón actualizar */}
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600 truncate mr-3">
                Bienvenido, {user?.name || user?.email}
              </p>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm whitespace-nowrap"
                title="Actualizar dashboard"
              >
                {refreshing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="hidden sm:inline">Actualizando...</span>
                  </>
                ) : (
                  <>
                    {/* Solo ícono SVG en móviles, ícono + texto en pantallas más grandes */}
                    <svg className="w-4 h-4 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="hidden sm:inline">Actualizar</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Botón de logout para ambos layouts */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-end">
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Aviso para usuarios sin órdenes */}
        {(orders?.length || 0) === 0 && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900">¡Bienvenido a Eterno Vínculo!</h3>
                <p className="text-blue-700">
                  Para poder empezar a crear tu memorial debes comprar el paquete
                </p>
              </div>
            </div>
            <div className="bg-blue-100 rounded-lg p-4">
              <p className="text-sm text-blue-800 mb-3">
                💝 Una vez realices el pago, podrás crear un hermoso memorial para honrar la memoria de tu ser querido.
              </p>
              <button
                onClick={() => navigate('/#pricing')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ve a precios y adquiere tu paquete!
              </button>
            </div>
          </div>
        )}
        
      {/* Toast flotante para enlace copiado */}
      {showShareSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg max-w-sm">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-green-900">¡Enlace Copiado!</h4>
              <p className="text-xs text-green-700">Listo para compartir</p>
            </div>
            <button
              onClick={() => setShowShareSuccess(false)}
              className="ml-2 text-green-600 hover:text-green-800"
            >
              ×
            </button>
          </div>
        </div>
      )}
        
        {/* Modal de éxito de pago */}
        <Modal
          isOpen={showPaymentSuccess}
          onClose={() => setShowPaymentSuccess(false)}
          size="md"
        >
          <div className="text-center">
            {/* Icono de éxito */}
            <div className="mx-auto flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            {/* Título principal */}
            <h3 className="text-xl font-semibold text-green-900 mb-4">
              ¡Comprobante Enviado Exitosamente!
            </h3>
            
            {/* Mensaje principal */}
            <p className="text-green-700 mb-6 text-base">
              Espera un máximo de 15 minutos, mientras se activa la creación del Memorial.
            </p>
            
            {/* Información adicional */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-800">
                📬 Te notificaremos por email cuando tu pago sea confirmado y puedas crear tu memorial.
              </p>
            </div>
            
            {/* Botón de confirmación */}
            <button
              onClick={() => setShowPaymentSuccess(false)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Entendido
            </button>
          </div>
        </Modal>
        
        <div className="grid grid-cols-1 gap-8">
          {/* Gestión de Recuerdos - Solo si tiene memorial */}
          {hasMemorial && memorials?.[0] && (
            <MemoriesManager profileId={memorials[0].id} />
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Mis Órdenes */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Mis Órdenes</h2>
            
            {(orders?.length || 0) === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No tienes órdenes aún</p>
                <button
                  onClick={() => navigate('/#pricing')}
                  className="btn btn-primary"
                >
                  Ver Paquetes
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders?.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{formatCurrency(order.total_amount)}</p>
                        <p className="text-sm text-gray-600">
                          {order.payment_intent_id && `Ref: ${order.payment_intent_id}`}
                        </p>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mis Memoriales */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Mis Memoriales</h2>
              {canCreateMemorial && (
                <button
                  onClick={() => navigate('/create-memorial')}
                  className="btn btn-primary btn-sm"
                >
                  + Crear Memorial
                </button>
              )}
            </div>
            
            {!hasCompletedOrder ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">🔒</div>
                <p className="text-gray-500 mb-2">Memorial no disponible</p>
                <p className="text-sm text-gray-400">
                  Necesitas una orden completada para crear tu memorial
                </p>
              </div>
            ) : hasMemorial ? (
              <div className="space-y-4">
                {memorials?.map((memorial) => (
                  <div key={memorial.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-lg truncate">{memorial.profile_name}</p>
                          <p className="text-sm text-gray-600">
                            {memorial.is_published ? '🌐 Publicado' : '📝 Borrador'}
                          </p>
                          <p className="text-xs text-gray-500">{formatDate(memorial.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => navigate(`/edit/${memorial.id}`)}
                          className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => window.open(`/memorial/${memorial.slug}`, '_blank')}
                          className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          👁️ Ver
                        </button>
                        <button
                          onClick={() => {
                            const url = `${window.location.origin}/memorial/${memorial.slug}`
                            navigator.clipboard.writeText(url)
                            setShowShareSuccess(true)
                            setTimeout(() => setShowShareSuccess(false), 3000)
                          }}
                          className="flex items-center gap-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                        >
                          📤 Compartir
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(memorial.id)}
                          className="px-3 py-2 text-red-600 hover:text-red-800 border border-red-200 rounded-lg hover:bg-red-50"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="text-center py-4 border-t">
                  <p className="text-sm text-gray-500">
                    Ya tienes un memorial creado. Solo puedes tener uno.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">📝</div>
                <p className="text-gray-500 mb-4">No tienes memoriales creados</p>
                <button
                  onClick={() => navigate('/create-memorial')}
                  className="btn btn-primary"
                >
                  Crear Mi Primer Memorial
                </button>
              </div>
            )}
          </div>
          </div>
        </div>
      </div>
      
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, memorialId: null })}
        onConfirm={confirmDelete}
        title="Eliminar Memorial"
        message="¿Estás seguro de que quieres eliminar este memorial? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  )
}

export default UserDashboard