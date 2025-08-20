import { useState, useEffect } from 'react'

export interface Setting {
  id: string
  key: string
  value: any
  description: string
}

export function useSettings() {
  const [settings, setSettings] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/settings')
      
      if (response.ok) {
        const result = await response.json()
        const settingsMap = (result.data || []).reduce((acc: Record<string, any>, setting: Setting) => {
          acc[setting.key] = setting.value
          return acc
        }, {})
        setSettings(settingsMap)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  return { settings, loading, refetch: fetchSettings }
}