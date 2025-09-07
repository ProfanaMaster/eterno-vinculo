import { useState, useEffect } from 'react';
import { familyApi } from '../services/familyApi';
import { FamilyProfile, CreateFamilyProfileData } from '../types/family';

// Hook para manejar perfil familiar por slug
export const useFamilyProfile = (slug?: string) => {
  const [profile, setProfile] = useState<FamilyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await familyApi.getBySlug(slug);
        setProfile(data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Error al cargar el perfil familiar');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [slug]);

  return { profile, loading, error, refetch: () => setProfile(null) };
};

// Hook para manejar perfiles familiares del usuario
export const useUserFamilyProfiles = () => {
  const [profiles, setProfiles] = useState<FamilyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const data = await familyApi.getUserProfiles();
      setProfiles(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar perfiles familiares');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  return { profiles, loading, error, refetch: fetchProfiles };
};

// Hook para crear perfil familiar
export const useCreateFamilyProfile = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProfile = async (data: CreateFamilyProfileData): Promise<FamilyProfile | null> => {
    try {
      setLoading(true);
      setError(null);
      const profile = await familyApi.create(data);
      return profile;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al crear perfil familiar');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createProfile, loading, error };
};

// Hook para contador de visitas familiar
export const useFamilyVisitCounter = (slug: string, initialCount: number = 0) => {
  const [visitCount, setVisitCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const incrementVisit = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await familyApi.incrementVisit(slug);
      setVisitCount(response.visit_count);
    } catch (err: any) {
      if (err.response?.status !== 429) { // Ignorar errores de rate limit
        setError(err.response?.data?.error || 'Error al registrar visita');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      incrementVisit();
    }
  }, [slug]);

  return { visitCount, isLoading, error, incrementVisit };
};
