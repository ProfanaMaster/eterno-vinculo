import { useState, useEffect } from 'react'
import { supabase } from '@/config/supabase'
import { useAuthStore } from '@/stores/authStore'

export const useAuth = () => {
  const [loading, setLoading] = useState(true)
  const { user, isAuthenticated, login, logout } = useAuthStore()

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        login({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.first_name || ''
        })
      }
      setLoading(false)
    })

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          login({
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.first_name || ''
          })
        } else {
          logout()
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [login, logout])

  const signUp = async (email: string, password: string, userData: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    
    if (error) throw error
    return data
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return {
    user,
    isAuthenticated,
    loading,
    signUp,
    signIn,
    signOut
  }
}