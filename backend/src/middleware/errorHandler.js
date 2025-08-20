// Manejador principal de errores
export const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || 500
  const message = error.message || 'Internal server error'
  
  console.error('Error:', {
    message,
    statusCode,
    url: req.originalUrl,
    method: req.method
  })

  res.status(statusCode).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  })
}

// Middleware para manejar rutas no encontradas
export const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`)
  error.statusCode = 404
  next(error)
}

export default errorHandler