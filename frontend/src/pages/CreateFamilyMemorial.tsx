import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import FamilyWizard from '@/modules/family/components/wizard/FamilyWizard'
import { api } from '@/services/api'

interface PackageInfo {
  id: string
  packageId: string
  packageName: string
  packageType: string
}

function CreateFamilyMemorial() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [canCreate, setCanCreate] = useState(false)
  const [availableOrders, setAvailableOrders] = useState<PackageInfo[]>([])
  const [familyOrders, setFamilyOrders] = useState<PackageInfo[]>([])

  useEffect(() => {
    if (!user) {
      navigate('/dashboard')
      return
    }
    
    checkCapabilities()
  }, [user, navigate])

  const checkCapabilities = async () => {
    try {
      const response = await api.get('/profiles/can-create')
      const data = response.data
      
      setCanCreate(data.canCreate)
      setAvailableOrders(data.availableOrders || [])
      
      // Filtrar solo órdenes de tipo familiar
      const familyOrders = data.availableOrders?.filter((order: PackageInfo) => 
        order.packageType === 'family'
      ) || []
      
      setFamilyOrders(familyOrders)
      
      // Si no hay paquetes familiares, redirigir
      if (familyOrders.length === 0) {
        navigate('/select-memorial-type')
      }
    } catch (error) {
      console.error('Error checking capabilities:', error)
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleSuccess = (familyProfile: any) => {
    // Redirigir al dashboard con mensaje de éxito
    navigate('/dashboard?refresh=true&created=family')
  }

  const handleCancel = () => {
    navigate('/select-memorial-type')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!canCreate || familyOrders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-4">
              No tienes paquetes familiares
            </h1>
            <p className="text-gray-600 mb-6">
              Para crear un memorial familiar necesitas adquirir un paquete de tipo familiar.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/select-memorial-type')}
                className="btn btn-primary w-full"
              >
                Seleccionar otro tipo
              </button>
              <button
                onClick={() => navigate('/')}
                className="btn btn-secondary w-full"
              >
                Ver paquetes disponibles
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Crear Memorial Familiar
              </h1>
              <p className="text-gray-600 mt-1">
                Crea un hermoso memorial para honrar a tu familia
              </p>
            </div>
            <button
              onClick={handleCancel}
              className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100"
            >
              ← Cancelar
            </button>
          </div>
        </div>
      </div>

      {/* Wizard Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <FamilyWizard 
          availableOrders={familyOrders}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  )
}

export default CreateFamilyMemorial
