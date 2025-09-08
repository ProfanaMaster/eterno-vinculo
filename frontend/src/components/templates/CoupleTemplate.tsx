import { ResponsiveBackground } from '@/components/ui'
import { getProxiedImageUrl } from '@/utils/imageUtils'
import { sanitizeText } from '@/utils/sanitize'
import VisitCounter from '@/components/VisitCounter'
import TemplateBackground from '@/components/profile/TemplateBackground'
import ImageModal from '@/components/ImageModal'
import { useState } from 'react'

interface PhotoWithTitle {
  url: string;
  title: string;
}

interface FavoriteSong {
  title: string;
  youtube_url: string;
}

interface CoupleTemplateProps {
  templateId: string
  profileData: {
    slug: string
    couple_name: string
    description: string
    profile_image_url?: string
    gallery_photos?: PhotoWithTitle[]
    visit_count?: number
    
    // Canciones favoritas (máximo 2)
    favorite_songs?: FavoriteSong[]
    
    // Videos especiales
    special_videos?: string[]
    
    // Persona 1
    person1_name: string
    person1_alias: string
    person1_birth_date: string
    person1_zodiac_sign: string
    
    // Persona 2
    person2_name: string
    person2_alias: string
    person2_birth_date: string
    person2_zodiac_sign: string
    
    // Relación
    relationship_start_date?: string
    anniversary_date?: string
    
    // Información adicional
    common_interests?: string
    in_laws?: string
    siblings_in_law?: string
    pets?: string
    short_term_goals?: string
    medium_term_goals?: string
    long_term_goals?: string
  }
}

const CoupleTemplate = ({ templateId, profileData }: CoupleTemplateProps) => {
  // Estados para el modal de imágenes
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  
  // Estados para paginación de galería
  const [currentPage, setCurrentPage] = useState(0);
  const photosPerPage = 5;

  // Función para calcular edad
  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  // Función para verificar si es cumpleaños
  const isBirthday = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    return today.getMonth() === birth.getMonth() && today.getDate() === birth.getDate();
  };

  // Función para calcular tiempo juntos
  const calculateTimeTogether = (startDate: string) => {
    const today = new Date();
    const start = new Date(startDate);
    const diffTime = Math.abs(today.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    const days = diffDays % 30;
    
    if (years > 0) {
      return `${years} año${years > 1 ? 's' : ''}${months > 0 ? ` y ${months} mes${months > 1 ? 'es' : ''}` : ''}`;
    } else if (months > 0) {
      return `${months} mes${months > 1 ? 'es' : ''}${days > 0 ? ` y ${days} día${days > 1 ? 's' : ''}` : ''}`;
    } else {
      return `${days} día${days > 1 ? 's' : ''}`;
    }
  };

  return (
    <ResponsiveBackground 
      templateId={templateId}
      className="min-h-screen relative"
    >
      {/* Template Background - Video en la parte superior como template-7 */}
      <TemplateBackground templateId={templateId} />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Espacio para que la foto quede entre el video y el fondo */}
          <div className="h-48 md:h-56"></div>

          {/* Header con frame de corazón */}
          <div className="text-center mb-8">
            {/* Frame de corazón para la foto principal */}
            <div className="relative mx-auto mb-6 w-64 h-64">
              <div className="absolute inset-0 bg-white/90 backdrop-blur rounded-full p-2">
                <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-pink-100 to-pink-200 p-1">
                  {profileData.profile_image_url ? (
                    <img 
                      src={getProxiedImageUrl(profileData.profile_image_url)} 
                      alt={profileData.couple_name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-pink-100 flex items-center justify-center rounded-full">
                      <span className="text-pink-500 text-6xl">💕</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

                  {/* Título principal - Liquid Glass con Resplandor Dorado */}
                  <div className="relative backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl p-8 mb-8 border border-white/20 overflow-hidden">
                    {/* Efecto de vidrio líquido */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10"></div>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600"></div>
                    
                    {/* Resplandor dorado sutil */}
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-amber-400/30 to-yellow-400/20 rounded-3xl blur-sm"></div>
                    
                    <div className="relative z-10 text-center">
                      <h1 
                        className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg italic"
                        style={{
                          fontFamily: 'Georgia, serif',
                          background: 'linear-gradient(45deg, #FFD700, #FFA500, #FFD700)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}
                      >
              {sanitizeText(profileData.couple_name)}
            </h1>
                    </div>
                  </div>
            
            {/* Información de la pareja - Diseño Elegante y Simple */}
            <div className="flex justify-center mb-8">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-200/50 w-full max-w-4xl">
                <div className="grid grid-cols-2 items-start justify-center gap-4 md:gap-8">
                  
                  {/* Persona 1 */}
                  <div className="text-center h-full flex flex-col justify-center">
                    <div className="mb-4">
                      <h3 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2 leading-tight">
                  {sanitizeText(profileData.person1_name)}
                </h3>
                    </div>
                    <div className="mb-4">
                      <p className="text-pink-600 text-xl md:text-2xl font-medium italic" style={{fontFamily: 'Georgia, serif'}}>
                  "{sanitizeText(profileData.person1_alias)}"
                </p>
                    </div>
                    <div className="mb-4">
                      <p className="text-gray-600 text-base md:text-lg">
                  {calculateAge(profileData.person1_birth_date)} años • {profileData.person1_zodiac_sign}
                  {isBirthday(profileData.person1_birth_date) && (
                          <span className="ml-2 text-yellow-500">🎂</span>
                  )}
                </p>
                      {/* Línea dorada elegante */}
                      <div className="mt-3 w-16 h-0.5 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 mx-auto rounded-full shadow-sm"></div>
                    </div>
              </div>
              
                  {/* Persona 2 */}
                  <div className="text-center h-full flex flex-col justify-center">
                    <div className="mb-4">
                      <h3 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2 leading-tight">
                  {sanitizeText(profileData.person2_name)}
                </h3>
                    </div>
                    <div className="mb-4">
                      <p className="text-pink-600 text-xl md:text-2xl font-medium italic" style={{fontFamily: 'Georgia, serif'}}>
                  "{sanitizeText(profileData.person2_alias)}"
                </p>
                    </div>
                    <div className="mb-4">
                      <p className="text-gray-600 text-base md:text-lg">
                  {calculateAge(profileData.person2_birth_date)} años • {profileData.person2_zodiac_sign}
                  {isBirthday(profileData.person2_birth_date) && (
                          <span className="ml-2 text-yellow-500">🎂</span>
                  )}
                </p>
                      {/* Línea dorada elegante */}
                      <div className="mt-3 w-16 h-0.5 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 mx-auto rounded-full shadow-sm"></div>
                    </div>
              </div>
            </div>

                {/* Imagen central debajo de las personas */}
                <div className="flex justify-center mt-6">
                  <img src="/amor-infinito.png" alt="Amor infinito" className="w-10 h-10" />
                </div>
                
                {/* Fechas importantes - Cuadro Unificado */}
                {(profileData.anniversary_date || profileData.relationship_start_date) && (
                  <div className="mt-8 pt-8 border-t border-gradient-to-r from-pink-200 via-pink-300 to-pink-200">
                    <div className="relative backdrop-blur-lg bg-gradient-to-br from-pink-50/80 to-rose-50/80 rounded-2xl p-6 border border-pink-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {profileData.anniversary_date && (
                        <div className="text-center">
                          <div className="w-10 h-10 mx-auto mb-3 flex items-center justify-center">
                            <img src="/aniversario.png" alt="Aniversario" className="w-10 h-10" />
                          </div>
                          <h4 className="text-pink-700 font-bold text-base mb-2 tracking-wide">ANIVERSARIO</h4>
                          <p className="text-gray-800 font-semibold text-lg">{profileData.anniversary_date}</p>
                        </div>
              )}
              {profileData.relationship_start_date && (
                        <div className="text-center">
                          <div className="w-10 h-10 mx-auto mb-3 flex items-center justify-center">
                            <img src="/fecha-inicio.png" alt="Juntos desde" className="w-10 h-10" />
                          </div>
                          <h4 className="text-rose-700 font-bold text-base mb-2 tracking-wide">JUNTOS DESDE</h4>
                          <p className="text-gray-800 font-semibold text-lg">{profileData.relationship_start_date}</p>
                        </div>
                      )}
                      </div>
                      <div className="mt-4 pt-4 border-t border-pink-200/30">
                        <div className="w-24 h-0.5 bg-gradient-to-r from-pink-400 to-rose-500 mx-auto rounded-full"></div>
                        {/* Tiempo juntos - Elegante y sutil */}
                        {profileData.relationship_start_date && (
                          <div className="mt-4 text-center">
                            <p className="text-pink-600/80 text-sm font-medium italic">
                              {calculateTimeTogether(profileData.relationship_start_date)} de amor
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 1. Su Historia de Amor - Liquid Glass Design */}
          <div className="relative backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl p-8 mb-8 border border-white/20 overflow-hidden">
            {/* Efecto de vidrio líquido */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600"></div>
            
            {/* Overlay para mejorar legibilidad del texto */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30 rounded-3xl"></div>

            <div className="relative z-10">
              <div className="text-center mb-6">
                <img src="/dos-corazones.png" alt="Historia de amor" className="w-12 h-12 mx-auto mb-3 drop-shadow-lg" />
                <h2 className="text-3xl font-bold text-white drop-shadow-2xl italic" style={{ fontFamily: 'Georgia, serif' }}>Su Historia de Amor</h2>
            </div>
              <div className="relative">
                <div className="absolute inset-0 bg-black/10 rounded-2xl"></div>
                <p className="relative text-white leading-relaxed text-center text-lg drop-shadow-2xl font-medium px-4 py-2">
              {sanitizeText(profileData.description)}
            </p>
              </div>
            </div>
          </div>

          {/* 2. Recuerdos Juntos - Liquid Glass Design */}
          {profileData.gallery_photos && profileData.gallery_photos.length > 0 && (
            <div className="relative backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl p-8 mb-8 border border-white/20 overflow-hidden">
              {/* Efecto de vidrio líquido */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600"></div>
              
              <div className="relative z-10">
                <div className="text-center mb-6">
                  <img src="/camara.png" alt="Recuerdos juntos" className="w-12 h-12 mx-auto mb-3 drop-shadow-lg" />
                  <h2 className="text-3xl font-bold text-white drop-shadow-lg italic" style={{ fontFamily: 'Georgia, serif' }}>Recuerdos Juntos</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {profileData.gallery_photos
                    .slice(currentPage * photosPerPage, (currentPage + 1) * photosPerPage)
                    .map((photo, index) => {
                      const globalIndex = currentPage * photosPerPage + index;
                      return (
                        <div key={globalIndex} className="group cursor-pointer" onClick={() => {
                          setModalImageIndex(globalIndex);
                          setModalOpen(true);
                        }}>
                          <div className="relative backdrop-blur-lg bg-white/5 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/10">
                            <div className="aspect-square overflow-hidden">
                              <img
                                src={getProxiedImageUrl(photo.url)}
                                alt={photo.title || `Recuerdo ${globalIndex + 1}`}
                                className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                              />
                            </div>
                            {photo.title && (
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                <p className="text-white text-sm font-medium drop-shadow">
                                  {sanitizeText(photo.title)}
                                </p>
                  </div>
                )}
                            {/* Indicador de clic */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-2xl transition-all duration-300 flex items-center justify-center">
                              <span className="text-white opacity-0 group-hover:opacity-100 text-2xl transition-opacity duration-300">🔍</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                
                {/* Paginación elegante */}
                {profileData.gallery_photos.length > photosPerPage && (
                  <div className="mt-8 flex justify-center items-center gap-4">
                    <button
                      onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                      disabled={currentPage === 0}
                      className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white border border-white/20 hover:bg-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ← Anterior
                    </button>
                    
                    <div className="flex gap-2">
                      {Array.from({ length: Math.ceil(profileData.gallery_photos.length / photosPerPage) }).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentPage(index)}
                          className={`w-8 h-8 rounded-full text-sm font-medium transition-all duration-300 ${
                            currentPage === index
                              ? 'bg-pink-500 text-white shadow-lg'
                              : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/20'
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                  </div>
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(Math.ceil(profileData.gallery_photos.length / photosPerPage) - 1, currentPage + 1))}
                      disabled={currentPage >= Math.ceil(profileData.gallery_photos.length / photosPerPage) - 1}
                      className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white border border-white/20 hover:bg-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Siguiente →
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. Video Especial - Liquid Glass Design */}
          {profileData.special_videos && profileData.special_videos.length > 0 && (
            <div className="relative backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl p-8 mb-8 border border-white/20 overflow-hidden">
              {/* Efecto de vidrio líquido */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600"></div>
              
              <div className="relative z-10">
                <div className="text-center mb-6">
                  <img src="/video-camara.png" alt="Video especial" className="w-12 h-12 mx-auto mb-3 drop-shadow-lg" />
                  <h2 className="text-3xl font-bold text-white drop-shadow-lg italic" style={{ fontFamily: 'Georgia, serif' }}>Video Especial</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {profileData.special_videos.map((video, index) => {
                    // Manejar diferentes estructuras de datos para videos
                    const videoUrl = video.url || video.video_url || video;
                    const videoTitle = video.title;
                    const thumbnailUrl = video.thumbnail_url || video.thumbnail;
                    
                    return (
                      <div key={index} className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 rounded-2xl blur-sm"></div>
                        <div className="relative backdrop-blur-sm bg-white/5 rounded-2xl p-4 border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                          <div className="aspect-video rounded-xl overflow-hidden shadow-lg">
                            <video
                              controls
                              className="w-full h-full object-cover"
                              poster={thumbnailUrl ? getProxiedImageUrl(thumbnailUrl) : undefined}
                              preload="metadata"
                            >
                              <source src={getProxiedImageUrl(videoUrl)} type="video/mp4" />
                              <source src={getProxiedImageUrl(videoUrl)} type="video/webm" />
                              Tu navegador no soporta el elemento de video.
                            </video>
                          </div>
                          {videoTitle && (
                            <h3 className="text-white font-semibold mt-4 text-center drop-shadow">
                              {sanitizeText(videoTitle)}
                            </h3>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 4. Nuestras Metas - Liquid Glass Design */}
          {(profileData.short_term_goals || profileData.medium_term_goals || profileData.long_term_goals) && (
            <div className="relative backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl p-8 mb-8 border border-white/20 overflow-hidden">
              {/* Efecto de vidrio líquido */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600"></div>
              
              <div className="relative z-10">
                <div className="text-center mb-6">
                  <img src="/metas.png" alt="Nuestras metas" className="w-12 h-12 mx-auto mb-3 drop-shadow-lg" />
                  <h2 className="text-3xl font-bold text-white drop-shadow-lg italic" style={{ fontFamily: 'Georgia, serif' }}>Nuestras Metas</h2>
                </div>
                <div className="space-y-6">
                {profileData.short_term_goals && (
                    <div className="relative backdrop-blur-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl p-6 border border-green-400/30">
                      <h3 className="font-bold text-white mb-3 text-xl drop-shadow italic" style={{ fontFamily: 'Georgia, serif' }}>Corto Plazo (1-2 años)</h3>
                      <p className="text-white/90 drop-shadow">{profileData.short_term_goals}</p>
                  </div>
                )}
                {profileData.medium_term_goals && (
                    <div className="relative backdrop-blur-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl p-6 border border-blue-400/30">
                      <h3 className="font-bold text-white mb-3 text-xl drop-shadow italic" style={{ fontFamily: 'Georgia, serif' }}>Mediano Plazo (3-5 años)</h3>
                      <p className="text-white/90 drop-shadow">{profileData.medium_term_goals}</p>
                  </div>
                )}
                {profileData.long_term_goals && (
                    <div className="relative backdrop-blur-lg bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-2xl p-6 border border-purple-400/30">
                      <h3 className="font-bold text-white mb-3 text-xl drop-shadow italic" style={{ fontFamily: 'Georgia, serif' }}>Largo Plazo (5+ años)</h3>
                      <p className="text-white/90 drop-shadow">{profileData.long_term_goals}</p>
                  </div>
                )}
                </div>
              </div>
            </div>
          )}

          {/* 5. Más Sobre Nosotros - Liquid Glass Design */}
          {(profileData.common_interests || profileData.pets || profileData.in_laws || profileData.siblings_in_law) && (
            <div className="relative backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl p-8 mb-8 border border-white/20 overflow-hidden">
              {/* Efecto de vidrio líquido */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600"></div>
              
              {/* Overlay para mejorar legibilidad del texto */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30 rounded-3xl"></div>

              <div className="relative z-10">
                <h2 className="text-4xl font-bold text-white text-center mb-6 drop-shadow-2xl italic" style={{ fontFamily: 'Georgia, serif' }}>Más Sobre Nosotros</h2>
                <div className="space-y-6">
                  {profileData.common_interests && (
                    <div className="relative backdrop-blur-lg bg-white/5 rounded-2xl p-6 border border-white/10">
                      <div className="absolute inset-0 bg-black/10 rounded-2xl"></div>
                      <div className="relative z-10">
                        <h3 className="font-bold text-white mb-4 text-xl drop-shadow-2xl flex items-center gap-3 italic" style={{ fontFamily: 'Georgia, serif' }}>
                          <img src="/comun.png" alt="Cosas en común" className="w-6 h-6" />
                          Cosas en Común
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {profileData.common_interests.split(',').map((item, index) => (
                            <span key={index} className="px-4 py-2 bg-gradient-to-r from-pink-500/40 to-rose-500/40 text-white rounded-full text-base font-medium border border-pink-400/50 backdrop-blur-sm drop-shadow-lg">
                              {item.trim()}
                            </span>
                          ))}
              </div>
                      </div>
                    </div>
                  )}
                  {profileData.pets && (
                    <div className="relative backdrop-blur-lg bg-white/5 rounded-2xl p-6 border border-white/10">
                      <div className="absolute inset-0 bg-black/10 rounded-2xl"></div>
                      <div className="relative z-10">
                        <h3 className="font-bold text-white mb-4 text-xl drop-shadow-2xl flex items-center gap-3 italic" style={{ fontFamily: 'Georgia, serif' }}>
                          <img src="/mascotas.png" alt="Mascotas" className="w-6 h-6" />
                          Mascotas
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {profileData.pets.split(',').map((pet, index) => (
                            <span key={index} className="px-4 py-2 bg-gradient-to-r from-green-500/40 to-emerald-500/40 text-white rounded-full text-base font-medium border border-green-400/50 backdrop-blur-sm drop-shadow-lg">
                              {pet.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {profileData.in_laws && (
                    <div className="relative backdrop-blur-lg bg-white/5 rounded-2xl p-6 border border-white/10">
                      <div className="absolute inset-0 bg-black/10 rounded-2xl"></div>
                      <div className="relative z-10">
                        <h3 className="font-bold text-white mb-4 text-xl drop-shadow-2xl flex items-center gap-3 italic" style={{ fontFamily: 'Georgia, serif' }}>
                          <img src="/suegros.png" alt="Suegros" className="w-6 h-6" />
                          Suegros
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {profileData.in_laws.split(',').map((inLaw, index) => (
                            <span key={index} className="px-4 py-2 bg-gradient-to-r from-blue-500/40 to-cyan-500/40 text-white rounded-full text-base font-medium border border-blue-400/50 backdrop-blur-sm drop-shadow-lg">
                              {inLaw.trim()}
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>
                  )}
                  {profileData.siblings_in_law && (
                    <div className="relative backdrop-blur-lg bg-white/5 rounded-2xl p-6 border border-white/10">
                      <div className="absolute inset-0 bg-black/10 rounded-2xl"></div>
                      <div className="relative z-10">
                        <h3 className="font-bold text-white mb-4 text-xl drop-shadow-2xl flex items-center gap-3 italic" style={{ fontFamily: 'Georgia, serif' }}>
                          <img src="/hermanos.png" alt="Cuñados" className="w-6 h-6" />
                          Cuñados
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {profileData.siblings_in_law.split(',').map((sibling, index) => (
                            <span key={index} className="px-4 py-2 bg-gradient-to-r from-purple-500/40 to-violet-500/40 text-white rounded-full text-base font-medium border border-purple-400/50 backdrop-blur-sm drop-shadow-lg">
                              {sibling.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 6. Nuestras Canciones Favoritas - Liquid Glass Design */}
          {profileData.favorite_songs && profileData.favorite_songs.length > 0 && (
            <div className="relative backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl p-8 mb-8 border border-white/20 overflow-hidden">
              {/* Efecto de vidrio líquido */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600"></div>
              
              <div className="relative z-10">
              <div className="text-center mb-6">
                  <img src="/cancion.png" alt="Canciones favoritas" className="w-12 h-12 mx-auto mb-3 drop-shadow-lg" />
                  <h2 className="text-3xl font-bold text-white drop-shadow-lg italic" style={{ fontFamily: 'Georgia, serif' }}>Nuestras Canciones Favoritas</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {profileData.favorite_songs.map((song, index) => {
                    // Extraer el ID del video de YouTube de la URL
                    const getYouTubeVideoId = (url: string) => {
                      if (!url || typeof url !== 'string') return null;
                      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                      const match = url.match(regExp);
                      return (match && match[2].length === 11) ? match[2] : null;
                    };

                    const videoId = getYouTubeVideoId(song.url || song.youtube_url);
                    
                    return (
                      <div key={index} className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 rounded-2xl blur-sm"></div>
                        <div className="relative backdrop-blur-sm bg-white/5 rounded-2xl p-4 border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                          <div className="aspect-video rounded-xl overflow-hidden shadow-lg">
                            {videoId ? (
                              <iframe
                                src={`https://www.youtube.com/embed/${videoId}?controls=1&modestbranding=1&rel=0`}
                                title={song.title || `Canción ${index + 1}`}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                <p className="text-white text-center">URL de YouTube no válida</p>
                              </div>
                            )}
                          </div>
                          {song.title && (
                            <h3 className="text-white font-semibold mt-4 text-center drop-shadow">
                              {sanitizeText(song.title)}
                            </h3>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}




          {/* Mensaje final - Liquid Glass Design */}
          <div className="text-center mt-8">
            <div className="relative backdrop-blur-xl bg-white/10 rounded-2xl p-8 inline-block border border-white/20 shadow-2xl overflow-hidden">
              {/* Efecto de vidrio líquido */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10 rounded-2xl"></div>
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 rounded-t-2xl"></div>
              
              <div className="relative z-10">
                <p className="text-white text-xl font-bold italic drop-shadow-lg">
                "El amor verdadero nunca muere"
              </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contador de visitas - esquina inferior derecha */}
      <div className="absolute bottom-4 right-4 z-10">
        <VisitCounter 
          slug={profileData.slug} 
          initialCount={profileData.visit_count || 0}
          className="bg-white/80 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg border border-pink-200/50"
        />
      </div>

      {/* Modal de imágenes */}
      <ImageModal
        images={profileData.gallery_photos?.map(photo => photo.url) || []}
        currentIndex={modalImageIndex}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </ResponsiveBackground>
  )
}

export default CoupleTemplate
