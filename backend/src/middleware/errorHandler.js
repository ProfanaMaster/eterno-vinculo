// Manejador principal de errores
export const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || 500
  const message = error.message || 'Internal server error'
  
  // Log más detallado para Railway
  console.error('🚨 Error:', {
    mensaje: message,
    'Código de estado': statusCode,
    URL: req.originalUrl,
    método: req.method,
    timestamp: new Date().toISOString(),
    userAgent: req.get('User-Agent'),
    ip: req.ip
  })

  res.status(statusCode).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  })
}

// Middleware para manejar rutas no encontradas
export const notFoundHandler = (req, res, next) => {
  const error = new Error(`Ruta ${req.originalUrl} no encontrada`)
  error.statusCode = 404
  next(error)
}

export default errorHandler