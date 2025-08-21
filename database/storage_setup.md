# Configuración de Storage - Bucket para Recuerdos

## Crear Bucket en Supabase

1. **Ve a Storage** en tu panel de Supabase
2. **Crea un nuevo bucket** con el nombre: `memories`
3. **Configuración del bucket**:
   - **Nombre**: `memories`
   - **Público**: ✅ Sí (para que las imágenes sean accesibles)
   - **Tamaño máximo de archivo**: 10MB
   - **Tipos de archivo permitidos**: `image/*`

## Políticas de Storage (RLS)

Ejecuta estos comandos en el SQL Editor para configurar las políticas:

```sql
-- Política para permitir subida de imágenes a usuarios autenticados
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command)
VALUES (
  'memories_upload_policy',
  'memories',
  'Allow authenticated users to upload',
  'auth.role() = ''authenticated''',
  'auth.role() = ''authenticated''',
  'INSERT'
);

-- Política para permitir lectura pública de imágenes
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command)
VALUES (
  'memories_read_policy',
  'memories',
  'Allow public read access',
  'true',
  'true',
  'SELECT'
);
```

## Verificación

Después de crear el bucket, verifica que:
- ✅ El bucket `memories` existe
- ✅ Es público para lectura
- ✅ Permite subida para usuarios autenticados
- ✅ Las políticas están activas