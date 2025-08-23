import logger from '../utils/logger.js';

// Tipos de errores personalizados
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message, field = null) {
    super(message, 400, 'VALIDATION_ERROR');
    this.field = field;
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message) {
    super(message, 409, 'CONFLICT');
  }
}

export class PaymentError extends AppError {
  constructor(message, paymentCode = null) {
    super(message, 402, 'PAYMENT_ERROR');
    this.paymentCode = paymentCode;
  }
}

// Manejador principal de errores
export const errorHandler = (error, req, res, next) => {
  let err = { ...error };
  err.message = error.message;

  // Log del error
  if (err.isOperational === false || err.statusCode >= 500) {
    logger.error('Server Error:', {
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id
    });
  } else {
    logger.warn('Client Error:', {
      message: err.message,
      url: req.originalUrl,
      method: req.method,
      statusCode: err.statusCode,
      userId: req.user?.id
    });
  }

  // Error de validación de Joi
  if (error.name === 'ValidationError' && error.details) {
    const message = error.details.map(detail => detail.message).join(', ');
    err = new ValidationError(message);
  }

  // Error de Supabase
  if (error.code && error.code.startsWith('PGRST')) {
    err = handleSupabaseError(error);
  }

  // Error de Stripe
  if (error.type && error.type.startsWith('Stripe')) {
    err = handleStripeError(error);
  }

  // Error de MercadoPago
  if (error.name === 'MercadoPagoError') {
    err = handleMercadoPagoError(error);
  }

  // Errors de subida de archivos ahora manejados en el frontend con signed URLs

  // Errores de MongoDB/base de datos
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    err = new ConflictError(`${field} already exists`);
  }

  // Error de JWT
  if (error.name === 'JsonWebTokenError') {
    err = new AuthenticationError('Invalid token');
  }

  if (error.name === 'TokenExpiredError') {
    err = new AuthenticationError('Token expired');
  }

  // Enviar respuesta de error
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    code: err.code || 'INTERNAL_ERROR',
    ...(err.field && { field: err.field }),
    ...(err.paymentCode && { paymentCode: err.paymentCode }),
    ...(isDevelopment && { stack: err.stack }),
    timestamp: new Date().toISOString(),
    requestId: req.id || 'unknown'
  });
};

// Manejo de errores específicos de Supabase
const handleSupabaseError = (error) => {
  switch (error.code) {
    case 'PGRST116':
      return new NotFoundError('Resource');
    case '23505':
      return new ConflictError('Resource already exists');
    case '23503':
      return new ValidationError('Referenced resource does not exist');
    case '42501':
      return new AuthorizationError('Insufficient database permissions');
    default:
      return new AppError('Database error', 500, 'DATABASE_ERROR');
  }
};

// Manejo de errores de Stripe
const handleStripeError = (error) => {
  switch (error.type) {
    case 'StripeCardError':
      return new PaymentError(error.message, error.code);
    case 'StripeInvalidRequestError':
      return new ValidationError(error.message);
    case 'StripeAPIError':
      return new AppError('Payment service error', 503, 'PAYMENT_SERVICE_ERROR');
    case 'StripeConnectionError':
      return new AppError('Payment service unavailable', 503, 'PAYMENT_SERVICE_UNAVAILABLE');
    case 'StripeRateLimitError':
      return new AppError('Too many requests to payment service', 429, 'PAYMENT_RATE_LIMIT');
    default:
      return new PaymentError('Payment processing error');
  }
};

// Manejo de errores de MercadoPago
const handleMercadoPagoError = (error) => {
  if (error.status === 400) {
    return new ValidationError(error.message || 'Invalid payment data');
  }
  if (error.status === 401) {
    return new AuthenticationError('Invalid payment credentials');
  }
  return new PaymentError(error.message || 'Payment processing error');
};

// Middleware para manejar rutas no encontradas
export const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Route ${req.originalUrl}`);
  next(error);
};

// Manejador para errores async sin try-catch
export const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default errorHandler;