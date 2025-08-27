import axios from 'axios'
import { supabase } from '@/config/supabase'

const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3002/api'

// Cache para el token
let cachedToken: string | null = null
let tokenExpiry: number = 0

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Función para obtener token con cache
const getAuthToken = async () => {
  const now = Date.now()
  
  // Si tenemos token cacheado y no ha expirado, usarlo
  if (cachedToken && now < tokenExpiry) {
    return cachedToken
  }
  
  // Obtener nuevo token
  const { data: { session } } = await supabase.auth.getSession()
  
  if (session?.access_token) {
    cachedToken = session.access_token
    // Cache por 50 minutos (los tokens de Supabase duran 1 hora)
    tokenExpiry = now + (50 * 60 * 1000)
    return cachedToken
  }
  
  // Limpiar cache si no hay sesión
  cachedToken = null
  tokenExpiry = 0
  return null
}

// Interceptor para agregar token de Supabase
api.interceptors.request.use(async (config) => {
  const token = await getAuthToken()
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  return config
})

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado, limpiar cache
      cachedToken = null
      tokenExpiry = 0
      
      // Solo redirigir a home si no estamos en una página pública
      const publicPaths = ['/muro-de-recuerdos/', '/memorial/', '/']
      const currentPath = window.location.pathname
      const isPublicPath = publicPaths.some(path => currentPath.includes(path) || currentPath === '/')
      
      if (!isPublicPath) {
        window.location.href = '/'
      }
    }
    return Promise.reject(error)
  }
)

export default api