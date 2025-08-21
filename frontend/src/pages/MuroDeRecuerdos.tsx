import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/config/supabase'
import MemoryCard from '@/components/MemoryCard'
import AddMemoryModal from '@/components/AddMemoryModal'

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

interface MuroDeRecuerdosProps {
  profileId: string
  profileName: string
  onOpenModal?: () => void
}

const MuroDeRecuerdos = ({ profileId, profileName, onOpenModal }: MuroDeRecuerdosProps) => {
  const [memories, setMemories] = useState<Memory[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Cargar recuerdos autorizados
  const loadMemories = async () => {
    try {
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .eq('memorial_profile_id', profileId)
        .eq('is_authorized', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setMemories(data || [])
    } catch (error) {
      console.error('Error loading memories:', error)
    } finally {
      setLoading(false)
    }
  }

  // Suscripción en tiempo real
  useEffect(() => {
    loadMemories()

    const subscription = supabase
      .channel('memories')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'memories' },
        (payload) => {
          console.log('Memory change:', payload)
          loadMemories()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Incrementar likes
  const handleLike = async (memoryId: string) => {
    try {
      // Actualizar optimísticamente
      setMemories(prev => prev.map(memory => 
        memory.id === memoryId 
          ? { ...memory, likes: memory.likes + 1 }
          : memory
      ))
      
      const { error } = await supabase.rpc('increment_likes', {
        memory_id: memoryId
      })
      
      if (error) {
        // Revertir si hay error
        setMemories(prev => prev.map(memory => 
          memory.id === memoryId 
            ? { ...memory, likes: memory.likes - 1 }
            : memory
        ))
        throw error
      }
    } catch (error) {
      console.error('Error updating likes:', error)
    }
  }

  return (
    <div className="min-h-screen relative py-8 bg-gradient-to-br from-gray-50 via-purple-50/30 to-gray-100">
      {/* Textura sutil fija */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform rotate-45"></div>
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-purple-100/20 to-transparent transform -rotate-45"></div>
      </div>
      
      {/* Elementos decorativos fijos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-purple-200/30 text-2xl">🍃</div>
        <div className="absolute top-40 right-16 text-purple-200/30 text-xl">🌿</div>
        <div className="absolute bottom-32 left-20 text-purple-200/30 text-lg">🌸</div>
        <div className="absolute bottom-20 right-12 text-purple-200/30 text-xl">🌺</div>
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
            Muro de los Recuerdos
          </h1>
          <p className="text-xl sm:text-2xl font-semibold text-purple-700 mb-2">
            {profileName}
          </p>
          <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base px-2">
            Comparte tus recuerdos y mantén viva la memoria
          </p>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base"
          >
            + Dejar un Recuerdo
          </button>
        </div>

        {/* Grid de recuerdos */}
        {loading ? (
          <div className="flex justify-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : memories.length === 0 ? (
          <div className="text-center py-8 sm:py-12 px-4">
            <p className="text-gray-500 text-sm sm:text-base">Aún no hay recuerdos compartidos</p>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {memories.map((memory) => (
              <MemoryCard
                key={memory.id}
                memory={memory}
                onLike={() => handleLike(memory.id)}
              />
            ))}
          </motion.div>
        )}

      {/* Modal para agregar recuerdo */}
      <AddMemoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        profileId={profileId}
        profileName={profileName}
        onSuccess={() => {
          setIsModalOpen(false)
          loadMemories()
        }}
      />
      </div>
      

    </div>
  )
}

export default MuroDeRecuerdos