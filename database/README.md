# Configuración de Base de Datos - Muro de los Recuerdos

## Instrucciones para Supabase

1. **Accede a tu panel de Supabase**: https://supabase.com/dashboard
2. **Ve a SQL Editor** en el menú lateral
3. **Ejecuta el script** `memories_table.sql` copiando y pegando su contenido
4. **Verifica la creación** de la tabla en la sección "Table Editor"

## Cambios en la tabla `memories`

La tabla `memories` ya existe, solo se agrega:
- `memorial_profile_id`: UUID que referencia al perfil memorial

## Estructura completa después del script:
```sql
- id: UUID (Primary Key) ✓ Ya existe
- memorial_profile_id: UUID (Referencia al perfil) ← NUEVO
- photo_url: TEXT ✓ Ya existe
- author_name: TEXT ✓ Ya existe
- message: TEXT ✓ Ya existe
- song: TEXT ✓ Ya existe
- things_list: TEXT[] ✓ Ya existe
- created_at: TIMESTAMP ✓ Ya existe
- is_authorized: BOOLEAN ✓ Ya existe
- likes: INTEGER ✓ Ya existe
```

## Función RPC incluida

- `increment_likes(memory_id UUID)`: Incrementa el contador de likes de un recuerdo

## Políticas de seguridad (RLS)

- Solo se pueden leer recuerdos autorizados (`is_authorized = true`)
- Solo usuarios autenticados pueden insertar recuerdos
- Cualquiera puede actualizar likes (para permitir likes anónimos)

## Configuración del Storage

Asegúrate de tener configurado el bucket `uploads` en Supabase Storage para las imágenes de los recuerdos.