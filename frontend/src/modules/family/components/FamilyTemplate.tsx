import { ResponsiveBackground } from '@/components/ui'
import { FamilyProfile } from '../types/family'
import { getProxiedImageUrl } from '@/utils/imageUtils'
import { sanitizeText } from '@/utils/sanitize'
import { TEMPLATE_VIDEOS } from '@/utils/templateBackgrounds'
import { useResponsiveBackground } from '@/hooks/useResponsiveBackground'
import { useState, useEffect } from 'react'
import MemoryWall from '@/components/MemoryWall'
import FamilyVisitCounter from '@/components/FamilyVisitCounter'

interface FamilyTemplateProps {
  templateId: string;
  profileData: FamilyProfile;
}

export default function FamilyTemplate({ templateId, profileData }: FamilyTemplateProps) {
  const { family_name, description, family_members, visit_count, slug, memorial_video_url, gallery_images, favorite_music } = profileData;
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentGalleryPage, setCurrentGalleryPage] = useState(0);
  const [showPlayer, setShowPlayer] = useState(false);
  const [glowingIndex, setGlowingIndex] = useState(0);
  
  // Efecto de resplandor secuencial para los nombres
  useEffect(() => {
    if (!family_members || family_members.length === 0) return;
    
    const interval = setInterval(() => {
      setGlowingIndex((prevIndex) => (prevIndex + 1) % family_members.length);
    }, 2000); // Cambia cada 2 segundos
    
    return () => clearInterval(interval);
  }, [family_members]);

  // Función para obtener las clases de resplandor
  const getGlowClasses = (memberIndex: number) => {
    const isGlowing = glowingIndex === memberIndex;
    return isGlowing 
      ? 'bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-white/50 shadow-white/50 shadow-2xl transition-all duration-1000 ease-in-out'
      : 'bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-white/50 transition-all duration-1000 ease-in-out';
  };
  

  // Extraer ID de YouTube si es una URL
  const getYouTubeId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    const match = url.match(regex)
    return match ? match[1] : null
  }

  const youtubeId = favorite_music ? getYouTubeId(favorite_music) : null
  const isYouTubeUrl = youtubeId !== null

  const handlePlay = () => {
    if (isYouTubeUrl) {
      setShowPlayer(true)
    } else {
      // Buscar en YouTube
      const searchQuery = encodeURIComponent(favorite_music)
      window.open(`https://www.youtube.com/results?search_query=${searchQuery}`, '_blank')
    }
  }
  
  

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTemplateStyles = (templateId: string) => {
    const templates = {
      'family-1': {
        card: 'bg-white/90 backdrop-blur rounded-lg shadow-md border border-gray-200',
        accent: 'text-gray-700',
        icons: ['👨‍👩‍👧‍👦', '🌹', '✨', '🤍'],
        decorativeElements: {
          profileBadge: '👨‍👩‍👧‍👦',
          cornerPattern: 'family-heart',
          headerIcon: '🌹'
        }
      },
      'family-2': {
        card: 'bg-white/90 backdrop-blur rounded-lg shadow-md border border-gray-200',
        accent: 'text-gray-700',
        icons: ['👨‍👩‍👧‍👦', '🌺', '✨', '🤍'],
        decorativeElements: {
          profileBadge: '👨‍👩‍👧‍👦',
          cornerPattern: 'family-rose',
          headerIcon: '🌺'
        }
      }
    };
    return templates[templateId as keyof typeof templates] || templates['family-1'];
  };

  const templateStyles = getTemplateStyles(templateId);

  return (
    <div className="min-h-screen relative">
      {/* Header con video de fondo */}
      <div className="relative h-96 w-full overflow-hidden rounded-b-3xl shadow-2xl">
        {/* Video de fondo */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover rounded-b-3xl"
        >
          <source src={TEMPLATE_VIDEOS[templateId]} type="video/mp4" />
        </video>
        
        {/* Overlay para mejor legibilidad */}
        <div className="absolute inset-0 bg-black/20 rounded-b-3xl"></div>
        
        {/* Nombre de la familia abajo del video */}
        <div className="absolute bottom-0 left-0 right-0 z-10 flex justify-center items-center pb-8 px-4">
          <div className="relative w-full max-w-2xl">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
            </div>
            <div className="relative inline-block w-full text-center">
              {/* Resplandor dorado más intenso */}
              <div className="absolute -inset-8 bg-gradient-to-r from-yellow-300/60 via-amber-400/70 to-yellow-300/60 blur-2xl rounded-full animate-pulse"></div>
              <div className="absolute -inset-4 bg-gradient-to-r from-amber-300/50 via-yellow-200/60 to-amber-300/50 blur-xl rounded-full"></div>
              <div className="absolute -inset-2 bg-gradient-to-r from-yellow-200/40 via-amber-100/50 to-yellow-200/40 blur-lg rounded-full"></div>
              
              {/* Contenedor del nombre */}
              <div className="relative z-10 bg-gradient-to-br from-white/98 via-amber-50/95 to-white/98 backdrop-blur-sm px-4 md:px-8 py-4 rounded-2xl shadow-2xl border border-amber-300/60 mx-auto">
                <h1 className="text-2xl md:text-4xl font-serif text-gray-800 tracking-wide font-bold drop-shadow-lg text-center">
                  {sanitizeText(family_name)}
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fotos de perfil debajo del video */}
      <div className="relative py-8">
        {/* Solo fondo, sin video */}
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url(${useResponsiveBackground(templateId).background})`
          }}
        />
        
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <div className="flex flex-col gap-6">
            {family_members && family_members.length > 0 && (
              <>
                {/* Primera fila */}
                <div className="flex justify-center gap-8">
                  {family_members.slice(0, 2).map((member, index) => (
                    <div key={member.id} className="relative text-center">
                      <img
                        src={getProxiedImageUrl(member.profile_image_url)}
                        alt={member.name}
                        className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-2xl mx-auto"
                      />
                      <div className="mt-4">
                        <div className={getGlowClasses(index)}>
                          <h3 className="text-lg font-serif text-gray-800 font-semibold tracking-wide">
                            {member.name.split(' ')[0]}
                          </h3>
                        </div>
                        <div className="w-12 h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent mx-auto mt-2"></div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Segunda fila (si hay más de 2 miembros) */}
                {family_members.length > 2 && (
                  <div className="flex justify-center gap-8">
                    {family_members.slice(2, 4).map((member, index) => (
                      <div key={member.id} className="relative text-center">
                        <img
                          src={getProxiedImageUrl(member.profile_image_url)}
                          alt={member.name}
                          className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-2xl mx-auto"
                        />
                        <div className="mt-4">
                          <div className={getGlowClasses(index + 2)}>
                            <h3 className="text-lg font-serif text-gray-800 font-semibold tracking-wide">
                              {member.name.split(' ')[0]}
                            </h3>
                          </div>
                          <div className="w-12 h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent mx-auto mt-2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Tercera fila (si hay más de 4 miembros) */}
                {family_members.length > 4 && (
                  <div className="flex justify-center gap-8">
                    {family_members.slice(4, 6).map((member, index) => (
                      <div key={member.id} className="relative text-center">
                        <img
                          src={getProxiedImageUrl(member.profile_image_url)}
                          alt={member.name}
                          className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-2xl mx-auto"
                        />
                        <div className="mt-4">
                          <div className={getGlowClasses(index + 4)}>
                            <h3 className="text-lg font-serif text-gray-800 font-semibold tracking-wide">
                              {member.name.split(' ')[0]}
                            </h3>
                          </div>
                          <div className="w-12 h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent mx-auto mt-2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Barra decorativa con emojis - Transición entre fotos y fechas */}
      <div className="relative py-4">
        <div className="h-1 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full mx-8"></div>
        <div className="flex justify-center gap-6 -mt-4">
          {templateStyles.icons.map((icon, index) => (
            <div key={index} className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center">
              <span className="text-lg">{icon}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Contenido principal */}
      <ResponsiveBackground 
        templateId={templateId}
        className="relative"
      >
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Fechas de nacimiento y fallecimiento */}
          {family_members && family_members.length > 0 && (
            <div className="text-center mb-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {family_members.map((member, index) => (
                  <div key={member.id} className="relative">
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300">
                      <div className="text-center">
                        <h3 className="text-xl font-serif text-gray-800 font-semibold mb-3 tracking-wide">
                          {member.name}
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-center gap-3">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <span className="text-gray-600 font-medium">Nacimiento</span>
                            <span className="text-gray-800 font-semibold">{formatDate(member.birth_date)}</span>
                          </div>
                          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                          <div className="flex items-center justify-center gap-3">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="text-gray-600 font-medium">Fallecimiento</span>
                            <span className="text-gray-800 font-semibold">{formatDate(member.death_date)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Carrusel de Videos */}
          <div className="mb-12">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50">
                <h2 className="text-2xl font-serif text-gray-800 font-semibold mb-6 text-center tracking-wide">
                  Videos Conmemorativos
                </h2>
                
                {family_members && family_members.some(member => member.memorial_video_url) ? (
                  <div className="relative group">
                    {/* Flecha izquierda */}
                    <button className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 -ml-4">
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    {/* Flecha derecha */}
                    <button className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 -mr-4">
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    
                    {/* Carrusel */}
                    <div className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide snap-x snap-mandatory">
                      {family_members.filter(member => member.memorial_video_url).map((member, index) => (
                        <div key={member.id} className="flex-shrink-0 w-full max-w-sm snap-center">
                          <div className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                            <div className="text-center mb-4">
                              <h3 className="text-xl font-serif text-gray-800 font-semibold tracking-wide">
                                {member.name}
                              </h3>
                              <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mx-auto mt-2"></div>
                            </div>
                            <div className="aspect-video relative overflow-hidden rounded-xl shadow-lg">
                              <video
                                src={getProxiedImageUrl(member.memorial_video_url)}
                                controls
                                preload="metadata"
                                className="w-full h-full object-cover"
                                poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 225'%3E%3Crect width='400' height='225' fill='%23f3f4f6'/%3E%3Ctext x='200' y='112' text-anchor='middle' fill='%236b7280' font-size='16'%3EVideo Memorial%3C/text%3E%3C/svg%3E"
                              >
                                Tu navegador no soporta el elemento de video.
                              </video>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Indicadores modernos */}
                    <div className="flex justify-center gap-3 mt-6">
                      {family_members.filter(member => member.memorial_video_url).map((_, index) => (
                        <div key={index} className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-30 hover:opacity-100 transition-opacity duration-300 cursor-pointer"></div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video relative overflow-hidden rounded-xl bg-gray-100 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <p className="text-lg font-medium">No hay videos cargados</p>
                      <p className="text-sm text-gray-400 mt-2">Los videos se cargan desde los miembros de la familia</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 1. En memoria */}
          {description && (
            <div className={`${templateStyles.card} p-6 mb-8 relative overflow-hidden`}>
              {/* Patrón decorativo de fondo */}
              <div className="absolute top-0 right-0 w-20 h-20 opacity-5">
                <div className="text-6xl transform rotate-12">{templateStyles.icons[0]}</div>
              </div>
              <h2 className={`text-xl font-semibold ${templateStyles.accent} mb-4 flex items-center gap-2`}>
                <span>🌹</span> En memoria
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap relative z-10">{sanitizeText(description)}</p>
            </div>
          )}

          {/* 2. Video Conmemorativo */}
          {memorial_video_url && (
            <div className={`${templateStyles.card} p-6 mb-8 relative overflow-hidden`}>
              <div className="absolute top-0 left-0 w-16 h-16 opacity-5">
                <div className="text-4xl">🎥</div>
              </div>
              <h2 className={`text-xl font-semibold ${templateStyles.accent} mb-4 flex items-center gap-2`}>
                <span>🎥</span> Video conmemorativo
              </h2>
              <div className="aspect-video relative z-10">
                <video
                  src={getProxiedImageUrl(memorial_video_url)}
                  controls
                  preload="metadata"
                  className="w-full h-full rounded-lg shadow-lg"
                  poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 225'%3E%3Crect width='400' height='225' fill='%23f3f4f6'/%3E%3Ctext x='200' y='112' text-anchor='middle' fill='%236b7280' font-size='16'%3EVideo Memorial%3C/text%3E%3C/svg%3E"
                >
                  Tu navegador no soporta el elemento de video.
                </video>
              </div>
            </div>
          )}

          {/* 3. Galería de Recuerdos */}
          {gallery_images && gallery_images.length > 0 && (
            <div className={`${templateStyles.card} p-6 mb-8`}>
              <h2 className={`text-xl font-semibold ${templateStyles.accent} mb-4 flex items-center gap-2`}>
                <span>📸</span> Galería de recuerdos
              </h2>
              
              {/* Grid de 6 fotos */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {gallery_images.slice(currentGalleryPage * 6, (currentGalleryPage + 1) * 6).map((image, index) => (
                  <div 
                    key={currentGalleryPage * 6 + index} 
                    className="relative group cursor-pointer overflow-hidden rounded-lg bg-gray-50 aspect-square"
                    onClick={() => setSelectedImage(getProxiedImageUrl(image))}
                  >
                    <img 
                      src={getProxiedImageUrl(image)} 
                      alt={`Recuerdo familiar ${currentGalleryPage * 6 + index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    {/* Overlay de zoom */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                      <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginación */}
              {gallery_images.length > 6 && (
                <div className="flex justify-center items-center gap-4">
                  <button
                    onClick={() => setCurrentGalleryPage(Math.max(0, currentGalleryPage - 1))}
                    disabled={currentGalleryPage === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-white/80 hover:bg-white text-gray-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Anterior
                  </button>
                  
                  <div className="flex gap-2">
                    {Array.from({ length: Math.ceil(gallery_images.length / 6) }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentGalleryPage(i)}
                        className={`w-8 h-8 rounded-full text-sm font-medium transition-all duration-200 ${
                          currentGalleryPage === i
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-white/80 hover:bg-white text-gray-700 shadow-md hover:shadow-lg'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => setCurrentGalleryPage(Math.min(Math.ceil(gallery_images.length / 6) - 1, currentGalleryPage + 1))}
                    disabled={currentGalleryPage >= Math.ceil(gallery_images.length / 6) - 1}
                    className="flex items-center gap-2 px-4 py-2 bg-white/80 hover:bg-white text-gray-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 4. Canción Favorita */}
          {favorite_music && (
            <div className="bg-white/90 backdrop-blur rounded-xl shadow-lg border border-gray-200 p-6 mb-8 relative overflow-hidden">
              {/* Patrón musical de fondo */}
              <div className="absolute top-0 right-0 w-20 h-20 opacity-5">
                <div className="text-6xl transform rotate-12">🎵</div>
              </div>
              
              <div className="relative z-10">
                <h2 className={`text-xl font-semibold ${templateStyles.accent} mb-4 flex items-center gap-2`}>
                  <span>🎵</span> Su canción favorita
                </h2>
                
                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-1">
                      {isYouTubeUrl ? 'Video de YouTube' : favorite_music}
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
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
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
                        src={`https://www.youtube.com/embed/${youtubeId}?controls=1&rel=0&modestbranding=1&playsinline=1`}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                        className="w-full h-full rounded-lg"
                        loading="lazy"
                        style={{ minHeight: '200px' }}
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
          )}

          {/* 5. Muro de Recuerdos */}
          <MemoryWall 
            profileId={profileData.id}
            profileName={family_name}
            profileSlug={slug}
            isFamilyProfile={true}
          />

        </div>

        {/* Modal de imagen */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="relative max-w-4xl max-h-full">
              <img
                src={selectedImage}
                alt="Imagen ampliada"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Contador de visitas - esquina inferior derecha */}
        <div className="absolute bottom-4 right-4 z-10">
          <FamilyVisitCounter 
            slug={slug} 
            initialCount={visit_count || 0}
            className="bg-white/80 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg border border-gray-200/50"
          />
        </div>
      </ResponsiveBackground>
    </div>
  );
}