import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { SettingsProvider } from '@/contexts/SettingsContext'
import Home from '@/pages/Home'
import VerifyEmail from '@/pages/VerifyEmail'
import ResetPassword from '@/pages/ResetPassword'
import AdminDashboard from '@/pages/AdminDashboard'
import UserDashboard from '@/pages/UserDashboard'
import CreateProfile from '@/pages/CreateProfile'
import SelectMemorialType from '@/pages/SelectMemorialType'
import CreateFamilyMemorial from '@/pages/CreateFamilyMemorial'
import PublicProfile from '@/pages/profile/PublicProfile'
import PreviewProfile from '@/pages/profile/PreviewProfile'
import MuroDeRecuerdos from '@/pages/MuroDeRecuerdos'
import TemplatePage from '@/pages/Template'
import SpecialProfiles from '@/pages/admin/SpecialProfiles'
import CreateCoupleProfile from '@/pages/admin/CreateCoupleProfile'
import ViewCoupleProfile from '@/pages/admin/ViewCoupleProfile'
import PublicCoupleProfile from '@/pages/profile/PublicCoupleProfile'
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
        // Detectar tipo de perfil basándose en la ruta actual y el slug
        const currentPath = window.location.pathname
        const isFamilyRoute = currentPath.startsWith('/familia/')
        const isFamilySlug = slug && slug.startsWith('familia-')
        
        if (isFamilyRoute || isFamilySlug) {
          // Es una ruta familiar o un slug familiar, intentar solo perfil familiar
          try {
            const response = await api.get(`/family-profiles/public/${slug}`)
            setProfile(response.data.data)
            setIsFamilyProfile(true)
          } catch (familyError) {
            throw familyError
          }
        } else {
          // Es una ruta individual, intentar solo perfil individual
          try {
            const response = await api.get(`/profiles/public/${slug}`)
            setProfile(response.data.data)
            setIsFamilyProfile(false)
          } catch (individualError) {
            throw individualError
          }
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
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/select-memorial-type" element={<SelectMemorialType />} />
          <Route path="/create" element={<CreateProfile />} />
          <Route path="/create-memorial" element={<CreateProfile />} />
          <Route path="/create-family-memorial" element={<CreateFamilyMemorial />} />
          <Route path="/edit/:id" element={<CreateProfile />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/special-profiles" element={<SpecialProfiles />} />
          <Route path="/admin/create-special-profile/:profileType" element={<CreateCoupleProfile />} />
          <Route path="/admin/couple-profile/:id" element={<ViewCoupleProfile />} />
          <Route path="/template" element={<TemplatePage />} />
          <Route path="/memorial/:slug" element={<PublicProfile />} />
          <Route path="/preview/:slug" element={<PreviewProfile />} />
          <Route path="/muro-de-recuerdos/:slug" element={<MuroDeRecuerdosPage />} />
          <Route path="/familia/:slug" element={<FamilyProfilePage />} />
          <Route path="/pareja/:slug" element={<PublicCoupleProfile />} />

        </Routes>
      </Router>
    </SettingsProvider>
  )
}

export default App