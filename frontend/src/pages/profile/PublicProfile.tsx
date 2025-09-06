import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '@/services/api'
import FavoriteMusic from '@/components/FavoriteMusic'
import ImageModal from '@/components/ImageModal'
import { ResponsiveBackground } from '@/components/ui'
import { sanitizeText } from '@/utils/sanitize'
import TemplateBackground from '@/components/profile/TemplateBackground'
import MemoryWall from '@/components/MemoryWall'
import { getProxiedImageUrl } from '@/utils/imageUtils'
import { CelebrationEffect } from '@/components/CelebrationEffect'
import { useBirthdayCelebration } from '@/hooks/useBirthdayCelebration'
import { MemorialTimeModal } from '@/components/memorial/MemorialTimeModal'
import VisitCounter from '@/components/VisitCounter'

interface Profile {
  id: string
  slug: string
  profile_name: string
  description: string
  birth_date: string
  death_date: string
  profile_image_url: string

  gallery_images: string[]
  memorial_video_url?: string
  template_id?: string
  favorite_music?: string
  visit_count?: number
}

export default function PublicProfile() {
  const { slug } = useParams<{ slug: string }>()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalImageIndex, setModalImageIndex] = useState(0)
  const [timeModalOpen, setTimeModalOpen] = useState(false)

  // Hook para manejar celebración de cumpleaños
  const birthdayCelebration = useBirthdayCelebration({
    birthDate: profile?.birth_date || '',
    profileName: profile?.profile_name || '',
    autoStart: true
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get(`/profiles/public/${slug}`)
        setProfile(response.data.data)
      } catch (err: any) {
        console.error('Error fetching profile:', err)
        console.error('Error response:', err.response)
        const errorMessage = err.response?.data?.error || err.message || 'Error al cargar el memorial'
        setError(errorMessage)
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando memorial...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Memorial no encontrado</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    // Agregar 'T00:00:00' para evitar problemas de zona horaria
    const date = new Date(dateString + 'T00:00:00')
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getTemplateStyles = (templateId: string) => {
    const templates = {
      'general-1': {
        card: 'bg-white/90 backdrop-blur rounded-lg shadow-md border border-gray-200',
        accent: 'text-gray-700',
        icons: ['🕊️', '🌿', '✨', '🤍'],
        decorativeElements: {
          profileBadge: '🕊️',
          cornerPattern: 'peace-dove',
          headerIcon: '🌿'
        }
      }
    }
    return templates[templateId as keyof typeof templates] || templates['general-1']
  }

  const templateStyles = getTemplateStyles(profile?.template_id || 'general-1')
  

  return (
    <ResponsiveBackground 
      templateId={profile?.template_id || 'general-1'}
      className="min-h-screen relative"
    >
      {/* Template Background */}
      <TemplateBackground templateId={profile.template_id || 'template-1'} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="relative inline-block mb-8">
            <img
              src={getProxiedImageUrl(profile.profile_image_url)}
              alt={profile.profile_name}
              className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-2xl mx-auto"
            />
            {/* Badge decorativo según plantilla */}
            <div className="absolute -top-3 -right-3 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-gray-100">
              <span className="text-xl">{templateStyles.decorativeElements?.profileBadge || '🕊️'}</span>
            </div>

          </div>
          
          {/* Nombre con estilo conmemorativo */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            </div>
            <div className="relative inline-block">
              {/* Resplandor dorado más intenso */}
              <div className="absolute -inset-8 bg-gradient-to-r from-yellow-300/60 via-amber-400/70 to-yellow-300/60 blur-2xl rounded-full animate-pulse"></div>
              <div className="absolute -inset-4 bg-gradient-to-r from-amber-300/50 via-yellow-200/60 to-amber-300/50 blur-xl rounded-full"></div>
              <div className="absolute -inset-2 bg-gradient-to-r from-yellow-200/40 via-amber-100/50 to-yellow-200/40 blur-lg rounded-full"></div>
              
              {/* Contenedor del nombre */}
              <div className="relative z-10 bg-gradient-to-br from-white/98 via-amber-50/95 to-white/98 backdrop-blur-sm px-8 py-4 rounded-2xl shadow-2xl border border-amber-300/60">
                <h1 className="text-4xl font-serif text-gray-800 tracking-wide font-bold drop-shadow-lg">
                  {sanitizeText(profile.profile_name)}
                </h1>
              </div>
            </div>
          </div>
          
          {/* Fechas con diseño elegante */}
          <div className="mt-6 space-y-2 flex justify-center">
            <div className="relative inline-block px-8 py-6 bg-gradient-to-br from-white/95 via-blue-50/90 to-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50">
              <div className="flex items-center justify-center gap-4 text-gray-800">
                <div className="flex items-center gap-2">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="text-lg font-medium">{formatDate(profile.birth_date)}</span>
                </div>
                <div className="w-8 h-px bg-gradient-to-r from-gray-400 to-gray-600"></div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-medium">{formatDate(profile.death_date)}</span>
                  <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2L12 22M5 9L19 9" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-gray-600 italic mt-3 text-center">
                "En nuestros corazones por siempre"
              </p>
            </div>
          </div>
        </div>

        {/* Mensaje de cumpleaños */}
        {birthdayCelebration.birthdayMessage && (
          <div className="mb-8 text-center">
            <div className="inline-block bg-gradient-to-r from-pink-100 via-purple-100 to-pink-100 px-6 py-4 rounded-2xl shadow-lg border border-pink-200">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎂</span>
                <p className="text-lg font-medium text-pink-800">
                  {birthdayCelebration.birthdayMessage}
                </p>
                <span className="text-2xl">🎉</span>
              </div>
            </div>
          </div>
        )}

        {/* Barra decorativa con iconos */}
        <div className="relative mb-8">
          <div className="h-1 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full mx-8"></div>
          <div className="flex justify-center gap-6 -mt-4">
            {templateStyles.icons.map((icon, index) => (
              <div key={index} className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center">
                <span className="text-lg">{icon}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 1. En memoria */}
        {profile.description && (
          <div className={`${templateStyles.card} p-6 mb-8 relative overflow-hidden`}>
            {/* Patrón decorativo de fondo */}
            <div className="absolute top-0 right-0 w-20 h-20 opacity-5">
              <div className="text-6xl transform rotate-12">{templateStyles.icons[0]}</div>
            </div>
            <h2 className={`text-xl font-semibold ${templateStyles.accent} mb-4 flex items-center gap-2`}>
              <span>🌹</span> En memoria
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap relative z-10">{sanitizeText(profile.description)}</p>
          </div>
        )}

        {/* 2. Video Conmemorativo */}
        {profile.memorial_video_url && (
          <div className={`${templateStyles.card} p-6 mb-8 relative overflow-hidden`}>
            <div className="absolute top-0 left-0 w-16 h-16 opacity-5">
              <div className="text-4xl">🎥</div>
            </div>
            <h2 className={`text-xl font-semibold ${templateStyles.accent} mb-4 flex items-center gap-2`}>
              <span>🎥</span> Video conmemorativo
            </h2>
            <div className="aspect-video relative z-10">
              <video
                src={getProxiedImageUrl(profile.memorial_video_url)}
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
        {profile.gallery_images && profile.gallery_images.length > 0 && (
          <div className={`${templateStyles.card} p-6 mb-8`}>
            <h2 className={`text-xl font-semibold ${templateStyles.accent} mb-4 flex items-center gap-2`}>
              <span>🖼️</span> Galería de recuerdos
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {profile.gallery_images.slice(0, 6).map((image, index) => (
                <div 
                  key={index} 
                  className="relative group cursor-pointer overflow-hidden rounded-lg bg-gray-50 aspect-square" 
                  onClick={() => {
                    setModalImageIndex(index)
                    setModalOpen(true)
                  }}
                >
                  <img
                    src={getProxiedImageUrl(image)}
                    alt={`Recuerdo ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all flex items-center justify-center">
                    <span className="text-white opacity-0 group-hover:opacity-100 text-2xl">🔍</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Su canción Favorita */}
        <FavoriteMusic 
          favoriteMusic={profile.favorite_music || ''} 
          accentColor={templateStyles.accent}
        />

        {/* 5. Muro de los Recuerdos */}
        <MemoryWall 
          profileId={profile.id}
          profileName={profile.profile_name}
          profileSlug={profile.slug}
        />

        {/* Footer decorativo */}
        <div className="text-center py-8 space-y-4">
          <div className={`inline-flex items-center gap-2 px-4 py-2 ${templateStyles.card} rounded-full`}>
            <span>✨</span>
            <span className="text-sm text-gray-600">En memoria eterna</span>
            <span>✨</span>
          </div>
          
          {/* Botón para datos de tiempo */}
          <div>
            <button
              onClick={() => setTimeModalOpen(true)}
              className="px-8 py-4 bg-blue-600 text-white font-semibold text-lg rounded-lg shadow-xl hover:bg-blue-700 hover:shadow-2xl active:bg-blue-800 active:shadow-lg transition-all duration-150 cursor-pointer"
            >
              Ver Datos no Menos Importantes
            </button>
          </div>
        </div>
      </div>
      
      {/* Patrón decorativo de fondo */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 text-6xl opacity-5 transform -rotate-12">{templateStyles.icons[1]}</div>
        <div className="absolute top-32 right-16 text-4xl opacity-5 transform rotate-45">{templateStyles.icons[2]}</div>
        <div className="absolute bottom-20 left-20 text-5xl opacity-5 transform rotate-12">{templateStyles.icons[3]}</div>
        <div className="absolute bottom-40 right-10 text-3xl opacity-5 transform -rotate-45">{templateStyles.icons[0]}</div>
      </div>
      {/* Modal de imágenes */}
      <ImageModal
        images={profile.gallery_images || []}
        currentIndex={modalImageIndex}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />

      {/* Efecto de celebración de cumpleaños */}
      <CelebrationEffect 
        isActive={birthdayCelebration.isCelebrating}
        onComplete={birthdayCelebration.stopCelebration}
      />

      {/* Modal de tiempo memorial */}
      <MemorialTimeModal
        isOpen={timeModalOpen}
        onClose={() => setTimeModalOpen(false)}
        profileName={profile.profile_name}
        birthDate={profile.birth_date}
        deathDate={profile.death_date}
      />

      {/* Contador de visitas - esquina inferior derecha */}
      <div className="absolute bottom-4 right-4 z-10">
        <VisitCounter 
          slug={profile.slug} 
          initialCount={profile.visit_count || 0}
          className="bg-white/80 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg border border-gray-200/50"
        />
      </div>
    </ResponsiveBackground>
  )
}