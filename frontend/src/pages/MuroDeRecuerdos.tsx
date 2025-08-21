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
    <div className="min-h-screen relative py-8" style={{
      background: `
        radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.8) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(120, 119, 198, 0.2) 0%, transparent 50%),
        linear-gradient(135deg, #f8fafc 0%, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%, #f8fafc 100%)
      `,
      backgroundSize: '400% 400%, 300% 300%, 200% 200%, 100% 100%',
      animation: 'marbleFlow 20s ease-in-out infinite'
    }}>
      {/* Overlay de textura mármol */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 2px,
              rgba(255,255,255,0.1) 2px,
              rgba(255,255,255,0.1) 4px
            ),
            repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 1px,
              rgba(120,119,198,0.05) 1px,
              rgba(120,119,198,0.05) 3px
            )
          `
        }}
      />
      
      {/* Partículas flotantes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-8 overflow-hidden">
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
      
      <style>{`
        @keyframes marbleFlow {
          0%, 100% { background-position: 0% 50%, 0% 50%, 0% 50%, 0% 50%; }
          25% { background-position: 100% 50%, 25% 75%, 50% 25%, 0% 50%; }
          50% { background-position: 50% 100%, 75% 25%, 100% 75%, 0% 50%; }
          75% { background-position: 25% 0%, 50% 50%, 25% 50%, 0% 50%; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 0.8; }
        }
      `}</style>
    </div>
  )
}

export default MuroDeRecuerdos