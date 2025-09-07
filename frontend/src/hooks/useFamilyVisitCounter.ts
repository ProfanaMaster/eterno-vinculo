import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { visitCounterManager } from '../utils/visitCounterManager';

interface UseFamilyVisitCounterProps {
  slug: string;
  initialCount?: number;
}

interface UseFamilyVisitCounterReturn {
  visitCount: number;
  isLoading: boolean;
  error: string | null;
  incrementVisit: () => Promise<void>;
}

export const useFamilyVisitCounter = ({ 
  slug, 
  initialCount = 0 
}: UseFamilyVisitCounterProps): UseFamilyVisitCounterReturn => {
  const [visitCount, setVisitCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasTriedIncrementRef = useRef(false);

  const incrementVisit = async () => {
    // Verificar si ya se intentó incrementar
    if (hasTriedIncrementRef.current || !slug) return;
    
    // Verificar con el manager global (usar prefijo para diferenciar de perfiles individuales)
    const familySlug = `family_${slug}`;
    if (!visitCounterManager.canIncrement(familySlug)) {
      hasTriedIncrementRef.current = true;
      return;
    }

    hasTriedIncrementRef.current = true;
    visitCounterManager.startIncrement(familySlug);
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post(`/family-profiles/public/${slug}/visit`);
      
      if (response.data.success) {
        setVisitCount(response.data.visit_count);
        visitCounterManager.completeIncrement(familySlug);
      }
    } catch (err: any) {
      if (err.response?.status === 429) {
        // Rate limit alcanzado - marcar como completado para evitar más intentos
        visitCounterManager.completeIncrement(familySlug);
      } else {
        setError(err.response?.data?.error || 'Error al registrar visita');
        // Reset para permitir reintento en caso de error real
        visitCounterManager.reset(familySlug);
        hasTriedIncrementRef.current = false;
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Incrementar visita automáticamente al montar el componente
  useEffect(() => {
    // Solo ejecutar una vez cuando el componente se monta
    if (slug && !hasTriedIncrementRef.current) {
      incrementVisit();
    }
  }, [slug]); // Solo dependencia del slug

  return {
    visitCount,
    isLoading,
    error,
    incrementVisit
  };
};
