/**
 * Servicio para verificar fechas de cumpleaños de perfiles memoriales
 */

export interface BirthdayCheckResult {
  isBirthday: boolean;
  daysUntilBirthday: number;
  age: number;
}

/**
 * Verifica si la fecha de nacimiento coincide con la fecha actual
 * @param birthDate - Fecha de nacimiento en formato YYYY-MM-DD
 * @returns Objeto con información del cumpleaños
 */
export const checkBirthday = (birthDate: string): BirthdayCheckResult => {
  if (!birthDate) {
    return {
      isBirthday: false,
      daysUntilBirthday: 0,
      age: 0
    };
  }

  const today = new Date();
  const birth = new Date(birthDate + 'T00:00:00');
  
  // Obtener mes y día actual
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();
  
  // Obtener mes y día de nacimiento
  const birthMonth = birth.getMonth();
  const birthDay = birth.getDate();
  
  // Verificar si es cumpleaños
  const isBirthday = currentMonth === birthMonth && currentDay === birthDay;
  
  // Calcular días hasta el próximo cumpleaños
  const nextBirthday = new Date(today.getFullYear(), birthMonth, birthDay);
  
  // Si ya pasó este año, calcular para el próximo año
  if (nextBirthday < today) {
    nextBirthday.setFullYear(today.getFullYear() + 1);
  }
  
  const timeDiff = nextBirthday.getTime() - today.getTime();
  const daysUntilBirthday = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  // Calcular edad (solo si hay fecha de fallecimiento)
  const age = today.getFullYear() - birth.getFullYear();
  
  return {
    isBirthday,
    daysUntilBirthday,
    age
  };
};

/**
 * Verifica si un perfil debe mostrar efecto de celebración
 * @param birthDate - Fecha de nacimiento del perfil
 * @returns true si debe mostrar celebración
 */
export const shouldShowCelebration = (birthDate: string): boolean => {
  return checkBirthday(birthDate).isBirthday;
};

/**
 * Obtiene mensaje personalizado para el cumpleaños
 * @param profileName - Nombre del perfil
 * @param birthDate - Fecha de nacimiento
 * @returns Mensaje de celebración
 */
export const getBirthdayMessage = (profileName: string, birthDate: string): string => {
  const { isBirthday, daysUntilBirthday } = checkBirthday(birthDate);
  
  if (isBirthday) {
    return `¡Hoy es el cumpleaños de ${profileName}! 🎉`;
  }
  
  if (daysUntilBirthday === 1) {
    return `Mañana es el cumpleaños de ${profileName} 🎂`;
  }
  
  if (daysUntilBirthday <= 7) {
    return `En ${daysUntilBirthday} días será el cumpleaños de ${profileName} 🎈`;
  }
  
  return '';
};
