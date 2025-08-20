# 🚀 Guía de Despliegue - Eterno Vínculo

## 📋 Resumen del Proyecto
- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript  
- **Base de Datos**: Supabase (PostgreSQL)
- **Almacenamiento**: Supabase Storage

## 🌐 Opciones de Despliegue Recomendadas

### 🥇 OPCIÓN 1: Vercel + Railway (RECOMENDADA)
**Costo**: ~$10-15/mes
**Facilidad**: ⭐⭐⭐⭐⭐

#### Frontend en Vercel
```bash
# 1. Conectar repositorio a Vercel
# 2. Configurar variables de entorno:
VITE_SUPABASE_URL=https://bhbnmuernqfbahkazbyg.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key
VITE_API_URL=https://tu-backend.railway.app/api

# 3. Build settings:
Build Command: npm run build
Output Directory: dist
Root Directory: frontend
```

#### Backend en Railway
```bash
# 1. Conectar repositorio a Railway
# 2. Configurar variables de entorno:
NODE_ENV=production
PORT=3002
SUPABASE_URL=https://bhbnmuernqfbahkazbyg.supabase.co
SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_KEY=tu_service_key
FRONTEND_URL=https://tu-app.vercel.app
CORS_ORIGIN=https://tu-app.vercel.app

# 3. Root Directory: backend
# 4. Start Command: npm start
```

### 🥈 OPCIÓN 2: Netlify + Render
**Costo**: ~$7-12/mes
**Facilidad**: ⭐⭐⭐⭐

#### Frontend en Netlify
- Conectar repositorio
- Build directory: `frontend`
- Publish directory: `frontend/dist`
- Build command: `npm run build`

#### Backend en Render
- Web Service desde repositorio
- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`

### 🥉 OPCIÓN 3: DigitalOcean App Platform
**Costo**: ~$12-20/mes
**Facilidad**: ⭐⭐⭐⭐

- Despliegue completo en una plataforma
- Configuración automática de CI/CD
- Escalado automático

## 📁 Estructura de Archivos para Producción

```
eterno-vinculo/
├── frontend/
│   ├── dist/ (generado)
│   ├── .env.production
│   └── package.json
├── backend/
│   ├── .env.production
│   └── package.json
├── public/
│   └── assets/
│       └── templates/ (videos y imágenes)
└── deployment-guide.md
```

## 🔧 Pasos de Despliegue

### 1. Preparar Supabase
```sql
-- Verificar que todas las tablas estén creadas
-- Configurar RLS (Row Level Security)
-- Subir archivos de templates a Storage
```

### 2. Configurar Variables de Entorno
- Copiar `.env.production` y actualizar con valores reales
- Obtener keys de Supabase Dashboard
- Configurar CORS en Supabase

### 3. Subir Assets
```bash
# Subir videos y imágenes de templates a Supabase Storage
# Bucket: templates
# Archivos:
# - fondo-olas.mp4
# - fondo-viaje.mp4  
# - fondo-nubes.mp4
# - fondo-girasoles.mp4
# - fondo-general-moviles.png
# - fondo-general-pantalla-grande.png
```

### 4. Deploy Frontend
```bash
cd frontend
npm run build
# Subir dist/ a tu plataforma elegida
```

### 5. Deploy Backend
```bash
cd backend
npm run build
# Desplegar en tu plataforma elegida
```

## 🔒 Configuración de Seguridad

### Supabase RLS Policies
```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE memorial_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (ajustar según necesidades)
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Public profiles are viewable" ON memorial_profiles FOR SELECT USING (is_published = true);
```

### CORS Configuration
```javascript
// En tu backend
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

## 📊 Monitoreo y Mantenimiento

### Logs y Errores
- Configurar Sentry para error tracking
- Usar logs de la plataforma de hosting
- Monitorear métricas de Supabase

### Backups
- Supabase hace backups automáticos
- Considerar backup adicional de Storage
- Documentar proceso de restauración

### Performance
- Configurar CDN para assets estáticos
- Optimizar imágenes y videos
- Implementar caching en backend

## 💰 Costos Estimados Mensuales

| Servicio | Costo | Descripción |
|----------|-------|-------------|
| Supabase | $0-25 | Gratis hasta 500MB DB |
| Vercel | $0-20 | Gratis para hobby |
| Railway | $5-10 | Backend hosting |
| **Total** | **$5-55** | Según uso |

## 🚨 Checklist Pre-Deploy

- [ ] Variables de entorno configuradas
- [x] Console.logs eliminados
- [x] Assets subidos a Supabase Storage
- [x] Base de datos configurada
- [x] RLS policies aplicadas
- [ ] CORS configurado
- [ ] SSL/HTTPS habilitado
- [ ] Dominio personalizado (opcional)
- [ ] Monitoreo configurado
- [ ] Backups verificados

## 📞 Soporte Post-Deploy

### Problemas Comunes
1. **CORS errors**: Verificar FRONTEND_URL en backend
2. **404 en rutas**: Configurar redirects en hosting
3. **Assets no cargan**: Verificar URLs de Supabase Storage
4. **Auth no funciona**: Verificar Supabase keys

### Comandos Útiles
```bash
# Ver logs en Railway
railway logs

# Ver logs en Vercel
vercel logs

# Rebuild en Netlify
netlify deploy --prod
```

¡Tu aplicación está lista para producción! 🎉