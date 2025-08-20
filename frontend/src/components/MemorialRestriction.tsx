import { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'

interface MemorialRestrictionProps {
  userId: string
  onCanCreate: (canCreate: boolean) => void
}

export const MemorialRestriction = ({ userId, onCanCreate }: MemorialRestrictionProps) => {
  const [canCreate, setCanCreate] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    checkMemorialRestriction()
  }, [userId])

  const checkMemorialRestriction = async () => {
    try {
      setLoading(true)
      
      // Verificar memorial activo
      const { data: activeMemorials } = await supabase
        .from('memorial_profiles')
        .select('id, profile_name')
        .eq('user_id', userId)
        .is('deleted_at', null)
      
      if (activeMemorials && activeMemorials.length > 0) {
        setCanCreate(false)
        setMessage('Ya tienes un memorial activo. Solo puedes tener uno.')
        onCanCreate(false)
        return
      }
      
      // Verificar memorial eliminado
      const { data: deletedMemorials } = await supabase
        .from('memorial_profiles')
        .select('id')
        .eq('user_id', userId)
        .not('deleted_at', 'is', null)
      
      if (deletedMemorials && deletedMemorials.length > 0) {
        setCanCreate(false)
        setMessage('Ya eliminaste un memorial anteriormente. No puedes crear más.')
        onCanCreate(false)
        return
      }
      
      setCanCreate(true)
      setMessage('Puedes crear tu memorial.')
      onCanCreate(true)
      
    } catch (error) {
      console.error('Error verificando restricción:', error)
      setCanCreate(false)
      setMessage('Error verificando permisos.')
      onCanCreate(false)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-100 p-4 rounded-lg">
        <div className="animate-pulse">Verificando permisos...</div>
      </div>
    )
  }

  return (
    <div className={`p-4 rounded-lg ${canCreate ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
      <div className={`flex items-center gap-2 ${canCreate ? 'text-green-700' : 'text-red-700'}`}>
        <span className="text-lg">{canCreate ? '✅' : '❌'}</span>
        <span className="font-medium">{message}</span>
      </div>
      
      {!canCreate && (
        <div className="mt-2 text-sm text-gray-600">
          <p>Política de memoriales:</p>
          <ul className="list-disc list-inside mt-1">
            <li>Solo puedes tener un memorial activo</li>
            <li>Si eliminas un memorial, no podrás crear otro</li>
            <li>Esta restricción es permanente</li>
          </ul>
        </div>
      )}
    </div>
  )
}