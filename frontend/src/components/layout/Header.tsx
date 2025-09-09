import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useUserOrders } from '@/hooks/useUserOrders';
import AuthModal from '@/components/auth/AuthModal';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const navigate = useNavigate();
  const location = useLocation();
  
  const { user, isAuthenticated, logout } = useAuthStore();
  const { getItemCount, toggleCart } = useCartStore();
  const { hasConfirmedOrders } = useUserOrders();
  
  const handleCreateMemorial = () => {
    if (isAuthenticated) {
      // Usuario autenticado - verificar si tiene órdenes
      if (hasConfirmedOrders) {
        // Si tiene órdenes, ir al dashboard
        navigate('/dashboard');
      }
    } else {
      // Usuario no autenticado - abrir modal de registro
      setAuthMode('register');
      setAuthModalOpen(true);
    }
  };

  const handleNavigation = (section: string) => {
    if (location.pathname === '/') {
      // Si estamos en la página principal, hacer scroll a la sección
      const element = document.getElementById(section);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Si estamos en otra página, navegar a la principal y luego a la sección
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(section);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg">EV</span>
            </div>
            <div>
              <h1 className="font-bold text-xl text-gray-900">Eterno Vínculo</h1>
              <p className="text-xs text-gray-500 -mt-1">Memoriales Digitales</p>
            </div>
          </div>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => handleNavigation('inicio')} 
              className="text-gray-600 hover:text-primary-600 transition-colors duration-200 font-medium"
            >
              Inicio
            </button>
            <button 
              onClick={() => handleNavigation('caracteristicas')} 
              className="text-gray-600 hover:text-primary-600 transition-colors duration-200 font-medium"
            >
              Características
            </button>
            <button 
              onClick={() => handleNavigation('ejemplos')} 
              className="text-gray-600 hover:text-primary-600 transition-colors duration-200 font-medium"
            >
              Ejemplos
            </button>
            <button 
              onClick={() => handleNavigation('precios')} 
              className="text-gray-600 hover:text-primary-600 transition-colors duration-200 font-medium"
            >
              Precios
            </button>
            <button 
              onClick={() => handleNavigation('faq')} 
              className="text-gray-600 hover:text-primary-600 transition-colors duration-200 font-medium"
            >
              FAQ
            </button>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {/* Carrito */}
                <button 
                  onClick={toggleCart}
                  className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h15M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                  {getItemCount() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {getItemCount()}
                    </span>
                  )}
                </button>
                
                {/* Usuario */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user?.name?.charAt(0) || user?.email?.charAt(0)}
                      </span>
                    </div>
                    <span className="text-gray-700 font-medium">{user?.name || 'Usuario'}</span>
                  </button>
                  
                  {/* Dropdown */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <button 
                      onClick={() => window.location.href = '/dashboard'}
                      className="w-full text-left block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-t-lg"
                    >
                      Dashboard
                    </button>
                    <button 
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-b-lg"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <button 
                  onClick={() => { setAuthMode('login'); setAuthModalOpen(true); }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
                >
                  Iniciar Sesión
                </button>
                <button 
                  onClick={handleCreateMemorial}
                  className="btn btn-primary"
                >
                  Crear Memorial
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 animate-fade-in">
            <nav className="flex flex-col space-y-2">
              <button 
                onClick={() => { handleNavigation('inicio'); setIsMenuOpen(false); }} 
                className="px-3 py-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors duration-200 font-medium text-left w-full"
              >
                Inicio
              </button>
              <button 
                onClick={() => { handleNavigation('caracteristicas'); setIsMenuOpen(false); }} 
                className="px-3 py-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors duration-200 font-medium text-left w-full"
              >
                Características
              </button>
              <button 
                onClick={() => { handleNavigation('ejemplos'); setIsMenuOpen(false); }} 
                className="px-3 py-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors duration-200 font-medium text-left w-full"
              >
                Ejemplos
              </button>
              <button 
                onClick={() => { handleNavigation('precios'); setIsMenuOpen(false); }} 
                className="px-3 py-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors duration-200 font-medium text-left w-full"
              >
                Precios
              </button>
              <button 
                onClick={() => { handleNavigation('faq'); setIsMenuOpen(false); }} 
                className="px-3 py-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors duration-200 font-medium text-left w-full"
              >
                FAQ
              </button>
              <div className="flex flex-col space-y-3 pt-4 mt-4 border-t border-gray-100">
                {isAuthenticated ? (
                  <>
                    {/* Carrito */}
                    <button 
                      onClick={() => { toggleCart(); setIsMenuOpen(false); }}
                      className="flex items-center justify-center space-x-2 p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h15M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
                      </svg>
                      <span>Carrito</span>
                      {getItemCount() > 0 && (
                        <span className="bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {getItemCount()}
                        </span>
                      )}
                    </button>
                    
                    {/* Usuario */}
                    <div className="flex items-center space-x-3 px-3 py-2 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user?.name?.charAt(0) || user?.email?.charAt(0)}
                        </span>
                      </div>
                      <span className="text-gray-700 font-medium">{user?.name || 'Usuario'}</span>
                    </div>
                    
                    {/* Dashboard */}
                    <button 
                      onClick={() => { window.location.href = '/dashboard'; setIsMenuOpen(false); }}
                      className="btn btn-secondary w-full"
                    >
                      Dashboard
                    </button>
                    
                    {/* Cerrar Sesión */}
                    <button 
                      onClick={() => { logout(); setIsMenuOpen(false); }}
                      className="btn btn-outline w-full"
                    >
                      Cerrar Sesión
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => { setAuthMode('login'); setAuthModalOpen(true); setIsMenuOpen(false); }}
                      className="btn btn-secondary w-full"
                    >
                      Iniciar Sesión
                    </button>
                    <button 
                      onClick={() => { handleCreateMemorial(); setIsMenuOpen(false); }}
                      className="btn btn-primary w-full"
                    >
                      Crear Memorial
                    </button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
      
      {/* Modal de Autenticación */}
      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authMode}
      />
    </header>
  );
}

export default Header;