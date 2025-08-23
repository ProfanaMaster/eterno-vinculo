import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const testEmailConnection = async () => {
  console.log('🧪 Testing email configuration...');
  
  try {
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: true, // true para puerto 465
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
    console.log('✅ SMTP connection verified successfully!');

    // Enviar email de prueba
    console.log('📧 Sending test email...');
    const testEmail = {
      from: `"Eterno Vinculo" <${process.env.SMTP_FROM}>`,
      to: [process.env.ADMIN_EMAIL_1, process.env.ADMIN_EMAIL_2].filter(Boolean).join(', '),
      subject: '🧪 Test: Sistema de Notificaciones - Eterno Vinculo',
      text: 'Este es un email de prueba del sistema de notificaciones.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            🧪 Email de Prueba - Eterno Vinculo
          </h2>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 16px; margin-bottom: 15px;">
              <strong>¡El sistema de notificaciones está funcionando correctamente!</strong>
            </p>
            <div style="background-color: white; padding: 15px; border-radius: 5px; border-left: 4px solid #28a745;">
              <p><strong>Configuración SMTP:</strong> ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}</p>
              <p><strong>Remitente:</strong> ${process.env.SMTP_FROM}</p>
              <p><strong>Fecha de prueba:</strong> ${new Date().toLocaleString('es-ES')}</p>
            </div>
          </div>
          <p style="font-size: 12px; color: #666; text-align: center;">
            Este es un mensaje de prueba del sistema Eterno Vínculo
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully!');
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`📬 Recipients: ${testEmail.to}`);
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.error('🔍 Check your SMTP configuration in .env file');
  }
};

// Ejecutar prueba
testEmailConnection();
