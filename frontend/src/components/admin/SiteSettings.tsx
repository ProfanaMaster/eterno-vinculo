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
  const [examplesData, setExamplesData] = useState({})
  const [existingProfiles, setExistingProfiles] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showProfileSuggestions, setShowProfileSuggestions] = useState(false)
  const [packages, setPackages] = useState([])
  const [loadingPackages, setLoadingPackages] = useState(false)
  const { refetch: refetchPublicSettings } = useSettings()

  // Función para limpiar URLs duplicadas en los perfiles de ejemplo
  const cleanExampleProfilesUrls = (examplesData: any) => {
    if (!examplesData.memorial_profiles) return examplesData

    const cleanedProfiles = examplesData.memorial_profiles.map((profile: any) => {
      let cleanedSlug = profile.slug || ''
      
      
      // Si el slug es una URL completa, extraer solo la parte del slug
      if (cleanedSlug.startsWith('http')) {
        // Extraer el slug de cualquier URL completa
        const match = cleanedSlug.match(/\/([^\/]+)$/)
        if (match) {
          cleanedSlug = match[1]
        }
      }
      
      return {
        ...profile,
        slug: cleanedSlug
      }
    })

    return {
      ...examplesData,
      memorial_profiles: cleanedProfiles
    }
  }

  useEffect(() => {
    fetchSettings()
    fetchExistingProfiles()
    fetchPackages()
  }, [])

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.profile-search-container')) {
        setShowProfileSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchExistingProfiles = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      
      if (!token) return
      
      const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3002/api'
      const response = await fetch(`${API_URL}/admin/memorial-profiles`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        setExistingProfiles(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching profiles:', error)
    }
  }

  const fetchPackages = async () => {
    try {
      setLoadingPackages(true)
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      
      if (!token) return
      
      const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3002/api'
      const response = await fetch(`${API_URL}/admin/packages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        setPackages(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching packages:', error)
    } finally {
      setLoadingPackages(false)
    }
  }

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
            case 'examples_section':
              // Limpiar y corregir URLs duplicadas en los perfiles
              const cleanedExamplesData = cleanExampleProfilesUrls(setting.value || {})
              setExamplesData(cleanedExamplesData)
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
        // Si es pricing_plan, también sincronizar con la tabla packages
        if (key === 'pricing_plan') {
          await syncPricingWithPackages(value)
        }
        
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

  const syncPricingWithPackages = async (pricingData: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      
      if (!token) return
      
      const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3002/api'
      const response = await fetch(`${API_URL}/admin/packages/sync-pricing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ pricingData })
      })

      if (!response.ok) {
        console.error('Error sincronizando con packages')
      }
    } catch (error) {
      console.error('Error en syncPricingWithPackages:', error)
    }
  }

  const updatePackage = async (packageId: string, packageData: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      
      if (!token) return
      
      const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3002/api'
      const response = await fetch(`${API_URL}/admin/packages/${packageId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(packageData)
      })

      if (response.ok) {
        await fetchPackages() // Recargar paquetes
      }
    } catch (error) {
      console.error('Error updating package:', error)
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
                label="TikTok"
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


  // Nueva función para gestionar múltiples paquetes
  const renderPackagesManagement = () => {

    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Paquetes y Precios</h3>
        <p className="text-gray-600 mb-6">
          Gestiona todos los paquetes disponibles, precios y características. Los cambios se aplican inmediatamente.
        </p>
        
        {loadingPackages ? (
          <div className="text-center py-4">Cargando paquetes...</div>
        ) : (
          <div className="space-y-6">
            {packages.map((pkg: any) => (
              <div key={pkg.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium">
                    {pkg.name} - ${pkg.price?.toLocaleString()} {pkg.currency}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={pkg.is_active}
                        onChange={(e) => updatePackage(pkg.id, { ...pkg, is_active: e.target.checked })}
                        className="rounded"
                      />
                      <span className="ml-2 text-sm">Activo</span>
                    </label>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <Input
                    label="Nombre"
                    value={pkg.name || ''}
                    onChange={(e) => setPackages(packages.map((p: any) => 
                      p.id === pkg.id ? { ...p, name: e.target.value } : p
                    ))}
                  />
                  <Input
                    label="Precio"
                    type="number"
                    value={pkg.price || ''}
                    onChange={(e) => setPackages(packages.map((p: any) => 
                      p.id === pkg.id ? { ...p, price: parseInt(e.target.value) } : p
                    ))}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={2}
                    value={pkg.description || ''}
                    onChange={(e) => setPackages(packages.map((p: any) => 
                      p.id === pkg.id ? { ...p, description: e.target.value } : p
                    ))}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Paquete
                  </label>
                  <select
                    value={pkg.package_type || 'individual'}
                    onChange={(e) => setPackages(packages.map((p: any) => 
                      p.id === pkg.id ? { ...p, package_type: e.target.value } : p
                    ))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="individual">📱 Individual</option>
                    <option value="family">👨‍👩‍👧‍👦 Familiar</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Individual: Para una persona | Familiar: Para múltiples miembros de familia
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Características</label>
                  {(pkg.features || []).map((feature: string, index: number) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                        value={feature}
                        onChange={(e) => {
                          const newFeatures = [...pkg.features]
                          newFeatures[index] = e.target.value
                          setPackages(packages.map((p: any) => 
                            p.id === pkg.id ? { ...p, features: newFeatures } : p
                          ))
                        }}
                      />
                      <button
                        onClick={() => {
                          const newFeatures = pkg.features.filter((_: any, i: number) => i !== index)
                          setPackages(packages.map((p: any) => 
                            p.id === pkg.id ? { ...p, features: newFeatures } : p
                          ))
                        }}
                        className="px-3 py-2 text-red-600 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newFeatures = [...(pkg.features || []), '']
                      setPackages(packages.map((p: any) => 
                        p.id === pkg.id ? { ...p, features: newFeatures } : p
                      ))
                    }}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    + Agregar característica
                  </button>
                </div>

                <Button
                  onClick={() => updatePackage(pkg.id, pkg)}
                  className="btn-primary"
                >
                  Guardar Paquete
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const renderExamplesSettings = () => {
    const addProfile = () => {
      const newProfile = {
        profile_name: '',
        profile_image_url: '',
        birth_date: '',
        death_date: '',
        slug: '', // Solo el slug simple
        description: '',
        show_birth_date: true,
        show_death_date: true,
        type: 'individual'
      }
      setExamplesData({
        ...examplesData,
        memorial_profiles: [...(examplesData.memorial_profiles || []), newProfile]
      })
    }

    const removeProfile = (index: number) => {
      const updatedProfiles = (examplesData.memorial_profiles || []).filter((_, i) => i !== index)
      setExamplesData({
        ...examplesData,
        memorial_profiles: updatedProfiles
      })
    }

    const updateProfile = (index: number, field: string, value: string | boolean) => {
      const updatedProfiles = [...(examplesData.memorial_profiles || [])]
      updatedProfiles[index] = { ...updatedProfiles[index], [field]: value }
      setExamplesData({
        ...examplesData,
        memorial_profiles: updatedProfiles
      })
    }

    const selectExistingProfile = (profile: any, index: number) => {
      const updatedProfiles = [...(examplesData.memorial_profiles || [])]
      
      // Extraer solo el slug simple, no la URL completa
      let simpleSlug = profile.slug || ''
      
      // Si el slug viene como URL completa, extraer solo la parte del slug
      if (simpleSlug.startsWith('http')) {
        // Extraer el slug de la URL completa
        const match = simpleSlug.match(/\/([^\/]+)$/)
        if (match) {
          simpleSlug = match[1]
        }
      }
      
      updatedProfiles[index] = {
        profile_name: profile.profile_name,
        profile_image_url: profile.profile_image_url || '',
        birth_date: profile.birth_date || '',
        death_date: profile.death_date || '',
        slug: simpleSlug, // Solo el slug simple
        description: profile.description || '',
        show_birth_date: profile.show_birth_date !== false, // Por defecto true
        show_death_date: profile.show_death_date !== false, // Por defecto true
        type: profile.type || 'individual'
      }
      setExamplesData({
        ...examplesData,
        memorial_profiles: updatedProfiles
      })
      setSearchTerm('')
      setShowProfileSuggestions(false)
    }

    const filteredProfiles = existingProfiles.filter(profile =>
      profile.profile_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sección de Ejemplos</h3>
        <p className="text-gray-600 mb-6">
          Configura hasta 3 perfiles memoriales reales para mostrar como ejemplos en la página principal.
        </p>
        
        <div className="space-y-8">
          {(examplesData.memorial_profiles || []).map((profile: any, index: number) => (
            <div key={index} className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 text-sm font-semibold">{index + 1}</span>
                  </div>
                  <h4 className="text-md font-medium text-gray-900">Perfil {index + 1}</h4>
                </div>
                <button
                  onClick={() => removeProfile(index)}
                  className="group p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
                  title="Eliminar perfil"
                >
                  <svg 
                    className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors duration-200" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                    />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative profile-search-container">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Perfil</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={profile.profile_name || ''}
                      onChange={(e) => {
                        updateProfile(index, 'profile_name', e.target.value)
                        setSearchTerm(e.target.value)
                        setShowProfileSuggestions(true)
                      }}
                      onFocus={() => setShowProfileSuggestions(true)}
                      placeholder="Escribe para buscar perfiles existentes..."
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    {profile.profile_name && (
                      <button
                        onClick={() => {
                          updateProfile(index, 'profile_name', '')
                          setSearchTerm('')
                          setShowProfileSuggestions(false)
                        }}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  {/* Sugerencias de perfiles */}
                  {showProfileSuggestions && searchTerm && filteredProfiles.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredProfiles.map((suggestedProfile, suggestionIndex) => (
                        <button
                          key={suggestionIndex}
                          onClick={() => selectExistingProfile(suggestedProfile, index)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{suggestedProfile.profile_name}</div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                suggestedProfile.type === 'family' 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {suggestedProfile.type === 'family' ? '👨‍👩‍👧‍👦 Familiar' : '👤 Individual'}
                              </span>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">
                            {suggestedProfile.type === 'individual' && suggestedProfile.birth_date && suggestedProfile.death_date 
                              ? `${suggestedProfile.birth_date} - ${suggestedProfile.death_date}`
                              : suggestedProfile.type === 'family'
                              ? 'Perfil familiar con múltiples miembros'
                              : 'Sin fechas'
                            }
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <Input
                  label="URL de la Imagen"
                  value={profile.profile_image_url || ''}
                  onChange={(e) => updateProfile(index, 'profile_image_url', e.target.value)}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
                
                {/* Configuración de visibilidad de fechas */}
                <div className="md:col-span-2">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h5 className="text-sm font-medium text-gray-700 mb-3">📅 Configuración de Fechas</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={profile.show_birth_date !== false}
                            onChange={(e) => updateProfile(index, 'show_birth_date', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                        <span className="text-sm font-medium text-gray-700">Mostrar fecha de nacimiento</span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={profile.show_death_date !== false}
                            onChange={(e) => updateProfile(index, 'show_death_date', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                        <span className="text-sm font-medium text-gray-700">Mostrar fecha de fallecimiento</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Campos de fechas condicionales */}
                {profile.show_birth_date !== false && (
                  <Input
                    label="Fecha de Nacimiento"
                    type="date"
                    value={profile.birth_date || ''}
                    onChange={(e) => updateProfile(index, 'birth_date', e.target.value)}
                  />
                )}
                
                {profile.show_death_date !== false && (
                  <Input
                    label="Fecha de Fallecimiento"
                    type="date"
                    value={profile.death_date || ''}
                    onChange={(e) => updateProfile(index, 'death_date', e.target.value)}
                  />
                )}
                <Input
                  label={profile.type === 'family' ? "Slug del Perfil Familiar" : "Slug del Memorial"}
                  value={profile.slug || ''}
                  onChange={(e) => updateProfile(index, 'slug', e.target.value)}
                  placeholder={
                    profile.type === 'family' 
                      ? "familia-gonzales-hernandez-1234567890" 
                      : "juan-manuel-valdez-garcia-1234567890"
                  }
                />
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={2}
                    value={profile.description || ''}
                    onChange={(e) => updateProfile(index, 'description', e.target.value)}
                    placeholder="Breve descripción del perfil"
                  />
                </div>
              </div>
            </div>
          ))}
          
          {(examplesData.memorial_profiles || []).length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
              <div className="text-6xl mb-4">📝</div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">No hay perfiles configurados</h4>
              <p className="text-gray-600 mb-6">Agrega perfiles memoriales para mostrar como ejemplos</p>
              <Button
                onClick={addProfile}
                className="btn-primary"
              >
                + Agregar Primer Perfil
              </Button>
            </div>
          ) : (examplesData.memorial_profiles || []).length < 3 && (
            <div className="text-center">
              <Button
                onClick={addProfile}
                className="btn-secondary"
              >
                + Agregar Perfil
              </Button>
            </div>
          )}
          
          <div className="flex gap-3">
            <Button
              onClick={() => {
                // Limpiar URLs antes de guardar
                const cleanedData = cleanExampleProfilesUrls(examplesData)
                updateSetting('examples_section', cleanedData)
              }}
              loading={saving === 'examples_section'}
              className="btn-primary"
            >
              Guardar Cambios
            </Button>
            
            <Button
              onClick={() => {
                // Forzar limpieza de URLs duplicadas
                const cleanedData = cleanExampleProfilesUrls(examplesData)
                setExamplesData(cleanedData)
                alert('URLs duplicadas corregidas. Recuerda guardar los cambios.')
              }}
              className="btn-secondary"
            >
              🔧 Corregir URLs
            </Button>
          </div>
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
        <>
          {settings.map((setting) => {
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
                return null // Eliminamos la sección antigua, usamos solo renderPackagesManagement
              default:
                return null
            }
          })}
          
          {/* Nueva sección de gestión de paquetes */}
          {settings.find(s => s.key === 'pricing_plan') && (
            <div>{renderPackagesManagement()}</div>
          )}
          
          {/* Sección de Ejemplos al final */}
          {settings.find(s => s.key === 'examples_section') && (
            <div>{renderExamplesSettings()}</div>
          )}
        </>
      )}
    </div>
  )
}

export default SiteSettings