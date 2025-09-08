import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { supabase } from '@/config/supabase';

interface PhotoWithTitle {
  file: File;
  title: string;
  preview: string;
}

interface FavoriteSong {
  title: string;
  youtube_url: string;
}

interface CoupleProfileData {
  // Información de la pareja
  couple_name: string;
  description: string;
  profile_image: File | null;
  profile_image_preview: string;
  
  // Persona 1
  person1_name: string;
  person1_alias: string;
  person1_birth_date: string;
  person1_zodiac_sign: string;
  
  // Persona 2
  person2_name: string;
  person2_alias: string;
  person2_birth_date: string;
  person2_zodiac_sign: string;
  
  // Relación
  relationship_start_date: string;
  anniversary_date: string;
  
  // Galería de fotos (máximo 10)
  gallery_photos: PhotoWithTitle[];
  
  // Canciones favoritas (máximo 2)
  favorite_songs: FavoriteSong[];
  
  // Videos especiales (máximo 2, 65MB cada uno, .mp4 o .avi)
  special_videos: File[];
  
  // Información adicional
  common_interests: string[];
  person1_suegros: string[];
  person2_suegros: string[];
  person1_cunados: string[];
  person2_cunados: string[];
  pets: string;
  short_term_goals: string;
  medium_term_goals: string;
  long_term_goals: string;
  
  // Configuración
  template_id: string;
  is_published: boolean;
}

function CreateCoupleProfile() {
  const navigate = useNavigate();
  const { profileType } = useParams<{ profileType: string }>();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const [profileData, setProfileData] = useState<CoupleProfileData>({
    couple_name: '',
    description: '',
    profile_image: null,
    profile_image_preview: '',
    person1_name: '',
    person1_alias: '',
    person1_birth_date: '',
    person1_zodiac_sign: '',
    person2_name: '',
    person2_alias: '',
    person2_birth_date: '',
    person2_zodiac_sign: '',
    relationship_start_date: '',
    anniversary_date: '',
    gallery_photos: [],
    favorite_songs: [],
    special_videos: [],
    common_interests: [],
    person1_suegros: [],
    person2_suegros: [],
    person1_cunados: [],
    person2_cunados: [],
    pets: '',
    short_term_goals: '',
    medium_term_goals: '',
    long_term_goals: '',
    template_id: 'couple-1',
    is_published: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: keyof CoupleProfileData, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleProfileImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      updateField('profile_image', file);
      updateField('profile_image_preview', preview);
    }
  };

  const handleGalleryPhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (profileData.gallery_photos.length + files.length > 10) {
      alert('Máximo 10 fotos permitidas');
      return;
    }

    const newPhotos: PhotoWithTitle[] = files.map(file => ({
      file,
      title: '',
      preview: URL.createObjectURL(file)
    }));

    setProfileData(prev => ({
      ...prev,
      gallery_photos: [...prev.gallery_photos, ...newPhotos]
    }));
  };

  const updatePhotoTitle = (index: number, title: string) => {
    setProfileData(prev => ({
      ...prev,
      gallery_photos: prev.gallery_photos.map((photo, i) => 
        i === index ? { ...photo, title } : photo
      )
    }));
  };

  const removePhoto = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      gallery_photos: prev.gallery_photos.filter((_, i) => i !== index)
    }));
  };

  const addCommonInterest = () => {
    if (profileData.common_interests.length < 10) {
      setProfileData(prev => ({
        ...prev,
        common_interests: [...prev.common_interests, '']
      }));
    }
  };

  const updateCommonInterest = (index: number, value: string) => {
    setProfileData(prev => ({
      ...prev,
      common_interests: prev.common_interests.map((interest, i) => 
        i === index ? value : interest
      )
    }));
  };

  const removeCommonInterest = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      common_interests: prev.common_interests.filter((_, i) => i !== index)
    }));
  };

  const addSuegro = (person: 'person1' | 'person2') => {
    const field = person === 'person1' ? 'person1_suegros' : 'person2_suegros';
    const currentSuegros = profileData[field];
    if (currentSuegros.length < 2) {
      setProfileData(prev => ({
        ...prev,
        [field]: [...currentSuegros, '']
      }));
    }
  };

  const updateSuegro = (person: 'person1' | 'person2', index: number, value: string) => {
    const field = person === 'person1' ? 'person1_suegros' : 'person2_suegros';
    setProfileData(prev => ({
      ...prev,
      [field]: prev[field].map((suegro, i) => i === index ? value : suegro)
    }));
  };

  const removeSuegro = (person: 'person1' | 'person2', index: number) => {
    const field = person === 'person1' ? 'person1_suegros' : 'person2_suegros';
    setProfileData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const addCunado = (person: 'person1' | 'person2') => {
    const field = person === 'person1' ? 'person1_cunados' : 'person2_cunados';
    const currentCunados = profileData[field];
    setProfileData(prev => ({
      ...prev,
      [field]: [...currentCunados, '']
    }));
  };

  const updateCunado = (person: 'person1' | 'person2', index: number, value: string) => {
    const field = person === 'person1' ? 'person1_cunados' : 'person2_cunados';
    setProfileData(prev => ({
      ...prev,
      [field]: prev[field].map((cunado, i) => i === index ? value : cunado)
    }));
  };

  const removeCunado = (person: 'person1' | 'person2', index: number) => {
    const field = person === 'person1' ? 'person1_cunados' : 'person2_cunados';
    setProfileData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const addSong = () => {
    if (profileData.favorite_songs.length < 2) {
      setProfileData(prev => ({
        ...prev,
        favorite_songs: [...prev.favorite_songs, { title: '', youtube_url: '' }]
      }));
    }
  };

  const updateSong = (index: number, field: 'title' | 'youtube_url', value: string) => {
    setProfileData(prev => ({
      ...prev,
      favorite_songs: prev.favorite_songs.map((song, i) => 
        i === index ? { ...song, [field]: value } : song
      )
    }));
  };

  const removeSong = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      favorite_songs: prev.favorite_songs.filter((_, i) => i !== index)
    }));
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles: File[] = [];
    
    files.forEach(file => {
      // Validar tipo de archivo
      if (file.type === 'video/mp4' || file.type === 'video/avi' || file.name.endsWith('.mp4') || file.name.endsWith('.avi')) {
        // Validar tamaño (65MB = 65 * 1024 * 1024 bytes)
        if (file.size <= 65 * 1024 * 1024) {
          validFiles.push(file);
        } else {
          alert(`El archivo ${file.name} es demasiado grande. Máximo 65MB.`);
        }
      } else {
        alert(`El archivo ${file.name} no es válido. Solo se permiten archivos .mp4 y .avi`);
      }
    });

    if (profileData.special_videos.length + validFiles.length > 2) {
      alert('Máximo 2 videos permitidos');
      return;
    }

    setProfileData(prev => ({
      ...prev,
      special_videos: [...prev.special_videos, ...validFiles]
    }));
  };

  const removeVideo = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      special_videos: prev.special_videos.filter((_, i) => i !== index)
    }));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!profileData.couple_name.trim()) newErrors.couple_name = 'El nombre de la pareja es requerido';
        if (!profileData.description.trim()) newErrors.description = 'La descripción es requerida';
        if (!profileData.profile_image) newErrors.profile_image = 'La imagen principal es requerida';
        break;
      
      case 2:
        if (!profileData.person1_name.trim()) newErrors.person1_name = 'El nombre de la primera persona es requerido';
        if (!profileData.person1_birth_date) newErrors.person1_birth_date = 'La fecha de nacimiento de la primera persona es requerida';
        if (!profileData.person2_name.trim()) newErrors.person2_name = 'El nombre de la segunda persona es requerido';
        if (!profileData.person2_birth_date) newErrors.person2_birth_date = 'La fecha de nacimiento de la segunda persona es requerida';
        break;
      
      case 3:
        // No hay campos requeridos en este paso
        break;
      
      case 4:
        // No hay campos requeridos en este paso
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const canProceedToNext = (): boolean => {
    return validateStep(currentStep);
  };

  const uploadFile = async (file: File, type: 'image' | 'video'): Promise<string> => {
    // Validar tipo de archivo
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    
    if (type === 'image' && !allowedImageTypes.includes(file.type)) {
      throw new Error(`Tipo de imagen no válido. Permitidos: ${allowedImageTypes.join(', ')}`);
    }
    
    if (type === 'video' && !allowedVideoTypes.includes(file.type)) {
      throw new Error(`Tipo de video no válido. Permitidos: ${allowedVideoTypes.join(', ')}`);
    }

    // Validar tamaño de archivo
    const maxImageSize = 2 * 1024 * 1024; // 2MB
    const maxVideoSize = 65 * 1024 * 1024; // 65MB
    
    if (type === 'image' && file.size > maxImageSize) {
      throw new Error(`Imagen demasiado grande. Máximo: 2MB`);
    }
    
    if (type === 'video' && file.size > maxVideoSize) {
      throw new Error(`Video demasiado grande. Máximo: 65MB`);
    }

    // Mapear tipo para el backend
    const backendType = type === 'image' ? 'profile' : 'video';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', backendType);

    // Obtener token de Supabase
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('No hay sesión activa');
    }

    const response = await fetch('http://localhost:3002/api/upload-proxy/proxy', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al subir archivo');
    }

    const result = await response.json();
    return result.data.publicUrl;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Verificar autenticación con Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        alert('No hay sesión activa. Por favor, recarga la página e inicia sesión nuevamente.');
        setLoading(false);
        return;
      }

      // Validar campos requeridos
      if (!canProceedToNext()) {
        setLoading(false);
        return;
      }

      // Subir imagen principal
      let profileImageUrl = '';
      if (profileData.profile_image) {
        profileImageUrl = await uploadFile(profileData.profile_image, 'image');
      }

      // Crear el perfil de pareja
      const coupleProfileData = {
        couple_name: profileData.couple_name,
        description: profileData.description,
        profile_image_url: profileImageUrl,
        person1_name: profileData.person1_name,
        person1_alias: profileData.person1_alias,
        person1_birth_date: profileData.person1_birth_date,
        person1_zodiac_sign: profileData.person1_zodiac_sign,
        person2_name: profileData.person2_name,
        person2_alias: profileData.person2_alias,
        person2_birth_date: profileData.person2_birth_date,
        person2_zodiac_sign: profileData.person2_zodiac_sign,
        relationship_start_date: profileData.relationship_start_date,
        anniversary_date: profileData.anniversary_date,
        common_interests: profileData.common_interests,
        person1_suegros: profileData.person1_suegros,
        person2_suegros: profileData.person2_suegros,
        person1_cunados: profileData.person1_cunados,
        person2_cunados: profileData.person2_cunados,
        pets: profileData.pets,
        short_term_goals: profileData.short_term_goals,
        medium_term_goals: profileData.medium_term_goals,
        long_term_goals: profileData.long_term_goals,
        template_id: profileData.template_id,
        is_published: profileData.is_published
      };

      const response = await fetch('http://localhost:3002/api/admin/couple-profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(coupleProfileData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al crear el perfil');
      }

      const result = await response.json();
      const coupleProfileId = result.coupleProfile.id;

      // Subir fotos de la galería
      if (profileData.gallery_photos.length > 0) {
        const galleryPhotos = [];
        for (const photo of profileData.gallery_photos) {
          const photoUrl = await uploadFile(photo.file, 'image');
          galleryPhotos.push({
            file_url: photoUrl,
            title: photo.title
          });
        }

        await fetch(`http://localhost:3002/api/admin/couple-profiles/${coupleProfileId}/gallery`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ photos: galleryPhotos })
        });
      }

      // Agregar canciones favoritas
      if (profileData.favorite_songs.length > 0) {
        await fetch(`http://localhost:3002/api/admin/couple-profiles/${coupleProfileId}/songs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ songs: profileData.favorite_songs })
        });
      }

      // Subir videos especiales
      if (profileData.special_videos.length > 0) {
        const videos = [];
        for (const video of profileData.special_videos) {
          const videoUrl = await uploadFile(video, 'video');
          videos.push({
            file_url: videoUrl,
            title: video.name
          });
        }

        await fetch(`http://localhost:3002/api/admin/couple-profiles/${coupleProfileId}/videos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ videos })
        });
      }

          // Mostrar modal de confirmación
          setShowSuccessModal(true);
    } catch (error) {
      console.error('Error creating couple profile:', error);
      alert(`Error al crear el perfil de pareja: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Información Básica', description: 'Datos generales de la pareja' },
    { number: 2, title: 'Personas', description: 'Información de cada persona' },
    { number: 3, title: 'Relación', description: 'Fechas importantes de la relación' },
    { number: 4, title: 'Detalles', description: 'Información adicional' },
    { number: 5, title: 'Revisar', description: 'Confirmar y crear' }
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">💕 Información Básica</h3>
              <p className="text-gray-600">Comencemos con los datos principales de la pareja</p>
            </div>
            
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 border border-pink-100">
              <Input
                label="Nombre de la Pareja"
                value={profileData.couple_name}
                onChange={(e) => updateField('couple_name', e.target.value)}
                placeholder="Ej: Juliana & Alex"
                required
                error={errors.couple_name}
                className="text-lg"
              />
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Descripción de la Pareja
                <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none ${
                  errors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200'
                }`}
                rows={4}
                value={profileData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Cuenta la hermosa historia de amor de esta pareja..."
              />
              {errors.description && (
                <p className="text-sm text-red-600 mt-2">{errors.description}</p>
              )}
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Imagen Principal (Frame de Corazón)
                <span className="text-red-500 ml-1">*</span>
              </label>
              
              {profileData.profile_image_preview ? (
                <div className="space-y-4">
                  <div className="relative w-32 h-32 mx-auto">
                    <img
                      src={profileData.profile_image_preview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-full border-4 border-pink-200 shadow-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        updateField('profile_image', null);
                        updateField('profile_image_preview', '');
                      }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 text-center">Imagen seleccionada</p>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-pink-400 transition-colors">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleProfileImageUpload}
                    className="hidden"
                    id="profile-image-upload"
                  />
                  <label
                    htmlFor="profile-image-upload"
                    className="cursor-pointer block"
                  >
                    <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl text-pink-500">📷</span>
                    </div>
                    <p className="text-gray-600 font-medium">Subir imagen principal</p>
                    <p className="text-sm text-gray-500 mt-1">PNG, JPG hasta 10MB</p>
                  </label>
                </div>
              )}
              
              {errors.profile_image && (
                <p className="text-sm text-red-600 mt-2">{errors.profile_image}</p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">👫 Información de las Personas</h3>
              <p className="text-gray-600">Datos de cada miembro de la pareja</p>
            </div>
            
            {/* Persona 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white text-xl">👤</span>
                </div>
                <h4 className="text-xl font-bold text-blue-800">Primera Persona</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Nombre Completo"
                  value={profileData.person1_name}
                  onChange={(e) => updateField('person1_name', e.target.value)}
                  placeholder="Nombre completo"
                  required
                  error={errors.person1_name}
                />
                <Input
                  label="Alias/Apellido"
                  value={profileData.person1_alias}
                  onChange={(e) => updateField('person1_alias', e.target.value)}
                  placeholder="Como le dicen de cariño"
                />
                <Input
                  label="Fecha de Nacimiento"
                  type="date"
                  value={profileData.person1_birth_date}
                  onChange={(e) => updateField('person1_birth_date', e.target.value)}
                  required
                  error={errors.person1_birth_date}
                />
                <Input
                  label="Signo Zodiacal"
                  value={profileData.person1_zodiac_sign}
                  onChange={(e) => updateField('person1_zodiac_sign', e.target.value)}
                  placeholder="Ej: Leo, Virgo, Libra..."
                />
              </div>
            </div>
            
            {/* Persona 2 */}
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 border border-pink-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white text-xl">👤</span>
                </div>
                <h4 className="text-xl font-bold text-pink-800">Segunda Persona</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Nombre Completo"
                  value={profileData.person2_name}
                  onChange={(e) => updateField('person2_name', e.target.value)}
                  placeholder="Nombre completo"
                  required
                  error={errors.person2_name}
                />
                <Input
                  label="Alias/Apellido"
                  value={profileData.person2_alias}
                  onChange={(e) => updateField('person2_alias', e.target.value)}
                  placeholder="Como le dicen de cariño"
                />
                <Input
                  label="Fecha de Nacimiento"
                  type="date"
                  value={profileData.person2_birth_date}
                  onChange={(e) => updateField('person2_birth_date', e.target.value)}
                  required
                  error={errors.person2_birth_date}
                />
                <Input
                  label="Signo Zodiacal"
                  value={profileData.person2_zodiac_sign}
                  onChange={(e) => updateField('person2_zodiac_sign', e.target.value)}
                  placeholder="Ej: Leo, Virgo, Libra..."
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">💕 Fechas de la Relación</h3>
              <p className="text-gray-600">Fechas importantes y multimedia especial</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
              <h4 className="text-lg font-bold text-green-800 mb-4 flex items-center">
                <span className="mr-2">📅</span>
                Fechas Importantes
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Fecha de Inicio de Relación"
                  type="date"
                  value={profileData.relationship_start_date}
                  onChange={(e) => updateField('relationship_start_date', e.target.value)}
                  placeholder="¿Cuándo se conocieron?"
                />
                <Input
                  label="Fecha de Aniversario"
                  type="date"
                  value={profileData.anniversary_date}
                  onChange={(e) => updateField('anniversary_date', e.target.value)}
                  placeholder="¿Cuándo se casaron o comprometieron?"
                />
              </div>
            </div>

            {/* Galería de Fotos */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
              <h4 className="text-lg font-bold text-blue-800 mb-4 flex items-center">
                <span className="mr-2">📸</span>
                Galería de Fotos (Máximo 10)
              </h4>
              
              <div className="space-y-4">
                {profileData.gallery_photos.map((photo, index) => (
                  <div key={index} className="bg-white rounded-xl p-4 border border-blue-200 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 flex-shrink-0">
                        <img
                          src={photo.preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-3">
                          <h5 className="font-medium text-gray-800">Foto {index + 1}</h5>
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded transition-colors"
                          >
                            🗑️
                          </button>
                        </div>
                        <Input
                          label="Título de la Foto"
                          value={photo.title}
                          onChange={(e) => updatePhotoTitle(index, e.target.value)}
                          placeholder="Ej: Nuestro lugar favorito"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                {profileData.gallery_photos.length < 10 && (
                  <div className="border-2 border-dashed border-blue-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      multiple
                      onChange={handleGalleryPhotoUpload}
                      className="hidden"
                      id="gallery-upload"
                    />
                    <label
                      htmlFor="gallery-upload"
                      className="cursor-pointer block"
                    >
                      <div className="text-blue-600 text-4xl mb-3">📸</div>
                      <p className="text-blue-600 font-medium text-lg">Subir Fotos a la Galería</p>
                      <p className="text-sm text-blue-500 mt-2">
                        {profileData.gallery_photos.length}/10 fotos • PNG, JPG hasta 10MB cada una
                      </p>
                    </label>
                  </div>
                )}
                
                {profileData.gallery_photos.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <span className="text-4xl mb-2 block">📸</span>
                    <p>No hay fotos agregadas aún</p>
                    <p className="text-sm">Sube fotos para crear una galería especial</p>
                  </div>
                )}
              </div>
            </div>

            {/* Canciones Favoritas */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
              <h4 className="text-lg font-bold text-purple-800 mb-4 flex items-center">
                <span className="mr-2">🎵</span>
                Canciones Favoritas (Máximo 2)
              </h4>
              
              <div className="space-y-4">
                {profileData.favorite_songs.map((song, index) => (
                  <div key={index} className="bg-white rounded-xl p-4 border border-purple-200 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <h5 className="font-medium text-gray-800">Canción {index + 1}</h5>
                      <button
                        type="button"
                        onClick={() => removeSong(index)}
                        className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Título de la Canción"
                        value={song.title}
                        onChange={(e) => updateSong(index, 'title', e.target.value)}
                        placeholder="Ej: Perfect - Ed Sheeran"
                      />
                      <Input
                        label="URL de YouTube"
                        value={song.youtube_url}
                        onChange={(e) => updateSong(index, 'youtube_url', e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                    </div>
                  </div>
                ))}
                
                {profileData.favorite_songs.length < 2 && (
                  <button
                    type="button"
                    onClick={addSong}
                    className="w-full py-4 px-6 border-2 border-dashed border-purple-300 rounded-xl text-purple-600 hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 font-medium"
                  >
                    + Agregar Canción
                  </button>
                )}
                
                {profileData.favorite_songs.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <span className="text-4xl mb-2 block">🎵</span>
                    <p>No hay canciones agregadas aún</p>
                    <p className="text-sm">Agrega las canciones especiales de la pareja</p>
                  </div>
                )}
              </div>
            </div>

            {/* Videos Especiales */}
            <div className="bg-orange-50 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium text-orange-800">🎬 Videos Especiales (Máximo 2, 65MB cada uno)</h4>
                <div>
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
                      multiple
                      onChange={handleVideoUpload}
                      className="hidden"
                      id="video-upload"
                    />
                  <label
                    htmlFor="video-upload"
                    className="btn-primary text-sm cursor-pointer"
                  >
                    + Subir Videos
                  </label>
                </div>
              </div>
              
              <div className="space-y-4">
                {profileData.special_videos.map((video, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-orange-200">
                    <div className="flex justify-between items-start mb-3">
                      <h5 className="font-medium text-gray-800">Video {index + 1}</h5>
                      <Button
                        onClick={() => removeVideo(index)}
                        className="btn-secondary text-sm text-red-600 hover:bg-red-50"
                      >
                        ✕ Eliminar
                      </Button>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <span className="text-orange-600 text-xl">🎬</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{video.name}</p>
                        <p className="text-sm text-gray-600">{formatFileSize(video.size)}</p>
                        <p className="text-xs text-gray-500">Tipo: {video.type}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {profileData.special_videos.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <span className="text-4xl mb-2 block">🎬</span>
                    <p>No hay videos subidos aún</p>
                    <p className="text-sm">Haz clic en "Subir Videos" para comenzar</p>
                    <p className="text-xs text-gray-400 mt-1">Solo archivos .mp4 y .avi, máximo 65MB cada uno</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Detalles Adicionales</h3>
            
            {/* Cosas en Común */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-100">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-bold text-yellow-800 flex items-center">
                  <span className="mr-2">💕</span>
                  Cosas en Común (Máximo 10)
                </h4>
                <button
                  type="button"
                  onClick={addCommonInterest}
                  disabled={profileData.common_interests.length >= 10}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  + Agregar
                </button>
              </div>
              
              <div className="space-y-3">
                {profileData.common_interests.map((interest, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Input
                      value={interest}
                      onChange={(e) => updateCommonInterest(index, e.target.value)}
                      placeholder="Ej: Les gusta viajar, cocinar juntos, etc."
                      className="flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => removeCommonInterest(index)}
                      className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
                
                {profileData.common_interests.length === 0 && (
                  <div className="text-center py-6 text-gray-500">
                    <span className="text-2xl mb-2 block">💕</span>
                    <p>No hay intereses agregados aún</p>
                    <p className="text-sm">Agrega las cosas que tienen en común</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Suegros */}
            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-6 border border-green-100">
              <h4 className="text-lg font-bold text-green-800 mb-4 flex items-center">
                <span className="mr-2">👨‍👩‍👧‍👦</span>
                Suegros
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Suegros de Persona 1 */}
                <div className="bg-white rounded-xl p-4 border border-green-200">
                  <h5 className="font-medium text-green-800 mb-3">
                    Suegros de {profileData.person1_name || 'Primera Persona'}
                  </h5>
                  <div className="space-y-3">
                    {profileData.person1_suegros.map((suegro, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Input
                          value={suegro}
                          onChange={(e) => updateSuegro('person1', index, e.target.value)}
                          placeholder="Nombre del suegro"
                          className="flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => removeSuegro('person1', index)}
                          className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                    {profileData.person1_suegros.length < 2 && (
                      <button
                        type="button"
                        onClick={() => addSuegro('person1')}
                        className="w-full py-2 px-4 border-2 border-dashed border-green-300 rounded-lg text-green-600 hover:border-green-400 hover:bg-green-50 transition-colors"
                      >
                        + Agregar Suegro
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Suegros de Persona 2 */}
                <div className="bg-white rounded-xl p-4 border border-green-200">
                  <h5 className="font-medium text-green-800 mb-3">
                    Suegros de {profileData.person2_name || 'Segunda Persona'}
                  </h5>
                  <div className="space-y-3">
                    {profileData.person2_suegros.map((suegro, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Input
                          value={suegro}
                          onChange={(e) => updateSuegro('person2', index, e.target.value)}
                          placeholder="Nombre del suegro"
                          className="flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => removeSuegro('person2', index)}
                          className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                    {profileData.person2_suegros.length < 2 && (
                      <button
                        type="button"
                        onClick={() => addSuegro('person2')}
                        className="w-full py-2 px-4 border-2 border-dashed border-green-300 rounded-lg text-green-600 hover:border-green-400 hover:bg-green-50 transition-colors"
                      >
                        + Agregar Suegro
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Cuñados */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
              <h4 className="text-lg font-bold text-indigo-800 mb-4 flex items-center">
                <span className="mr-2">👫</span>
                Cuñados
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cuñados de Persona 1 */}
                <div className="bg-white rounded-xl p-4 border border-indigo-200">
                  <h5 className="font-medium text-indigo-800 mb-3">
                    Cuñados de {profileData.person1_name || 'Primera Persona'}
                  </h5>
                  <div className="space-y-3">
                    {profileData.person1_cunados.map((cunado, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Input
                          value={cunado}
                          onChange={(e) => updateCunado('person1', index, e.target.value)}
                          placeholder="Nombre del cuñado"
                          className="flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => removeCunado('person1', index)}
                          className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addCunado('person1')}
                      className="w-full py-2 px-4 border-2 border-dashed border-indigo-300 rounded-lg text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
                    >
                      + Agregar Cuñado
                    </button>
                  </div>
                </div>
                
                {/* Cuñados de Persona 2 */}
                <div className="bg-white rounded-xl p-4 border border-indigo-200">
                  <h5 className="font-medium text-indigo-800 mb-3">
                    Cuñados de {profileData.person2_name || 'Segunda Persona'}
                  </h5>
                  <div className="space-y-3">
                    {profileData.person2_cunados.map((cunado, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Input
                          value={cunado}
                          onChange={(e) => updateCunado('person2', index, e.target.value)}
                          placeholder="Nombre del cuñado"
                          className="flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => removeCunado('person2', index)}
                          className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addCunado('person2')}
                      className="w-full py-2 px-4 border-2 border-dashed border-indigo-300 rounded-lg text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
                    >
                      + Agregar Cuñado
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Mascotas */}
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 border border-pink-100">
              <h4 className="text-lg font-bold text-pink-800 mb-4 flex items-center">
                <span className="mr-2">🐾</span>
                Mascotas
              </h4>
              <textarea
                className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 resize-none"
                rows={4}
                value={profileData.pets}
                onChange={(e) => updateField('pets', e.target.value)}
                placeholder="¿Tienen mascotas? Nombres, tipos y detalles especiales..."
              />
            </div>

            {/* Metas de la pareja */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
              <h4 className="text-lg font-bold text-blue-800 mb-4 flex items-center">
                <span className="mr-2">🎯</span>
                Metas de la Pareja
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">Corto Plazo (1-2 años)</label>
                  <textarea
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={2}
                    value={profileData.short_term_goals}
                    onChange={(e) => updateField('short_term_goals', e.target.value)}
                    placeholder="Ej: Viajar a Europa, comprar un auto..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">Mediano Plazo (3-5 años)</label>
                  <textarea
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={2}
                    value={profileData.medium_term_goals}
                    onChange={(e) => updateField('medium_term_goals', e.target.value)}
                    placeholder="Ej: Comprar casa, tener hijos..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">Largo Plazo (5+ años)</label>
                  <textarea
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={2}
                    value={profileData.long_term_goals}
                    onChange={(e) => updateField('long_term_goals', e.target.value)}
                    placeholder="Ej: Jubilación, legado familiar..."
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Revisar Información</h3>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4">Resumen del Perfil de Pareja</h4>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p><strong>Pareja:</strong> {profileData.couple_name}</p>
                    <p><strong>Persona 1:</strong> {profileData.person1_name} ({profileData.person1_alias})</p>
                    <p><strong>Nacimiento:</strong> {profileData.person1_birth_date}</p>
                    <p><strong>Signo:</strong> {profileData.person1_zodiac_sign}</p>
                  </div>
                  <div>
                    <p><strong>Persona 2:</strong> {profileData.person2_name} ({profileData.person2_alias})</p>
                    <p><strong>Nacimiento:</strong> {profileData.person2_birth_date}</p>
                    <p><strong>Signo:</strong> {profileData.person2_zodiac_sign}</p>
                  </div>
                </div>
                
                <div className="border-t pt-3">
                  <p><strong>Relación desde:</strong> {profileData.relationship_start_date}</p>
                  <p><strong>Aniversario:</strong> {profileData.anniversary_date}</p>
                  <p><strong>Fotos en galería:</strong> {profileData.gallery_photos.length}</p>
                  <p><strong>Canciones favoritas:</strong> {profileData.favorite_songs.length}</p>
                  <p><strong>Videos especiales:</strong> {profileData.special_videos.length}</p>
                </div>
                
                <div className="border-t pt-3">
                  <p><strong>Descripción:</strong></p>
                  <p className="text-gray-600 italic">"{profileData.description}"</p>
                </div>
                
                {profileData.common_interests && (
                  <div className="border-t pt-3">
                    <p><strong>Cosas en común:</strong> {profileData.common_interests}</p>
                  </div>
                )}
                
                {(profileData.in_laws || profileData.siblings_in_law || profileData.pets) && (
                  <div className="border-t pt-3">
                    <p><strong>Familia:</strong> {profileData.in_laws}</p>
                    <p><strong>Cuñados:</strong> {profileData.siblings_in_law}</p>
                    <p><strong>Mascotas:</strong> {profileData.pets}</p>
                  </div>
                )}
                
                {(profileData.short_term_goals || profileData.medium_term_goals || profileData.long_term_goals) && (
                  <div className="border-t pt-3">
                    <p><strong>Metas a corto plazo:</strong> {profileData.short_term_goals}</p>
                    <p><strong>Metas a mediano plazo:</strong> {profileData.medium_term_goals}</p>
                    <p><strong>Metas a largo plazo:</strong> {profileData.long_term_goals}</p>
                  </div>
                )}

                {profileData.favorite_songs.length > 0 && (
                  <div className="border-t pt-3">
                    <p><strong>Canciones favoritas:</strong></p>
                    {profileData.favorite_songs.map((song, index) => (
                      <p key={index} className="text-gray-600 ml-4">
                        {index + 1}. {song.title} - <a href={song.youtube_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Ver en YouTube</a>
                      </p>
                    ))}
                  </div>
                )}

                {profileData.special_videos.length > 0 && (
                  <div className="border-t pt-3">
                    <p><strong>Videos especiales:</strong></p>
                    {profileData.special_videos.map((video, index) => (
                      <p key={index} className="text-gray-600 ml-4">
                        {index + 1}. {video.name} ({formatFileSize(video.size)})
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="publish"
                checked={profileData.is_published}
                onChange={(e) => updateField('is_published', e.target.checked)}
                className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
              />
              <label htmlFor="publish" className="ml-2 block text-sm text-gray-900">
                Publicar inmediatamente
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Crear Perfil de Pareja</h1>
              <p className="text-gray-600 mt-2">
                Crea un perfil especial para parejas
              </p>
            </div>
            <Button
              onClick={() => navigate('/admin/special-profiles')}
              className="btn-secondary"
            >
              ← Volver
            </Button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between overflow-x-auto pb-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex flex-col items-center min-w-0 flex-1 px-1">
                <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 ${
                  currentStep >= step.number
                    ? 'bg-pink-500 border-pink-500 text-white'
                    : 'bg-white border-gray-300 text-gray-500'
                }`}>
                  {step.number}
                </div>
                <div className="mt-2 text-center">
                  <p className={`text-xs sm:text-sm font-medium leading-tight ${
                    currentStep >= step.number ? 'text-pink-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 leading-tight hidden sm:block">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`hidden sm:block w-8 h-0.5 mx-2 mt-4 ${
                    currentStep > step.number ? 'bg-pink-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8">
          <Button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="btn-secondary w-full sm:w-auto"
          >
            ← Anterior
          </Button>
          
          {currentStep < 5 ? (
            <Button
              onClick={() => {
                if (canProceedToNext()) {
                  setCurrentStep(Math.min(5, currentStep + 1));
                }
              }}
              className="btn-primary w-full sm:w-auto"
            >
              Siguiente →
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              loading={loading}
              className="btn-primary w-full sm:w-auto bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
            >
              💕 Crear Perfil de Pareja
            </Button>
          )}
        </div>
      </div>

      {/* Modal de Confirmación */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">💕</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Perfil Creado Exitosamente!
            </h3>
            <p className="text-gray-600 mb-6">
              El perfil de pareja ha sido creado y guardado correctamente.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate('/admin/special-profiles');
                }}
                className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
              >
                Ver Perfiles
              </Button>
              <Button
                onClick={() => {
                  setShowSuccessModal(false);
                  // Resetear el formulario para crear otro perfil
                  setProfileData({
                    couple_name: '',
                    description: '',
                    profile_image: null,
                    profile_image_preview: '',
                    person1_name: '',
                    person1_alias: '',
                    person1_birth_date: '',
                    person1_zodiac_sign: '',
                    person2_name: '',
                    person2_alias: '',
                    person2_birth_date: '',
                    person2_zodiac_sign: '',
                    relationship_start_date: '',
                    anniversary_date: '',
                    gallery_photos: [],
                    favorite_songs: [],
                    special_videos: [],
                    common_interests: [],
                    person1_suegros: [],
                    person2_suegros: [],
                    person1_cunados: [],
                    person2_cunados: [],
                    pets: '',
                    short_term_goals: '',
                    medium_term_goals: '',
                    long_term_goals: '',
                    template_id: 'couple-1',
                    is_published: false
                  });
                  setCurrentStep(1);
                }}
                variant="outline"
                className="flex-1"
              >
                Crear Otro
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateCoupleProfile;
