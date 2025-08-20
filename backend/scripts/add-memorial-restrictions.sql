-- Agregar campos para manejar restricciones de memoriales
ALTER TABLE public.memorial_profiles 
ADD COLUMN edit_count INTEGER DEFAULT 0,
ADD COLUMN max_edits INTEGER DEFAULT 1,
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE NULL;

-- Crear tabla para rastrear el historial de memoriales por usuario
CREATE TABLE public.user_memorial_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  memorial_id UUID REFERENCES public.memorial_profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('created', 'edited', 'deleted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS en la nueva tabla
ALTER TABLE public.user_memorial_history ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios solo vean su propio historial
CREATE POLICY "Users can view own memorial history" ON public.user_memorial_history
  FOR SELECT USING (auth.uid() = user_id);

-- Función para verificar si un usuario puede crear un memorial
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

-- Función para verificar si un usuario puede editar un memorial
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

-- Función para registrar acciones en el historial
CREATE OR REPLACE FUNCTION public.log_memorial_action()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.user_memorial_history (user_id, memorial_id, action)
    VALUES (NEW.user_id, NEW.id, 'created');
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Si se marcó como eliminado
    IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
      INSERT INTO public.user_memorial_history (user_id, memorial_id, action)
      VALUES (NEW.user_id, NEW.id, 'deleted');
    -- Si se editó (incrementar contador)
    ELSIF NEW.edit_count > OLD.edit_count THEN
      INSERT INTO public.user_memorial_history (user_id, memorial_id, action)
      VALUES (NEW.user_id, NEW.id, 'edited');
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger para registrar acciones
CREATE TRIGGER memorial_action_logger
  AFTER INSERT OR UPDATE ON public.memorial_profiles
  FOR EACH ROW EXECUTE FUNCTION public.log_memorial_action();

-- Actualizar políticas de RLS para memorial_profiles
DROP POLICY IF EXISTS "Users can view own memorials" ON public.memorial_profiles;
DROP POLICY IF EXISTS "Users can create memorials" ON public.memorial_profiles;
DROP POLICY IF EXISTS "Users can update own memorials" ON public.memorial_profiles;

CREATE POLICY "Users can view own memorials" ON public.memorial_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create memorials" ON public.memorial_profiles
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    public.can_user_create_memorial(auth.uid())
  );

CREATE POLICY "Users can update own memorials" ON public.memorial_profiles
  FOR UPDATE USING (
    auth.uid() = user_id AND 
    public.can_user_edit_memorial(id)
  );