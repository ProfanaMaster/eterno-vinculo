# Configuración del Contador de Visitas

## Pasos para habilitar el contador de visitas

### 1. Agregar campo visit_count a la tabla memorial_profiles

Ejecuta este SQL en el editor de Supabase:

```sql
ALTER TABLE public.memorial_profiles 
ADD COLUMN IF NOT EXISTS visit_count INTEGER DEFAULT 0;
```

### 2. Crear función para incrementar visitas

Ejecuta este SQL en el editor de Supabase:

```sql
CREATE OR REPLACE FUNCTION public.increment_memorial_visits(memorial_slug TEXT)
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE public.memorial_profiles 
  SET visit_count = visit_count + 1
  WHERE slug = memorial_slug AND deleted_at IS NULL
  RETURNING visit_count INTO new_count;
  
  RETURN COALESCE(new_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3. Crear política para permitir incremento de visitas

Ejecuta este SQL en el editor de Supabase:

```sql
CREATE POLICY "Allow public visit increment" ON public.memorial_profiles
  FOR UPDATE USING (true);
```

## Funcionalidad

Una vez configurado, el contador de visitas:

- Se muestra de forma sutil en la esquina inferior derecha de los perfiles memoriales
- Se incrementa automáticamente cada vez que alguien visita el perfil
- Muestra el número total de visitas con formato de miles (ej: 1,234)
- Tiene un diseño discreto con fondo semitransparente y blur
- Incluye un ícono de ojo para indicar que son visitas

## Componentes creados

- `VisitCounter.tsx`: Componente visual para mostrar el contador
- `useVisitCounter.ts`: Hook para manejar la lógica de incremento
- Endpoint `/api/profiles/public/:slug/visit`: Para incrementar visitas
- Integración en `PublicProfile.tsx` y `MemorialTemplate.tsx`
