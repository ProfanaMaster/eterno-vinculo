import { useSettings } from '@/contexts/SettingsContext'

export function useSettingsRefresh() {
  const { refetch } = useSettings()
  
  const refreshSettings = async () => {
    await refetch()
  }
  
  return { refreshSettings }
}