import { useNavigate } from 'react-router-dom'
import DailyQuote from '@/components/memorial/DailyQuote'

interface MemoryWallProps {
  profileId: string
  profileName: string
  profileSlug: string
  isFamilyProfile?: boolean
}

const MemoryWall = ({ profileId, profileName, profileSlug, isFamilyProfile = false }: MemoryWallProps) => {
  const navigate = useNavigate()

  return (
    <div className="py-8 space-y-6">
      {/* Botón Muro de Recuerdos */}
      <div className="text-center">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/30 via-yellow-500/30 to-yellow-600/30 rounded-xl blur-sm"></div>
          <button
            onClick={() => navigate(`/muro-de-recuerdos/${profileSlug}`)}
            className="relative px-8 py-4 text-white font-semibold text-lg rounded-xl shadow-2xl hover:shadow-3xl active:shadow-lg transition-all duration-300 cursor-pointer border border-yellow-500/40"
            style={{
              background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 50%, #B8860B 100%)',
              boxShadow: '0 25px 50px -12px rgba(212, 175, 55, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #B8860B 0%, #D4AF37 50%, #8B7355 100%)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #D4AF37 0%, #FFD700 50%, #B8860B 100%)'
            }}
          >
            Ver Muro de los Recuerdos
          </button>
        </div>
        <p className="text-gray-600 mt-4 text-sm font-medium">
          {isFamilyProfile 
            ? 'Comparte tus recuerdos y mantén viva la memoria familiar'
            : 'Comparte tus recuerdos y mantén viva la memoria'
          }
        </p>
      </div>

      {/* Reflexión del día */}
      <DailyQuote 
        className=""
        theme="memorial"
        showRefresh={false}
      />
    </div>
  )
}

export default MemoryWall