import { useState, useEffect, useCallback } from 'react'
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/authStore'

interface FamilyProfile {
  id: string
  family_name: string
  slug: string
  is_published: boolean
  created_at: string
}

interface UseFamilyProfilesReturn {
  familyProfiles: FamilyProfile[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  deleteFamilyProfile: (id: string) => Promise<void>
}

// Cache simple en memoria
let familyProfilesCache: { data: FamilyProfile[]; timestamp: number } | null = null
const CACHE_TTL = 30000 // 30 segundos

export function useFamilyProfiles(): UseFamilyProfilesReturn {
  const { user } = useAuthStore()
  const [familyProfiles, setFamilyProfiles] = useState<FamilyProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFamilyProfiles = useCallback(async () => {
    if (!user?.id) {
      return
    }

    // Verificar cache
    const now = Date.now()
    if (familyProfilesCache && (now - familyProfilesCache.timestamp) < CACHE_TTL) {
      setFamilyProfiles(familyProfilesCache.data)
      setLoading(false)
      return
    }

    try {
      setError(null)
      const response = await api.get('/family-profiles/my-profiles')
      const data = response.data.data || []
      
      setFamilyProfiles(data)
      
      // Actualizar cache
      familyProfilesCache = {
        data,
        timestamp: now
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar perfiles familiares')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  const deleteFamilyProfile = useCallback(async (id: string) => {
    try {
      const response = await api.delete(`/family-profiles/${id}`)
      
      if (response.data.success) {
        setFamilyProfiles(prev => prev.filter(f => f.id !== id))
        
        // Limpiar cache
        familyProfilesCache = null
      }
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Error al eliminar perfil familiar')
    }
  }, [])

  const refetch = useCallback(async () => {
    // Limpiar cache y recargar
    familyProfilesCache = null
    setLoading(true)
    await fetchFamilyProfiles()
  }, [fetchFamilyProfiles])

  useEffect(() => {
    if (user?.id) {
      fetchFamilyProfiles()
    } else {
      setFamilyProfiles([])
      setLoading(false)
    }
  }, [fetchFamilyProfiles])

  return {
    familyProfiles,
    loading,
    error,
    refetch,
    deleteFamilyProfile
  }
}
