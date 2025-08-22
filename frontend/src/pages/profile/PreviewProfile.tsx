import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/services/api'
import FavoriteMusic from '@/components/FavoriteMusic'
import ImageModal from '@/components/ImageModal'
import { ResponsiveBackground } from '@/components/ui'
import TemplateBackground from '@/components/profile/TemplateBackground'
import { getProxiedImageUrl } from '@/utils/imageUtils'

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
  is_published: boolean
  favorite_music?: string
  template_id?: string
}

export default function PreviewProfile() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalImageIndex, setModalImageIndex] = useState(0)
  const [refreshKey] = useState(Date.now()) // Forzar actualización

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get(`/profiles/preview/${slug}`)
        setProfile(response.data.data)
      } catch (err: any) {
        setError(err.response?.data?.error || 'Error al cargar el memorial')
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
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Volver al Dashboard
          </button>
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
      key={refreshKey}
      templateId={profile?.template_id || 'template-1'}
      className="min-h-screen"
    >
      {/* Header privado */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold">Vista Previa - {profile.profile_name}</h1>
            <p className="text-sm text-gray-600">
              {profile.is_published ? '🌐 Publicado' : '📝 Borrador'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-3 py-2 text-gray-600 hover:text-gray-800 text-sm sm:text-base"
            >
              ← Dashboard
            </button>
            {profile.is_published && (
              <>
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/memorial/${profile.slug}`
                    navigator.clipboard.writeText(url)
                    alert('Enlace copiado al portapapeles')
                  }}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                  </svg>
                  <span className="hidden sm:inline">Compartir</span>
                  <span className="sm:hidden">📤</span>
                </button>
                <button
                  onClick={() => window.open(`/memorial/${profile.slug}`, '_blank')}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm sm:text-base whitespace-nowrap"
                >
                  <span className="hidden sm:inline">Ver Público</span>
                  <span className="sm:hidden">👁️</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

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
            <div className="absolute -top-3 -right-3 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-gray-100">
              <span className="text-xl">{templateStyles.decorativeElements?.profileBadge || '🕊️'}</span>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            </div>
            <div className="relative inline-block">
              <div className="absolute -inset-8 bg-gradient-to-r from-yellow-300/60 via-amber-400/70 to-yellow-300/60 blur-2xl rounded-full animate-pulse"></div>
              <div className="absolute -inset-4 bg-gradient-to-r from-amber-300/50 via-yellow-200/60 to-amber-300/50 blur-xl rounded-full"></div>
              <div className="absolute -inset-2 bg-gradient-to-r from-yellow-200/40 via-amber-100/50 to-yellow-200/40 blur-lg rounded-full"></div>
              
              <div className="relative z-10 bg-gradient-to-br from-white/98 via-amber-50/95 to-white/98 backdrop-blur-sm px-8 py-4 rounded-2xl shadow-2xl border border-amber-300/60">
                <h1 className="text-4xl font-serif text-gray-800 tracking-wide font-bold drop-shadow-lg">
                  {profile.profile_name}
                </h1>
              </div>
            </div>
          </div>
          
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-center gap-4 text-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📖</span>
                <span className="text-lg font-medium">{formatDate(profile.birth_date)}</span>
              </div>
              <div className="w-8 h-px bg-gradient-to-r from-gray-400 to-gray-600"></div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">✝️</span>
                <span className="text-lg font-medium">{formatDate(profile.death_date)}</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 italic mt-3">
              “En nuestros corazones por siempre”
            </p>
          </div>
        </div>

        {/* Barra decorativa */}
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

        {/* Description */}
        {profile.description && (
          <div className={`${templateStyles.card} p-6 mb-8 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-20 h-20 opacity-5">
              <div className="text-6xl transform rotate-12">{templateStyles.icons[0]}</div>
            </div>
            <h2 className={`text-xl font-semibold ${templateStyles.accent} mb-4 flex items-center gap-2`}>
              <span>🌹</span> En memoria
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap relative z-10">{profile.description}</p>
          </div>
        )}

        {/* Favorite Music */}
        <FavoriteMusic 
          favoriteMusic={profile.favorite_music || ''} 
          accentColor={templateStyles.accent}
        />

        {/* Gallery */}
        {profile.gallery_images && profile.gallery_images.length > 0 && (
          <div className={`${templateStyles.card} p-6 mb-8`}>
            <h2 className={`text-xl font-semibold ${templateStyles.accent} mb-4 flex items-center gap-2`}>
              <span>🖼️</span> Galería de recuerdos
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {profile.gallery_images.slice(0, 6).map((image, index) => (
                <div 
                  key={index} 
                  className="relative group cursor-pointer" 
                  onClick={() => {
                    setModalImageIndex(index)
                    setModalOpen(true)
                  }}
                >
                  <img
                    src={getProxiedImageUrl(image)}
                    alt={`Recuerdo ${index + 1}`}
                    className="w-full h-40 object-cover rounded-lg transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all flex items-center justify-center">
                    <span className="text-white opacity-0 group-hover:opacity-100 text-2xl">🔍</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Video */}
        {profile.memorial_video_url && (
          <div className={`${templateStyles.card} p-6 relative overflow-hidden`}>
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
              >
                Tu navegador no soporta el elemento de video.
              </video>
            </div>
          </div>
        )}
      </div>
      {/* Modal de imágenes */}
      <ImageModal
        images={profile.gallery_images || []}
        currentIndex={modalImageIndex}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </ResponsiveBackground>
  )
}