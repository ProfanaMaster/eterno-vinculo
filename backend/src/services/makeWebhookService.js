import fetch from 'node-fetch';
import { makeConfig } from '../config/make.js';

class MakeWebhookService {
  constructor() {
    this.webhookUrl = makeConfig.webhookUrl;
    this.apiKey = makeConfig.apiKey;
    this.enabled = makeConfig.enabled;
  }

  /**
   * Envía datos de orden a Make
   * @param {Object} orderData - Datos de la orden
   * @returns {Promise<boolean>} - true si se envió exitosamente
   */
  async sendOrderData(orderData) {
    try {
      // Verificar si el webhook está habilitado
      if (!this.enabled) {
        return false;
      }

      // Validar que tenemos los datos requeridos
      if (!orderData || !orderData.id) {
        return false;
      }

      // Formatear fecha en formato legible
      const formatDate = (dateString) => {
        const date = new Date(dateString);
        const months = [
          'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        
        return `${day} de ${month} de ${year} + ${hours}:${minutes}`;
      };

      // Preparar payload con solo los datos necesarios
      const payload = {
        status: orderData.status,
        payment_intent_id: orderData.payment_intent_id,
        payment_method: orderData.payment_method,
        total_amount: orderData.total_amount,
        created_at: formatDate(orderData.created_at),
        order_id: orderData.id,
        user_id: orderData.user_id
      };



      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-make-apikey': this.apiKey
        },
        body: JSON.stringify(payload),
        timeout: 10000 // 10 segundos timeout
      });

      if (!response.ok) {
        return false;
      }

      return true;

    } catch (error) {
      return false;
    }
  }

  /**
   * Envía datos de orden de forma asíncrona (no bloquea la respuesta)
   * @param {Object} orderData - Datos de la orden
   */
  sendOrderDataAsync(orderData) {
    // Enviar de forma asíncrona para no bloquear la respuesta al cliente
    setImmediate(async () => {
      try {
        await this.sendOrderData(orderData);
      } catch (error) {
        // Error silencioso para no afectar el flujo principal
      }
    });
  }
}

export default new MakeWebhookService();
