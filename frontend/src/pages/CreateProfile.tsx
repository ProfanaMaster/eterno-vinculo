import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { api } from '@/services/api'
import { useNavigate } from 'react-router-dom'
import UploadService from '@/services/uploadService'
import Toast from '@/components/Toast'
import { sanitizeFilename } from '@/utils/sanitize'
import '@/styles/datepicker.css'

function CreateProfile() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    // Plantillas hardcodeadas
    setTemplates([
      {
        id: 'template-1',
        name: 'Olas atardecer',
        description: 'Video de olas con fondo móvil',
        icons: ['🌊']
      },
      {
        id: 'template-2',
        name: 'Un Viaje',
        description: 'Video de viaje con fondo móvil',
        icons: ['✈️']
      },
      {
        id: 'template-3',
        name: 'Nubes',
        description: 'Video de nubes con fondo móvil',
        icons: ['☁️']
      },
      {
        id: 'template-4',
        name: 'Girasoles',
        description: 'Video de girasoles con fondo móvil',
        icons: ['🌻']
      }
    ])
  }, [])
  
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '2000-12-01',
    deathDate: '',
    description: '',
    profileImage: null as File | null,

    galleryImages: [] as File[],
    video: null as File | null,
    template_id: 'template-1',
    favoriteMusic: ''
  })

  const [errors, setErrors] = useState<any>({})
  const [showErrors, setShowErrors] = useState(false)

  const [templates, setTemplates] = useState<any[]>([])
  const [toast, setToast] = useState({ message: '', type: 'info' as 'success' | 'error' | 'info', isVisible: false })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateImageFile = (file: File): string | null => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return 'Solo se permiten archivos JPG y PNG'
    }
    if (file.size > 10 * 1024 * 1024) {
      return 'La imagen debe ser menor a 10MB'
    }
    const sanitizedName = sanitizeFilename(file.name)
    if (!sanitizedName) {
      return 'Nombre de archivo no válido'
    }
    return null
  }

  const validateVideoFile = (file: File): string | null => {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return 'Solo se permiten videos MP4, WebM, MOV y AVI'
    }
    if (file.size > 50 * 1024 * 1024) {
      return `El video debe ser menor a 50MB.\n\n📱 Puedes usar apps como:\n• Video Compressor (Android/iOS)\n• Compress Videos & Resize Video\n\n💻 O sitios web como:\n• cloudconvert.com\n• freeconvert.com\n• compressvideo.io`
    }
    const sanitizedName = sanitizeFilename(file.name)
    if (!sanitizedName) {
      return 'Nombre de archivo no válido'
    }
    return null
  }

  const handleFileChange = (field: string, files: FileList | null) => {
    if (!files) return
    
    if (field === 'profileImage') {
      const error = validateImageFile(files[0])
      if (error) {
        setToast({ message: error, type: 'error', isVisible: true })
        return
      }
      setFormData(prev => ({ ...prev, profileImage: files[0] }))

    } else if (field === 'galleryImages') {
      const validFiles: File[] = []
      Array.from(files).slice(0, 6).forEach(file => {
        const error = validateImageFile(file)
        if (error) {
          setToast({ message: `${file.name}: ${error}`, type: 'error', isVisible: true })
        } else {
          validFiles.push(file)
        }
      })
      if (validFiles.length > 0) {
        setFormData(prev => ({ ...prev, galleryImages: [...prev.galleryImages, ...validFiles].slice(0, 6) }))
      }
    } else if (field === 'video') {
      const error = validateVideoFile(files[0])
      if (error) {
        setToast({ message: error, type: 'error', isVisible: true })
        return
      }
      setFormData(prev => ({ ...prev, video: files[0] }))
    }
  }

  const removeGalleryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      let profileImageUrl = 'https://via.placeholder.com/400x400?text=Foto+de+Perfil'

      let galleryImageUrls: string[] = []
      let videoUrl: string | null = null

      // Subir imagen de perfil
      if (formData.profileImage) {
        try {
          UploadService.validateImageFile(formData.profileImage)
          profileImageUrl = await UploadService.uploadImage(formData.profileImage, 'profile')
        } catch (error: any) {
          setToast({ message: `Error subiendo imagen de perfil: ${error.message}`, type: 'error', isVisible: true })
          return
        }
      }



      // Subir imágenes de galería
      if (formData.galleryImages.length > 0) {
        try {
          formData.galleryImages.forEach(img => UploadService.validateImageFile(img))
          galleryImageUrls = await UploadService.uploadGalleryImages(formData.galleryImages)
        } catch (error: any) {
          setToast({ message: `Error subiendo galería: ${error.message}`, type: 'error', isVisible: true })
          return
        }
      }

      // Subir video
      if (formData.video) {
        try {
          UploadService.validateVideoFile(formData.video)
          videoUrl = await UploadService.uploadVideo(formData.video)
        } catch (error: any) {
          setToast({ message: `Error subiendo video: ${error.message}`, type: 'error', isVisible: true })
          return
        }
      }

      const profileData = {
        profile_name: formData.name,
        description: formData.description,
        birth_date: formData.birthDate,
        death_date: formData.deathDate,
        profile_image_url: profileImageUrl,

        gallery_images: galleryImageUrls,
        memorial_video_url: videoUrl,
        template_id: formData.template_id,
        favorite_music: formData.favoriteMusic
      }

      const response = await api.post('/profiles', profileData)
      
      if (response.data.success) {
        setToast({ message: '¡Memorial creado exitosamente!', type: 'success', isVisible: true })
        setTimeout(() => navigate('/dashboard'), 2000)
      }
    } catch (error) {
      console.error('Error creating profile:', error)
      setToast({ message: `Error al crear el memorial: ${(error as any).response?.data?.error || (error as any).message}`, type: 'error', isVisible: true })
    } finally {
      setLoading(false)
    }
  }

  const validateStep1 = () => {
    const newErrors: any = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido'
    }
    
    if (!formData.birthDate) {
      newErrors.birthDate = 'La fecha de nacimiento es requerida'
    }
    
    if (!formData.deathDate) {
      newErrors.deathDate = 'La fecha de fallecimiento es requerida'
    }
    
    if (!formData.template_id || formData.template_id === 'default') {
      newErrors.template_id = 'Debes seleccionar una plantilla de diseño'
    }
    
    if (formData.birthDate && formData.deathDate) {
      if (new Date(formData.deathDate) <= new Date(formData.birthDate)) {
        newErrors.deathDate = 'Debe ser posterior a la fecha de nacimiento'
      }
    }
    
    if (formData.deathDate && new Date(formData.deathDate) > new Date()) {
      newErrors.deathDate = 'No puede ser una fecha futura'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (step === 1) {
      setShowErrors(true)
      if (!validateStep1()) {
        setToast({ message: 'Por favor completa todos los campos requeridos', type: 'error', isVisible: true })
        return
      }
    }
    if (step < 3) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Crear Perfil Memorial
          </h1>
          <p className="text-lg text-gray-600">
            Paso {step} de 3
          </p>
        </div>

        {/* Indicador de pasos */}
        <div className="flex justify-center mb-8">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                num === step ? 'bg-blue-600 text-white' : 
                num < step ? 'bg-green-500 text-white' : 
                'bg-gray-200 text-gray-600'
              }`}>
                {num < step ? '✓' : num}
              </div>
              {num < 3 && <div className="w-12 h-0.5 bg-gray-200 mx-2"></div>}
            </div>
          ))}
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="card">
            {step === 1 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Información Básica</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        showErrors && errors.name 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="Ej: María Elena González"
                    />
                    {showErrors && errors.name && (
                      <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de nacimiento *
                      </label>
                      <input
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => handleInputChange('birthDate', e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        className={`w-full px-4 py-3 border rounded-lg text-base focus:outline-none focus:ring-2 ${
                          showErrors && errors.birthDate 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        style={{
                          colorScheme: 'light',
                          fontSize: '16px'
                        }}
                      />
                      {showErrors && errors.birthDate && (
                        <p className="text-red-600 text-sm mt-1">{errors.birthDate}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de fallecimiento *
                      </label>
                      <input
                        type="date"
                        value={formData.deathDate}
                        onChange={(e) => handleInputChange('deathDate', e.target.value)}
                        min={formData.birthDate}
                        max={new Date().toISOString().split('T')[0]}
                        className={`w-full px-4 py-3 border rounded-lg text-base focus:outline-none focus:ring-2 ${
                          showErrors && errors.deathDate 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        style={{
                          colorScheme: 'light',
                          fontSize: '16px'
                        }}
                      />
                      {showErrors && errors.deathDate && (
                        <p className="text-red-600 text-sm mt-1">{errors.deathDate}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Plantilla de diseño *
                    </label>
                    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 ${
                      showErrors && errors.template_id ? 'border-2 border-red-200 rounded-lg p-2' : ''
                    }`}>
                      {templates.map((template: any) => (
                        <div
                          key={template.id}
                          onClick={() => handleInputChange('template_id', template.id)}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            formData.template_id === template.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">
                              {template.icons?.[0] || '🎨'}
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{template.name}</h3>
                              <p className="text-sm text-gray-600">{template.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {showErrors && errors.template_id && (
                      <p className="text-red-600 text-sm mt-1">{errors.template_id}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Su canción favorita (opcional)
                    </label>
                    <input
                      type="text"
                      value={formData.favoriteMusic}
                      onChange={(e) => handleInputChange('favoriteMusic', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: Imagine - John Lennon, o URL de YouTube"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      🎵 Puedes escribir el nombre de la canción o pegar un enlace de YouTube
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción inicial (opcional)
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Escribe una breve descripción..."
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Fotos y Videos (Opcional)</h2>
                
                {/* Información de formatos */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-blue-900 mb-2">📋 Formatos permitidos:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                    <div>
                      <p className="font-medium">📷 Imágenes:</p>
                      <ul className="ml-4 space-y-1">
                        <li>• Solo JPG y PNG</li>
                        <li>• Máximo 10MB</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium">🎥 Videos:</p>
                      <ul className="ml-4 space-y-1">
                        <li>• MP4, WebM, MOV, AVI</li>
                        <li>• Máximo 50MB</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-yellow-800">
                      💡 <strong>Video muy grande?</strong> Usa apps como Video Compressor o sitios como cloudconvert.com
                    </p>
                  </div>
                </div>

                <div className="space-y-6">


                  {/* Foto de perfil */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="text-center">
                      <div className="text-gray-400 mb-4">
                        📷 Foto de perfil (Opcional)
                      </div>
                      {formData.profileImage ? (
                        <div className="space-y-3">
                          <img 
                            src={URL.createObjectURL(formData.profileImage)} 
                            alt="Preview" 
                            className="w-32 h-32 object-cover rounded-full mx-auto border-4 border-white shadow-lg"
                          />
                          <p className="text-sm text-gray-600">{formData.profileImage.name}</p>
                          <button 
                            onClick={() => setFormData(prev => ({ ...prev, profileImage: null }))}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Cambiar imagen
                          </button>
                        </div>
                      ) : (
                        <div>
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png"
                            onChange={(e) => handleFileChange('profileImage', e.target.files)}
                            className="hidden"
                            id="profileImage"
                          />
                          <label htmlFor="profileImage" className="btn btn-secondary cursor-pointer">
                            Seleccionar imagen
                          </label>
                          <p className="text-xs text-gray-500 mt-2">JPG/PNG • Máx. 10MB</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Galería */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="text-center mb-4">
                      <div className="text-gray-400 mb-4">
                        🖼️ Galería (hasta 6 fotos)
                      </div>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        multiple
                        onChange={(e) => handleFileChange('galleryImages', e.target.files)}
                        className="hidden"
                        id="galleryImages"
                      />
                      <label htmlFor="galleryImages" className="btn btn-secondary cursor-pointer">
                        Agregar fotos ({formData.galleryImages.length}/6)
                      </label>
                      <p className="text-xs text-gray-500 mt-2">JPG/PNG • Máx. 5MB c/u</p>
                    </div>
                    
                    {formData.galleryImages.length > 0 && (
                      <div className="grid grid-cols-3 gap-3 mt-4">
                        {formData.galleryImages.map((image, index) => (
                          <div key={index} className="relative">
                            <img 
                              src={URL.createObjectURL(image)} 
                              alt={`Gallery ${index + 1}`} 
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              onClick={() => removeGalleryImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Video */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <div className="text-gray-400 mb-4">
                      🎥 Video memorial (opcional)
                    </div>
                    {formData.video ? (
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600">{formData.video.name}</p>
                        <button 
                          onClick={() => setFormData(prev => ({ ...prev, video: null }))}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Cambiar video
                        </button>
                      </div>
                    ) : (
                      <div>
                        <input
                          type="file"
                          accept=".mp4,.webm,.mov,.avi"
                          onChange={(e) => handleFileChange('video', e.target.files)}
                          className="hidden"
                          id="video"
                        />
                        <label htmlFor="video" className="btn btn-secondary cursor-pointer">
                          Subir video
                        </label>
                        <p className="text-xs text-gray-500 mt-2">MP4/WebM/MOV/AVI • Máx. 50MB</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Revisión Final</h2>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-3">Información del perfil:</h3>
                    <div className="space-y-2">
                      <p><strong>Nombre:</strong> {formData.name || 'No especificado'}</p>
                      <p><strong>Nacimiento:</strong> {formData.birthDate || 'No especificado'}</p>
                      <p><strong>Fallecimiento:</strong> {formData.deathDate || 'No especificado'}</p>
                      {formData.description && (
                        <p><strong>Descripción:</strong> {formData.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-3">Archivos seleccionados:</h3>
                    <div className="space-y-2">
                      <p><strong>Foto de perfil:</strong> {formData.profileImage ? '✓ Seleccionada' : '✗ No seleccionada'}</p>
                      <p><strong>Galería:</strong> {formData.galleryImages.length} fotos</p>
                      <p><strong>Video:</strong> {formData.video ? '✓ Seleccionado' : 'No seleccionado'}</p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 text-sm">
                      ✨ Una vez creado, estará publicado online y podrás compartirlo con tus seres queridos.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Botones de navegación */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <div>
                {step > 1 && (
                  <button onClick={prevStep} className="btn btn-secondary">
                    ← Anterior
                  </button>
                )}
              </div>
              
              <div>
                {step < 3 ? (
                  <button 
                    onClick={nextStep}
                    className="btn btn-primary"
                  >
                    Siguiente →
                  </button>
                ) : (
                  <button 
                    onClick={handleSubmit}
                    disabled={loading || !formData.name || !formData.birthDate || !formData.deathDate}
                    className="btn btn-primary"
                  >
                    {loading ? 'Creando...' : '🚀 Crear Memorial'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Botón para volver */}
        <div className="text-center mt-8">
          <button 
            onClick={() => window.location.href = '/'}
            className="text-gray-600 hover:text-gray-800"
          >
            ← Volver al inicio
          </button>
        </div>
      </div>

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  )
}

export default CreateProfile