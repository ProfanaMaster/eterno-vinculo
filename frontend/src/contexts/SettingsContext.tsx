import React, { createContext, useContext, useEffect, useState } from 'react'

interface Settings {
  hero_section?: {
    title: string
    subtitle: string
    cta_primary: string
    cta_secondary: string
  }
  site_stats?: {
    memorials_created: number
    monthly_visits: number
    rating: number
  }
  pricing_plan?: {
    name: string
    subtitle: string
    price: number
    currency: string
    features: string[]
  }
  footer_info?: {
    company_name: string
    description: string
    address: string
    phone: string
    email: string
    social: {
      facebook: string
      instagram: string
      twitter: string
    }
  }
  payment_methods?: {
    bancolombia: {
      name: string
      account: string
      type: string
      owner: string
    }
    nequi: {
      name: string
      account: string
      type: string
      owner: string
    }
    daviplata: {
      name: string
      account: string
      type: string
      owner: string
    }
  }
}

interface SettingsContextType {
  settings: Settings
  loading: boolean
  refetch: () => Promise<void>
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>({})
  const [loading, setLoading] = useState(true)

  const fetchSettings = async () => {
    try {
      const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3002/api'
      const response = await fetch(`${API_URL}/settings`)
      
      if (response.ok) {
        const result = await response.json()
        const settingsMap = (result.data || []).reduce((acc: Settings, setting: any) => {
          acc[setting.key as keyof Settings] = setting.value
          return acc
        }, {})
        setSettings(settingsMap)
      } else {
        console.error('❌ Settings API error:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('❌ Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
    
    // Refrescar settings cada 30 segundos
    const interval = setInterval(fetchSettings, 30000)
    
    // Refrescar cuando la página vuelve a ser visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchSettings()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return (
    <SettingsContext.Provider value={{ settings, loading, refetch: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}