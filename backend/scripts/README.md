# 🛠️ Scripts de Backend

Scripts utilitarios para mantenimiento y configuración de la base de datos.

## 📋 **Scripts Principales**

### **Configuración Inicial**
```bash
# Insertar configuraciones por defecto del sitio
node scripts/seed-settings.js

# Insertar datos iniciales (paquetes, templates)
node scripts/seed-simple.js

# Crear buckets de storage en Supabase
node scripts/create-storage-bucket.js
```

### **Verificación y Diagnóstico**
```bash
# Verificar roles de usuarios
node scripts/check-user-role.js

# Verificar configuraciones del sitio
node scripts/check-settings.js

# Verificar estructura de tablas
node scripts/check-columns.js
```

### **Migración y Correcciones**
```bash
# Ejecutar migraciones de restricciones
node scripts/run-memorial-restrictions-migration.js

# Actualizar templates por defecto
node scripts/update-default-templates.js

# Migrar datos existentes
node scripts/migrate.js
```

## ⚙️ **Uso de Variables de Entorno**

Los scripts principales usan dotenv para credenciales seguras:

```bash
# Archivo .env requerido
SUPABASE_URL=tu_supabase_url
SUPABASE_SERVICE_KEY=tu_service_key
```

## 🔄 **Scripts con Opciones**

### **seed-settings.js**
```bash
# Insertar solo si no existen
node scripts/seed-settings.js

# Sobrescribir configuraciones existentes  
node scripts/seed-settings.js --force
```

## 🧹 **Scripts Eliminados (Duplicados)**

Se eliminaron estos archivos duplicados:
- ❌ `init-settings.js` → ✅ Usar `seed-settings.js`
- ❌ `create-site-settings.js` → ✅ Usar `seed-settings.js`
- ❌ `create-site-settings-simple.js` → ✅ Usar `seed-settings.js`
- ❌ `seed.js` → ✅ Usar `seed-simple.js`

## 🎯 **Ejecución Recomendada**

Para configurar un proyecto desde cero:

```bash
# 1. Configurar settings del sitio
node scripts/seed-settings.js

# 2. Insertar datos iniciales
node scripts/seed-simple.js

# 3. Crear storage buckets
node scripts/create-storage-bucket.js

# 4. Verificar todo
node scripts/check-user-role.js
node scripts/check-settings.js
```
