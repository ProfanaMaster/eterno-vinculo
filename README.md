# Eterno Vínculo

Sistema web conmemorativo para crear perfiles memoriales personalizados.

## 🚀 Instalación y Configuración

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🏗️ Arquitectura

### Backend
- **Express + TypeScript**
- **Supabase** (Base de datos, Auth, Storage)
- **Servicios**: ProfileService, UploadService, QRService
- **Middleware**: Manejo de errores completo

### Frontend
- **React + TypeScript + Vite**
- **Framer Motion** (Animaciones)
- **Zustand** (Estado global)
- **React Router** (Navegación)

## 📊 Base de Datos

### Tablas principales:
- `users` - Usuarios del sistema
- `packages` - Paquetes disponibles
- `orders` - Órdenes de compra
- `memorial_profiles` - Perfiles conmemorativos
- `qr_orders` - Órdenes de fabricación QR
- `templates` - Plantillas de diseño

## 🔧 Variables de Entorno

### Backend (.env)
```
SUPABASE_URL=https://bhbnmuernqfbahkazbyg.supabase.co
SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_KEY=tu_service_key
```

### Frontend (.env)
```
VITE_SUPABASE_URL=https://bhbnmuernqfbahkazbyg.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

## 📱 Flujo de Usuario

1. **Registro/Login**
2. **Selección de paquete**
3. **Pago**
4. **Editor de perfil**
5. **Revisión final**
6. **Publicación**
7. **Generación de QR**

## 🛠️ Próximos Pasos

- [ ] Implementar autenticación
- [ ] Integrar pagos (Stripe/MercadoPago)
- [ ] Completar componentes de upload
- [ ] Panel de administración
- [ ] Optimización de archivos