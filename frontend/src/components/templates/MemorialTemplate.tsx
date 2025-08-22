import { ResponsiveBackground } from '@/components/ui'
import { getProxiedImageUrl } from '@/utils/imageUtils'
import { sanitizeText } from '@/utils/sanitize'

interface MemorialTemplateProps {
  templateId: string
  profileData: {
    profile_name: string
    description: string
    birth_date: string
    death_date: string
    profile_image_url?: string
    gallery_images?: string[]
  }
}

const MemorialTemplate = ({ templateId, profileData }: MemorialTemplateProps) => {
  return (
    <ResponsiveBackground 
      templateId={templateId}
      className="min-h-screen"
    >
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-white/90 backdrop-blur">
              {profileData.profile_image_url ? (
                <img 
                  src={getProxiedImageUrl(profileData.profile_image_url)} 
                  alt={profileData.profile_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-500 text-4xl">👤</span>
                </div>
              )}
            </div>
            <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
              {sanitizeText(profileData.profile_name)}
            </h1>
            <p className="text-white/90 text-lg drop-shadow">
              {profileData.birth_date} - {profileData.death_date}
            </p>
          </div>

          {/* Description */}
          <div className="bg-white/90 backdrop-blur rounded-lg p-6 mb-8">
            <p className="text-gray-800 leading-relaxed">
              {sanitizeText(profileData.description)}
            </p>
          </div>

          {/* Gallery */}
          {profileData.gallery_images && profileData.gallery_images.length > 0 && (
            <div className="bg-white/90 backdrop-blur rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Galería de Recuerdos</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {profileData.gallery_images.map((image, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden">
                    <img 
                      src={getProxiedImageUrl(image)} 
                      alt={`Recuerdo ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ResponsiveBackground>
  )
}

export default MemorialTemplate