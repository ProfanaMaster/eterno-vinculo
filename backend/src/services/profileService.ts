import { supabase } from '../../config/supabase.js'
import { NotFoundError, ValidationError, ConflictError } from '../middleware/errorHandler.js'

// Cache simple para perfiles de usuario (TTL: 2 minutos)
const profilesCache = new Map();
const PROFILES_CACHE_TTL = 2 * 60 * 1000; // 2 minutos

export class ProfileService {
  async canUserCreateMemorial(userId: string) {
    
    // Verificar si tiene un memorial activo
    const { data: activeMemorials, error: activeError } = await supabase
      .from('memorial_profiles')
      .select('id, profile_name')
      .eq('user_id', userId)
      .is('deleted_at', null)
    
    
    if (activeMemorials && activeMemorials.length > 0) {
      return false
    }
    
    // Verificar en el historial si ya eliminó un memorial
    const { data: deletedHistory, error: historyError } = await supabase
      .from('user_memorial_history')
      .select('id, action')
      .eq('user_id', userId)
      .eq('action', 'deleted')
    
    if (historyError) {
      // Fallback: verificar deleted_at
      const { data: deletedMemorials } = await supabase
        .from('memorial_profiles')
        .select('id')
        .eq('user_id', userId)
        .not('deleted_at', 'is', null)
      
      if (deletedMemorials && deletedMemorials.length > 0) {
        return false
      }
    } else {
      if (deletedHistory && deletedHistory.length > 0) {
        return false
      }
    }
    
    return true
  }

  async canUserEditMemorial(memorialId: string) {
    const { data: memorial } = await supabase
      .from('memorial_profiles')
      .select('edit_count, max_edits')
      .eq('id', memorialId)
      .is('deleted_at', null)
      .single()
    
    if (!memorial) return false
    
    return (memorial.edit_count || 0) < (memorial.max_edits || 1)
  }

  async createProfile(profileData: any) {
    
    // Verificar si el usuario puede crear un memorial
    const canCreate = await this.canUserCreateMemorial(profileData.user_id)
    
    if (!canCreate) {
      throw new ConflictError('No puedes crear más memoriales. Ya tienes uno activo o eliminaste uno anteriormente.')
    }

    // Forzar publicación automática
    const finalProfileData = {
      ...profileData,
      is_published: true,
      published_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('memorial_profiles')
      .insert(finalProfileData)
      .select()
      .single()

    if (error) {
      throw error;
    }
    
    
    // Registrar creación en historial
    try {
      const { error: historyError } = await supabase
        .from('user_memorial_history')
        .insert({
          user_id: profileData.user_id,
          memorial_id: data.id,
          action: 'created'
        })
      
      if (historyError) {
        console.error('❌ Error registrando creación:', historyError)
      } else {
      }
    } catch (err) {
      console.error('❌ Error en historial:', err)
    }
    
    // Invalidar cache del usuario
    const cacheKey = `profiles_${profileData.user_id}`;
    profilesCache.delete(cacheKey);
    
    return data
  }

  async updateProfile(profileId: string, userId: string, updateData: any) {
    // Verificar si el usuario puede editar este memorial
    const canEdit = await this.canUserEditMemorial(profileId)
    if (!canEdit) {
      throw new ConflictError('Ya no puedes editar este memorial. Has alcanzado el límite de ediciones.')
    }

    // Obtener datos actuales del perfil
    const { data: profile } = await supabase
      .from('memorial_profiles')
      .select('edit_count, user_id')
      .eq('id', profileId)
      .single()

    if (!profile) throw new NotFoundError('Memorial Profile')
    if (profile.user_id !== userId) throw new ValidationError('Unauthorized')

    const { data, error } = await supabase
      .from('memorial_profiles')
      .update({
        ...updateData,
        edit_count: profile.edit_count + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', profileId)
      .select()
      .single()

    if (error) throw error
    
    // Invalidar cache del usuario
    const cacheKey = `profiles_${userId}`;
    profilesCache.delete(cacheKey);
    
    return data
  }

  async publishProfile(profileId: string, userId: string) {
    const { data, error } = await supabase
      .from('memorial_profiles')
      .update({
        is_published: true,
        published_at: new Date().toISOString()
      })
      .eq('id', profileId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    
    // Invalidar cache del usuario
    const cacheKey = `profiles_${userId}`;
    profilesCache.delete(cacheKey);
    
    return data
  }

  async getPublicProfile(slug: string) {
    const { data, error } = await supabase
      .from('memorial_profiles')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .is('deleted_at', null) // Solo perfiles no eliminados
      .single()

    if (error || !data) throw new NotFoundError('Memorial Profile')
    return data
  }

  async deleteProfile(profileId: string, userId: string) {
    const { data: profile } = await supabase
      .from('memorial_profiles')
      .select('user_id')
      .eq('id', profileId)
      .single()

    if (!profile) throw new NotFoundError('Memorial Profile')
    if (profile.user_id !== userId) throw new ValidationError('Unauthorized')

    // Registrar PRIMERO en historial
    const { error: historyError } = await supabase
      .from('user_memorial_history')
      .insert({
        user_id: userId,
        memorial_id: profileId,
        action: 'deleted'
      })
    
    if (historyError) {
      console.error('❌ FALLO: Error registrando en historial:', historyError)
      throw new Error('No se pudo registrar la eliminación en el historial')
    }
    

    // Luego marcar como eliminado
    const { data, error } = await supabase
      .from('memorial_profiles')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', profileId)
      .select()
      .single()

    if (error) throw error
    
    profilesCache.delete(`profiles_${userId}`)
    return data
  }

  async getUserProfiles(userId: string) {
    // Verificar cache
    const cacheKey = `profiles_${userId}`;
    const cached = profilesCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < PROFILES_CACHE_TTL) {
      return cached.data;
    }
    
    const { data, error } = await supabase
      .from('memorial_profiles')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null) // Solo perfiles no eliminados
      .order('created_at', { ascending: false })

    if (error) throw error
    
    
    // Guardar en cache
    profilesCache.set(cacheKey, { data, timestamp: Date.now() });
    
    // Limpiar cache viejo
    if (profilesCache.size > 50) {
      const entries = Array.from(profilesCache.entries());
      entries.forEach(([key, value]) => {
        if (Date.now() - value.timestamp > PROFILES_CACHE_TTL) {
          profilesCache.delete(key);
        }
      });
    }
    
    return data
  }

  async getProfileById(profileId: string, userId: string) {
    const { data, error } = await supabase
      .from('memorial_profiles')
      .select('*')
      .eq('id', profileId)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single()

    if (error || !data) throw new NotFoundError('Memorial Profile')
    return data
  }

  async getTemplates() {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .order('created_at')

    if (error) throw error
    return data
  }
}