import { api } from './api'

interface Quotas {
  total: number
  used: number
  available: number
}

interface ProfileRestrictionCheck {
  canCreate: boolean
  reason?: string
  quotas: Quotas
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
        quotas: { total: 0, used: 0, available: 0 }
      }
    }
  }

  /**
   * Obtiene el mensaje de error apropiado cuando no se puede crear un perfil
   */
  static getRestrictionMessage(check: ProfileRestrictionCheck): string {
    if (check.quotas.total === 0) {
      return 'Necesitas al menos una orden pagada para crear memoriales.'
    }
    
    if (check.quotas.available <= 0) {
      return `Has alcanzado el límite de memoriales (${check.quotas.total}). Tienes ${check.quotas.used} memoriales activos.`
    }
    
    return check.reason || 'No puedes crear un perfil memorial en este momento.'
  }

  /**
   * Obtiene información de las cuotas disponibles
   */
  static getQuotasInfo(check: ProfileRestrictionCheck): string {
    const { total, used, available } = check.quotas
    
    if (total === 0) {
      return 'Sin cuotas disponibles'
    }
    
    if (available > 0) {
      return `${available} de ${total} cuotas disponibles`
    }
    
    return `${used}/${total} cuotas utilizadas`
  }
}
