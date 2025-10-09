import { useState } from 'react'
import { useSettings } from '@/contexts/SettingsContext'
import { useAuthStore } from '@/stores/authStore'
import { useUserOrders } from '@/hooks/useUserOrders'
import { useAutoRedirect } from '@/hooks/useAutoRedirect'
import { useDebugAuth } from '@/hooks/useDebugAuth'
import { useNavigate } from 'react-router-dom'
import AuthModal from '@/components/auth/AuthModal'
import { getSupabaseUrl } from '@/services/storage'

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
                  // Hacer scroll a la sección de ejemplos
                  const examplesSection = document.getElementById('ejemplos')
                  if (examplesSection) {
                    examplesSection.scrollIntoView({ behavior: 'smooth' })
                    // Simular clic en el botón "Ver Ejemplos Reales" después de un breve delay
                    setTimeout(() => {
                      const examplesButton = examplesSection.querySelector('button')
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
              {/* Imagen principal del producto */}
              <div className="relative bg-white rounded-3xl shadow-2xl p-4 transform hover:scale-105 transition-all duration-500 overflow-hidden group">
                {/* Efecto de brillo en hover */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:translate-x-full transform -translate-x-full"></div>
                
                {/* Contenedor de la imagen */}
                <div className="relative rounded-2xl overflow-hidden shadow-lg">
                  <img 
                    src={getSupabaseUrl('imagenes-pagina', 'img-portada.png')}
                    alt="Placa Memorial Eterno Vínculo"
                    className="w-full h-auto object-cover"
                  />
                  
                  {/* Overlay gradiente sutil */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

              </div>

              {/* Floating elements mejorados */}
              <div className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-2xl p-4 animate-float border-2 border-primary-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1z" clipRule="evenodd" />
                      <path d="M11 4a1 1 0 10-2 0v1a1 1 0 002 0V4zM10 7a1 1 0 011 1v1h2a1 1 0 110 2h-3a1 1 0 01-1-1V8a1 1 0 011-1zM16 9a1 1 0 100 2 1 1 0 000-2zM9 13a1 1 0 011-1h1a1 1 0 110 2v2a1 1 0 11-2 0v-3zM7 11a1 1 0 100-2H4a1 1 0 100 2h3zM17 13a1 1 0 01-1 1h-2a1 1 0 110-2h2a1 1 0 011 1zM16 17a1 1 0 100-2h-3a1 1 0 100 2h3z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-medium">Código QR</div>
                    <div className="text-sm font-bold text-gray-900">Personalizado</div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-2xl p-4 animate-bounce-slow border-2 border-green-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-medium">Hechos en</div>
                    <div className="text-sm font-bold text-gray-900">Aluminio Premium</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Background decoration mejorado */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-10 left-10 w-24 h-24 bg-primary/10 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute bottom-10 right-10 w-32 h-32 bg-accent/10 rounded-full blur-xl animate-pulse delay-75"></div>
              <div className="absolute top-1/2 left-0 w-20 h-20 bg-secondary/10 rounded-full blur-xl animate-pulse delay-150"></div>
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