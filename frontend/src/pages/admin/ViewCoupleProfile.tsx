import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import { supabase } from '@/config/supabase';

interface CoupleProfile {
  id: string;
  couple_name: string;
  description: string;
  profile_image_url?: string;
  person1_name: string;
  person1_alias?: string;
  person1_birth_date: string;
  person1_zodiac_sign?: string;
  person2_name: string;
  person2_alias?: string;
  person2_birth_date: string;
  person2_zodiac_sign?: string;
  relationship_start_date?: string;
  anniversary_date?: string;
  common_interests: string[];
  person1_suegros: string[];
  person2_suegros: string[];
  person1_cunados: string[];
  person2_cunados: string[];
  pets?: string;
  short_term_goals?: string;
  medium_term_goals?: string;
  long_term_goals?: string;
  template_id: string;
  is_published: boolean;
  visit_count: number;
  created_at: string;
  gallery_photos?: Array<{
    id: string;
    photo_url: string;
    photo_title?: string;
    display_order: number;
  }>;
  favorite_songs?: Array<{
    id: string;
    song_title: string;
    youtube_url: string;
    display_order: number;
  }>;
  special_videos?: Array<{
    id: string;
    video_url: string;
    video_filename?: string;
    display_order: number;
  }>;
}

function ViewCoupleProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CoupleProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) {
        setError('ID de perfil no válido');
        setLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          setError('No hay sesión activa');
          setLoading(false);
          return;
        }

        const response = await fetch(`http://localhost:3002/api/admin/couple-profiles/${id}`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setProfile(data.coupleProfile);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Error al cargar el perfil');
        }
      } catch (error) {
        console.error('Error:', error);
        setError('Error al cargar el perfil');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Perfil no encontrado'}</p>
          <Button onClick={() => navigate('/admin/special-profiles')}>
            Volver a Perfiles
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{profile.couple_name}</h1>
              <p className="text-gray-600 mt-2">Perfil de Pareja</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => navigate('/admin/special-profiles')}
                variant="outline"
              >
                ← Volver
              </Button>
              <Button
                onClick={() => {
                  // TODO: Implementar edición
                  console.log('Editar perfil:', profile.id);
                }}
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
              >
                Editar
              </Button>
            </div>
          </div>
        </div>

        {/* Información Principal */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          {/* Imagen de perfil */}
          <div className="h-64 bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center">
            {profile.profile_image_url ? (
              <img
                src={profile.profile_image_url}
                alt={profile.couple_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-32 h-32 bg-pink-200 rounded-full flex items-center justify-center">
                <span className="text-6xl">💕</span>
              </div>
            )}
          </div>

          {/* Contenido */}
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{profile.couple_name}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                profile.is_published 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {profile.is_published ? 'Publicado' : 'Borrador'}
              </span>
            </div>

            <p className="text-gray-700 text-lg mb-8">{profile.description}</p>

            {/* Información de las personas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Persona 1 */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-blue-900 mb-4">
                  {profile.person1_name}
                  {profile.person1_alias && (
                    <span className="text-lg font-normal text-blue-700 ml-2">
                      "{profile.person1_alias}"
                    </span>
                  )}
                </h3>
                <div className="space-y-2 text-blue-800">
                  <p><strong>Edad:</strong> {calculateAge(profile.person1_birth_date)} años</p>
                  <p><strong>Fecha de nacimiento:</strong> {formatDate(profile.person1_birth_date)}</p>
                  {profile.person1_zodiac_sign && (
                    <p><strong>Signo zodiacal:</strong> {profile.person1_zodiac_sign}</p>
                  )}
                </div>
              </div>

              {/* Persona 2 */}
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-pink-900 mb-4">
                  {profile.person2_name}
                  {profile.person2_alias && (
                    <span className="text-lg font-normal text-pink-700 ml-2">
                      "{profile.person2_alias}"
                    </span>
                  )}
                </h3>
                <div className="space-y-2 text-pink-800">
                  <p><strong>Edad:</strong> {calculateAge(profile.person2_birth_date)} años</p>
                  <p><strong>Fecha de nacimiento:</strong> {formatDate(profile.person2_birth_date)}</p>
                  {profile.person2_zodiac_sign && (
                    <p><strong>Signo zodiacal:</strong> {profile.person2_zodiac_sign}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Fechas importantes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {profile.relationship_start_date && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-green-900 mb-2">💕 Inicio de Relación</h4>
                  <p className="text-green-800">{formatDate(profile.relationship_start_date)}</p>
                </div>
              )}
              {profile.anniversary_date && (
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-purple-900 mb-2">🎉 Aniversario</h4>
                  <p className="text-purple-800">{formatDate(profile.anniversary_date)}</p>
                </div>
              )}
            </div>

            {/* Cosas en común */}
            {profile.common_interests && profile.common_interests.length > 0 && (
              <div className="mb-8">
                <h4 className="text-xl font-bold text-gray-900 mb-4">🎯 Cosas en Común</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.common_interests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Familia */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Suegros */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6">
                <h4 className="text-lg font-bold text-orange-900 mb-4">👨‍👩‍👧‍👦 Suegros</h4>
                <div className="space-y-3">
                  {profile.person1_suegros && profile.person1_suegros.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-orange-800 mb-1">De {profile.person1_name}:</p>
                      <div className="flex flex-wrap gap-1">
                        {profile.person1_suegros.map((suegro, index) => (
                          <span key={index} className="px-2 py-1 bg-orange-200 text-orange-800 rounded text-xs">
                            {suegro}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {profile.person2_suegros && profile.person2_suegros.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-orange-800 mb-1">De {profile.person2_name}:</p>
                      <div className="flex flex-wrap gap-1">
                        {profile.person2_suegros.map((suegro, index) => (
                          <span key={index} className="px-2 py-1 bg-orange-200 text-orange-800 rounded text-xs">
                            {suegro}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Cuñados */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6">
                <h4 className="text-lg font-bold text-indigo-900 mb-4">👫 Cuñados</h4>
                <div className="space-y-3">
                  {profile.person1_cunados && profile.person1_cunados.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-indigo-800 mb-1">De {profile.person1_name}:</p>
                      <div className="flex flex-wrap gap-1">
                        {profile.person1_cunados.map((cunado, index) => (
                          <span key={index} className="px-2 py-1 bg-indigo-200 text-indigo-800 rounded text-xs">
                            {cunado}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {profile.person2_cunados && profile.person2_cunados.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-indigo-800 mb-1">De {profile.person2_name}:</p>
                      <div className="flex flex-wrap gap-1">
                        {profile.person2_cunados.map((cunado, index) => (
                          <span key={index} className="px-2 py-1 bg-indigo-200 text-indigo-800 rounded text-xs">
                            {cunado}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mascotas */}
            {profile.pets && (
              <div className="mb-8">
                <h4 className="text-xl font-bold text-gray-900 mb-4">🐾 Mascotas</h4>
                <p className="text-gray-700">{profile.pets}</p>
              </div>
            )}

            {/* Metas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {profile.short_term_goals && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-green-900 mb-2">🎯 Metas a Corto Plazo</h4>
                  <p className="text-green-800">{profile.short_term_goals}</p>
                </div>
              )}
              {profile.medium_term_goals && (
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-yellow-900 mb-2">🎯 Metas a Mediano Plazo</h4>
                  <p className="text-yellow-800">{profile.medium_term_goals}</p>
                </div>
              )}
              {profile.long_term_goals && (
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-purple-900 mb-2">🎯 Metas a Largo Plazo</h4>
                  <p className="text-purple-800">{profile.long_term_goals}</p>
                </div>
              )}
            </div>

            {/* Galería de fotos */}
            {profile.gallery_photos && profile.gallery_photos.length > 0 && (
              <div className="mb-8">
                <h4 className="text-xl font-bold text-gray-900 mb-4">📸 Galería de Fotos</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {profile.gallery_photos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <img
                        src={photo.photo_url}
                        alt={photo.photo_title || 'Foto de la pareja'}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      {photo.photo_title && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 rounded-b-lg">
                          <p className="text-sm truncate">{photo.photo_title}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Canciones favoritas */}
            {profile.favorite_songs && profile.favorite_songs.length > 0 && (
              <div className="mb-8">
                <h4 className="text-xl font-bold text-gray-900 mb-4">🎵 Canciones Favoritas</h4>
                <div className="space-y-3">
                  {profile.favorite_songs.map((song) => (
                    <div key={song.id} className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-2">{song.song_title}</h5>
                      <a
                        href={song.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        🎬 Ver en YouTube
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Videos especiales */}
            {profile.special_videos && profile.special_videos.length > 0 && (
              <div className="mb-8">
                <h4 className="text-xl font-bold text-gray-900 mb-4">🎬 Videos Especiales</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.special_videos.map((video) => (
                    <div key={video.id} className="bg-gray-50 rounded-lg p-4">
                      <video
                        src={video.video_url}
                        controls
                        className="w-full h-48 object-cover rounded-lg mb-2"
                      />
                      {video.video_filename && (
                        <p className="text-sm text-gray-600">{video.video_filename}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Información adicional */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4">📊 Información del Perfil</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Creado:</p>
                  <p className="font-medium">{formatDate(profile.created_at)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Visitas:</p>
                  <p className="font-medium">{profile.visit_count}</p>
                </div>
                <div>
                  <p className="text-gray-600">Plantilla:</p>
                  <p className="font-medium">{profile.template_id}</p>
                </div>
                <div>
                  <p className="text-gray-600">Estado:</p>
                  <p className="font-medium">{profile.is_published ? 'Publicado' : 'Borrador'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewCoupleProfile;

