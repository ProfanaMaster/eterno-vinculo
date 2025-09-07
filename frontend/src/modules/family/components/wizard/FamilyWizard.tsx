import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateFamilyProfileData, CreateFamilyMemberData, FAMILY_RELATIONSHIPS } from '../../types/family';
import { useCreateFamilyProfile } from '../../hooks/useFamily';
import { toast } from 'react-hot-toast';
import ImageUpload from '@/components/editor/ImageUpload';
import VideoUpload from '@/components/editor/VideoUpload';
import GalleryUpload from '@/components/editor/GalleryUpload';
import { sanitizeInput } from '@/utils/sanitize';

interface FamilyWizardProps {
  onComplete?: (profile: any) => void;
}

export default function FamilyWizard({ onComplete }: FamilyWizardProps) {
  const navigate = useNavigate();
  const { createProfile, loading, error } = useCreateFamilyProfile();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [familyData, setFamilyData] = useState<CreateFamilyProfileData>({
    family_name: '',
    description: '',
    template_id: 'family-1',
    members: [],
    gallery_images: []
  });

  const totalSteps = 5;

  // Paso 1: Información de la familia
  const handleFamilyInfo = (data: { family_name: string; description: string }) => {
    setFamilyData(prev => ({ ...prev, ...data }));
    setCurrentStep(2);
  };

  // Paso 2: Agregar miembros
  const handleMembersInfo = (members: CreateFamilyMemberData[]) => {
    setFamilyData(prev => ({ ...prev, members }));
    setCurrentStep(3);
  };

  // Paso 3: Galería familiar
  const handleFamilyGallery = (gallery_images: string[]) => {
    setFamilyData(prev => ({ ...prev, gallery_images }));
    setCurrentStep(4);
  };

  // Paso 4: Configuración adicional
  const handleAdditionalConfig = (config: { template_id?: string; favorite_music?: string }) => {
    setFamilyData(prev => ({ ...prev, ...config }));
    setCurrentStep(5);
  };

  // Paso 5: Crear perfil
  const handleCreateProfile = async () => {
    const profile = await createProfile(familyData);
    if (profile) {
      toast.success('¡Perfil familiar creado exitosamente!');
      if (onComplete) {
        onComplete(profile);
      } else {
        // Redirigir al dashboard con parámetro de refresh
        navigate('/dashboard?refresh=true');
      }
    } else {
      toast.error(error || 'Error al crear el perfil familiar');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Indicador de progreso */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div key={i} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                i + 1 <= currentStep 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {i + 1}
              </div>
              {i < totalSteps - 1 && (
                <div className={`w-16 h-1 mx-2 ${
                  i + 1 < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>Información</span>
          <span>Miembros</span>
          <span>Galería</span>
          <span>Configuración</span>
          <span>Crear</span>
        </div>
      </div>

      {/* Contenido del paso actual */}
      {currentStep === 1 && (
        <FamilyInfoStep onNext={handleFamilyInfo} initialData={familyData} />
      )}
      
      {currentStep === 2 && (
        <FamilyMembersStep 
          onNext={handleMembersInfo} 
          onBack={() => setCurrentStep(1)}
          initialMembers={familyData.members}
        />
      )}
      
      {currentStep === 3 && (
        <FamilyGalleryStep 
          onNext={handleFamilyGallery}
          onBack={() => setCurrentStep(2)}
          initialGallery={familyData.gallery_images}
          memberCount={familyData.members.length}
        />
      )}
      
      {currentStep === 4 && (
        <FamilyConfigStep 
          onNext={handleAdditionalConfig}
          onBack={() => setCurrentStep(3)}
          initialConfig={{ 
            template_id: familyData.template_id, 
            favorite_music: familyData.favorite_music 
          }}
        />
      )}
      
      {currentStep === 5 && (
        <FamilyReviewStep 
          familyData={familyData}
          onBack={() => setCurrentStep(4)}
          onCreate={handleCreateProfile}
          loading={loading}
        />
      )}
    </div>
  );
}

// Componente para el paso 1: Información de la familia
function FamilyInfoStep({ onNext, initialData }: any) {
  const [familyName, setFamilyName] = useState(initialData.family_name || '');
  const [description, setDescription] = useState(initialData.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (familyName.trim()) {
      onNext({ 
        family_name: sanitizeInput(familyName), 
        description: sanitizeInput(description) 
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Información de la Familia</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre de la Familia *
          </label>
          <input
            type="text"
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: Familia González"
            maxLength={100}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {familyName.length}/100 caracteres
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción (Opcional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            maxLength={1000}
            placeholder="Una breve descripción sobre la familia..."
          />
          <p className="text-xs text-gray-500 mt-1">
            {description.length}/1000 caracteres
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Continuar
          </button>
        </div>
      </form>
    </div>
  );
}

// Componente para el paso 2: Miembros de la familia
function FamilyMembersStep({ onNext, onBack, initialMembers }: any) {
  const [members, setMembers] = useState<CreateFamilyMemberData[]>(initialMembers || []);

  const addMember = () => {
    if (members.length < 3) {
      setMembers([...members, {
        name: '',
        birth_date: '',
        death_date: '',
        profile_image_url: '',
        relationship: 'otro'
      }]);
    }
  };

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const updateMember = (index: number, field: string, value: string | string[]) => {
    const updatedMembers = [...members];
    // No sanitizar en tiempo real para permitir escritura normal
    updatedMembers[index] = { ...updatedMembers[index], [field]: value };
    setMembers(updatedMembers);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Sanitizar nombres antes de validar
    const sanitizedMembers = members.map(member => ({
      ...member,
      name: sanitizeInput(member.name)
    }));
    
    // Validar que todos los campos requeridos estén completos
    const isValid = sanitizedMembers.length > 0 && sanitizedMembers.every(m => 
      m.name && 
      m.birth_date && 
      m.death_date && 
      m.profile_image_url
    );
    
    if (isValid) {
      onNext(sanitizedMembers);
    } else {
      toast.error('Por favor completa todos los campos requeridos, incluyendo las fotos de perfil');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Miembros de la Familia</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {members.map((member, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Miembro {index + 1}</h3>
              <button
                type="button"
                onClick={() => removeMember(index)}
                className="text-red-600 hover:text-red-700"
              >
                Eliminar
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={member.name}
                  onChange={(e) => updateMember(index, 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={50}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relación *
                </label>
                <select
                  value={member.relationship}
                  onChange={(e) => updateMember(index, 'relationship', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {FAMILY_RELATIONSHIPS.map(rel => (
                    <option key={rel} value={rel}>{rel}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Nacimiento *
                </label>
                <input
                  type="date"
                  value={member.birth_date}
                  onChange={(e) => updateMember(index, 'birth_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Fallecimiento *
                </label>
                <input
                  type="date"
                  value={member.death_date}
                  onChange={(e) => updateMember(index, 'death_date', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <ImageUpload
                  label="Foto de Perfil *"
                  type="profile"
                  currentImage={member.profile_image_url}
                  onImageUploaded={(url) => updateMember(index, 'profile_image_url', url)}
                  maxSize={2}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Solo JPG y PNG • Máximo 2MB • Se recomienda 400x400px
                </p>
              </div>

              <div className="md:col-span-2">
                <VideoUpload
                  currentVideo={member.memorial_video_url || ''}
                  onVideoUploaded={(url) => updateMember(index, 'memorial_video_url', url)}
                  maxSize={65}
                  maxDuration={180}
                />
              </div>

            </div>
          </div>
        ))}

        {members.length < 3 && (
          <button
            type="button"
            onClick={addMember}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
          >
            + Agregar Miembro ({members.length}/3)
          </button>
        )}

        <div className="flex justify-between">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Atrás
          </button>
          <button
            type="submit"
            disabled={members.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            Continuar
          </button>
        </div>
      </form>
    </div>
  );
}

// Componente para el paso 3: Galería familiar
function FamilyGalleryStep({ onNext, onBack, initialGallery, memberCount }: any) {
  const [galleryImages, setGalleryImages] = useState<string[]>(initialGallery || []);
  
  // Calcular máximo de fotos: 6 fotos por miembro
  const maxImages = memberCount * 6;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(galleryImages);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Galería Familiar</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <p className="text-gray-600 mb-4">
            Agrega fotos de la familia que se mostrarán en la galería general del memorial.
            <br />
            <span className="text-sm text-blue-600 font-medium">
              Máximo {maxImages} fotos ({memberCount} miembros × 6 fotos por miembro)
            </span>
            <br />
            <span className="text-sm text-gray-500">
              Peso máximo: 2MB por foto • Formatos: JPG, PNG
            </span>
          </p>
          
          <GalleryUpload
            images={galleryImages}
            onImagesChange={setGalleryImages}
            maxImages={maxImages}
          />
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Atrás
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Continuar
          </button>
        </div>
      </form>
    </div>
  );
}

// Componente para el paso 4: Configuración adicional
function FamilyConfigStep({ onNext, onBack, initialConfig }: any) {
  const [templateId, setTemplateId] = useState(initialConfig.template_id || 'family-1');
  const [favoriteMusic, setFavoriteMusic] = useState(initialConfig.favorite_music || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({ 
      template_id: templateId, 
      favorite_music: sanitizeInput(favoriteMusic) 
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Configuración Adicional</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Plantilla de Diseño
          </label>
          <select
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="family-1">Mármol Blanco y Oro</option>
            <option value="family-2">Mármol Rosa y Oro</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Música Favorita (Opcional)
          </label>
          <input
            type="url"
            value={favoriteMusic}
            onChange={(e) => setFavoriteMusic(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="URL de la música favorita de la familia"
          />
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Atrás
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Continuar
          </button>
        </div>
      </form>
    </div>
  );
}

// Componente para el paso 5: Revisar y crear
function FamilyReviewStep({ familyData, onBack, onCreate, loading }: any) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Revisar y Crear</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Información de la Familia</h3>
          <p><strong>Nombre:</strong> {familyData.family_name}</p>
          {familyData.description && <p><strong>Descripción:</strong> {familyData.description}</p>}
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Miembros ({familyData.members.length})</h3>
          <div className="space-y-2">
            {familyData.members.map((member: CreateFamilyMemberData, index: number) => (
              <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <img 
                  src={member.profile_image_url} 
                  alt={member.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-gray-600">{member.relationship}</p>
                  {member.memorial_video_url && (
                    <p className="text-xs text-blue-600">✓ Video incluido</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {familyData.gallery_images && familyData.gallery_images.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Galería Familiar ({familyData.gallery_images.length} fotos)</h3>
            <div className="grid grid-cols-4 gap-2">
              {familyData.gallery_images.slice(0, 8).map((image: string, index: number) => (
                <img 
                  key={index}
                  src={image} 
                  alt={`Galería ${index + 1}`}
                  className="w-full h-20 object-cover rounded-lg"
                />
              ))}
              {familyData.gallery_images.length > 8 && (
                <div className="w-full h-20 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-sm">
                  +{familyData.gallery_images.length - 8} más
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-between">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Atrás
          </button>
          <button
            onClick={onCreate}
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creando...' : 'Crear Perfil Familiar'}
          </button>
        </div>
      </div>
    </div>
  );
}
