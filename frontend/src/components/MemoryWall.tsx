import { useNavigate } from 'react-router-dom'
import DailyQuote from '@/components/memorial/DailyQuote'

interface MemoryWallProps {
  profileId: string
  profileName: string
  profileSlug: string
}

const MemoryWall = ({ profileId, profileName, profileSlug }: MemoryWallProps) => {
  const navigate = useNavigate()

  return (
    <div className="py-8 space-y-6">
      {/* Botón Muro de Recuerdos */}
      <div className="text-center">
        <button
          onClick={() => navigate(`/muro-de-recuerdos/${profileSlug}`)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          💜 Ver Muro de los Recuerdos
        </button>
        <p className="text-gray-600 mt-3 text-sm">
          Comparte tus recuerdos y mantén viva la memoria
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