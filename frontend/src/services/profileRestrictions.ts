import { api } from './api'

interface ProfileRestrictionCheck {
  canCreate: boolean
  reason?: string
  hasCompletedOrder: boolean
  hasActiveProfile: boolean
  hasDeletedProfile: boolean
}

/**
 * Servicio para verificar restricciones de perfiles memorial
 */
export class ProfileRestrictionsService {
  /**
   * Verifica si el usuario puede crear un nuevo perfil memorial
   */
  static async canUserCreateProfile(): Promise<ProfileRestrictionCheck> {
    try {
      const response = await api.get('/profiles/can-create')
      return response.data
    } catch (error: any) {
      console.error('❌ Error verificando restricciones de perfil:', error)
      
      // Si hay error de red o servidor, asumir que no puede crear
      return {
        canCreate: false,
        reason: 'Error verificando permisos. Inténtalo más tarde.',
        hasCompletedOrder: false,
        hasActiveProfile: false,
        hasDeletedProfile: false
      }
    }
  }

  /**
   * Obtiene el mensaje de error apropiado cuando no se puede crear un perfil
   */
  static getRestrictionMessage(check: ProfileRestrictionCheck): string {
    if (!check.hasCompletedOrder) {
      return 'Necesitas una orden completada para crear un memorial.'
    }
    
    if (check.hasActiveProfile) {
      return 'Solo puedes crear un memorial. Elimina el existente para crear uno nuevo.'
    }
    
    if (check.hasDeletedProfile) {
      return 'Ya eliminaste un memorial anteriormente. No puedes crear más memoriales.'
    }
    
    return check.reason || 'No puedes crear un perfil memorial en este momento.'
  }
}
