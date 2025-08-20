import { useState, useEffect } from 'react'

interface ImageModalProps {
  images: string[]
  currentIndex: number
  isOpen: boolean
  onClose: () => void
}

export default function ImageModal({ images, currentIndex, isOpen, onClose }: ImageModalProps) {
  const [activeIndex, setActiveIndex] = useState(currentIndex)

  useEffect(() => {
    setActiveIndex(currentIndex)
  }, [currentIndex])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prevImage()
      if (e.key === 'ArrowRight') nextImage()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, activeIndex])

  const nextImage = () => {
    setActiveIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      {/* Botón cerrar */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 z-10"
      >
        ×
      </button>

      {/* Navegación anterior */}
      {images.length > 1 && (
        <button
          onClick={prevImage}
          className="absolute left-4 text-white text-4xl hover:text-gray-300 z-10"
        >
          ‹
        </button>
      )}

      {/* Imagen principal */}
      <div className="max-w-full max-h-full flex items-center justify-center">
        <img
          src={images[activeIndex]}
          alt={`Imagen ${activeIndex + 1}`}
          className="max-w-full max-h-full object-contain"
        />
      </div>

      {/* Navegación siguiente */}
      {images.length > 1 && (
        <button
          onClick={nextImage}
          className="absolute right-4 text-white text-4xl hover:text-gray-300 z-10"
        >
          ›
        </button>
      )}

      {/* Indicadores */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-3 h-3 rounded-full ${
                index === activeIndex ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      )}

      {/* Contador */}
      {images.length > 1 && (
        <div className="absolute top-4 left-4 text-white text-lg">
          {activeIndex + 1} / {images.length}
        </div>
      )}
    </div>
  )
}