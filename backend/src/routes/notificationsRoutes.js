import { Router } from 'express';
import emailNotificationService from '../services/emailNotificationService.js';
import { requireAdmin } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = Router();

/**
 * GET /api/notifications/status
 * Obtener estado del servicio de notificaciones
 */
router.get('/status', requireAdmin, async (req, res) => {
  try {
    const status = emailNotificationService.getStatus();
    const emailConnected = await emailNotificationService.testConnection();
    
    res.json({
      success: true,
      data: {
        listening: status.listening,
        emailService: emailConnected ? 'connected' : 'disconnected',
        lastCheck: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error checking notification service status:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking service status'
    });
  }
});

/**
 * POST /api/notifications/test
 * Enviar email de prueba
 */
router.post('/test', requireAdmin, async (req, res) => {
  try {
    const testOrder = {
      id: 'test-' + Date.now(),
      user_id: 'test-user',
      total_amount: 150000.00,
      payment_method: 'Test',
      payment_intent_id: 'test_payment_' + Date.now(),
      created_at: new Date().toISOString()
    };

    // Simular el envío de notificación
    await emailNotificationService.sendPendingOrderNotification(testOrder);
    
    logger.info('Test notification sent successfully');
    res.json({
      success: true,
      message: 'Test notification sent successfully'
    });
  } catch (error) {
    logger.error('Error sending test notification:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending test notification'
    });
  }
});

/**
 * POST /api/notifications/restart
 * Reiniciar servicio de notificaciones
 */
router.post('/restart', requireAdmin, async (req, res) => {
  try {
    await emailNotificationService.stopListening();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo
    await emailNotificationService.startListening();
    
    logger.info('Email notification service restarted');
    res.json({
      success: true,
      message: 'Email notification service restarted successfully'
    });
  } catch (error) {
    logger.error('Error restarting notification service:', error);
    res.status(500).json({
      success: false,
      message: 'Error restarting notification service'
    });
  }
});

export default router;
