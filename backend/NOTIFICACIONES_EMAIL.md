# Sistema de Notificaciones por Email

Este documento describe el sistema de notificaciones automáticas por email implementado para el proyecto Eterno Vínculo.

## Funcionalidad

El sistema escucha cambios en tiempo real en la tabla `orders` de Supabase y envía notificaciones por email cuando el estado de una orden cambia a `pending`.

## Archivos Implementados

### 1. `src/services/emailNotificationService.ts`
Servicio principal que maneja:
- Conexión con Supabase Realtime
- Configuración del transporter de Nodemailer
- Envío de emails con plantilla HTML
- Manejo de errores y logging

### 2. `src/routes/notificationsRoutes.ts`
Rutas administrativas para:
- `/api/notifications/status` - Verificar estado del servicio
- `/api/notifications/test` - Enviar email de prueba
- `/api/notifications/restart` - Reiniciar el servicio

### 3. Modificaciones en `src/server.ts`
- Inicialización automática del servicio al arrancar el servidor
- Manejo de cierre graceful con SIGTERM/SIGINT

## Configuración Requerida

### Variables de Entorno (.env)

```env
# Email/SMTP Configuration (Hostinger)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=no-reply@eternovinculo.com
SMTP_PASS=#Eternovinculo.2025
SMTP_FROM=no-reply@eternovinculo.com

# Emails de administradores
ADMIN_EMAIL_1=carolupe23@gmail.com
ADMIN_EMAIL_2=mestizojhoselyn@gmail.com

# Frontend URL (para enlaces en emails)
FRONTEND_URL=https://tu-dominio.com
```

### Configuración SMTP Hostinger
- **Host**: smtp.hostinger.com
- **Puerto**: 465 (SSL/TLS seguro)
- **Autenticación**: Usuario y contraseña del email configurado
- **Remitente**: "Eterno Vinculo" <no-reply@eternovinculo.com>
- **Intervalo mínimo**: 60 segundos entre emails (según Supabase)

### Para otros proveedores SMTP
Si necesitas cambiar el proveedor:
- **Gmail**: smtp.gmail.com:587 (requiere contraseña de aplicación)
- **Outlook**: smtp-mail.outlook.com:587
- **Yahoo**: smtp.mail.yahoo.com:587

## Instalación y Deployment

### 1. Dependencias
Las dependencias ya están incluidas en `package.json`:
- `nodemailer` - Envío de emails
- `@supabase/supabase-js` - Realtime listeners
- `winston` - Logging

### 2. Railway Deployment
1. Agregar las variables de entorno en Railway
2. El servicio se iniciará automáticamente al desplegar
3. Verificar logs para confirmar inicialización

### 3. Verificación
```bash
# Verificar estado del servicio
GET /api/notifications/status

# Enviar email de prueba (requiere auth admin)
POST /api/notifications/test

# Reiniciar servicio si es necesario
POST /api/notifications/restart
```

## Comportamiento del Sistema

### Trigger de Notificación
- **Evento**: UPDATE en tabla `orders`
- **Condición**: `status` cambia a `'pending'`
- **Acción**: Envío inmediato de email a administradores
- **Esquema de la tabla**: `id`, `user_id`, `status`, `total_amount`, `payment_method`, `payment_intent_id`, `paid_at`, `created_at`

### Contenido del Email
- **Asunto**: "Nueva orden pendiente"
- **Mensaje**: "Tienes una nueva orden pendiente, revisa el Panel Administrativo Urgente!"
- **Información adicional**: ID de orden, usuario, monto (`total_amount`), método de pago, ID de pago (`payment_intent_id`), fecha
- **Enlace directo**: Al panel administrativo

### Características Técnicas
- ✅ **Múltiples notificaciones**: Cada cambio a 'pending' genera un email
- ✅ **Tiempo real**: Usa Supabase Realtime para respuesta inmediata
- ✅ **Manejo de errores**: Logging completo y recuperación automática
- ✅ **Producción ready**: Optimizado para Railway y otros PaaS
- ✅ **Sin dependencias externas**: Solo usa servicios ya configurados

## Logging y Debugging

El sistema genera logs detallados:
```
✅ Email transporter configured successfully
🔄 Realtime listener configured for orders table  
🎧 Email notification service started listening to orders changes
📧 New pending order detected: [order_id]
✅ Pending order notification sent for order: [order_id]
```

### Troubleshooting
1. **Servicio no inicia**: Verificar variables SMTP
2. **No llegan emails**: Revisar logs y configuración SMTP
3. **Realtime no funciona**: Verificar conexión Supabase
4. **Múltiples emails**: Verificar que solo hay una instancia del servicio

## Monitoreo en Producción

### Health Checks
```bash
# Estado general del servidor
GET /api/health

# Estado específico de notificaciones
GET /api/notifications/status
```

### Logs en Railway
```bash
railway logs --follow
```

Buscar patrones:
- `📧 Email notification service initialized successfully`
- `📧 New pending order detected`
- `✅ Pending order notification sent`

## Seguridad

- Las rutas de administración requieren autenticación de admin
- Las credenciales SMTP se manejan como variables de entorno
- No se exponen datos sensibles en logs
- Conexión SMTP con TLS/SSL

## Escalabilidad

El sistema está diseñado para:
- **Alta frecuencia**: Maneja múltiples cambios simultáneos
- **Reinicio automático**: Recuperación ante fallos de conexión
- **Múltiples instancias**: Compatible con escalado horizontal

---

**Implementado por**: Sistema automatizado de notificaciones
**Fecha**: Implementación completa lista para producción
