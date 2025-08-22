import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useProfiles } from '@/hooks/useProfiles'
import { api } from '@/services/api'
import { supabase } from '@/config/supabase'
import { useNavigate, useSearchParams } from 'react-router-dom'
import ConfirmModal from '@/components/ui/ConfirmModal'
import MemoriesManager from '@/components/MemoriesManager'

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
        () => {
          console.log('Orders updated, refetching...')
          setDataFetched(false)
          fetchOrders()
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'memorial_profiles' },
        () => {
          // Recargar perfiles desde el hook
          window.location.reload()
        }
      )
      .subscribe()

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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mi Dashboard</h1>
              <p className="text-gray-600">Bienvenido, {user?.name || user?.email}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Inicio
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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
        
        {/* Mensaje de éxito de pago */}
        {showPaymentSuccess && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-900">¡Comprobante Enviado Exitosamente!</h3>
                <p className="text-green-700">
                  Espera un máximo de 15 minutos, mientras se activa la creación del Memorial.
                </p>
              </div>
              <button
                onClick={() => setShowPaymentSuccess(false)}
                className="ml-auto text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </div>
            <div className="bg-green-100 rounded-lg p-4">
              <p className="text-sm text-green-800">
                📬 Te notificaremos por email cuando tu pago sea confirmado y puedas crear tu memorial.
              </p>
            </div>
          </div>
        )}
        
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
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-medium text-lg">{memorial.profile_name}</p>
                        <p className="text-sm text-gray-600 mb-2">
                          {memorial.is_published ? '🌐 Publicado' : '📝 Borrador'}
                        </p>
                        <p className="text-xs text-gray-500">{formatDate(memorial.created_at)}</p>
                      </div>
                      <div className="flex gap-2">
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