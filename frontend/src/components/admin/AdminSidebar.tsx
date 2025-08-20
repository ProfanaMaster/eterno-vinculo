interface AdminSidebarProps {
  currentView: string
  onViewChange: (view: string) => void
}

function AdminSidebar({ currentView, onViewChange }: AdminSidebarProps) {
  const menuItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: '📊',
      description: 'Estadísticas generales'
    },
    {
      id: 'orders',
      name: 'Órdenes',
      icon: '💳',
      description: 'Gestión de pagos'
    },
    {
      id: 'users',
      name: 'Usuarios',
      icon: '👥',
      description: 'Gestión de usuarios'
    },
    {
      id: 'settings',
      name: 'Configuración',
      icon: '⚙️',
      description: 'Ajustes del sitio'
    }
  ]

  return (
    <div className="w-64 bg-white shadow-lg border-r h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-accent-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">EV</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Admin Panel</h2>
            <p className="text-xs text-gray-500">Eterno Vínculo</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 flex-1 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
                  currentView === item.id
                    ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-gray-500">{item.description}</div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t bg-gray-50 flex-shrink-0">
        <button
          onClick={() => window.location.href = '/'}
          className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-white transition-colors duration-200"
        >
          <span>🏠</span>
          <span>Volver al sitio</span>
        </button>
      </div>
    </div>
  )
}

export default AdminSidebar