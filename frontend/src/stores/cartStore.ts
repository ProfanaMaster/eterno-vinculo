import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface Package {
  id: string
  name: string
  type: 'basic' | 'premium' | 'family'
  price: number
  features: string[]
  popular?: boolean
}

interface CartItem {
  package: Package
  quantity: number
}

interface CartState {
  // Estado
  items: CartItem[]
  isOpen: boolean
  loading: boolean
  error: string | null
  
  // Acciones
  addItem: (pkg: Package) => void
  removeItem: (packageId: string) => void
  clearCart: () => void
  toggleCart: () => void
  
  // Checkout
  processPayment: (paymentMethod: string) => Promise<void>
  
  // Getters
  getTotal: () => number
  getItemCount: () => number
}

/**
 * Store del carrito de compras
 * Gestiona productos, cantidades y proceso de pago
 */
export const useCartStore = create<CartState>()(
  devtools(
    (set, get) => ({
      // Estado inicial
      items: [],
      isOpen: false,
      loading: false,
      error: null,

      // Agregar producto al carrito
      addItem: (pkg: Package) => {
        set(() => {
          // Solo permitir un paquete a la vez
          return {
            items: [{ package: pkg, quantity: 1 }],
            isOpen: true
          }
        })
      },

      // Remover producto del carrito
      removeItem: (packageId: string) => {
        set((state) => ({
          items: state.items.filter(item => item.package.id !== packageId)
        }))
      },

      // Limpiar carrito
      clearCart: () => {
        set({ items: [], isOpen: false })
      },

      // Abrir/cerrar carrito
      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }))
      },

      // Procesar pago
      processPayment: async (paymentMethod: string) => {
        const { items } = get()
        if (items.length === 0) return

        set({ loading: true, error: null })

        try {
          const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              package_id: items[0].package.id,
              payment_method: paymentMethod,
              amount: get().getTotal()
            })
          })

          if (!response.ok) {
            throw new Error('Error al procesar el pago')
          }

          const order = await response.json()
          
          // Limpiar carrito después del pago exitoso
          set({ 
            items: [], 
            isOpen: false, 
            loading: false 
          })

          // Redirigir a página de éxito
          window.location.href = `/payment-success?order=${order.data.id}`

        } catch (error: any) {
          set({ 
            error: error.message || 'Error al procesar el pago',
            loading: false 
          })
        }
      },

      // Calcular total
      getTotal: () => {
        const { items } = get()
        return items.reduce((total, item) => 
          total + (item.package.price * item.quantity), 0
        )
      },

      // Contar items
      getItemCount: () => {
        const { items } = get()
        return items.reduce((count, item) => count + item.quantity, 0)
      }
    }),
    { name: 'cart-store' }
  )
)