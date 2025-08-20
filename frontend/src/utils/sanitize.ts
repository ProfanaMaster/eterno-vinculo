/**
 * Utilidades para sanitización de contenido y prevención de XSS
 */

/**
 * Sanitiza texto plano removiendo caracteres peligrosos
 */
export const sanitizeText = (text: string): string => {
  if (!text) return ''
  
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Sanitiza URLs para prevenir javascript: y data: schemes maliciosos
 */
export const sanitizeUrl = (url: string): string => {
  if (!url) return ''
  
  // Lista blanca de protocolos seguros
  const allowedProtocols = ['http:', 'https:', 'mailto:']
  
  try {
    const urlObj = new URL(url)
    if (!allowedProtocols.includes(urlObj.protocol)) {
      return ''
    }
    return url
  } catch {
    // Si no es una URL válida, retornar vacío
    return ''
  }
}

/**
 * Sanitiza nombres de archivo
 */
export const sanitizeFilename = (filename: string): string => {
  if (!filename) return ''
  
  return filename
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\.\./g, '')
    .trim()
}