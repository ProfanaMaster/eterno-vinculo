import { useState, useEffect } from 'react'
import { supabase } from '@/config/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { getProxiedImageUrl } from '@/utils/imageUtils'
import ConfirmModal from '@/components/ui/ConfirmModal'

interface Memory {
  id: string
  memorial_profile_id: string
  photo_url: string
  author_name: string
  message: string
  song?: string
  things_list: string[]
  created_at: string
  is_authorized: boolean
  likes: number
}

interface MemoriesManagerProps {
  profileId: string
}

const MemoriesManager = ({ profileId }: MemoriesManagerProps) => {
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, memoryId: null as string | null, photoUrl: '' })
  const itemsPerPage = 5

  const loadMemories = async (page = 1) => {
    try {
      setLoading(true)
      const from = (page - 1) * itemsPerPage
      const to = from + itemsPerPage - 1



      const { data, error, count } = await supabase
        .from('memories')
        .select('*', { count: 'exact' })
        .eq('memorial_profile_id', profileId)
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) {
        console.error('❌ MemoriesManager SQL Error:', error)
        throw error
      }

      setMemories(data || [])
      setTotalPages(Math.ceil((count || 0) / itemsPerPage))
    } catch (error) {
      console.error('❌ MemoriesManager Error loading memories:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMemories(currentPage)
  }, [profileId, currentPage])

  // Suscripción en tiempo real para recuerdos
  useEffect(() => {
    if (!profileId) return

    const subscription = supabase
      .channel(`memories_manager_${profileId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'memories',
          filter: `memorial_profile_id=eq.${profileId}`
        },
        (payload) => {
          console.log('💭 Memory change detected in MemoriesManager:', payload.eventType, 'for profileId:', profileId)
          // Recargar recuerdos cuando hay cambios
          loadMemories(currentPage)
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [profileId, currentPage])

  const toggleVisibility = async (memoryId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('memories')
        .update({ is_authorized: !currentStatus })
        .eq('id', memoryId)

      if (error) throw error

      setMemories(prev => prev.map(memory =>
        memory.id === memoryId
          ? { ...memory, is_authorized: !currentStatus }
          : memory
      ))
    } catch (error) {
      console.error('Error updating visibility:', error)
    }
  }

  const handleDeleteClick = (memoryId: string, photoUrl: string) => {
    setConfirmModal({ isOpen: true, memoryId, photoUrl })
  }

  const confirmDelete = async () => {
    if (!confirmModal.memoryId) return

    try {
      // Usar endpoint del backend que incluye limpieza de R2
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3002/api'}/memories/${confirmModal.memoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al eliminar el recuerdo')
      }

      setMemories(prev => prev.filter(memory => memory.id !== confirmModal.memoryId))
    } catch (error) {
      console.error('Error deleting memory:', error)
      alert('Error al eliminar el recuerdo')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const truncateText = (text: string, maxLength: number = 100) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Recuerdos del Memorial</h2>
        <span className="text-sm text-gray-500">
          {memories.length} recuerdo{memories.length !== 1 ? 's' : ''}
        </span>
      </div>

      {memories.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">💭</div>
          <p className="text-gray-500">No hay recuerdos aún</p>
          <p className="text-sm text-gray-400 mt-2">
            Los visitantes pueden dejar recuerdos en tu memorial
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            <AnimatePresence>
              {memories.map((memory) => (
                <motion.div
                  key={memory.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4">
                    {/* Imagen */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={getProxiedImageUrl(memory.photo_url)}
                        alt="Recuerdo"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f3f4f6"/%3E%3Ctext x="50" y="50" text-anchor="middle" fill="%236b7280" font-size="12"%3E📷%3C/text%3E%3C/svg%3E'
                        }}
                      />
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium text-gray-900">{memory.author_name}</h3>
                          <p className="text-sm text-gray-500">{formatDate(memory.created_at)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            memory.is_authorized 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {memory.is_authorized ? '👁️ Visible' : '🔒 Oculto'}
                          </span>
                          <span className="text-sm text-gray-500">
                            ❤️ {memory.likes}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-700 text-sm mb-3">
                        {truncateText(memory.message)}
                      </p>

                      {/* Acciones */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleVisibility(memory.id, memory.is_authorized)}
                          className={`px-3 py-1 text-xs rounded-full transition-colors ${
                            memory.is_authorized
                              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                        >
                          {memory.is_authorized ? '🙈 Ocultar' : '👁️ Mostrar'}
                        </button>
                        <button
                          onClick={() => handleDeleteClick(memory.id, memory.photo_url)}
                          className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded-full hover:bg-red-200 transition-colors"
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6 pt-4 border-t">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Anterior
              </button>
              
              <span className="text-sm text-gray-600">
                Página {currentPage} de {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, memoryId: null, photoUrl: '' })}
        onConfirm={confirmDelete}
        title="Eliminar Recuerdo"
        message="¿Estás seguro de que quieres eliminar este recuerdo? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  )
}

export default MemoriesManager