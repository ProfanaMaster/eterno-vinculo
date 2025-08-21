import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { SettingsProvider } from '@/contexts/SettingsContext'
import Home from '@/pages/Home'
import VerifyEmail from '@/pages/VerifyEmail'
import AdminDashboard from '@/pages/AdminDashboard'
import UserDashboard from '@/pages/UserDashboard'
import CreateProfile from '@/pages/CreateProfile'
import PublicProfile from '@/pages/profile/PublicProfile'
import PreviewProfile from '@/pages/profile/PreviewProfile'

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
        </Routes>
      </Router>
    </SettingsProvider>
  )
}

export default App