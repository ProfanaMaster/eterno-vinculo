import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { SettingsProvider } from '@/contexts/SettingsContext'
import Home from '@/pages/Home'
import VerifyEmail from '@/pages/VerifyEmail'
import AdminDashboard from '@/pages/AdminDashboard'
import UserDashboard from '@/pages/UserDashboard'
import CreateProfile from '@/pages/CreateProfile'
import SelectMemorialType from '@/pages/SelectMemorialType'
import CreateFamilyMemorial from '@/pages/CreateFamilyMemorial'
import PublicProfile from '@/pages/profile/PublicProfile'
import PreviewProfile from '@/pages/profile/PreviewProfile'
import MuroDeRecuerdos from '@/pages/MuroDeRecuerdos'
import TemplatePage from '@/pages/Template'
import { api } from '@/services/api'
import { FamilyTemplate } from '@/modules/family/components'

// Wrapper component para manejar la ruta
function MuroDeRecuerdosPage() {
  const { slug } = useParams<{ slug: string }>()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isFamilyProfile, setIsFamilyProfile] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Detectar tipo de perfil basándose en el slug
        const isFamilySlug = slug?.startsWith('familia-')
        
        if (isFamilySlug) {
          // Es un perfil familiar
          const response = await api.get(`/family-profiles/public/${slug}`)
          setProfile(response.data.data)
          setIsFamilyProfile(true)
        } else {
          // Es un perfil individual
          const response = await api.get(`/profiles/public/${slug}`)
          setProfile(response.data.data)
          setIsFamilyProfile(false)
        }
      } catch (error) {
        // Error silencioso para producción
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchProfile()
    }
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Perfil no encontrado</h1>
        </div>
      </div>
    )
  }

  return (
    <MuroDeRecuerdos 
      profileId={profile.id}
      profileName={isFamilyProfile ? profile.family_name : profile.profile_name}
      isFamilyProfile={isFamilyProfile}
    />
  )
}

// Wrapper component para perfiles familiares
function FamilyProfilePage() {
  const { slug } = useParams<{ slug: string }>()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get(`/family-profiles/public/${slug}`)
        setProfile(response.data.data)
      } catch (error) {
        console.error('Error fetching family profile:', error)
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchProfile()
    }
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Memorial familiar no encontrado</h1>
        </div>
      </div>
    )
  }

  return <FamilyTemplate templateId={profile.template_id || 'family-1'} profileData={profile} />
}



function App() {
  const { checkAuth } = useAuthStore()

  useEffect(() => {
    // Verificar autenticación inicial
    checkAuth().catch(() => {
      // Si falla, asegurar que loading sea false
      useAuthStore.setState({ loading: false })
    })
  }, [checkAuth])

  return (
    <SettingsProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/select-memorial-type" element={<SelectMemorialType />} />
          <Route path="/create" element={<CreateProfile />} />
          <Route path="/create-memorial" element={<CreateProfile />} />
          <Route path="/create-family-memorial" element={<CreateFamilyMemorial />} />
          <Route path="/edit/:id" element={<CreateProfile />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/template" element={<TemplatePage />} />
          <Route path="/memorial/:slug" element={<PublicProfile />} />
          <Route path="/preview/:slug" element={<PreviewProfile />} />
          <Route path="/muro-de-recuerdos/:slug" element={<MuroDeRecuerdosPage />} />
          <Route path="/familia/:slug" element={<FamilyProfilePage />} />

        </Routes>
      </Router>
    </SettingsProvider>
  )
}

export default App