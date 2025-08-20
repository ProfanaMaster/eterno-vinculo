import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface ProfileData {
  // Información básica
  profile_name: string
  description: string
  birth_date: string
  death_date: string
  
  // Medios
  profile_image_url?: string

  gallery_images: string[]
  memorial_video_url?: string
  
  // Configuración
  template_id?: string
  order_id?: string
}

interface ProfileState {
  // Estado del perfil
  profileData: ProfileData
  currentStep: number
  isPublished: boolean
  editCount: number
  
  // Estados de UI
  loading: boolean
  saving: boolean
  error: string | null
  
  // Acciones
  updateProfile: (data: Partial<ProfileData>) => void
  setCurrentStep: (step: number) => void
  saveProfile: () => Promise<void>
  publishProfile: () => Promise<void>
  resetProfile: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

/**
 * Store global para gestión del perfil memorial
 * Incluye estado de creación, edición y publicación
 */
export const useProfileStore = create<ProfileState>()(
  devtools(
    (set, get) => ({
      // Estado inicial
      profileData: {
        profile_name: '',
        description: '',
        birth_date: '',
        death_date: '',
        gallery_images: [],
      },
      currentStep: 0,
      isPublished: false,
      editCount: 0,
      loading: false,
      saving: false,
      error: null,

      // Actualizar datos del perfil
      updateProfile: (data) => {
        set((state) => ({
          profileData: { ...state.profileData, ...data },
          error: null
        }), false, 'updateProfile')
      },

      // Cambiar paso actual del wizard
      setCurrentStep: (step) => {
        set({ currentStep: step }, false, 'setCurrentStep')
      },

      // Guardar perfil (draft)
      saveProfile: async () => {
        const { profileData } = get()
        set({ saving: true, error: null })

        try {
          const { default: api } = await import('@/services/api')
          
          const response = await api.post('/profiles', profileData)
          
          set((state) => ({
            profileData: { ...state.profileData, order_id: response.data.data.id },
            saving: false
          }), false, 'saveProfile')

        } catch (error: any) {
          const message = error.response?.data?.error || error.message || 'Error al guardar el perfil'
          set({ 
            saving: false, 
            error: message
          }, false, 'saveProfile/error')
        }
      },

      // Publicar perfil
      publishProfile: async () => {
        const { profileData } = get()
        set({ loading: true, error: null })

        try {
          const { default: api } = await import('@/services/api')
          
          const response = await api.post(`/profiles/${profileData.order_id}/publish`)
          
          set((state) => ({ 
            profileData: { ...state.profileData, ...response.data.data },
            isPublished: true, 
            loading: false,
            editCount: 1 
          }), false, 'publishProfile')

        } catch (error: any) {
          const message = error.response?.data?.error || error.message || 'Error al publicar el perfil'
          set({ 
            loading: false, 
            error: message
          }, false, 'publishProfile/error')
        }
      },

      // Resetear estado
      resetProfile: () => {
        set({
          profileData: {
            profile_name: '',
            description: '',
            birth_date: '',
            death_date: '',
            gallery_images: [],
          },
          currentStep: 0,
          isPublished: false,
          editCount: 0,
          loading: false,
          saving: false,
          error: null
        }, false, 'resetProfile')
      },

      // Helpers para UI
      setLoading: (loading) => set({ loading }, false, 'setLoading'),
      setError: (error) => set({ error }, false, 'setError'),
    }),
    {
      name: 'profile-store', // Nombre para DevTools
    }
  )
)