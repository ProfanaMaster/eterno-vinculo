import { getUserFromToken } from '../config/supabase.js';
import { AuthenticationError } from './errorHandler.js';

// Cache simple para tokens (TTL: 5 minutos)
const tokenCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

const getCachedUser = async (token) => {
  const cached = tokenCache.get(token);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.user;
  }
  
  const user = await getUserFromToken(token);
  tokenCache.set(token, { user, timestamp: Date.now() });
  
  // Limpiar cache viejo
  if (tokenCache.size > 100) {
    const entries = Array.from(tokenCache.entries());
    entries.forEach(([key, value]) => {
      if (Date.now() - value.timestamp > CACHE_TTL) {
        tokenCache.delete(key);
      }
    });
  }
  
  return user;
};

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }
    
    const token = authHeader.substring(7);
    const user = await getCachedUser(token);
    
    req.user = user;
    next();
  } catch (error) {
    next(new AuthenticationError(error.message));
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const user = await getCachedUser(token);
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Continuar sin usuario si el token es inválido
    next();
  }
};