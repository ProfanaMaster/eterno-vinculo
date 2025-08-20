import { useState } from 'react'

interface FavoriteMusicProps {
  favoriteMusic: string
  accentColor: string
}

export default function FavoriteMusic({ favoriteMusic, accentColor }: FavoriteMusicProps) {
  const [showPlayer, setShowPlayer] = useState(false)

  if (!favoriteMusic) return null

  // Extraer ID de YouTube si es una URL
  const getYouTubeId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    const match = url.match(regex)
    return match ? match[1] : null
  }

  const youtubeId = getYouTubeId(favoriteMusic)
  const isYouTubeUrl = youtubeId !== null

  const handlePlay = () => {
    if (isYouTubeUrl) {
      setShowPlayer(true)
    } else {
      // Buscar en YouTube
      const searchQuery = encodeURIComponent(favoriteMusic)
      window.open(`https://www.youtube.com/results?search_query=${searchQuery}`, '_blank')
    }
  }

  return (
    <div className="bg-white/90 backdrop-blur rounded-xl shadow-lg border border-gray-200 p-6 mb-8 relative overflow-hidden">
      {/* Patrón musical de fondo */}
      <div className="absolute top-0 right-0 w-20 h-20 opacity-5">
        <div className="text-6xl transform rotate-12">🎵</div>
      </div>
      
      <div className="relative z-10">
        <h2 className={`text-xl font-semibold ${accentColor} mb-4 flex items-center gap-2`}>
          <span>🎵</span> Su canción favorita
        </h2>
        
        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
          <div className="flex-1">
            <p className="font-medium text-gray-900 mb-1">
              {isYouTubeUrl ? 'Video de YouTube' : favoriteMusic}
            </p>
            {isYouTubeUrl && (
              <p className="text-sm text-gray-600">
                Enlace directo a YouTube
              </p>
            )}
            {!isYouTubeUrl && (
              <p className="text-sm text-gray-600">
                Buscar en YouTube
              </p>
            )}
          </div>
          
          <button
            onClick={handlePlay}
            className={`flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
            <span className="text-sm font-medium">
              {isYouTubeUrl ? 'Ver' : 'Buscar'}
            </span>
          </button>
        </div>
        
        {/* Reproductor embebido */}
        {showPlayer && isYouTubeUrl && (
          <div className="mt-4">
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full rounded-lg"
              ></iframe>
            </div>
            <button
              onClick={() => setShowPlayer(false)}
              className="mt-2 text-sm text-gray-500 hover:text-gray-700"
            >
              ✖ Cerrar reproductor
            </button>
          </div>
        )}
        
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
          <span>🎧</span>
          <span>{isYouTubeUrl ? 'Reproductor de YouTube integrado' : 'Buscar en YouTube'}</span>
        </div>
      </div>
    </div>
  )
}