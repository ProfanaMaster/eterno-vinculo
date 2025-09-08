import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/config/supabase';
import CoupleTemplate from '@/components/templates/CoupleTemplate';

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

function PublicCoupleProfile() {
  const { slug } = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<CoupleProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!slug) {
        setError('Slug no válido');
        setLoading(false);
        return;
      }

      try {
        // Consulta directa a la tabla couple_profiles
        const { data: profileData, error: fetchError } = await supabase
          .from('couple_profiles')
          .select('*')
          .eq('slug', slug)
          .eq('is_published', true)
          .single();

        if (fetchError) {
          console.error('Error fetching profile:', fetchError);
          setError('Perfil no encontrado');
          setLoading(false);
          return;
        }

        if (!profileData) {
          setError('Perfil no encontrado');
          setLoading(false);
          return;
        }

        // Obtener datos relacionados
        const [galleryResult, songsResult, videosResult] = await Promise.all([
          supabase
            .from('couple_gallery_photos')
            .select('*')
            .eq('couple_profile_id', profileData.id)
            .order('display_order'),
          supabase
            .from('couple_favorite_songs')
            .select('*')
            .eq('couple_profile_id', profileData.id)
            .order('display_order'),
          supabase
            .from('couple_special_videos')
            .select('*')
            .eq('couple_profile_id', profileData.id)
            .order('display_order')
        ]);

        // Combinar todos los datos
        const completeProfile = {
          ...profileData,
          common_interests: profileData.common_interests ? JSON.parse(profileData.common_interests) : [],
          person1_suegros: profileData.person1_suegros ? JSON.parse(profileData.person1_suegros) : [],
          person2_suegros: profileData.person2_suegros ? JSON.parse(profileData.person2_suegros) : [],
          person1_cunados: profileData.person1_cunados ? JSON.parse(profileData.person1_cunados) : [],
          person2_cunados: profileData.person2_cunados ? JSON.parse(profileData.person2_cunados) : [],
          gallery_photos: galleryResult.data || [],
          favorite_songs: songsResult.data || [],
          special_videos: videosResult.data || []
        };

        setProfile(completeProfile);
      } catch (error) {
        console.error('Error:', error);
        setError('Error al cargar el perfil');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-black to-red-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-white">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-black to-red-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Perfil no encontrado</h2>
          <p className="text-gray-300 mb-4">{error || 'El perfil que buscas no existe o no está disponible'}</p>
        </div>
      </div>
    );
  }

  return (
    <CoupleTemplate 
      templateId={profile.template_id || 'couple-1'}
      profileData={{
        slug: profile.slug,
        couple_name: profile.couple_name,
        description: profile.description,
        profile_image_url: profile.profile_image_url,
        gallery_photos: profile.gallery_photos?.map(photo => ({
          url: photo.photo_url,
          title: photo.photo_title || ''
        })) || [],
        visit_count: profile.visit_count,
        favorite_songs: profile.favorite_songs?.map(song => ({
          title: song.song_title,
          youtube_url: song.youtube_url
        })) || [],
        special_videos: profile.special_videos?.map(video => video.video_url) || [],
        person1_name: profile.person1_name,
        person1_alias: profile.person1_alias || '',
        person1_birth_date: profile.person1_birth_date,
        person1_zodiac_sign: profile.person1_zodiac_sign || '',
        person2_name: profile.person2_name,
        person2_alias: profile.person2_alias || '',
        person2_birth_date: profile.person2_birth_date,
        person2_zodiac_sign: profile.person2_zodiac_sign || '',
        relationship_start_date: profile.relationship_start_date,
        anniversary_date: profile.anniversary_date,
        common_interests: profile.common_interests?.join(', ') || '',
        in_laws: [
          ...(profile.person1_suegros || []),
          ...(profile.person2_suegros || [])
        ].join(', '),
        siblings_in_law: [
          ...(profile.person1_cunados || []),
          ...(profile.person2_cunados || [])
        ].join(', '),
        pets: profile.pets || '',
        short_term_goals: profile.short_term_goals || '',
        medium_term_goals: profile.medium_term_goals || '',
        long_term_goals: profile.long_term_goals || ''
      }}
    />
  );
}

export default PublicCoupleProfile;