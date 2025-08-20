import { useState, useEffect, useCallback } from 'react'
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/authStore'

interface Memorial {
  id: string
  profile_name: string
  slug: string
  is_published: boolean
  created_at: string
}

interface UseProfilesReturn {
  memorials: Memorial[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  deleteMemorial: (id: string) => Promise<void>
}

// Cache simple en memoria
let profilesCache: { data: Memorial[]; timestamp: number } | null = null
const CACHE_TTL = 30000 // 30 segundos

export function useProfiles(): UseProfilesReturn {
  const { user } = useAuthStore()
  const [memorials, setMemorials] = useState<Memorial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfiles = useCallback(async () => {
    if (!user?.id) {
      return
    }


    // Verificar cache
    const now = Date.now()
    if (profilesCache && (now - profilesCache.timestamp) < CACHE_TTL) {
      setMemorials(profilesCache.data)
      setLoading(false)
      return
    }

    try {
      setError(null)
      const response = await api.get('/profiles/my-profiles')
      const data = response.data.data || []
      
      setMemorials(data)
      
      // Actualizar cache
      profilesCache = {
        data,
        timestamp: now
      }
    } catch (err: any) {
      console.error('useProfiles: Error fetching profiles:', err)
      setError(err.response?.data?.error || 'Error al cargar perfiles')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  const deleteMemorial = useCallback(async (id: string) => {
    try {
      const response = await api.delete(`/profiles/${id}`)
      
      if (response.data.success) {
        setMemorials(prev => prev.filter(m => m.id !== id))
        
        // Limpiar cache
        profilesCache = null
      }
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Error al eliminar memorial')
    }
  }, [])

  const refetch = useCallback(async () => {
    // Limpiar cache y recargar
    profilesCache = null
    setLoading(true)
    await fetchProfiles()
  }, [fetchProfiles])

  useEffect(() => {
    if (user?.id) {
      fetchProfiles()
    } else {
      setMemorials([])
      setLoading(false)
    }
  }, [fetchProfiles])

  return {
    memorials,
    loading,
    error,
    refetch,
    deleteMemorial
  }
}