-- Actualizar registros existentes a publicado
UPDATE public.memorial_profiles 
SET is_published = true, 
    published_at = COALESCE(published_at, created_at)
WHERE is_published = false;

-- Cambiar el valor por defecto de la columna
ALTER TABLE public.memorial_profiles 
ALTER COLUMN is_published SET DEFAULT true;