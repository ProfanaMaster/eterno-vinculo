import { useState } from 'react'
import { useSettings } from '@/contexts/SettingsContext'
import { useAuthStore } from '@/stores/authStore'
import { useUserOrders } from '@/hooks/useUserOrders'
import { useAutoRedirect } from '@/hooks/useAutoRedirect'
import { useDebugAuth } from '@/hooks/useDebugAuth'
import { useNavigate } from 'react-router-dom'
import AuthModal from '@/components/auth/AuthModal'

function DashboardButton() {
  const { isAuthenticated } = useAuthStore()
  
  if (!isAuthenticated) return null
  
  return (
    <div className="sm:hidden mb-6">
      <button 
        onClick={() => window.location.href = '/dashboard'}
        className="btn btn-accent btn-lg w-full"
      >
        Entrar a mi Cuenta de Usuario
      </button>
    </div>
  )
}

function Hero() {
  const { settings, loading } = useSettings()
  const { isAuthenticated } = useAuthStore()
  const { hasConfirmedOrders } = useUserOrders()
  const { shouldRedirect } = useAutoRedirect()
  const debugAuth = useDebugAuth() // Para debug
  const navigate = useNavigate()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register')
  const heroSettings = settings.hero_section || {}
  const statsSettings = settings.site_stats || {}
  

  if (loading) {
    return (
      <section id="inicio" className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </section>
    )
  }

  // TEMPORALMENTE DESHABILITADO - Solo usar redirección manual
  // if (shouldRedirect) {
  //   return (
  //     <section id="inicio" className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50">
  //       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  //         <div className="flex items-center justify-center h-64">
  //           <div className="text-center">
  //             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
  //             <p className="text-lg font-medium text-gray-700">Redirigiendo al Dashboard...</p>
  //             <p className="text-sm text-gray-500 mt-2">Tienes órdenes activas</p>
  //           </div>
  //         </div>
  //       </div>
  //     </section>
  //   )
  // }

  return (
    <section id="inicio" className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
              Códigos QR personalizados
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              {heroSettings.title || 'Honra la memoria de tus seres queridos'}
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {heroSettings.subtitle || 'Crea perfiles memoriales digitales únicos con fotos, videos y recuerdos. Comparte momentos especiales que perdurarán para siempre.'}
            </p>

            {/* Botón Dashboard solo en móvil cuando hay sesión */}
            <DashboardButton />
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button 
                onClick={() => {
                  // Si no está autenticado, abrir modal de registro
                  if (!isAuthenticated) {
                    setAuthMode('register');
                    setAuthModalOpen(true);
                    return;
                  }
                  
                  // Si está autenticado y tiene órdenes, ir al dashboard
                  if (isAuthenticated && hasConfirmedOrders) {
                    navigate('/dashboard');
                    return;
                  }
                  
                  // Si está autenticado pero no tiene órdenes, no hacer nada
                }}
                className="btn btn-primary btn-lg"
              >
                {heroSettings.cta_primary || 'Crear Memorial Ahora'}
              </button>
              <button 
                onClick={() => {
                  // Abrir modal de ejemplos en la sección Examples
                  const examplesSection = document.getElementById('ejemplos')
                  if (examplesSection) {
                    examplesSection.scrollIntoView({ behavior: 'smooth' })
                    // Simular clic en el botón "Ver Ejemplos Reales" después de un breve delay
                    setTimeout(() => {
                      const examplesButton = examplesSection.querySelector('button[onclick*="setIsModalOpen"]')
                      if (examplesButton) {
                        examplesButton.click()
                      }
                    }, 800)
                  }
                }}
                className="btn btn-secondary btn-lg"
              >
                {heroSettings.cta_secondary || 'Ver Ejemplos'}
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{statsSettings.memorials_created?.toLocaleString() || '1,200'}+</div>
                <div className="text-sm text-gray-600">Memoriales Creados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{statsSettings.monthly_visits ? (statsSettings.monthly_visits / 1000).toFixed(0) + 'K' : '50K'}+</div>
                <div className="text-sm text-gray-600">Visitas Mensuales</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{statsSettings.rating || '4.9'}★</div>
                <div className="text-sm text-gray-600">Calificación</div>
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="relative animate-slide-in">
            <div className="relative">
              {/* Main mockup */}
              <div className="bg-white rounded-2xl shadow-xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl h-48 mb-4 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white rounded-full mx-auto mb-3 flex items-center justify-center shadow-md">
                      <span className="text-2xl">👤</span>
                    </div>
                    <h3 className="font-semibold text-gray-800">Memorial Digital</h3>
                    <p className="text-sm text-gray-600">Honrando la memoria</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-3 animate-pulse">
                <div className="w-8 h-8 bg-gradient rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">QR</span>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-sm font-medium">Publicado</span>
                </div>
              </div>
            </div>

            {/* Background decoration */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-10 left-10 w-20 h-20 bg-primary/10 rounded-full"></div>
              <div className="absolute bottom-10 right-10 w-32 h-32 bg-accent/10 rounded-full"></div>
              <div className="absolute top-1/2 left-0 w-16 h-16 bg-secondary/10 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal de autenticación */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authMode}
      />
    </section>
  )
}

export default Hero