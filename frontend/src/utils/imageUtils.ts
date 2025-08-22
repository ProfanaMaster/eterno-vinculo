/**
 * Convierte una URL de Cloudflare R2 a una URL del proxy del backend
 * para evitar problemas de CORS mientras se configura el acceso público
 */
export const getProxiedImageUrl = (originalUrl: string): string => {
  if (!originalUrl) return ''
  
  try {
    // Si ya es una URL del proxy, devolverla tal como está
    if (originalUrl.includes('/api/image-proxy/')) {
      return originalUrl
    }
    
    // Si es una URL de Supabase (legacy), devolverla tal como está
    if (originalUrl.includes('supabase.co')) {
      return originalUrl
    }
    
    // Si es una URL de Cloudflare R2 pública (r2.dev), usarla directamente
    if (originalUrl.includes('r2.dev')) {
      return originalUrl
    }
    
    // Si es una URL de Cloudflare R2 privada, extraer la key y usar el proxy
    if (originalUrl.includes('r2.cloudflarestorage.com')) {
      const urlObj = new URL(originalUrl)
      const pathParts = urlObj.pathname.split('/')
      // Remover el primer elemento vacío y el nombre del bucket
      const key = pathParts.slice(2).join('/')
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api'
      return `${API_URL}/image-proxy/${key}`
    }
    
    // Si no es una URL reconocida, devolverla tal como está
    return originalUrl
    
  } catch (error) {
    console.error('Error processing image URL:', error)
    return originalUrl
  }
}

/**
 * Hook para usar imágenes con proxy automático
 */
export const useProxiedImage = (originalUrl: string) => {
  return getProxiedImageUrl(originalUrl)
}

/**
 * Verifica si una URL necesita proxy
 */
export const needsProxy = (url: string): boolean => {
  // Solo las URLs privadas de R2 necesitan proxy, no las públicas (.r2.dev)
  return url.includes('r2.cloudflarestorage.com') && !url.includes('/api/image-proxy/') && !url.includes('r2.dev')
}
