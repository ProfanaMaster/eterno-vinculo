import { Router } from 'express';
import nodemailer from 'nodemailer';
import { requireAdmin } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = Router();

/**
 * POST /api/test-email/smtp
 * Probar conexión SMTP directamente (SIN AUTENTICACIÓN - SOLO PARA DEBUG)
 */
router.post('/smtp', async (req, res) => {
  try {
    console.log('🔧 Testing SMTP configuration...');
    console.log('SMTP_HOST:', process.env.SMTP_HOST);
    console.log('SMTP_PORT:', process.env.SMTP_PORT);
    console.log('SMTP_USER:', process.env.SMTP_USER);
    console.log('ADMIN_EMAIL_1:', process.env.ADMIN_EMAIL_1);
    console.log('ADMIN_EMAIL_2:', process.env.ADMIN_EMAIL_2);

    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: true, // SSL para puerto 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verificar conexión
    console.log('📡 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified!');

    // Enviar email de prueba
    const adminEmails = [
      process.env.ADMIN_EMAIL_1,
      process.env.ADMIN_EMAIL_2
    ].filter(Boolean);

    if (adminEmails.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No admin emails configured'
      });
    }

    const mailOptions = {
      from: `"Eterno Vinculo" <${process.env.SMTP_FROM}>`,
      to: adminEmails.join(', '),
      subject: '🧪 Test SMTP - Eterno Vinculo',
      text: 'Test email from Railway deployment',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            🧪 Test Email - Eterno Vinculo
          </h2>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 16px; margin-bottom: 15px;">
              <strong>¡SMTP funcionando correctamente desde Railway!</strong>
            </p>
            <div style="background-color: white; padding: 15px; border-radius: 5px; border-left: 4px solid #28a745;">
              <p><strong>Host:</strong> ${process.env.SMTP_HOST}</p>
              <p><strong>Puerto:</strong> ${process.env.SMTP_PORT}</p>
              <p><strong>Usuario:</strong> ${process.env.SMTP_USER}</p>
              <p><strong>Destinatarios:</strong> ${adminEmails.join(', ')}</p>
              <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
            </div>
          </div>
          <p style="font-size: 12px; color: #666; text-align: center;">
            Test desde Railway deployment - Eterno Vínculo
          </p>
        </div>
      `
    };

    console.log('📧 Sending test email to:', adminEmails.join(', '));
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully!');
    console.log('📧 Message ID:', info.messageId);

    res.json({
      success: true,
      message: 'Test email sent successfully',
      data: {
        messageId: info.messageId,
        recipients: adminEmails,
        smtp: {
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          user: process.env.SMTP_USER
        }
      }
    });

  } catch (error) {
    console.error('❌ SMTP test failed:', error);
    logger.error('SMTP test failed:', error);
    
    res.status(500).json({
      success: false,
      message: 'SMTP test failed',
      error: error.message,
      details: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
        hasPassword: !!process.env.SMTP_PASS
      }
    });
  }
});

/**
 * POST /api/test-email/order-notification
 * Simular notificación de orden pendiente (SIN AUTENTICACIÓN - SOLO PARA DEBUG)
 */
router.post('/order-notification', async (req, res) => {
  try {
    const testOrder = {
      id: 'test-order-' + Date.now(),
      user_id: 'test-user-id',
      total_amount: 150000.00,
      payment_method: 'Test Payment',
      payment_intent_id: 'test_pi_' + Date.now(),
      created_at: new Date().toISOString(),
      status: 'pending'
    };

    // Importar el servicio de notificaciones
    const emailNotificationService = await import('../services/emailNotificationService.js');
    await emailNotificationService.default.sendPendingOrderNotification(testOrder);

    res.json({
      success: true,
      message: 'Test order notification sent',
      data: testOrder
    });

  } catch (error) {
    console.error('❌ Order notification test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Order notification test failed',
      error: error.message
    });
  }
});

export default router;
