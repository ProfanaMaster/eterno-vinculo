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
          className="px-8 py-4 bg-purple-600 text-white font-semibold text-lg rounded-lg shadow-xl hover:bg-purple-700 hover:shadow-2xl active:bg-purple-800 active:shadow-lg transition-all duration-150 cursor-pointer"
        >
          Ver Muro de los Recuerdos
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