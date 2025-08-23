import { useState } from 'react'
import { motion } from 'framer-motion'
import { useOrders } from '@/hooks/useOrders'
import { useAuthStore } from '@/stores/authStore'
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHeaderCell } from '@/components/ui/Table'
import Pagination from '@/components/ui/Pagination'
import { Input } from '@/components/ui/Input'

function OrdersManagement() {
  const { user } = useAuthStore()
  const { orders, loading, error, pagination, fetchOrders, updateOrderStatus } = useOrders()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

  const handleSearch = (value: string) => {
    setSearch(value)
    
    if (searchTimeout) clearTimeout(searchTimeout)
    
    const timeout = setTimeout(() => {
      fetchOrders(1, value, statusFilter)
    }, 500)
    
    setSearchTimeout(timeout)
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const success = await updateOrderStatus(orderId, newStatus, user?.id)
      if (success) {
        // Recargar órdenes para mostrar cambios
        fetchOrders(pagination?.page || 1, search, statusFilter)
      }
    } catch (error) {
      console.error('Error updating order:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pendiente' },
      completed: { color: 'bg-green-100 text-green-800', text: 'Completado' },
      cancelled: { color: 'bg-red-100 text-red-800', text: 'Cancelado' },
      failed: { color: 'bg-red-100 text-red-800', text: 'Fallido' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.text}
      </span>
    )
  }

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(numAmount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading && (!orders || orders.length === 0)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Órdenes</h2>
        <div className="text-sm text-gray-500">
          Total: {pagination?.total || 0} órdenes
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Buscar por nombre, email o referencia de pago..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="sm:w-48">
            <select 
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                fetchOrders(1, search, e.target.value)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="completed">Completados</option>
              <option value="cancelled">Cancelados</option>
              <option value="failed">Fallidos</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Tabla de órdenes */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Usuario</TableHeaderCell>
              <TableHeaderCell>Monto</TableHeaderCell>
              <TableHeaderCell>Referencia</TableHeaderCell>
              <TableHeaderCell>Método de Pago</TableHeaderCell>
              <TableHeaderCell>Estado</TableHeaderCell>
              <TableHeaderCell>Fecha</TableHeaderCell>
              <TableHeaderCell>Acciones</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(orders || []).map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <div>
                    <div className="font-medium text-gray-900">
                      {order.users?.first_name} {order.users?.last_name}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {order.users?.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-medium text-gray-900">
                  {formatCurrency(order.total_amount || 0)}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {order.payment_intent_id ? (
                      <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                        {order.payment_intent_id}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">Sin referencia</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {order.payment_method || (
                    <span className="text-gray-400 text-xs">No especificado</span>
                  )}
                </TableCell>
                <TableCell>
                  {getStatusBadge(order.status)}
                </TableCell>
                <TableCell className="text-gray-500 text-xs">
                  {formatDate(order.created_at)}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {order.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(order.id, 'completed')}
                          className="group relative px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-sm hover:from-green-600 hover:to-green-700 hover:shadow-md transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
                        >
                          <span className="flex items-center gap-1">
                            ✓ Aceptar
                          </span>
                        </button>
                        <button
                          onClick={() => handleStatusChange(order.id, 'cancelled')}
                          className="group relative px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow-sm hover:from-red-600 hover:to-red-700 hover:shadow-md transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                        >
                          <span className="flex items-center gap-1">
                            ✗ Rechazar
                          </span>
                        </button>
                      </>
                    )}
                    {order.status === 'completed' && (
                      <span className="px-2 py-1 text-xs text-green-700 bg-green-100 rounded-full">
                        ✓ Procesada
                      </span>
                    )}
                    {order.status === 'cancelled' && (
                      <span className="px-2 py-1 text-xs text-red-700 bg-red-100 rounded-full">
                        ✗ Rechazada
                      </span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {(!orders || orders.length === 0) && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">📋</div>
            <p className="text-gray-500">No se encontraron órdenes</p>
            {search && (
              <p className="text-gray-400 text-sm mt-1">
                Intenta con otros términos de búsqueda
              </p>
            )}
          </div>
        )}
      </div>

      {/* Paginación */}
      {(pagination?.pages || 0) > 1 && (
        <Pagination
          currentPage={pagination?.page || 1}
          totalPages={pagination?.pages || 1}
          totalItems={pagination?.total || 0}
          itemsPerPage={pagination?.limit || 10}
          onPageChange={(page) => fetchOrders(page, search, statusFilter)}
        />
      )}
    </motion.div>
  )
}

export default OrdersManagement