import { useNavigate, useLocation } from 'react-router-dom'
import { useSettings } from '@/contexts/SettingsContext'

function Footer() {
  const { settings, loading } = useSettings()
  const footerSettings = settings.footer_info || {}
  const navigate = useNavigate()
  const location = useLocation()

  const handleNavigation = (section: string) => {
    if (location.pathname === '/') {
      // Si estamos en la página principal, hacer scroll a la sección
      const element = document.getElementById(section)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      // Si estamos en otra página, navegar a la principal y luego a la sección
      navigate('/')
      setTimeout(() => {
        const element = document.getElementById(section)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    }
  }
  
  if (loading) {
    return (
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">EV</span>
                </div>
                <div>
                  <h3 className="font-bold text-xl">{footerSettings.company_name || 'Eterno Vínculo'}</h3>
                  <p className="text-gray-400 text-sm">Memoriales Digitales</p>
                </div>
              </div>
              <p className="text-gray-300 mb-6 max-w-md leading-relaxed">
                {footerSettings.description || 'Honramos la memoria de tus seres queridos con memoriales digitales hermosos, seguros y permanentes. Más de 1,200 familias confían en nosotros.'}
              </p>
              <div className="flex gap-4">
                {footerSettings.social?.facebook && (
                  <a href={footerSettings.social.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary transition-colors">
                    <img src="/facebook.png" alt="Facebook" className="w-5 h-5" />
                  </a>
                )}
                {footerSettings.social?.instagram && (
                  <a href={footerSettings.social.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary transition-colors">
                    <img src="/instagram.png" alt="Instagram" className="w-5 h-5" />
                  </a>
                )}
                {footerSettings.social?.twitter && (
                  <a href={footerSettings.social.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary transition-colors">
                    <img src="/tik-tok.png" alt="TikTok" className="w-5 h-5" />
                  </a>
                )}
              </div>
              
              {/* Contact Info */}
              {(footerSettings.address || footerSettings.phone || footerSettings.email) && (
                <div className="mt-6 space-y-2">
                  {footerSettings.address && (
                    <p className="text-gray-400 text-sm flex items-center gap-2">
                      <span>📍</span> {footerSettings.address}
                    </p>
                  )}
                  {footerSettings.phone && (
                    <p className="text-gray-400 text-sm flex items-center gap-2">
                      <span>📞</span> {footerSettings.phone}
                    </p>
                  )}
                  {footerSettings.email && (
                    <p className="text-gray-400 text-sm flex items-center gap-2">
                      <span>✉️</span> {footerSettings.email}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold text-lg mb-6">Producto</h4>
              <ul className="space-y-3">
                <li><button onClick={() => handleNavigation('caracteristicas')} className="text-gray-300 hover:text-white transition-colors text-left w-full">Características</button></li>
                <li><button onClick={() => handleNavigation('precios')} className="text-gray-300 hover:text-white transition-colors text-left w-full">Precios</button></li>
                <li><button onClick={() => handleNavigation('ejemplos')} className="text-gray-300 hover:text-white transition-colors text-left w-full">Ejemplos</button></li>
                <li><button onClick={() => navigate('/template')} className="text-gray-300 hover:text-white transition-colors text-left w-full">Plantillas</button></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold text-lg mb-6">Soporte</h4>
              <ul className="space-y-3">
                <li><button onClick={() => handleNavigation('faq')} className="text-gray-300 hover:text-white transition-colors text-left w-full">Preguntas Frecuentes</button></li>
                <li><button onClick={() => handleNavigation('inicio')} className="text-gray-300 hover:text-white transition-colors text-left w-full">Centro de Ayuda</button></li>
                <li><button onClick={() => handleNavigation('inicio')} className="text-gray-300 hover:text-white transition-colors text-left w-full">Contacto</button></li>
                <li><button onClick={() => handleNavigation('inicio')} className="text-gray-300 hover:text-white transition-colors text-left w-full">Tutoriales</button></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <p className="text-gray-400 text-sm">
                © 2024 Eterno Vínculo. Todos los derechos reservados.
              </p>
              <div className="flex gap-6">
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Términos de Servicio
                </a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Política de Privacidad
                </a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Cookies
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-sm">Hecho con</span>
              <span className="text-red-500">❤️</span>
              <span className="text-gray-400 text-sm">en Colombia</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer