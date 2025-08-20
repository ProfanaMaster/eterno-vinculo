import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { supabase } from '@/config/supabase'

interface User {
  id: string
  email: string
  name?: string
  subscription?: {
    plan: 'basic' | 'premium' | 'family' | 'complete'
    status: 'active' | 'inactive' | 'expired'
    expires_at?: string
  }
}

interface AuthState {
  // Estado
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
  
  // Acciones
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  clearError: () => void
  
  // Helpers
  canCreateMemorials: () => boolean
  getMemorialLimit: () => number
}

/**
 * Store de autenticación con Supabase
 * Gestiona login, registro, sesión y permisos de usuario
 */
export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // Estado inicial
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,

        // Login de usuario
        login: async (email: string, password: string) => {
          set({ loading: true, error: null })
          
          try {
            const { data, error } = await supabase.auth.signInWithPassword({
              email,
              password
            })

            if (error) {
              // Manejar diferentes tipos de errores
              let errorMessage = 'Error al iniciar sesión'
              
              if (error.message.includes('Invalid login credentials')) {
                errorMessage = 'Email o contraseña incorrectos'
              } else if (error.message.includes('Email not confirmed')) {
                errorMessage = 'Debes verificar tu email antes de iniciar sesión'
              } else if (error.message.includes('Too many requests')) {
                errorMessage = 'Demasiados intentos. Intenta nuevamente en unos minutos'
              }
              
              throw new Error(errorMessage)
            }

            // Obtener datos adicionales del usuario
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select(`
                *,
                orders (
                  id,
                  package_id,
                  status,
                  paid_at
                )
              `)
              .eq('id', data.user.id)
              .single()

            if (userError) {
              throw new Error('Error al obtener datos del usuario')
            }

            // Determinar suscripción activa
            const activeOrder = userData.orders?.find((order: any) => 
              order.paid_at !== null
            )

            const user: User = {
              id: data.user.id,
              email: data.user.email!,
              name: `${userData.first_name} ${userData.last_name}`.trim(),
              subscription: activeOrder ? {
                plan: 'complete',
                status: 'active'
              } : undefined
            }

            set({ 
              user, 
              isAuthenticated: true, 
              loading: false,
              error: null
            })

          } catch (error: any) {
            set({ 
              error: error.message || 'Error al iniciar sesión',
              loading: false,
              isAuthenticated: false,
              user: null
            })
            throw error // Re-lanzar para que AuthModal pueda manejarlo
          }
        },

        // Registro de usuario
        register: async (email: string, password: string, name: string) => {
          set({ loading: true, error: null })
          
          try {
            const { data, error } = await supabase.auth.signUp({
              email,
              password,
              options: {
                data: { name },
                emailRedirectTo: `https://eterno-vinculo.vercel.app/verify-email`
              }
            })

            if (error) {
              // Manejar diferentes tipos de errores de registro
              let errorMessage = 'Error al registrarse'
              
              if (error.message.includes('User already registered')) {
                errorMessage = 'Este email ya está registrado'
              } else if (error.message.includes('Password should be at least')) {
                errorMessage = 'La contraseña debe tener al menos 6 caracteres'
              } else if (error.message.includes('Invalid email')) {
                errorMessage = 'Email inválido'
              }
              
              throw new Error(errorMessage)
            }

            // El perfil de usuario se creará automáticamente por el trigger de Supabase
            // o por el backend cuando el usuario confirme su email

            set({ loading: false, error: null })
            
            // No mostrar alert, el modal manejará el mensaje de éxito

          } catch (error: any) {
            set({ 
              error: error.message || 'Error al registrarse',
              loading: false 
            })
            throw error // Re-lanzar para que AuthModal pueda manejarlo
          }
        },

        // Cerrar sesión
        logout: async () => {
          try {
            await supabase.auth.signOut()
            set({ 
              user: null, 
              isAuthenticated: false,
              error: null 
            })
          } catch (error: any) {
            set({ error: error.message })
          }
        },

        // Verificar autenticación al cargar la app
        checkAuth: async () => {
          set({ loading: true })
          
          try {
            const { data: { session } } = await supabase.auth.getSession()
            
            if (session?.user) {
              // Obtener datos del usuario sin hacer login
              const { data: userData, error: userError } = await supabase
                .from('users')
                .select(`
                  *,
                  orders (
                    id,
                    package_id,
                    status,
                    paid_at
                  )
                `)
                .eq('id', session.user.id)
                .single()

              if (!userError && userData) {
                const activeOrder = userData.orders?.find((order: any) => 
                  order.paid_at !== null
                )

                const user: User = {
                  id: session.user.id,
                  email: session.user.email!,
                  name: `${userData.first_name} ${userData.last_name}`.trim(),
                  subscription: activeOrder ? {
                    plan: 'complete',
                    status: 'active'
                  } : undefined
                }

                set({ 
                  user, 
                  isAuthenticated: true, 
                  loading: false,
                  error: null
                })
              } else {
                set({ loading: false })
              }
            } else {
              set({ 
                user: null,
                isAuthenticated: false,
                loading: false 
              })
            }
          } catch (error) {
            set({ 
              user: null,
              isAuthenticated: false,
              loading: false 
            })
          }
        },

        // Limpiar errores
        clearError: () => set({ error: null }),

        // Verificar si puede crear memoriales
        canCreateMemorials: () => {
          const { user } = get()
          return user?.subscription?.status === 'active' || false
        },

        // Obtener límite de memoriales según plan
        getMemorialLimit: () => {
          const { user } = get()
          if (!user?.subscription) return 1 // Plan básico gratuito
          
          switch (user.subscription.plan) {
            case 'premium': return -1 // Ilimitado
            case 'family': return 10
            default: return 1
          }
        }
      }),
      {
        name: 'auth-store',
        partialize: (state) => ({ 
          user: state.user,
          isAuthenticated: state.isAuthenticated 
        })
      }
    ),
    { name: 'auth-store' }
  )
)