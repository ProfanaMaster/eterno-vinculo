import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/authStore'

interface PackageInfo {
  id: string
  packageId: string
  packageName: string
  packageType: string
}

interface QuotasInfo {
  total: number
  used: number
  available: number
  individual: {
    total: number
    used: number
    available: number
  }
  family: {
    total: number
    used: number
    available: number
  }
}

interface PackageTypes {
  individual: number
  family: number
}

function SelectMemorialType() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [quotas, setQuotas] = useState<QuotasInfo>({ total: 0, used: 0, available: 0 })
  const [packageTypes, setPackageTypes] = useState<PackageTypes>({ individual: 0, family: 0 })
  const [availableOrders, setAvailableOrders] = useState<PackageInfo[]>([])
  const [canCreate, setCanCreate] = useState(false)
  const [reason, setReason] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      navigate('/dashboard')
      return
    }
    
    fetchCapabilities()
  }, [user, navigate])

  const fetchCapabilities = async () => {
    try {
      const response = await api.get('/profiles/can-create')
      const data = response.data
      
      setCanCreate(data.canCreate)
      setReason(data.reason)
      setQuotas(data.quotas || { total: 0, used: 0, available: 0 })
      setPackageTypes(data.packageTypes || { individual: 0, family: 0 })
      setAvailableOrders(data.availableOrders || [])
    } catch (error) {
      console.error('Error fetching capabilities:', error)
      setReason('Error al verificar capacidades de creación')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectType = (type: 'individual' | 'family') => {
    if (type === 'individual') {
      navigate('/create-memorial')
    } else if (type === 'family') {
      navigate('/create-family-memorial')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!canCreate) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-4">
              No puedes crear memoriales
            </h1>
            <p className="text-gray-600 mb-6">
              {reason || 'No tienes cuotas disponibles para crear memoriales.'}
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn btn-primary w-full"
            >
              Volver al Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Selecciona el tipo de memorial
          </h1>
          <p className="text-gray-600 text-lg">
            Elige qué tipo de memorial deseas crear según los paquetes que has adquirido
          </p>
          <div className="mt-4 inline-flex items-center px-4 py-2 bg-blue-50 rounded-lg">
            <span className="text-blue-600 text-sm">
              📊 Tienes {quotas.available} cuotas disponibles de {quotas.total} totales
            </span>
          </div>
        </div>

        {/* Opciones de tipo de memorial */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {/* Memorial Individual */}
          <div 
            className={`bg-white rounded-xl shadow-sm border-2 p-8 text-center transition-all duration-200 ${
              quotas.individual.available > 0 
                ? 'border-blue-200 hover:border-blue-400 hover:shadow-md cursor-pointer' 
                : 'border-gray-200 opacity-50 cursor-not-allowed'
            }`}
            onClick={() => quotas.individual.available > 0 && handleSelectType('individual')}
          >
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Memorial Individual
            </h3>
            <p className="text-gray-600 mb-6">
              Crea un memorial dedicado a una persona especial con fotos, videos y recuerdos personalizados.
            </p>
            <div className="mb-6">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                quotas.individual.available > 0 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {quotas.individual.available > 0 
                  ? `✓ ${quotas.individual.available} cuota${quotas.individual.available > 1 ? 's' : ''} disponible${quotas.individual.available > 1 ? 's' : ''}` 
                  : '✕ No disponible'
                }
              </span>
            </div>
            {quotas.individual.available > 0 && (
              <button className="btn btn-primary w-full">
                Crear Memorial Individual
              </button>
            )}
          </div>

          {/* Memorial Familiar */}
          <div 
            className={`bg-white rounded-xl shadow-sm border-2 p-8 text-center transition-all duration-200 ${
              quotas.family.available > 0 
                ? 'border-purple-200 hover:border-purple-400 hover:shadow-md cursor-pointer' 
                : 'border-gray-200 opacity-50 cursor-not-allowed'
            }`}
            onClick={() => quotas.family.available > 0 && handleSelectType('family')}
          >
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Memorial Familiar
            </h3>
            <p className="text-gray-600 mb-6">
              Crea un memorial para toda la familia con múltiples perfiles, videos y galerías compartidas.
            </p>
            <div className="mb-6">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                quotas.family.available > 0 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {quotas.family.available > 0 
                  ? `✓ ${quotas.family.available} cuota${quotas.family.available > 1 ? 's' : ''} disponible${quotas.family.available > 1 ? 's' : ''}` 
                  : '✕ No disponible'
                }
              </span>
            </div>
            {quotas.family.available > 0 && (
              <button className="btn bg-purple-600 hover:bg-purple-700 text-white w-full">
                Crear Memorial Familiar
              </button>
            )}
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm mb-4">
            ¿No tienes el paquete que necesitas?
          </p>
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Ver paquetes disponibles →
          </button>
        </div>

        {/* Botón volver */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-600 hover:text-gray-700 text-sm"
          >
            ← Volver al Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

export default SelectMemorialType
