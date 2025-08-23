import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import routes from './routes/index.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import nodemailer from 'nodemailer'
import { supabaseAdmin } from './config/supabase.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3002

// Middleware de seguridad y parsing
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json({ limit: '70mb' }))
app.use(express.urlencoded({ extended: true, limit: '70mb' }))

// Rutas principales
app.use('/api', routes)

// Middleware de errores
app.use(notFoundHandler)
app.use(errorHandler)

// Configurar transporter de email
let emailTransporter = null;
try {
  emailTransporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: { rejectUnauthorized: false }
  });
  console.log('✅ Email transporter configured successfully');
} catch (error) {
  console.error('❌ Error configuring email:', error);
}

// Función para enviar notificación
const sendOrderNotification = async (order) => {
  if (!emailTransporter) return;
  
  const adminEmails = [process.env.ADMIN_EMAIL_1, process.env.ADMIN_EMAIL_2].filter(Boolean);
  if (adminEmails.length === 0) return;

  try {
    await emailTransporter.sendMail({
      from: `"Eterno Vinculo" <${process.env.SMTP_FROM}>`,
      to: adminEmails.join(', '),
      subject: 'Nueva orden pendiente',
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
              <p><strong>Fecha:</strong> ${new Date(order.created_at).toLocaleString('es-ES')}</p>
            </div>
          </div>
        </div>
      `
    });
    console.log(`📧 Email sent for order: ${order.id}`);
  } catch (error) {
    console.error('❌ Error sending email:', error);
  }
};

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`)
  console.log(`🔗 Cloudflare R2 Bucket: ${process.env.R2_BUCKET_NAME}`)
  console.log(`📡 API Health: http://localhost:${PORT}/api/health`)
  console.log(`📤 Upload Health: http://localhost:${PORT}/api/upload/health`)
  
  // Configurar Supabase Realtime
  try {
    const channel = supabaseAdmin
      .channel('orders-notifications')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: 'status=eq.pending'
      }, (payload) => {
        console.log('📦 Order status changed:', payload);
        const { new: newRecord, old: oldRecord } = payload;
        if (newRecord?.status === 'pending' && oldRecord?.status !== 'pending') {
          console.log('📧 Sending notification for order:', newRecord.id);
          sendOrderNotification(newRecord);
        }
      })
      .subscribe((status) => {
        console.log('🔄 Realtime subscription status:', status);
      });
    
    console.log('🎧 Email notification system initialized');
  } catch (error) {
    console.error('❌ Failed to initialize notifications:', error);
  }
})

// Manejo de cierre graceful
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});