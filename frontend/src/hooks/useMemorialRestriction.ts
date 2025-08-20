import { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'

export const useMemorialRestriction = (userId: string) => {
  const [canCreate, setCanCreate] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (userId) {
      checkRestriction()
    }
  }, [userId])

  const checkRestriction = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Verificar memorial activo
      const { data: activeMemorials, error: activeError } = await supabase
        .from('memorial_profiles')
        .select('id')
        .eq('user_id', userId)
        .is('deleted_at', null)
      
      if (activeError) throw activeError
      
      if (activeMemorials && activeMemorials.length > 0) {
        setCanCreate(false)
        return
      }
      
      // Verificar memorial eliminado
      const { data: deletedMemorials, error: deletedError } = await supabase
        .from('memorial_profiles')
        .select('id')
        .eq('user_id', userId)
        .not('deleted_at', 'is', null)
      
      if (deletedError) throw deletedError
      
      if (deletedMemorials && deletedMemorials.length > 0) {
        setCanCreate(false)
        return
      }
      
      setCanCreate(true)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      setCanCreate(false)
    } finally {
      setLoading(false)
    }
  }

  return {
    canCreate,
    loading,
    error,
    refetch: checkRestriction
  }
}