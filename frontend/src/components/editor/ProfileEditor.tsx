import { useState } from 'react'
import { motion } from 'framer-motion'
import ImageUpload from './ImageUpload'
import VideoUpload from './VideoUpload'
import GalleryUpload from './GalleryUpload'
import DescriptionEditor from './DescriptionEditor'
import { sanitizeText } from '@/utils/sanitize'

interface ProfileData {
  profile_name: string
  description: string
  birth_date: string
  death_date: string
  profile_image_url?: string

  gallery_images?: string[]
  memorial_video_url?: string
}

interface ProfileEditorProps {
  initialData?: Partial<ProfileData>
  onSave: (data: ProfileData) => void
  onNext?: () => void
  onPrev?: () => void
  canGoNext?: boolean
  canGoPrev?: boolean
}

const ProfileEditor = ({ 
  initialData = {}, 
  onSave, 
  onNext, 
  onPrev, 
  canGoNext, 
  canGoPrev 
}: ProfileEditorProps) => {
  const [profileData, setProfileData] = useState<ProfileData>({
    profile_name: '',
    description: '',
    birth_date: '',
    death_date: '',
    ...initialData
  })

  const updateField = (field: keyof ProfileData, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    onSave(profileData)
    if (onNext) onNext()
  }

  return (
    <div className="space-y-8">
      {/* Información básica */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del perfil
          </label>
          <input
            type="text"
            value={profileData.profile_name}
            onChange={(e) => updateField('profile_name', sanitizeText(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nombre completo"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de nacimiento
            </label>
            <input
              type="date"
              value={profileData.birth_date}
              onChange={(e) => updateField('birth_date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de fallecimiento
            </label>
            <input
              type="date"
              value={profileData.death_date}
              onChange={(e) => updateField('death_date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Imágenes principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ImageUpload
          label="Foto de perfil"
          type="profile"
          currentImage={profileData.profile_image_url}
          onImageUploaded={(url) => updateField('profile_image_url', url)}
        />
        

      </div>

      {/* Descripción */}
      <DescriptionEditor
        value={profileData.description}
        onChange={(value) => updateField('description', value)}
      />

      {/* Galería de fotos */}
      <GalleryUpload
        images={profileData.gallery_images || []}
        onImagesChange={(images) => updateField('gallery_images', images)}
        maxImages={6}
      />

      {/* Video conmemorativo */}
      <VideoUpload
        currentVideo={profileData.memorial_video_url}
        onVideoUploaded={(url) => updateField('memorial_video_url', url)}
      />

      {/* Botones de navegación */}
      <div className="flex justify-between pt-6">
        {canGoPrev && (
          <button
            onClick={onPrev}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Anterior
          </button>
        )}
        
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ml-auto"
        >
          {canGoNext ? 'Continuar' : 'Guardar'}
        </button>
      </div>
    </div>
  )
}

export default ProfileEditor