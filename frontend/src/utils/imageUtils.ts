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
    
    // Si es una URL de Cloudflare R2 privada, convertir directamente a URL pública
    if (originalUrl.includes('r2.cloudflarestorage.com')) {
      const urlObj = new URL(originalUrl)
      const pathParts = urlObj.pathname.split('/')
      // Remover el primer elemento vacío y el nombre del bucket
      const key = pathParts.slice(2).join('/')
      // Convertir directamente a URL pública de R2
      return `https://pub-6a50d2dd90e14a1ab5d78f934e4d65c9.r2.dev/${key}`
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
  // En producción ya no necesitamos proxy, convertimos directamente a URLs públicas
  return false
}
