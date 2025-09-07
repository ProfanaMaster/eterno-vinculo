import { api } from '@/services/api';
import { CreateFamilyProfileData, FamilyProfile } from '../types/family';

// API endpoints para perfiles familiares
export const familyApi = {
  // Crear nuevo perfil familiar
  create: async (data: CreateFamilyProfileData): Promise<FamilyProfile> => {
    const response = await api.post('/family-profiles', data);
    // El backend devuelve { success: true, data: {...}, message: '...' }
    return response.data.data;
  },

  // Obtener perfil familiar por slug (público)
  getBySlug: async (slug: string): Promise<FamilyProfile> => {
    const response = await api.get(`/family-profiles/public/${slug}`);
    return response.data.data;
  },

  // Obtener perfiles familiares del usuario
  getUserProfiles: async (): Promise<FamilyProfile[]> => {
    const response = await api.get('/family-profiles/my-profiles');
    return response.data.data;
  },

  // Actualizar perfil familiar
  update: async (id: string, data: Partial<CreateFamilyProfileData>): Promise<FamilyProfile> => {
    const response = await api.put(`/family-profiles/${id}`, data);
    return response.data.data;
  },

  // Eliminar perfil familiar
  delete: async (id: string): Promise<void> => {
    await api.delete(`/family-profiles/${id}`);
  },

  // Incrementar visitas
  incrementVisit: async (slug: string): Promise<{ visit_count: number }> => {
    // Primero obtener el ID del perfil por slug
    const profile = await familyApi.getBySlug(slug);
    const response = await api.post(`/family-profiles/${profile.id}/visit`);
    return response.data;
  },

  // Agregar miembro familiar (funcionalidad futura para expansión)
  addMember: async (profileId: string, memberData: any): Promise<FamilyProfile> => {
    const response = await api.post(`/family-profiles/${profileId}/members`, memberData);
    return response.data;
  },

  // Remover miembro familiar (funcionalidad futura)
  removeMember: async (profileId: string, memberId: string): Promise<FamilyProfile> => {
    const response = await api.delete(`/family-profiles/${profileId}/members/${memberId}`);
    return response.data;
  }
};
