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
  resetPassword: (email: string) => Promise<void>
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
        // Listener para cambios de autenticación
        _setupAuthListener: () => {
          supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
              // Recargar datos del usuario cuando se confirma el email
              const { checkAuth } = get()
              await checkAuth()
            } else if (event === 'SIGNED_OUT') {
              set({ 
                user: null, 
                isAuthenticated: false,
                error: null 
              })
            }
          })
        },
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
              // Si es "Invalid login credentials", verificar si el usuario existe pero no está confirmado
              if (error.message.includes('Invalid login credentials')) {
                // Verificar si el usuario existe en la tabla users
                const { data: existingUser } = await supabase
                  .from('users')
                  .select('email, email_verified')
                  .eq('email', email)
                  .single()
                
                if (existingUser && !existingUser.email_verified) {
                  throw new Error('Debes verificar tu email antes de iniciar sesión. Revisa tu bandeja de entrada y haz clic en el enlace de confirmación.')
                } else if (existingUser) {
                  throw new Error('Contraseña incorrecta')
                } else {
                  throw new Error('No existe una cuenta con este email')
                }
              } else if (error.message.includes('Email not confirmed')) {
                throw new Error('Debes verificar tu email antes de iniciar sesión. Revisa tu bandeja de entrada.')
              } else if (error.message.includes('Too many requests')) {
                throw new Error('Demasiados intentos. Intenta nuevamente en unos minutos')
              } else {
                throw new Error(`Error: ${error.message}`)
              }
            }

            // Obtener datos adicionales del usuario
            let { data: userData, error: userError } = await supabase
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
              // Si el usuario no existe en la tabla users, crearlo
              if (userError.code === 'PGRST116') {
                const { error: insertError } = await supabase
                  .from('users')
                  .insert({
                    id: data.user.id,
                    email: data.user.email,
                    first_name: data.user.user_metadata?.name?.split(' ')[0] || '',
                    last_name: data.user.user_metadata?.name?.split(' ').slice(1).join(' ') || ''
                  })
                
                if (insertError) {
                  throw new Error('Error al crear el perfil de usuario')
                }
                
                // Intentar obtener el usuario nuevamente
                const { data: newUserData, error: newUserError } = await supabase
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
                
                if (newUserError) {
                  throw new Error('Error al obtener datos del usuario')
                }
                
                userData = newUserData
              } else {
                throw new Error('Error al obtener datos del usuario')
              }
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
                data: { name }
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

        // Restablecer contraseña
        resetPassword: async (email: string) => {
          set({ loading: true, error: null })
          
          try {
            console.log('🔍 Intentando restablecer contraseña para:', email)
            
            // Enviar el email de restablecimiento directamente
            // Por seguridad, no verificamos si el email existe
            const redirectUrl = `${window.location.origin}/reset-password`
            console.log('🔗 URL de redirección:', redirectUrl)
            
            const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
              redirectTo: redirectUrl
            })

            console.log('📧 Respuesta de Supabase:', { data, error })

            if (error) {
              console.error('❌ Error de Supabase Auth:', error)
              
              if (error.message.includes('Invalid email')) {
                throw new Error('Email inválido')
              } else if (error.message.includes('Too many requests')) {
                throw new Error('Demasiados intentos. Intenta nuevamente en unos minutos')
              } else if (error.message.includes('Email rate limit exceeded')) {
                throw new Error('Demasiados emails enviados. Intenta nuevamente en unos minutos')
              } else if (error.message.includes('Email not confirmed')) {
                throw new Error('Debes confirmar tu email antes de restablecer la contraseña')
              } else if (error.message.includes('For security purposes')) {
                throw new Error('Por seguridad, no se puede enviar el email. Contacta al administrador.')
              } else {
                throw new Error(`Error: ${error.message}`)
              }
            }

            console.log('✅ Email de restablecimiento enviado exitosamente')
            console.log('📧 Datos de respuesta:', data)
            set({ loading: false, error: null })
            
          } catch (error: any) {
            console.error('❌ Error en resetPassword:', error)
            set({ 
              error: error.message || 'Error al enviar el enlace de restablecimiento',
              loading: false 
            })
            throw error
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
              } else if (userError?.code === 'PGRST116') {
                // Usuario no existe en tabla users, crearlo
                const { error: insertError } = await supabase
                  .from('users')
                  .insert({
                    id: session.user.id,
                    email: session.user.email,
                    first_name: session.user.user_metadata?.name?.split(' ')[0] || '',
                    last_name: session.user.user_metadata?.name?.split(' ').slice(1).join(' ') || ''
                  })
                
                if (!insertError) {
                  const user: User = {
                    id: session.user.id,
                    email: session.user.email!,
                    name: session.user.user_metadata?.name || session.user.email!.split('@')[0]
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