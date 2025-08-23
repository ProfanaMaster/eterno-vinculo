import nodemailer from 'nodemailer';
import { supabaseAdmin } from '../config/supabase.js';
import logger from '../utils/logger.js';

class EmailNotificationService {
  constructor() {
    this.transporter = null;
    this.realtimeChannel = null;
    this.isListening = false;
    this.setupTransporter();
    this.setupRealtimeListener();
  }

  setupTransporter() {
    try {
      const smtpPort = parseInt(process.env.SMTP_PORT || '587');
      const isSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;
      
      this.transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: smtpPort,
        secure: isSecure, // true para puerto 465, false para otros puertos
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      logger.info(`✅ Email transporter configured successfully (${process.env.SMTP_HOST}:${smtpPort}, secure: ${isSecure})`);
    } catch (error) {
      logger.error('❌ Error configuring email transporter:', error);
      throw new Error('Failed to configure email service');
    }
  }

  setupRealtimeListener() {
    try {
      this.realtimeChannel = supabaseAdmin
        .channel('orders-notifications')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'orders',
            filter: 'status=eq.pending'
          },
          (payload) => this.handleOrderStatusChange(payload)
        );

      logger.info('🔄 Realtime listener configured for orders table');
    } catch (error) {
      logger.error('❌ Error configuring Realtime listener:', error);
      throw new Error('Failed to configure Realtime listener');
    }
  }

  async handleOrderStatusChange(payload) {
    try {
      const { new: newRecord, old: oldRecord } = payload;
      
      // Verificar que el status cambió a 'pending'
      if (newRecord?.status === 'pending' && oldRecord?.status !== 'pending') {
        logger.info(`📧 New pending order detected: ${newRecord.id}`);
        await this.sendPendingOrderNotification(newRecord);
      }
    } catch (error) {
      logger.error('❌ Error handling order status change:', error);
    }
  }

  async sendPendingOrderNotification(order) {
    try {
      const adminEmails = [
        process.env.ADMIN_EMAIL_1,
        process.env.ADMIN_EMAIL_2
      ].filter(Boolean);

      if (adminEmails.length === 0) {
        logger.warn('⚠️ No admin emails configured');
        return;
      }

      const emailConfig = {
        to: adminEmails,
        subject: 'Nueva orden pendiente',
        text: 'Tienes una nueva orden pendiente, revisa el Panel Administrativo Urgente!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
              🔔 Nueva Orden Pendiente
            </h2>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="font-size: 16px; margin-bottom: 15px;">
                <strong>Tienes una nueva orden pendiente, revisa el Panel Administrativo Urgente!</strong>
              </p>
              <div style="background-color: white; padding: 15px; border-radius: 5px; border-left: 4px solid #007bff;">
                <p><strong>ID de Orden:</strong> ${order.id}</p>
                <p><strong>Usuario:</strong> ${order.user_id}</p>
                <p><strong>Monto:</strong> $${order.total_amount ? parseFloat(order.total_amount).toLocaleString() : 'N/A'}</p>
                <p><strong>Método de Pago:</strong> ${order.payment_method || 'N/A'}</p>
                <p><strong>ID de Pago:</strong> ${order.payment_intent_id || 'N/A'}</p>
                <p><strong>Fecha:</strong> ${new Date(order.created_at).toLocaleString('es-ES')}</p>
              </div>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/admin/dashboard" 
                 style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Ver Panel Administrativo
              </a>
            </div>
            <p style="font-size: 12px; color: #666; text-align: center;">
              Este es un mensaje automático del sistema Eterno Vínculo
            </p>
          </div>
        `
      };

      await this.sendEmail(emailConfig);
      logger.info(`✅ Pending order notification sent for order: ${order.id}`);
    } catch (error) {
      logger.error(`❌ Error sending pending order notification for order ${order.id}:`, error);
    }
  }

  async sendEmail(config) {
    try {
      const mailOptions = {
        from: `"Eterno Vinculo" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: config.to.join(', '),
        subject: config.subject,
        text: config.text,
        html: config.html
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`📧 Email sent successfully to: ${config.to.join(', ')} | MessageID: ${info.messageId}`);
    } catch (error) {
      logger.error('❌ Error sending email:', error);
      throw error;
    }
  }

  async startListening() {
    if (this.isListening) {
      logger.warn('⚠️ Email notification service is already listening');
      return;
    }

    try {
      await this.realtimeChannel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          this.isListening = true;
          logger.info('🎧 Email notification service started listening to orders changes');
        } else if (status === 'CHANNEL_ERROR') {
          logger.error('❌ Error subscribing to Realtime channel');
          this.isListening = false;
        }
      });
    } catch (error) {
      logger.error('❌ Error starting email notification service:', error);
      throw error;
    }
  }

  async stopListening() {
    if (!this.isListening) {
      logger.warn('⚠️ Email notification service is not listening');
      return;
    }

    try {
      await this.realtimeChannel.unsubscribe();
      this.isListening = false;
      logger.info('🛑 Email notification service stopped listening');
    } catch (error) {
      logger.error('❌ Error stopping email notification service:', error);
    }
  }

  async testConnection() {
    try {
      await this.transporter.verify();
      logger.info('✅ Email service connection verified');
      return true;
    } catch (error) {
      logger.error('❌ Email service connection failed:', error);
      return false;
    }
  }

  getStatus() {
    return {
      listening: this.isListening
    };
  }
}

export default new EmailNotificationService();
