import { useState, useEffect, useCallback } from 'react';
import { shouldShowCelebration, getBirthdayMessage } from '@/services/birthdayService';

interface UseBirthdayCelebrationProps {
  birthDate: string;
  profileName: string;
  autoStart?: boolean;
}

interface UseBirthdayCelebrationReturn {
  isCelebrating: boolean;
  birthdayMessage: string;
  startCelebration: () => void;
  stopCelebration: () => void;
  shouldShow: boolean;
}

/**
 * Hook para manejar la celebración de cumpleaños de perfiles memoriales
 * @param birthDate - Fecha de nacimiento del perfil
 * @param profileName - Nombre del perfil
 * @param autoStart - Si debe iniciar automáticamente (default: true)
 * @returns Objeto con estado y funciones de control
 */
export const useBirthdayCelebration = ({
  birthDate,
  profileName,
  autoStart = true
}: UseBirthdayCelebrationProps): UseBirthdayCelebrationReturn => {
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);
  const [hasCelebratedToday, setHasCelebratedToday] = useState(false);

  // Verificar si debe mostrar celebración
  useEffect(() => {
    if (birthDate) {
      const show = shouldShowCelebration(birthDate);
      setShouldShow(show);
      
      // Iniciar automáticamente si está configurado y es cumpleaños
      // Solo una vez por día, no en loop
      if (autoStart && show && !isCelebrating && !hasCelebratedToday) {
        setIsCelebrating(true);
        setHasCelebratedToday(true);
      }
    }
  }, [birthDate, autoStart, hasCelebratedToday]); // Agregado hasCelebratedToday

  // Obtener mensaje de cumpleaños
  const birthdayMessage = getBirthdayMessage(profileName, birthDate);

  // Función para iniciar celebración manualmente
  const startCelebration = useCallback(() => {
    if (shouldShow) {
      setIsCelebrating(true);
    }
  }, [shouldShow]);

  // Función para detener celebración
  const stopCelebration = useCallback(() => {
    setIsCelebrating(false);
  }, []);

  // Detener celebración automáticamente después de 7 segundos
  useEffect(() => {
    if (isCelebrating) {
      const timer = setTimeout(() => {
        setIsCelebrating(false);
      }, 7000);

      return () => clearTimeout(timer);
    }
  }, [isCelebrating]);

  // Reset diario para permitir celebración al día siguiente
  useEffect(() => {
    const checkNewDay = () => {
      const today = new Date().toDateString();
      const lastCelebrationDate = localStorage.getItem(`birthday-celebration-${profileName}-${birthDate}`);
      
      if (lastCelebrationDate !== today) {
        setHasCelebratedToday(false);
        localStorage.setItem(`birthday-celebration-${profileName}-${birthDate}`, today);
      }
    };

    // Verificar al montar el componente
    checkNewDay();

    // Verificar cada hora para detectar cambio de día
    const interval = setInterval(checkNewDay, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [profileName, birthDate]);

  return {
    isCelebrating,
    birthdayMessage,
    startCelebration,
    stopCelebration,
    shouldShow
  };
};
