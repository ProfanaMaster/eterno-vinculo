import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Input, Button } from '@/components/ui'
import { useProfileStore } from '@/stores/profileStore'

interface BasicInfoStepProps {
  onNext: () => void
  onPrev?: () => void
  canGoNext: boolean
  canGoPrev: boolean
}

/**
 * Primer paso del wizard - Información básica del perfil
 * Recolecta nombre, fechas y descripción inicial
 */
const BasicInfoStep = ({ onNext, canGoNext }: BasicInfoStepProps) => {
  const { profileData, updateProfile, saving, error } = useProfileStore()
  
  // Estado local para validación
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  /**
   * Validar campos requeridos
   */
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!profileData.profile_name.trim()) {
      newErrors.profile_name = 'El nombre es requerido'
    }

    if (!profileData.birth_date) {
      newErrors.birth_date = 'La fecha de nacimiento es requerida'
    }

    if (!profileData.death_date) {
      newErrors.death_date = 'La fecha de fallecimiento es requerida'
    }

    // Validar que la fecha de fallecimiento sea posterior al nacimiento
    if (profileData.birth_date && profileData.death_date) {
      if (new Date(profileData.death_date) <= new Date(profileData.birth_date)) {
        newErrors.death_date = 'La fecha debe ser posterior al nacimiento'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * Manejar cambios en los campos
   */
  const handleFieldChange = (field: string, value: string) => {
    updateProfile({ [field]: value })
    
    // Limpiar error del campo cuando se modifica
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  /**
   * Marcar campo como tocado
   */
  const handleFieldBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  /**
   * Continuar al siguiente paso
   */
  const handleNext = () => {
    // Marcar todos los campos como tocados
    setTouched({
      profile_name: true,
      birth_date: true,
      death_date: true,
      description: true
    })

    if (validateForm()) {
      onNext()
    }
  }

  // Validar en tiempo real cuando los campos cambian
  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      validateForm()
    }
  }, [profileData, touched])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Error general */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Información personal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <Input
            label="Nombre de la persona que honras"
            placeholder="Ej: María Elena González"
            value={profileData.profile_name}
            onChange={(e) => handleFieldChange('profile_name', e.target.value)}
            onBlur={() => handleFieldBlur('profile_name')}
            error={touched.profile_name ? errors.profile_name : undefined}
            required
          />
        </div>

        <Input
          label="Fecha de nacimiento"
          type="date"
          value={profileData.birth_date}
          onChange={(e) => handleFieldChange('birth_date', e.target.value)}
          onBlur={() => handleFieldBlur('birth_date')}
          error={touched.birth_date ? errors.birth_date : undefined}
          required
        />

        <Input
          label="Fecha de fallecimiento"
          type="date"
          value={profileData.death_date}
          onChange={(e) => handleFieldChange('death_date', e.target.value)}
          onBlur={() => handleFieldBlur('death_date')}
          error={touched.death_date ? errors.death_date : undefined}
          required
        />
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descripción inicial
          <span className="text-gray-500 font-normal ml-1">(opcional)</span>
        </label>
        <textarea
          placeholder="Escribe una breve descripción o deja en blanco para elegir una plantilla más adelante..."
          value={profileData.description}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          onBlur={() => handleFieldBlur('description')}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        />
        <p className="mt-1 text-sm text-gray-500">
          Puedes personalizar esto más adelante con plantillas predefinidas
        </p>
      </div>

      {/* Información adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">
              Información importante
            </h4>
            <p className="text-sm text-blue-700">
              Esta información será visible públicamente en el perfil memorial. 
              Podrás editarla una vez más después de la publicación.
            </p>
          </div>
        </div>
      </div>

      {/* Botones de navegación */}
      <div className="flex justify-between pt-6">
        <div></div> {/* Spacer para alinear el botón a la derecha */}
        
        <Button
          onClick={handleNext}
          disabled={saving}
          loading={saving}
        >
          {canGoNext ? 'Continuar' : 'Siguiente'}
        </Button>
      </div>
    </motion.div>
  )
}

export default BasicInfoStep