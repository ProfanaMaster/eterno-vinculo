import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { SettingsProvider } from '@/contexts/SettingsContext'
import Home from '@/pages/Home'
import VerifyEmail from '@/pages/VerifyEmail'
import AdminDashboard from '@/pages/AdminDashboard'
import UserDashboard from '@/pages/UserDashboard'
import CreateProfile from '@/pages/CreateProfile'
import PublicProfile from '@/pages/profile/PublicProfile'
import PreviewProfile from '@/pages/profile/PreviewProfile'
import MuroDeRecuerdos from '@/pages/MuroDeRecuerdos'
import { api } from '@/services/api'

// Wrapper component para manejar la ruta
function MuroDeRecuerdosPage() {
  const { slug } = useParams<{ slug: string }>()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get(`/profiles/public/${slug}`)
        setProfile(response.data.data)
      } catch (error) {
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Memorial no encontrado</h1>
        </div>
      </div>
    )
  }

  return (
    <MuroDeRecuerdos 
      profileId={profile.id}
      profileName={profile.profile_name}
    />
  )
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
          <Route path="/create" element={<CreateProfile />} />
          <Route path="/create-memorial" element={<CreateProfile />} />
          <Route path="/edit/:id" element={<CreateProfile />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/memorial/:slug" element={<PublicProfile />} />
          <Route path="/preview/:slug" element={<PreviewProfile />} />
          <Route path="/muro-de-recuerdos/:slug" element={<MuroDeRecuerdosPage />} />

        </Routes>
      </Router>
    </SettingsProvider>
  )
}

export default App