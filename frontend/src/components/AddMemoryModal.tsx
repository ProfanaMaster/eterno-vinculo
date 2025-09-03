import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/config/supabase'
import Captcha from '@/components/ui/Captcha'

interface AddMemoryModalProps {
  isOpen: boolean
  onClose: () => void
  profileId: string
  profileName: string
  onSuccess: () => void
}

const AddMemoryModal = ({ isOpen, onClose, profileId, profileName, onSuccess }: AddMemoryModalProps) => {
  const [formData, setFormData] = useState({
    author_name: '',
    message: '',
    song: '',
    is_authorized: false
  })
  const [thingsList, setThingsList] = useState<string[]>([''])
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>('')
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [captchaId, setCaptchaId] = useState('')
  const [captchaInput, setCaptchaInput] = useState('')

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCaptchaChange = (id: string, input: string) => {
    setCaptchaId(id);
    setCaptchaInput(input);
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhoto(file)
      const reader = new FileReader()
      reader.onload = () => setPhotoPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const addThingItem = () => {
    if (thingsList.length < 3) {
      setThingsList([...thingsList, ''])
    }
  }

  const updateThingItem = (index: number, value: string) => {
    const updated = [...thingsList]
    updated[index] = value
    setThingsList(updated)
  }

  const removeThingItem = (index: number) => {
    setThingsList(thingsList.filter((_, i) => i !== index))
  }

  const [uploadProgress, setUploadProgress] = useState(0)

  const uploadPhoto = async (file: File): Promise<string> => {
    const { default: UploadService } = await import('@/services/uploadService')
    return await UploadService.uploadMemoryImage(
      file, 
      (progress) => setUploadProgress(progress.percentage)
    )
  }

  const sanitizeInput = (input: string): string => {
    return input.trim().replace(/<[^>]*>/g, '').substring(0, 500)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!photo) {
        throw new Error('La foto es requerida')
      }

      const sanitizedName = sanitizeInput(formData.author_name)
      const sanitizedMessage = sanitizeInput(formData.message)
      const sanitizedSong = sanitizeInput(formData.song)

      if (!sanitizedName || !sanitizedMessage) {
        throw new Error('El nombre y mensaje son requeridos')
      }

      // Subir foto
      const photoUrl = await uploadPhoto(photo)

      // Filtrar items vacíos de la lista
      const filteredThings = thingsList.filter(item => item.trim() !== '')

      // Guardar usando endpoint público
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api'
      const response = await fetch(`${API_URL}/memories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          memorial_profile_id: profileId,
          photo_url: photoUrl,
          author_name: sanitizedName,
          message: sanitizedMessage,
          song: sanitizedSong || null,
          things_list: filteredThings.map(item => sanitizeInput(item)),
          captcha_id: captchaId,
          captcha_input: captchaInput
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error response:', errorText)
        throw new Error('Error al enviar el recuerdo')
      }
      
      const data = await response.json()

      // Mostrar modal de éxito
      setShowSuccessModal(true)
      
      // Resetear formulario
      setFormData({
        author_name: '',
        message: '',
        song: '',
        is_authorized: false
      })
      setThingsList([''])
      setPhoto(null)
      setPhotoPreview('')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-gradient-to-br from-white to-purple-50 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-purple-100"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-purple-100">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  💜 Dejar un Recuerdo
                </h2>
                <p className="text-gray-600 mt-1">Para {profileName}</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
                {error}
              </div>
            )}
            


            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Foto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  📸 Foto del recuerdo *
                </label>
                {!photoPreview ? (
                  <div className="relative">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={handlePhotoChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      required
                    />
                    <div className="border-2 border-dashed border-purple-300 rounded-xl p-8 text-center hover:border-purple-400 hover:bg-purple-50 transition-colors">
                      <div className="text-4xl mb-3">📷</div>
                      <p className="text-gray-600 font-medium mb-1">Haz clic para subir una foto</p>
                      <p className="text-sm text-gray-500">Una imagen que represente tu recuerdo especial</p>
                      <p className="text-xs text-gray-400 mt-2">JPG o PNG (máx. 2MB)</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Vista previa"
                      className="w-full h-48 object-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setShowPhotoModal(true)}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPhoto(null)
                        setPhotoPreview('')
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                      Clic para ampliar
                    </div>
                  </div>
                )}
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  👤 Tu nombre *
                </label>
                <input
                  type="text"
                  value={formData.author_name}
                  onChange={(e) => handleInputChange('author_name', e.target.value)}
                  placeholder="Ej: María González, Amigo de la familia..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  maxLength={100}
                  required
                />
              </div>

              {/* Mensaje */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  💭 Mensaje conmemorativo *
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  rows={4}
                  placeholder="Comparte una anécdota, un recuerdo especial, o palabras que honren su memoria..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all"
                  maxLength={500}
                  required
                />
                <div className="text-right text-xs text-gray-400 mt-1">
                  {formData.message.length}/500 caracteres
                </div>
              </div>

              {/* Canción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🎵 Canción especial (opcional)
                </label>
                <input
                  type="text"
                  value={formData.song}
                  onChange={(e) => handleInputChange('song', e.target.value)}
                  placeholder="Ej: 'Imagine' de John Lennon, o link de YouTube"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  maxLength={200}
                />
              </div>

              {/* Lista de cosas que extraña */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  💝 Lo que más extrañas (máximo 3)
                </label>
                {thingsList.map((thing, index) => (
                  <div key={index} className="flex items-center space-x-3 mb-3">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={thing}
                        onChange={(e) => updateThingItem(index, e.target.value)}
                        placeholder={[
                          "Sus abrazos y palabras de aliento",
                          "Las conversaciones hasta tarde",
                          "Su risa contagiosa"
                        ][index] || `Recuerdo especial ${index + 1}...`}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        maxLength={150}
                      />
                    </div>
                    {thingsList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeThingItem(index)}
                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                {thingsList.length < 3 && (
                  <button
                    type="button"
                    onClick={addThingItem}
                    className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 text-sm font-medium hover:bg-purple-50 px-3 py-2 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Agregar otro recuerdo</span>
                  </button>
                )}
              </div>

              {/* Captcha */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <Captcha onCaptchaChange={handleCaptchaChange} />
              </div>

              {/* Checkbox autorización */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="authorize"
                    checked={formData.is_authorized}
                    onChange={(e) => handleInputChange('is_authorized', e.target.checked)}
                    className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="authorize" className="text-sm text-gray-700 leading-relaxed">
                    <span className="font-medium">✨ Hacer público este recuerdo</span>
                    <br />
                    <span className="text-gray-600">Autorizo que este recuerdo aparezca en el Muro de los Recuerdos para que otros puedan verlo y honrar la memoria juntos.</span>
                  </label>
                </div>
              </div>

              {/* Botones */}
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Guardando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>💜</span>
                      <span>Guardar Recuerdo</span>
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Modal para vista ampliada de foto */}
        {showPhotoModal && photoPreview && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60 p-4"
            onClick={() => setShowPhotoModal(false)}
          >
            <div className="max-w-4xl max-h-full">
              <img
                src={photoPreview}
                alt="Vista previa ampliada"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
        )}

        {/* Modal de éxito */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">¡Recuerdo Enviado!</h3>
                <p className="text-gray-600 mb-6">
                  Tu recuerdo se ha enviado exitosamente. Será visible una vez que el propietario lo autorice.
                </p>
                <button
                  onClick={() => {
                    setShowSuccessModal(false)
                    onSuccess()
                  }}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AnimatePresence>
  )
}

export default AddMemoryModal