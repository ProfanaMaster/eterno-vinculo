import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Memory {
  id: string
  photo_url: string
  author_name: string
  message: string
  song?: string
  things_list: string[]
  created_at: string
  is_authorized: boolean
  likes: number
}

interface MemoryCardProps {
  memory: Memory
  onLike: () => void
}

const MemoryCard = ({ memory, onLike }: MemoryCardProps) => {
  const [showImageModal, setShowImageModal] = useState(false)
  const [showFullCard, setShowFullCard] = useState(false)
  const [showPlayer, setShowPlayer] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const truncateMessage = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-white to-purple-50 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border border-purple-100"
        onClick={() => setShowFullCard(true)}
        whileHover={{ scale: 1.02, y: -5 }}
      >
        {/* Imagen con overlay */}
        <div className="relative h-48 bg-gray-200 overflow-hidden">
          <img
            src={memory.photo_url}
            alt="Recuerdo"
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23f3f4f6"/%3E%3Ctext x="200" y="150" text-anchor="middle" fill="%236b7280" font-size="16"%3EImagen no disponible%3C/text%3E%3C/svg%3E'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2">
            <span className="text-purple-600">💜</span>
          </div>
        </div>

        {/* Contenido compacto */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-gray-900 text-lg">{memory.author_name}</h3>
            <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
              {formatDate(memory.created_at)}
            </span>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed mb-3">
            {truncateMessage(memory.message, 80)}...
          </p>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Clic para ver más</span>
            <div className="flex items-center space-x-1 text-red-500">
              <span>❤️</span>
              <span className="text-sm font-medium">{memory.likes || 0}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modal de tarjeta expandida */}
      <AnimatePresence>
        {showFullCard && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              className="bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-purple-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-purple-100 p-4 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">{memory.author_name.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{memory.author_name}</h3>
                      <p className="text-sm text-purple-600">{formatDate(memory.created_at)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowFullCard(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Imagen */}
              <div className="relative group">
                <img
                  src={memory.photo_url}
                  alt="Recuerdo"
                  className="w-full h-64 object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowImageModal(true)
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full p-3">
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Contenido completo */}
              <div className="p-6 space-y-6">
                {/* Mensaje */}
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-purple-100">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                    <span className="mr-2">💭</span> Mensaje
                  </h4>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{memory.message}</p>
                </div>

                {/* Canción */}
                {memory.song && (
                  <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 border border-purple-200">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold text-gray-800 flex items-center">
                        <span className="mr-2">🎵</span> Canción especial
                      </h4>
                      {(memory.song.includes('youtube.com') || memory.song.includes('youtu.be')) && (
                        <button
                          onClick={() => setShowPlayer(!showPlayer)}
                          className="text-sm bg-white/70 hover:bg-white px-3 py-1 rounded-full transition-colors"
                        >
                          {showPlayer ? '▲ Ocultar' : '▶ Reproducir'}
                        </button>
                      )}
                    </div>
                    {memory.song.includes('youtube.com') || memory.song.includes('youtu.be') ? (
                      showPlayer ? (
                        <div className="aspect-video">
                          <iframe
                            src={`https://www.youtube.com/embed/${memory.song.includes('youtu.be') 
                              ? memory.song.split('youtu.be/')[1]?.split('?')[0] 
                              : memory.song.split('v=')[1]?.split('&')[0]}`}
                            className="w-full h-full rounded-lg"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            sandbox="allow-scripts allow-same-origin allow-presentation"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <p className="text-gray-700 text-sm">YouTube: {memory.song}</p>
                      )
                    ) : (
                      <p className="text-gray-700">{memory.song}</p>
                    )}
                  </div>
                )}

                {/* Cosas que extraña */}
                {memory.things_list.length > 0 && (
                  <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl p-4 border border-pink-200">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <span className="mr-2">💝</span> Lo que más extraño
                    </h4>
                    <ul className="space-y-2">
                      {memory.things_list.map((thing, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-purple-500 mr-3 mt-1">✨</span>
                          <span className="text-gray-700">{thing}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Botón de like */}
                <div className="flex justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onLike()
                    }}
                    className="flex items-center space-x-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <span className="text-xl">❤️</span>
                    <span>Me encanta ({memory.likes || 0})</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal imagen ampliada */}
      <AnimatePresence>
        {showImageModal && (
          <div
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-60 p-4"
            onClick={() => setShowImageModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="max-w-4xl max-h-full"
            >
              <img
                src={memory.photo_url}
                alt="Recuerdo ampliado"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

export default MemoryCard