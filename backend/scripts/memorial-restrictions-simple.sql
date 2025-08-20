-- Migración: Restricciones de memoriales
-- Ejecutar en el SQL Editor de Supabase

-- 1. Agregar columnas a memorial_profiles
ALTER TABLE public.memorial_profiles 
ADD COLUMN IF NOT EXISTS edit_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_edits INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE NULL;

-- 2. Crear tabla de historial
CREATE TABLE IF NOT EXISTS public.user_memorial_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  memorial_id UUID REFERENCES public.memorial_profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('created', 'edited', 'deleted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Habilitar RLS
ALTER TABLE public.user_memorial_history ENABLE ROW LEVEL SECURITY;

-- 4. Crear política
DROP POLICY IF EXISTS "Users can view own memorial history" ON public.user_memorial_history;
CREATE POLICY "Users can view own memorial history" ON public.user_memorial_history
  FOR SELECT USING (auth.uid() = user_id);

-- 5. Función para verificar si un usuario puede crear un memorial
CREATE OR REPLACE FUNCTION public.can_user_create_memorial(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  has_active_memorial BOOLEAN;
  has_deleted_memorial BOOLEAN;
BEGIN
  -- Verificar si tiene un memorial activo (no eliminado)
  SELECT EXISTS(
    SELECT 1 FROM public.memorial_profiles 
    WHERE user_id = user_uuid AND deleted_at IS NULL
  ) INTO has_active_memorial;
  
  -- Si ya tiene un memorial activo, no puede crear otro
  IF has_active_memorial THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar si ya eliminó un memorial anteriormente
  SELECT EXISTS(
    SELECT 1 FROM public.user_memorial_history 
    WHERE user_id = user_uuid AND action = 'deleted'
  ) INTO has_deleted_memorial;
  
  -- Si ya eliminó un memorial, no puede crear otro
  IF has_deleted_memorial THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Función para verificar si un usuario puede editar un memorial
CREATE OR REPLACE FUNCTION public.can_user_edit_memorial(memorial_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_edit_count INTEGER;
  max_allowed_edits INTEGER;
BEGIN
  SELECT edit_count, max_edits 
  FROM public.memorial_profiles 
  WHERE id = memorial_uuid AND deleted_at IS NULL
  INTO current_edit_count, max_allowed_edits;
  
  -- Si no se encontró el memorial o está eliminado
  IF current_edit_count IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar si aún puede editar
  RETURN current_edit_count < max_allowed_edits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;