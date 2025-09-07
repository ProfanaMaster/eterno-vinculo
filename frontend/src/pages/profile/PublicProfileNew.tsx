import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '@/services/api'
import ImageModal from '@/components/ImageModal'
import { CelebrationEffect } from '@/components/CelebrationEffect'
import { useBirthdayCelebration } from '@/hooks/useBirthdayCelebration'
import { MemorialTimeModal } from '@/components/memorial/MemorialTimeModal'
import MemorialTemplate from '@/components/templates/MemorialTemplate'
import { MemorialProfile } from '@/types/family'

export default function PublicProfile() {
  const { slug } = useParams<{ slug: string }>()
  const [profile, setProfile] = useState<MemorialProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalImageIndex, setModalImageIndex] = useState(0)
  const [timeModalOpen, setTimeModalOpen] = useState(false)

  // Hook para manejar celebración de cumpleaños
  const birthdayCelebration = useBirthdayCelebration({
    birthDate: profile?.profile_type === 'individual' ? profile.birth_date : '',
    profileName: profile?.profile_type === 'individual' ? profile.profile_name : 
                 profile?.profile_type === 'family' ? profile.family_name : '',
    autoStart: true
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get(`/profiles/public/${slug}`)
        setProfile(response.data)
      } catch (err: any) {
        console.error('Error fetching profile:', err)
        setError(err.response?.data?.error || 'Error al cargar el perfil')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchProfile()
    }
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Perfil no encontrado</h1>
          <p className="text-gray-600">{error || 'El perfil que buscas no existe o ha sido eliminado.'}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Usar MemorialTemplate que maneja tanto individual como familiar */}
      <MemorialTemplate 
        templateId={profile?.template_id || 'general-1'}
        profileData={profile}
      />

      {/* Modal de Imagen */}
      <ImageModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        images={profile?.gallery_images || []}
        currentIndex={modalImageIndex}
        onIndexChange={setModalImageIndex}
      />

      {/* Modal de Tiempo */}
      <MemorialTimeModal
        isOpen={timeModalOpen}
        onClose={() => setTimeModalOpen(false)}
        birthDate={profile?.profile_type === 'individual' ? profile.birth_date : ''}
        deathDate={profile?.profile_type === 'individual' ? profile.death_date : ''}
        profileName={profile?.profile_type === 'individual' ? profile.profile_name : 
                    profile?.profile_type === 'family' ? profile.family_name : ''}
      />

      {/* Efecto de celebración de cumpleaños */}
      {birthdayCelebration.isCelebrating && (
        <CelebrationEffect
          isActive={birthdayCelebration.isCelebrating}
          onComplete={birthdayCelebration.stopCelebration}
        />
      )}
    </>
  )
}
