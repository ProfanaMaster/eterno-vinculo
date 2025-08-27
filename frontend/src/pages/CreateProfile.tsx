import { useState, useEffect } from 'react'

import { api } from '@/services/api'
import { useNavigate, useParams } from 'react-router-dom'
import UploadService from '@/services/uploadService'
import Toast from '@/components/Toast'
import { sanitizeFilename } from '@/utils/sanitize'
import { ProfileRestrictionsService } from '@/services/profileRestrictions'
import { logger } from '@/utils/logger'
import '@/styles/datepicker.css'

function CreateProfile() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [canCreateProfile, setCanCreateProfile] = useState(true)
  const [restrictionMessage, setRestrictionMessage] = useState('')
  const [quotasInfo, setQuotasInfo] = useState('')
  const [checkingRestrictions, setCheckingRestrictions] = useState(true)

  const navigate = useNavigate()
  const { id } = useParams()

  useEffect(() => {
    // Verificar restricciones solo si no está en modo edición
    if (!id) {
      checkProfileRestrictions()
    } else {
      setCheckingRestrictions(false)
    }
  }, [id])

  const checkProfileRestrictions = async () => {
    try {
      const restriction = await ProfileRestrictionsService.canUserCreateProfile()
      setCanCreateProfile(restriction.canCreate)
      setQuotasInfo(ProfileRestrictionsService.getQuotasInfo(restriction))
      
      if (!restriction.canCreate) {
        setRestrictionMessage(ProfileRestrictionsService.getRestrictionMessage(restriction))
      }
    } catch (error) {
      console.error('Error verificando restricciones:', error)
      setCanCreateProfile(false)
      setRestrictionMessage('Error verificando permisos. Inténtalo más tarde.')
      setQuotasInfo('Error obteniendo información de cuotas')
    } finally {
      setCheckingRestrictions(false)
    }
  }

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
      },
      {
        id: 'template-5',
        name: 'Gatos',
        description: 'Para amantes de los felinos',
        icons: ['🐱']
      },
      {
        id: 'template-6',
        name: 'Perros',
        description: 'Para amantes de los caninos',
        icons: ['🐶']
      },
      {
        id: 'template-7',
        name: 'América',
        description: 'Temática del equipo América',
        icons: ['⚽']
      },
      {
        id: 'template-8',
        name: 'Cali',
        description: 'Temática del equipo Deportivo Cali',
        icons: ['🌴']
      }
    ])
    
    // Si hay ID en la URL, es modo edición
    if (id) {
      setIsEditing(true)
      loadMemorialData(id)
    }
  }, [id])
  
  const loadMemorialData = async (memorialId: string) => {
    try {
      setLoading(true)
      const response = await api.get(`/profiles/${memorialId}`)
      const memorial = response.data.data
      
      setFormData({
        name: memorial.profile_name || '',
        birthDate: memorial.birth_date || '',
        deathDate: memorial.death_date || '',
        description: memorial.description || '',
        profileImage: null,
        galleryImages: [],
        video: null,
        template_id: memorial.template_id || 'template-1',
        favoriteMusic: memorial.favorite_music || ''
      })
    } catch (error) {
      console.error('Error loading memorial:', error)
      setToast({ message: 'Error al cargar el memorial', type: 'error', isVisible: true })
    } finally {
      setLoading(false)
    }
  }
  
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
    if (file.size > 65 * 1024 * 1024) {
      return `El video debe ser menor a 65MB.\n\n📱 Puedes usar apps como:\n• Video Compressor (Android/iOS)\n• Compress Videos & Resize Video\n\n💻 O sitios web como:\n• cloudconvert.com\n• freeconvert.com\n• compressvideo.io`
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

  const [uploadProgress, setUploadProgress] = useState({
    profile: 0,
    gallery: 0,
    video: 0,
    currentFile: '',
    isUploading: false
  })

  const handleSubmit = async () => {
    setLoading(true)
    setUploadProgress(prev => ({ ...prev, isUploading: true }))
    
    try {
      let profileImageUrl = 'https://via.placeholder.com/400x400?text=Foto+de+Perfil'
      let galleryImageUrls: string[] = []
      let videoUrl: string | null = null

      // Subir imagen de perfil
      if (formData.profileImage) {
        try {
          setUploadProgress(prev => ({ ...prev, currentFile: 'Imagen de perfil', profile: 0 }))
          
          profileImageUrl = await UploadService.uploadImage(
            formData.profileImage, 
            'profile',
            (progress) => {
              setUploadProgress(prev => ({ 
                ...prev, 
                profile: progress.percentage,
                currentFile: `Imagen de perfil (${progress.percentage}%)`
              }))
            }
          )
          
          setUploadProgress(prev => ({ ...prev, profile: 100 }))
          logger.log('✅ Imagen de perfil subida:', profileImageUrl)
        } catch (error: any) {
          console.error('❌ Error subiendo imagen de perfil:', error)
          setToast({ 
            message: `Error subiendo imagen de perfil: ${error.message}`, 
            type: 'error', 
            isVisible: true 
          })
          return
        }
      }

      // Subir imágenes de galería
      if (formData.galleryImages.length > 0) {
        try {
          setUploadProgress(prev => ({ ...prev, currentFile: 'Galería de imágenes', gallery: 0 }))
          
          galleryImageUrls = await UploadService.uploadGalleryImages(
            formData.galleryImages,
            (fileIndex, progress) => {
              const totalProgress = Math.round(((fileIndex * 100) + progress.percentage) / formData.galleryImages.length)
              setUploadProgress(prev => ({ 
                ...prev, 
                gallery: totalProgress,
                currentFile: `Galería ${fileIndex + 1}/${formData.galleryImages.length} (${progress.percentage}%)`
              }))
            },
            (fileIndex, url) => {
              logger.log(`✅ Imagen ${fileIndex + 1} subida:`, url)
            }
          )
          
          setUploadProgress(prev => ({ ...prev, gallery: 100 }))
          logger.log('✅ Galería completa subida:', galleryImageUrls)
        } catch (error: any) {
          console.error('❌ Error subiendo galería:', error)
          setToast({ 
            message: `Error subiendo galería: ${error.message}`, 
            type: 'error', 
            isVisible: true 
          })
          return
        }
      }

      // Subir video
      if (formData.video) {
        try {
          setUploadProgress(prev => ({ ...prev, currentFile: 'Video memorial', video: 0 }))
          
          videoUrl = await UploadService.uploadVideo(
            formData.video,
            (progress) => {
              setUploadProgress(prev => ({ 
                ...prev, 
                video: progress.percentage,
                currentFile: `Video memorial (${progress.percentage}%)`
              }))
            }
          )
          
          setUploadProgress(prev => ({ ...prev, video: 100 }))
          logger.log('✅ Video subido:', videoUrl)
        } catch (error: any) {
          console.error('❌ Error subiendo video:', error)
          setToast({ 
            message: `Error subiendo video: ${error.message}`, 
            type: 'error', 
            isVisible: true 
          })
          return
        }
      }

      // Crear perfil en base de datos
      setUploadProgress(prev => ({ ...prev, currentFile: 'Guardando memorial...' }))
      
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

      let response
      if (isEditing && id) {
        response = await api.put(`/profiles/${id}`, profileData)
      } else {
        response = await api.post('/profiles', profileData)
      }
      
      if (response.data.success) {
        const message = isEditing ? '¡Memorial actualizado exitosamente!' : '¡Memorial creado exitosamente!'
        setToast({ message, type: 'success', isVisible: true })
        
        // Resetear progreso
        setUploadProgress({
          profile: 0,
          gallery: 0,
          video: 0,
          currentFile: '',
          isUploading: false
        })
        
        setTimeout(() => {
          // Navegar con parámetro para indicar actualización necesaria
          navigate('/dashboard?refresh=true')
        }, 2000)
      }
    } catch (error) {
      console.error('❌ Error creating profile:', error)
      setToast({ 
        message: `Error al crear el memorial: ${(error as any).response?.data?.error || (error as any).message}`, 
        type: 'error', 
        isVisible: true 
      })
    } finally {
      setLoading(false)
      setUploadProgress(prev => ({ ...prev, isUploading: false }))
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

  // Mostrar mensaje de carga mientras verifica restricciones
  if (checkingRestrictions) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    )
  }

  // Mostrar mensaje de restricción si no puede crear
  if (!canCreateProfile && !isEditing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">No puedes crear un memorial</h2>
            <p className="text-gray-600 mb-6">{restrictionMessage}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
            >
              Volver al Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {isEditing ? 'Editar Memorial' : 'Crear Perfil Memorial'}
          </h1>
          <p className="text-lg text-gray-600">
            Paso {step} de 3
          </p>
          {!isEditing && quotasInfo && (
            <div className="mt-4 inline-block bg-blue-50 px-4 py-2 rounded-full">
              <span className="text-blue-600 text-sm font-medium">
                📊 {quotasInfo}
              </span>
            </div>
          )}
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
                      Nombre de la persona que honras *
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
                        max={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]}
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
                        max={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]}
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
                      Selecciona una plantilla de diseño *
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
                      🎵 Debes pegar el vínculo o URL de la canción.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Escribre un mensaje conmemorativo (opcional)
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
                        <li>• Máximo 2MB por imagen</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium">🎥 Videos:</p>
                      <ul className="ml-4 space-y-1">
                        <li>• MP4, WebM, MOV, AVI</li>
                        <li>• Máximo 65MB</li>
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
                          <p className="text-xs text-gray-500 mt-2">JPG/PNG • Máx. 2MB por imagen</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Galería */}
                  <div className={`border-2 border-dashed rounded-lg p-6 ${isEditing ? 'border-gray-200 bg-gray-50' : 'border-gray-300'}`}>
                    <div className="text-center mb-4">
                      <div className={`mb-4 ${isEditing ? 'text-gray-400' : 'text-gray-400'}`}>
                        🖼️ Galería (hasta 6 fotos)
                      </div>
                      {isEditing ? (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <p className="text-yellow-800 text-sm mb-2">
                            🚫 <strong>Función deshabilitada en edición</strong>
                          </p>
                          <p className="text-yellow-700 text-xs">
                            Si deseas cargar más archivos, comunícate con soporte
                          </p>
                        </div>
                      ) : (
                        <>
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
                          <p className="text-xs text-gray-500 mt-2">JPG/PNG • Máx. 2MB c/u</p>
                        </>
                      )}
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
                  <div className={`border-2 border-dashed rounded-lg p-6 text-center ${isEditing ? 'border-gray-200 bg-gray-50' : 'border-gray-300'}`}>
                    <div className={`mb-4 ${isEditing ? 'text-gray-400' : 'text-gray-400'}`}>
                      🎥 Video memorial (opcional)
                    </div>
                    {isEditing ? (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-yellow-800 text-sm mb-2">
                          🚫 <strong>Función deshabilitada en edición</strong>
                        </p>
                        <p className="text-yellow-700 text-xs">
                          Si deseas cargar más archivos, comunícate con soporte
                        </p>
                      </div>
                    ) : formData.video ? (
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
                        <p className="text-xs text-gray-500 mt-2">MP4/WebM/MOV/AVI • Máx. 65MB</p>
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
                      {formData.favoriteMusic && (
                        <p><strong>Música favorita:</strong> {formData.favoriteMusic}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-3">Archivos seleccionados:</h3>
                    <div className="space-y-2">
                      <p><strong>Foto de perfil:</strong> {formData.profileImage ? `✓ ${formData.profileImage.name}` : '✗ No seleccionada'}</p>
                      <p><strong>Galería:</strong> {formData.galleryImages.length} fotos{formData.galleryImages.length > 0 ? ` (${UploadService.formatFileSize(formData.galleryImages.reduce((acc, img) => acc + img.size, 0))})` : ''}</p>
                      <p><strong>Video:</strong> {formData.video ? `✓ ${formData.video.name} (${UploadService.formatFileSize(formData.video.size)})` : 'No seleccionado'}</p>
                    </div>
                  </div>
                  
                  {/* Progreso de subida */}
                  {uploadProgress.isUploading && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-medium text-blue-900 mb-3">📤 Subiendo archivos...</h3>
                      <div className="space-y-3">
                        <div className="text-sm text-blue-800 mb-2">
                          {uploadProgress.currentFile}
                        </div>
                        
                        {/* Progreso imagen de perfil */}
                        {formData.profileImage && (
                          <div>
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                              <span>Imagen de perfil</span>
                              <span>{uploadProgress.profile}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress.profile}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                        
                        {/* Progreso galería */}
                        {formData.galleryImages.length > 0 && (
                          <div>
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                              <span>Galería ({formData.galleryImages.length} fotos)</span>
                              <span>{uploadProgress.gallery}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress.gallery}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                        
                        {/* Progreso video */}
                        {formData.video && (
                          <div>
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                              <span>Video memorial</span>
                              <span>{uploadProgress.video}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress.video}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
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
                    disabled={loading || uploadProgress.isUploading || !formData.name || !formData.birthDate || !formData.deathDate}
                    className="btn btn-primary"
                  >
                    {uploadProgress.isUploading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Subiendo archivos...
                      </span>
                    ) : loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {isEditing ? 'Actualizando...' : 'Creando...'}
                      </span>
                    ) : (
                      isEditing ? '💾 Actualizar Memorial' : '🚀 Crear Memorial'
                    )}
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