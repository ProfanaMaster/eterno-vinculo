import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import { supabase } from '@/config/supabase';

interface CoupleProfile {
  id: string;
  couple_name: string;
  description: string;
  profile_image_url?: string;
  person1_name: string;
  person2_name: string;
  is_published: boolean;
  created_at: string;
  visit_count: number;
}

function SpecialProfiles() {
  const navigate = useNavigate();
  const [selectedProfileType, setSelectedProfileType] = useState<string | null>(null);
  const [coupleProfiles, setCoupleProfiles] = useState<CoupleProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const specialProfileTypes = [
    {
      id: 'couple',
      name: 'Perfil de Pareja',
      description: 'Plantilla romántica para parejas',
      icon: '💕',
      color: 'bg-pink-500',
      hoverColor: 'hover:bg-pink-600'
    },
    // Aquí se pueden agregar más tipos de perfiles especiales en el futuro
  ];

  // Cargar perfiles de pareja existentes
  useEffect(() => {
    const fetchCoupleProfiles = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          setLoading(false);
          return;
        }

        const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3002/api';
        const response = await fetch(`${API_URL}/admin/couple-profiles`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setCoupleProfiles(data.coupleProfiles || []);
        } else {
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchCoupleProfiles();
  }, []);

  const handleCreateProfile = (profileType: string) => {
    // Navegar a la página de creación específica
    navigate(`/admin/create-special-profile/${profileType}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Perfiles Especiales</h1>
              <p className="text-gray-600 mt-2">
                Crea perfiles únicos para casos especiales
              </p>
            </div>
            <Button
              onClick={() => navigate('/admin')}
              className="btn-secondary"
            >
              ← Volver al Dashboard
            </Button>
          </div>
        </div>

        {/* Profile Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {specialProfileTypes.map((profileType) => (
            <div
              key={profileType.id}
              className="bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Icon */}
              <div className="p-6 text-center">
                <div className={`w-20 h-20 mx-auto rounded-full ${profileType.color} flex items-center justify-center mb-4`}>
                  <span className="text-3xl text-white">{profileType.icon}</span>
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {profileType.name}
                </h3>
                <p className="text-gray-600 mb-6">
                  {profileType.description}
                </p>
                
                {/* Action Button */}
                <Button
                  onClick={() => handleCreateProfile(profileType.id)}
                  className={`w-full ${profileType.hoverColor} text-white`}
                >
                  Crear {profileType.name}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Perfiles de Pareja Existentes */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Perfiles de Pareja Existentes</h2>
            <span className="text-sm text-gray-500">
              {coupleProfiles.length} perfil{coupleProfiles.length !== 1 ? 'es' : ''} creado{coupleProfiles.length !== 1 ? 's' : ''}
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            </div>
          ) : coupleProfiles.length === 0 ? (
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-gray-400">💕</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay perfiles de pareja creados</h3>
              <p className="text-gray-500 mb-4">Crea tu primer perfil de pareja especial</p>
              <Button
                onClick={() => handleCreateProfile('couple')}
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
              >
                Crear Primer Perfil
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coupleProfiles.map((profile) => (
                <div
                  key={profile.id}
                  className="bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300"
                >
                  {/* Imagen de perfil */}
                  <div className="h-48 bg-gradient-to-br from-pink-100 to-rose-100 rounded-t-xl flex items-center justify-center">
                    {profile.profile_image_url ? (
                      <img
                        src={profile.profile_image_url}
                        alt={profile.couple_name}
                        className="w-full h-full object-cover rounded-t-xl"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-pink-200 rounded-full flex items-center justify-center">
                        <span className="text-3xl">💕</span>
                      </div>
                    )}
                  </div>

                  {/* Contenido */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900 truncate">
                        {profile.couple_name}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        profile.is_published 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {profile.is_published ? 'Publicado' : 'Borrador'}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {profile.description}
                    </p>
                    
                    <div className="text-sm text-gray-500 mb-4">
                      <p><strong>{profile.person1_name}</strong> & <strong>{profile.person2_name}</strong></p>
                      <p>Creado: {formatDate(profile.created_at)}</p>
                      <p>Visitas: {profile.visit_count}</p>
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          const publicUrl = `${window.location.origin}/pareja/${profile.slug}`;
                          window.open(publicUrl, '_blank');
                        }}
                        variant="outline"
                        className="flex-1 text-sm"
                      >
                        Ver
                      </Button>
                      <Button
                        onClick={() => {
                          // TODO: Implementar edición
                        }}
                        variant="outline"
                        className="flex-1 text-sm"
                      >
                        Editar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Future Expansion Notice */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">🚀</span>
            </div>
            <div className="ml-4">
              <h4 className="text-lg font-medium text-blue-900">
                Más perfiles especiales próximamente
              </h4>
              <p className="text-blue-700 mt-1">
                Estamos trabajando en más tipos de perfiles especiales para casos únicos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SpecialProfiles;
