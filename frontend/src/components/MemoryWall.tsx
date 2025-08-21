import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MuroDeRecuerdos from '@/pages/MuroDeRecuerdos'

interface MemoryWallProps {
  profileId: string
  profileName: string
}

const MemoryWall = ({ profileId, profileName }: MemoryWallProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div className="text-center py-8">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          💜 Ver Muro de los Recuerdos
        </button>
        <p className="text-gray-600 mt-3 text-sm">
          Comparte tus recuerdos y mantén viva la memoria
        </p>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-white z-[9999] overflow-y-auto">
            {/* Hojas cayendo */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute text-purple-300/30"
                  style={{
                    left: `${Math.random() * 100}%`,
                    fontSize: `${10 + Math.random() * 6}px`,
                    animation: `fallLeaves ${12 + Math.random() * 8}s linear infinite`,
                    animationDelay: `${Math.random() * 10}s`
                  }}
                >
                  {['🍃', '🌿', '🌸'][Math.floor(Math.random() * 3)]}
                </div>
              ))}
            </div>
            <div className="sticky top-0 bg-gradient-to-r from-white/98 via-purple-50/95 to-white/98 backdrop-blur-sm border-b border-purple-200/50 p-4 z-[100] shadow-sm">
              <button
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Volver al perfil</span>
              </button>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <MuroDeRecuerdos 
                profileId={profileId} 
                profileName={profileName}
                onOpenModal={() => {}} 
              />
            </motion.div>
            
            <style>{`
              @keyframes fallLeaves {
                0% { 
                  transform: translateY(-50px) rotate(0deg); 
                  opacity: 0; 
                }
                10% { opacity: 0.4; }
                90% { opacity: 0.4; }
                100% { 
                  transform: translateY(100vh) rotate(180deg); 
                  opacity: 0; 
                }
              }
            `}</style>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

export default MemoryWall