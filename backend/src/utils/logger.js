/**
 * Utilidad de logging para backend que respeta el entorno de producción
 */

const isDevelopment = process.env.NODE_ENV !== 'production';

const logger = {
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  
  warn: (...args) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  
  error: (...args) => {
    // Los errores siempre se muestran, incluso en producción
    console.error(...args);
  },
  
  debug: (...args) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },

  info: (...args) => {
    if (isDevelopment) {
      console.info(...args);
    }
  }
};

export { logger };
