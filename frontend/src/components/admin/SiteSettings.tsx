import { useState, useEffect } from 'react'
import { Button, Input } from '@/components/ui'
import { supabase } from '@/config/supabase'
import { useSettings } from '@/contexts/SettingsContext'

interface Setting {
  id: string
  key: string
  value: any
  description: string
}

function SiteSettings() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [initializing, setInitializing] = useState(false)
  const [heroData, setHeroData] = useState({})
  const [footerData, setFooterData] = useState({})
  const [paymentData, setPaymentData] = useState({})
  const [statsData, setStatsData] = useState({})
  const [pricingData, setPricingData] = useState({})
  const { refetch: refetchPublicSettings } = useSettings()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      
      if (!token) return
      
      const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3002/api'
      const response = await fetch(`${API_URL}/admin/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        const settingsData = result.data || []
        setSettings(settingsData)
        
        // Initialize form data
        settingsData.forEach((setting: Setting) => {
          switch (setting.key) {
            case 'hero_section':
              setHeroData(setting.value || {})
              break
            case 'footer_info':
              setFooterData(setting.value || {})
              break
            case 'payment_methods':
              setPaymentData(setting.value || {})
              break
            case 'site_stats':
              setStatsData(setting.value || {})
              break
            case 'pricing_plan':
              setPricingData(setting.value || {})
              break
          }
        })
      } else {
        console.error('Error response:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = async (key: string, value: any) => {
    try {
      setSaving(key)
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      
      if (!token) return
      
      const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3002/api'
      const response = await fetch(`${API_URL}/admin/settings/${key}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ value })
      })

      if (response.ok) {
        await fetchSettings()
        // Refrescar también los settings públicos
        await refetchPublicSettings()
        alert('Configuración actualizada exitosamente')
      }
    } catch (error) {
      console.error('Error updating setting:', error)
      alert('Error al actualizar la configuración')
    } finally {
      setSaving(null)
    }
  }

  const initializeSettings = async () => {
    try {
      setInitializing(true)
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      
      if (!token) return
      
      const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3002/api'
      const response = await fetch(`${API_URL}/admin/settings/init`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        await fetchSettings()
        alert('Configuraciones inicializadas exitosamente')
      } else {
        alert('Error al inicializar configuraciones')
      }
    } catch (error) {
      console.error('Error initializing settings:', error)
      alert('Error al inicializar configuraciones')
    } finally {
      setInitializing(false)
    }
  }

  const renderHeroSettings = () => {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sección Hero</h3>
        <div className="space-y-4">
          <Input
            label="Título Principal"
            value={heroData.title || ''}
            onChange={(e) => setHeroData({...heroData, title: e.target.value})}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows={3}
              value={heroData.subtitle || ''}
              onChange={(e) => setHeroData({...heroData, subtitle: e.target.value})}
            />
          </div>
          <Input
            label="Botón Primario"
            value={heroData.cta_primary || ''}
            onChange={(e) => setHeroData({...heroData, cta_primary: e.target.value})}
          />
          <Input
            label="Botón Secundario"
            value={heroData.cta_secondary || ''}
            onChange={(e) => setHeroData({...heroData, cta_secondary: e.target.value})}
          />
          <Button
            onClick={() => updateSetting('hero_section', heroData)}
            loading={saving === 'hero_section'}
            className="btn-primary"
          >
            Guardar Cambios
          </Button>
        </div>
      </div>
    )
  }

  const renderFooterSettings = () => {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Footer</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nombre de la Empresa"
            value={footerData.company_name || ''}
            onChange={(e) => setFooterData({...footerData, company_name: e.target.value})}
          />
          <Input
            label="Descripción"
            value={footerData.description || ''}
            onChange={(e) => setFooterData({...footerData, description: e.target.value})}
          />
          <Input
            label="Dirección"
            value={footerData.address || ''}
            onChange={(e) => setFooterData({...footerData, address: e.target.value})}
          />
          <Input
            label="Teléfono"
            value={footerData.phone || ''}
            onChange={(e) => setFooterData({...footerData, phone: e.target.value})}
          />
          <Input
            label="Email"
            value={footerData.email || ''}
            onChange={(e) => setFooterData({...footerData, email: e.target.value})}
          />
          <div className="md:col-span-2">
            <h4 className="font-medium text-gray-900 mb-2">Redes Sociales</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Facebook"
                value={(footerData as any).social?.facebook || ''}
                onChange={(e) => setFooterData({
                  ...footerData, 
                  social: {...(footerData as any).social, facebook: e.target.value}
                })}
              />
              <Input
                label="Instagram"
                value={(footerData as any).social?.instagram || ''}
                onChange={(e) => setFooterData({
                  ...footerData, 
                  social: {...(footerData as any).social, instagram: e.target.value}
                })}
              />
              <Input
                label="Twitter"
                value={(footerData as any).social?.twitter || ''}
                onChange={(e) => setFooterData({
                  ...footerData, 
                  social: {...(footerData as any).social, twitter: e.target.value}
                })}
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <Button
              onClick={() => updateSetting('footer_info', footerData)}
              loading={saving === 'footer_info'}
              className="btn-primary"
            >
              Guardar Cambios
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const renderPaymentSettings = () => {

    const updatePaymentMethod = (method: string, field: string, value: string) => {
      setPaymentData({
        ...paymentData,
        [method]: {
          ...paymentData[method],
          [field]: value
        }
      })
    }

    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Métodos de Pago</h3>
        <div className="space-y-6">
          {Object.entries(paymentData).map(([method, data]: [string, any]) => (
            <div key={method} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3 capitalize">{method}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nombre"
                  value={data.name}
                  onChange={(e) => updatePaymentMethod(method, 'name', e.target.value)}
                />
                <Input
                  label="Número de Cuenta"
                  value={data.account}
                  onChange={(e) => updatePaymentMethod(method, 'account', e.target.value)}
                />
                <Input
                  label="Tipo de Cuenta"
                  value={data.type}
                  onChange={(e) => updatePaymentMethod(method, 'type', e.target.value)}
                />
                <Input
                  label="Titular"
                  value={data.owner}
                  onChange={(e) => updatePaymentMethod(method, 'owner', e.target.value)}
                />
              </div>
            </div>
          ))}
          <Button
            onClick={() => updateSetting('payment_methods', paymentData)}
            loading={saving === 'payment_methods'}
            className="btn-primary"
          >
            Guardar Cambios
          </Button>
        </div>
      </div>
    )
  }

  const renderStatsSettings = () => {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas del Sitio</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Memoriales Creados"
            type="number"
            value={statsData.memorials_created}
            onChange={(e) => setStatsData({...statsData, memorials_created: parseInt(e.target.value)})}
          />
          <Input
            label="Visitas Mensuales"
            type="number"
            value={statsData.monthly_visits}
            onChange={(e) => setStatsData({...statsData, monthly_visits: parseInt(e.target.value)})}
          />
          <Input
            label="Calificación"
            type="number"
            step="0.1"
            value={statsData.rating}
            onChange={(e) => setStatsData({...statsData, rating: parseFloat(e.target.value)})}
          />
          <div className="md:col-span-3">
            <Button
              onClick={() => updateSetting('site_stats', statsData)}
              loading={saving === 'site_stats'}
              className="btn-primary"
            >
              Guardar Cambios
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const renderPricingSettings = () => {
    const updateFeature = (index: number, value: string) => {
      const newFeatures = [...(pricingData.features || [])]
      newFeatures[index] = value
      setPricingData({...pricingData, features: newFeatures})
    }

    const addFeature = () => {
      setPricingData({...pricingData, features: [...(pricingData.features || []), '']})
    }

    const removeFeature = (index: number) => {
      const newFeatures = (pricingData.features || []).filter((_, i) => i !== index)
      setPricingData({...pricingData, features: newFeatures})
    }

    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan de Precios</h3>
        <div className="space-y-4">
          <Input
            label="Nombre del Plan"
            value={pricingData.name}
            onChange={(e) => setPricingData({...pricingData, name: e.target.value})}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows={2}
              value={pricingData.subtitle}
              onChange={(e) => setPricingData({...pricingData, subtitle: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Precio"
              type="number"
              value={pricingData.price}
              onChange={(e) => setPricingData({...pricingData, price: parseInt(e.target.value)})}
            />
            <Input
              label="Moneda"
              value={pricingData.currency}
              onChange={(e) => setPricingData({...pricingData, currency: e.target.value})}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Características</label>
              <Button onClick={addFeature} className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200">
                + Agregar
              </Button>
            </div>
            <div className="space-y-2">
              {(pricingData.features || []).map((feature: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    placeholder="Característica del plan"
                  />
                  <Button
                    onClick={() => removeFeature(index)}
                    className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600"
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <Button
            onClick={() => updateSetting('pricing_plan', pricingData)}
            loading={saving === 'pricing_plan'}
            className="btn-primary"
          >
            Guardar Cambios
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Configuración del Sitio</h2>
        {settings.length === 0 && (
          <Button
            onClick={initializeSettings}
            loading={initializing}
            className="btn-primary"
          >
            Inicializar Configuraciones
          </Button>
        )}
      </div>
      
      {settings.length === 0 && !loading ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚙️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay configuraciones</h3>
          <p className="text-gray-600 mb-4">Inicializa las configuraciones por defecto para comenzar.</p>
        </div>
      ) : (
        settings.map((setting) => {
        switch (setting.key) {
          case 'hero_section':
            return <div key={setting.key}>{renderHeroSettings()}</div>
          case 'footer_info':
            return <div key={setting.key}>{renderFooterSettings()}</div>
          case 'payment_methods':
            return <div key={setting.key}>{renderPaymentSettings()}</div>
          case 'site_stats':
            return <div key={setting.key}>{renderStatsSettings()}</div>
          case 'pricing_plan':
            return <div key={setting.key}>{renderPricingSettings()}</div>
          default:
            return null
        }
      })
      )}
    </div>
  )
}

export default SiteSettings