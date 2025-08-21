import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/config/supabase'

const SessionManager = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, logout, checkAuth } = useAuthStore()

  useEffect(() => {
    // Verificar sesión al cargar
    checkAuth()

    // Listener para cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        // Sesión expirada o cerrada
        await logout()
        
        // Si está en una ruta protegida, redirigir al home
        const protectedRoutes = ['/dashboard', '/create', '/create-memorial', '/edit', '/admin']
        const publicRoutes = ['/memorial/']
        const isProtectedRoute = protectedRoutes.some(route => location.pathname.startsWith(route))
        const isPublicRoute = publicRoutes.some(route => location.pathname.startsWith(route))
        
        if (isProtectedRoute && !isPublicRoute) {
          navigate('/', { replace: true })
        }
      } else if (event === 'TOKEN_REFRESHED') {
        // Token renovado, verificar datos del usuario
        await checkAuth()
      }
    })

    // Verificar sesión cada 5 minutos
    const interval = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session && isAuthenticated) {
        // Sesión expirada
        await logout()
        const protectedRoutes = ['/dashboard', '/create', '/create-memorial', '/edit', '/admin']
        const publicRoutes = ['/memorial/']
        const isProtectedRoute = protectedRoutes.some(route => location.pathname.startsWith(route))
        const isPublicRoute = publicRoutes.some(route => location.pathname.startsWith(route))
        
        if (isProtectedRoute && !isPublicRoute) {
          navigate('/', { replace: true })
        }
      }
    }, 5 * 60 * 1000) // 5 minutos

    return () => {
      subscription.unsubscribe()
      clearInterval(interval)
    }
  }, [])

  // Manejar URLs con /login
  useEffect(() => {
    if (location.pathname === '/login') {
      navigate('/', { replace: true })
    }
  }, [location.pathname])

  return null
}

export default SessionManager