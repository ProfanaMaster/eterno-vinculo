import { motion } from 'framer-motion'

interface Template {
  id: string
  name: string
  styles: {
    background: string
    card: string
    accent: string
  }
}

interface ProfileData {
  profile_name: string
  description: string
  birth_date: string
  death_date: string
  profile_image_url?: string
  gallery_images: string[]
}

interface MobileTemplatePreviewProps {
  template: Template
  profileData: ProfileData
}

const MobileTemplatePreview = ({ template, profileData }: MobileTemplatePreviewProps) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="max-w-sm mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`min-h-screen ${template.styles.background}`}
      >
        {/* Header */}
        <div className="pt-8 pb-4 px-4 text-center">
          <h1 className={`text-2xl font-bold mb-2 ${template.styles.accent}`}>
            En Memoria de
          </h1>
        </div>

        {/* Profile Photo */}
        <div className="px-4 mb-6">
          <div className={`${template.styles.card} p-6 text-center`}>
            <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-gray-200">
              {profileData.profile_image_url ? (
                <img 
                  src={profileData.profile_image_url} 
                  alt={profileData.profile_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {profileData.profile_name || 'Nombre del Memorial'}
            </h2>
            
            {(profileData.birth_date || profileData.death_date) && (
              <p className="text-gray-600 mb-4">
                {formatDate(profileData.birth_date)} - {formatDate(profileData.death_date)}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        {profileData.description && (
          <div className="px-4 mb-6">
            <div className={`${template.styles.card} p-4`}>
              <h3 className={`font-semibold mb-2 ${template.styles.accent}`}>
                Mensaje Memorial
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {profileData.description}
              </p>
            </div>
          </div>
        )}

        {/* Gallery Preview */}
        {profileData.gallery_images.length > 0 && (
          <div className="px-4 mb-6">
            <div className={`${template.styles.card} p-4`}>
              <h3 className={`font-semibold mb-3 ${template.styles.accent}`}>
                Galería de Recuerdos
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {profileData.gallery_images.slice(0, 6).map((image, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-200">
                    <img 
                      src={image} 
                      alt={`Recuerdo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-4 pb-8">
          <div className={`${template.styles.card} p-4 text-center`}>
            <p className="text-sm text-gray-500">
              Memorial creado con amor
            </p>
            <p className={`text-xs mt-1 ${template.styles.accent}`}>
              Eterno Vínculo
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default MobileTemplatePreview