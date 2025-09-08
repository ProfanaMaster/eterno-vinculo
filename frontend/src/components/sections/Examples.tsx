import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '@/contexts/SettingsContext';

function Examples() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [memorialProfiles, setMemorialProfiles] = useState<Array<{
    profile_name: string;
    profile_image_url: string;
    birth_date: string;
    death_date: string;
    slug: string;
    description?: string;
    type?: string;
  }>>([]);

  useEffect(() => {
    if (settings.examples_section?.memorial_profiles) {
      setMemorialProfiles(settings.examples_section.memorial_profiles);
    }
  }, [settings.examples_section]);

  return (
    <section id="ejemplos" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Ejemplos de 
            <span className="text-gradient"> memoriales</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Descubre cómo otras familias han honrado la memoria de sus seres queridos
          </p>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary mb-8"
          >
            Ver Ejemplos Reales
          </button>
        </div>

        <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Conoce nuestras plantillas
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Descubre nuestras plantillas y crea un hermoso memorial para tu ser querido
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => {
                navigate('/template');
                // Asegurar que se cargue desde el inicio de la página
                setTimeout(() => {
                  window.scrollTo(0, 0);
                }, 100);
              }}
              className="btn btn-secondary"
            >
              Ver Todas las Plantillas
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-white via-gray-50 to-blue-50 rounded-3xl max-w-6xl w-full max-h-[95vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden">
            {/* Header elegante con gradiente - Fijo */}
            <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 text-white p-8 flex-shrink-0 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-3xl font-bold mb-1">Ejemplos de Memoriales</h3>
                  <p className="text-primary-100 text-lg">Descubre cómo otras familias honran la memoria</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Contenido del modal con scroll */}
            <div className="flex-1 overflow-y-auto p-8 rounded-b-3xl">
              {memorialProfiles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {memorialProfiles.map((profile, index) => (
                    <div key={index} className="group relative">
                      {/* Tarjeta principal */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                        {/* Imagen del perfil con marco elegante */}
                        <div className="relative mb-6">
                          <div className="w-40 h-40 mx-auto rounded-2xl overflow-hidden bg-gradient-to-br from-primary-100 to-accent-100 p-1">
                            {profile.profile_image_url ? (
                              <img
                                src={profile.profile_image_url}
                                alt={`Perfil de ${profile.profile_name}`}
                                className="w-full h-full object-cover rounded-xl"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const fallback = target.parentElement?.querySelector('.profile-fallback');
                                  if (fallback) {
                                    (fallback as HTMLElement).style.display = 'flex';
                                  }
                                }}
                              />
                            ) : (
                              <div className="profile-fallback w-full h-full flex items-center justify-center text-primary-400 bg-white rounded-xl">
                                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                          
                          {/* Indicador de número */}
                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                            {index + 1}
                          </div>
                        </div>
                        
                        {/* Información del perfil */}
                        <div className="text-center">
                          <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors duration-200">
                            {profile.profile_name || 'Sin nombre'}
                          </h4>
                          
                          {/* Fechas con diseño elegante */}
                          {profile.birth_date && profile.death_date && (
                            <div className="mb-4">
                              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-50 to-accent-50 px-4 py-2 rounded-full">
                                <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-sm font-medium text-primary-700">
                                  {profile.birth_date} - {profile.death_date}
                                </span>
                              </div>
                            </div>
                          )}
                          
                          {/* Botón Ver Memorial */}
                          <button
                            onClick={() => {
                              if (profile.slug) {
                                // Determinar la URL correcta según el tipo de perfil
                                const isFamilyProfile = profile.type === 'family' || profile.slug.startsWith('familia-');
                                const baseUrl = isFamilyProfile ? '/familia/' : '/memorial/';
                                window.open(`${baseUrl}${profile.slug}`, '_blank');
                              }
                            }}
                            className="w-full bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!profile.slug}
                          >
                            <span className="flex items-center justify-center gap-2">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Ver Memorial
                            </span>
                          </button>
                        </div>
                      </div>
                      
                      {/* Efecto de brillo en hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-accent-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-3">No hay ejemplos configurados</h4>
                  <p className="text-gray-600 text-lg">Los administradores pueden configurar ejemplos de memoriales desde el panel de control.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default Examples