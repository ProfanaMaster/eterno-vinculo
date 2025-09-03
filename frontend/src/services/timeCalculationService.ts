/**
 * Servicio para cálculos de tiempo en perfiles memoriales
 */

export interface TimeCalculation {
  years: number;
  months: number;
  days: number;
  totalDays: number;
}

export interface MemorialTimeInfo {
  timeWithUs: TimeCalculation;
  timeWithoutYou: TimeCalculation;
  formattedTimeWithUs: string;
  formattedTimeWithoutYou: string;
}

/**
 * Calcula la diferencia entre dos fechas en años, meses y días
 * @param startDate - Fecha de inicio
 * @param endDate - Fecha de fin
 * @returns Objeto con años, meses y días
 */
export const calculateTimeDifference = (startDate: string, endDate: string): TimeCalculation => {
  if (!startDate || !endDate) {
    return { years: 0, months: 0, days: 0, totalDays: 0 };
  }

  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  
  // Calcular diferencia total en días
  const timeDiff = end.getTime() - start.getTime();
  const totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  // Calcular años, meses y días
  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();
  
  // Ajustar si los días son negativos
  if (days < 0) {
    months--;
    const lastMonth = new Date(end.getFullYear(), end.getMonth(), 0);
    days += lastMonth.getDate();
  }
  
  // Ajustar si los meses son negativos
  if (months < 0) {
    years--;
    months += 12;
  }
  
  return {
    years: Math.max(0, years),
    months: Math.max(0, months),
    days: Math.max(0, days),
    totalDays
  };
};

/**
 * Formatea el tiempo en un texto legible
 * @param time - Objeto de tiempo
 * @returns Texto formateado
 */
export const formatTimeText = (time: TimeCalculation): string => {
  const parts: string[] = [];
  
  if (time.years > 0) {
    parts.push(`${time.years} ${time.years === 1 ? 'año' : 'años'}`);
  }
  
  if (time.months > 0) {
    parts.push(`${time.months} ${time.months === 1 ? 'mes' : 'meses'}`);
  }
  
  if (time.days > 0) {
    parts.push(`${time.days} ${time.days === 1 ? 'día' : 'días'}`);
  }
  
  if (parts.length === 0) {
    return 'Menos de un día';
  }
  
  if (parts.length === 1) {
    return parts[0];
  }
  
  if (parts.length === 2) {
    return `${parts[0]} y ${parts[1]}`;
  }
  
  return `${parts[0]}, ${parts[1]} y ${parts[2]}`;
};

/**
 * Calcula toda la información de tiempo para un perfil memorial
 * @param birthDate - Fecha de nacimiento
 * @param deathDate - Fecha de fallecimiento
 * @returns Información completa de tiempo
 */
export const calculateMemorialTime = (birthDate: string, deathDate: string): MemorialTimeInfo => {
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
  
  // Tiempo que estuvo con nosotros
  const timeWithUs = calculateTimeDifference(birthDate, deathDate);
  
  // Tiempo que ha pasado sin esa persona
  const timeWithoutYou = calculateTimeDifference(deathDate, todayString);
  
  return {
    timeWithUs,
    timeWithoutYou,
    formattedTimeWithUs: formatTimeText(timeWithUs),
    formattedTimeWithoutYou: formatTimeText(timeWithoutYou)
  };
};

/**
 * Obtiene mensaje personalizado para el tiempo con nosotros
 * @param timeWithUs - Tiempo que estuvo con nosotros
 * @returns Mensaje personalizado
 */
export const getTimeWithUsMessage = (timeWithUs: TimeCalculation): string => {
  if (timeWithUs.years === 0 && timeWithUs.months === 0) {
    return 'Un tiempo muy breve pero significativo';
  }
  
  if (timeWithUs.years < 1) {
    return 'Unos meses que cambiaron nuestras vidas para siempre';
  }
  
  if (timeWithUs.years < 5) {
    return 'Años de alegría y aprendizaje que nunca olvidaremos';
  }
  
  if (timeWithUs.years < 20) {
    return 'Décadas de momentos preciosos y recuerdos inolvidables';
  }
  
  return 'Una vida completa de amor, sabiduría y momentos inolvidables';
};

/**
 * Obtiene mensaje personalizado para el tiempo sin esa persona
 * @param timeWithoutYou - Tiempo que ha pasado sin esa persona
 * @returns Mensaje personalizado
 */
export const getTimeWithoutYouMessage = (timeWithoutYou: TimeCalculation): string => {
  if (timeWithoutYou.years === 0 && timeWithoutYou.months === 0) {
    return 'Apenas unos días, pero cada momento sin ti es eterno';
  }
  
  if (timeWithoutYou.years < 1) {
    return 'Meses que han pasado, pero tu recuerdo sigue vivo en cada día';
  }
  
  if (timeWithoutYou.years < 5) {
    return 'Años han pasado, pero tu presencia sigue siendo tan real como el primer día';
  }
  
  if (timeWithoutYou.years < 20) {
    return 'Décadas sin ti, pero tu amor y recuerdo siguen iluminando nuestros días';
  }
  
  return 'Muchos años han pasado, pero tu memoria sigue siendo un faro en nuestras vidas';
};
