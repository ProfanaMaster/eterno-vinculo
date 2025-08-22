# 🚀 Configuración de Cloudflare R2 - Eterno Vínculo

## 📋 Nuevo Flujo de Subida de Archivos

### Arquitectura Optimizada

```
Frontend (React) → Backend (URLs prefirmadas) → Cloudflare R2 → CDN → Usuario
```

### Flujo Paso a Paso

1. **Frontend**: Usuario selecciona archivo
2. **Frontend → Backend**: Solicita URL prefirmada
3. **Backend**: Genera URL prefirmada con validaciones
4. **Frontend**: Sube archivo directamente a R2
5. **Frontend → Backend**: Envía URL pública para guardar en BD
6. **Backend → Supabase**: Guarda metadatos y URL

## ⚙️ Configuración Backend

### Variables de Entorno

```bash
# Cloudflare R2
R2_ENDPOINT=https://tu-account-id.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=tu_access_key_id
R2_SECRET_ACCESS_KEY=tu_secret_access_key
R2_BUCKET_NAME=eternovinculo-media

# CDN (opcional)
R2_CDN_URL=https://media.eternovinculo.com
```

### Obtener Credenciales R2

1. **Dashboard de Cloudflare** → R2 Object Storage
2. **Crear bucket**: `eternovinculo-media`
3. **API Tokens** → Create Token
4. **Permissions**: Object:Edit, Object:Read
5. **Copiar**: Access Key ID y Secret Access Key

## 🎯 Funcionalidades Implementadas

### ✅ Servicios Actualizados

- **UploadService**: Validaciones y progreso
- **CloudflareUpload**: URLs prefirmadas y subida directa
- **CreateProfile**: Progreso visual en tiempo real
- **AddMemoryModal**: Subida con progreso
- **ImageUpload/GalleryUpload**: Migrado a R2

### ✅ Mejoras de Rendimiento

- **Subida Directa**: Sin pasar por servidor backend
- **Progreso Visual**: Barras de progreso en tiempo real
- **Validación Previa**: Tipos y tamaños antes de subir
- **Manejo de Errores**: Mensajes específicos y detallados
- **Cache Optimizado**: Headers de cache para CDN

### ✅ Validaciones Implementadas

```javascript
// Imágenes
- Tipos: JPG, PNG, WebP
- Tamaño máximo: 10MB
- Validación de contenido

// Videos  
- Tipos: MP4, WebM, MOV, AVI
- Tamaño máximo: 100MB
- Validación de duración
```

## 🔧 API Endpoints

### POST /api/upload/presigned-url

**Solicitar URL prefirmada**

```json
{
  "type": "profile|gallery|video|memory",
  "fileName": "imagen.jpg",
  "contentType": "image/jpeg",
  "fileSize": 1024000
}
```

**Respuesta:**

```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://r2.cloudflare.com/...",
    "fields": { "key": "...", "policy": "..." },
    "publicUrl": "https://media.eternovinculo.com/...",
    "key": "user-id/profile/timestamp-file.jpg",
    "expiresIn": 1800
  }
}
```

### POST /api/upload/verify

**Verificar subida exitosa**

```json
{
  "key": "user-id/profile/timestamp-file.jpg"
}
```

## 📱 Frontend - Uso del Servicio

### Subida Simple

```typescript
import UploadService from '@/services/uploadService'

const uploadImage = async (file: File) => {
  try {
    const url = await UploadService.uploadImage(file, 'profile')
    console.log('Imagen subida:', url)
  } catch (error) {
    console.error('Error:', error.message)
  }
}
```

### Subida con Progreso

```typescript
const uploadWithProgress = async (file: File) => {
  const url = await UploadService.uploadImage(
    file, 
    'profile',
    (progress) => {
      console.log(`Progreso: ${progress.percentage}%`)
      setProgress(progress.percentage)
    }
  )
}
```

### Subida Múltiple (Galería)

```typescript
const uploadGallery = async (files: File[]) => {
  const urls = await UploadService.uploadGalleryImages(
    files,
    (fileIndex, progress) => {
      console.log(`Archivo ${fileIndex + 1}: ${progress.percentage}%`)
    },
    (fileIndex, url) => {
      console.log(`Archivo ${fileIndex + 1} completado:`, url)
    }
  )
}
```

## 🔒 Seguridad

### Validaciones Backend

- **Autenticación**: Token JWT requerido
- **Tipos MIME**: Validación estricta
- **Tamaños**: Límites por tipo de archivo
- **Keys**: Solo archivos del usuario autenticado

### URLs Prefirmadas

- **Expiración**: 30 minutos
- **Condiciones**: Tipo, tamaño, usuario
- **Firma**: AWS Signature V4

## 🚀 Despliegue

### Backend (Railway/Render)

```bash
# Variables de entorno
R2_ENDPOINT=https://...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=eternovinculo-media
```

### Frontend (Vercel/Netlify)

```bash
# No requiere cambios en variables
# Solo usar las existentes de Supabase
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_API_URL=https://tu-backend.railway.app/api
```

## 📊 Monitoreo

### Logs Backend

```
🚀 Solicitando URL prefirmada para profile: imagen.jpg
🔑 Key generada: user-123/profile/1234567890-abc123-imagen.jpg
✅ URL prefirmada generada exitosamente
```

### Logs Frontend

```
🚀 Solicitando URL prefirmada para profile: imagen.jpg
✅ URL prefirmada obtenida: { key: "...", publicUrl: "..." }
📤 Subiendo archivo a Cloudflare R2...
✅ Archivo subido exitosamente a: https://media.eternovinculo.com/...
```

## 🐛 Troubleshooting

### Error: "CORS policy"
- Verificar `FRONTEND_URL` en backend
- Configurar CORS en Cloudflare R2

### Error: "Invalid presigned URL"
- Verificar credenciales R2
- Comprobar expiración (30 min)

### Error: "File too large"
- Verificar límites por tipo
- Imágenes: 10MB, Videos: 100MB

### Error: "Invalid file type"
- Solo tipos permitidos
- Verificar MIME type exacto

## 📈 Beneficios

✅ **Rendimiento**: Subida directa sin servidor intermedio
✅ **Escalabilidad**: Cloudflare maneja el tráfico
✅ **Costos**: Menor uso de ancho de banda del servidor
✅ **UX**: Progreso visual y mejor feedback
✅ **Seguridad**: URLs prefirmadas con validaciones
✅ **Confiabilidad**: CDN global de Cloudflare

---

¡El nuevo flujo está listo para producción! 🎉
