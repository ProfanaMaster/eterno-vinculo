import { useState } from 'react';
import { FamilyMember } from '../types/family';

interface FamilyVideoCarouselProps {
  members: FamilyMember[];
  className?: string;
}

export default function FamilyVideoCarousel({ members, className = '' }: FamilyVideoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Filtrar solo miembros que tienen video
  const membersWithVideos = members?.filter(member => member.memorial_video_url) || [];
  
  if (membersWithVideos.length === 0) {
    return (
      <div className={`w-full max-w-4xl mx-auto text-center ${className}`}>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20">
          <div className="text-white/60 text-lg mb-2">
            📹 Videos Memoriales
          </div>
          <p className="text-white/80 text-sm">
            Los videos memoriales de los miembros de la familia aparecerán aquí cuando estén disponibles.
          </p>
        </div>
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? membersWithVideos.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === membersWithVideos.length - 1 ? 0 : prevIndex + 1
    );
  };

  const currentMember = membersWithVideos[currentIndex];

  return (
    <div className={`relative w-full max-w-4xl mx-auto ${className}`}>
      {/* Video principal */}
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
        <video
          key={currentMember.memorial_video_url}
          className="w-full h-full object-cover"
          controls
          preload="metadata"
          poster={currentMember.profile_image_url}
        >
          <source src={currentMember.memorial_video_url} type="video/mp4" />
          Tu navegador no soporta el elemento de video.
        </video>
        
        {/* Overlay con nombre */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <h3 className="text-white text-xl font-semibold">
            {currentMember.name}
          </h3>
          <p className="text-white/80 text-sm">
            {currentMember.relationship}
          </p>
        </div>
      </div>

      {/* Controles de navegación */}
      {membersWithVideos.length > 1 && (
        <>
          {/* Botón anterior */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all duration-200"
            aria-label="Video anterior"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Botón siguiente */}
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all duration-200"
            aria-label="Siguiente video"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Indicadores de posición */}
      {membersWithVideos.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {membersWithVideos.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentIndex 
                  ? 'bg-white shadow-lg' 
                  : 'bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Ir al video ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Miniaturas de miembros */}
      {membersWithVideos.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2 overflow-x-auto pb-2">
          {membersWithVideos.map((member, index) => (
            <button
              key={member.id}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                index === currentIndex 
                  ? 'border-white shadow-lg' 
                  : 'border-white/40 hover:border-white/60'
              }`}
            >
              <img
                src={member.profile_image_url}
                alt={member.name}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
