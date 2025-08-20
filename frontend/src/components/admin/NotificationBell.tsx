import { useState, useEffect } from 'react'
import { api } from '@/services/api'

const NotificationBell = () => {
  const [pendingOrders, setPendingOrders] = useState(0)

  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        const response = await api.get('/admin/orders/pending-count')
        setPendingOrders(response.data.count || 0)
      } catch (error) {
        console.error('Error fetching pending orders:', error)
      }
    }

    fetchPendingOrders()
    
    // Actualizar cada 30 segundos
    const interval = setInterval(fetchPendingOrders, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative">
      <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 640 640">
          <path d="M320 64C302.3 64 288 78.3 288 96L288 99.2C215 114 160 178.6 160 256L160 277.7C160 325.8 143.6 372.5 113.6 410.1L103.8 422.3C98.7 428.6 96 436.4 96 444.5C96 464.1 111.9 480 131.5 480L508.4 480C528 480 543.9 464.1 543.9 444.5C543.9 436.4 541.2 428.6 536.1 422.3L526.3 410.1C496.4 372.5 480 325.8 480 277.7L480 256C480 178.6 425 114 352 99.2L352 96C352 78.3 337.7 64 320 64zM258 528C265.1 555.6 290.2 576 320 576C349.8 576 374.9 555.6 382 528L258 528z"/>
        </svg>
      </button>
      
      {pendingOrders > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
          {pendingOrders > 99 ? '99+' : pendingOrders}
        </span>
      )}
    </div>
  )
}

export default NotificationBell