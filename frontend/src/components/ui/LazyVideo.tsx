import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

interface LazyVideoProps {
  src: string
  poster?: string
  className?: string
  autoplay?: boolean
  muted?: boolean
  loop?: boolean
  controls?: boolean
  width?: number | string
  height?: number | string
  onLoadStart?: () => void
  onLoadComplete?: () => void
  onError?: (error: string) => void
}

/**
 * Componente de video optimizado con lazy loading
 * - Solo carga el video cuando es visible o cuando se interactúa
 * - Muestra thumbnail mientras no se carga
 * - Optimiza ancho de banda
 */
const LazyVideo: React.FC<LazyVideoProps> = ({
  src,
  poster,
  className = '',
  autoplay = false,
  muted = true,
  loop = false,
  controls = true,
  width = '100%',
  height = 'auto',
  onLoadStart,
  onLoadComplete,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [loadTriggered, setLoadTriggered] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Intersection Observer para detectar cuando el video es visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          // Auto-cargar si está visible y es un video pequeño o si autoplay está habilitado
          if (autoplay || !controls) {
            handleLoadVideo()
          }
        }
      },
      { threshold: 0.1 }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [autoplay, controls])

  const handleLoadVideo = () => {
    if (loadTriggered) return
    
    setLoadTriggered(true)
    onLoadStart?.()
    
    if (videoRef.current) {
      videoRef.current.load()
    }
  }

  const handleVideoLoaded = () => {
    setIsLoaded(true)
    onLoadComplete?.()
  }

  const handleVideoError = () => {
    setHasError(true)
    onError?.('Error al cargar el video')
  }

  const handlePlayRequest = () => {
    if (!loadTriggered) {
      handleLoadVideo()
    }
  }

  // Generar thumbnail placeholder si no se proporciona poster
  const generatePlaceholder = () => {
    if (poster) return poster
    
    // Crear un placeholder SVG con ícono de play
    const svgPlaceholder = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ccircle cx='200' cy='150' r='40' fill='%236b7280' opacity='0.8'/%3E%3Cpolygon points='185,135 185,165 215,150' fill='white'/%3E%3Ctext x='200' y='200' text-anchor='middle' fill='%236b7280' font-size='14' font-family='Arial'%3EHaz clic para cargar%3C/text%3E%3C/svg%3E`
    return svgPlaceholder
  }

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden rounded-lg ${className}`}
      style={{ width, height }}
    >
      {!isLoaded && !hasError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-gray-100 flex items-center justify-center cursor-pointer"
          onClick={handlePlayRequest}
          style={{
            backgroundImage: `url(${generatePlaceholder()})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Overlay de carga */}
          {loadTriggered && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-12 h-12 border-3 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm">Cargando video...</p>
              </div>
            </div>
          )}
          
          {/* Botón de play */}
          {!loadTriggered && isVisible && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30"
            >
              <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-gray-800 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Video real */}
      <video
        ref={videoRef}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        controls={controls}
        autoPlay={autoplay && isLoaded}
        muted={muted}
        loop={loop}
        preload="none" // Crucial: no precargar datos
        poster={poster}
        onLoadedData={handleVideoLoaded}
        onError={handleVideoError}
        onPlay={handlePlayRequest}
      >
        <source src={src} type="video/mp4" />
        Tu navegador no soporta la reproducción de video.
      </video>

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-600">
            <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-sm font-medium">Error al cargar video</p>
            <button 
              onClick={handleLoadVideo}
              className="text-xs text-blue-600 hover:text-blue-700 mt-1"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default LazyVideo
