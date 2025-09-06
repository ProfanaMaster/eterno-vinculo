# Contador de Visitas - Configuración de Producción

## 📋 Configuración Requerida en Supabase

### 1. Campo visit_count
```sql
ALTER TABLE public.memorial_profiles 
ADD COLUMN IF NOT EXISTS visit_count INTEGER DEFAULT 0;
```

### 2. Función de incremento segura
```sql
CREATE OR REPLACE FUNCTION public.increment_memorial_visits_secure(memorial_slug TEXT)
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE public.memorial_profiles 
  SET visit_count = COALESCE(visit_count, 0) + 1
  WHERE slug = memorial_slug 
    AND deleted_at IS NULL 
    AND is_published = true
  RETURNING visit_count INTO new_count;
  
  RETURN COALESCE(new_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3. Tabla de logs de visitas
```sql
CREATE TABLE IF NOT EXISTS public.visit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  memorial_slug TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.visit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System can insert visit logs" ON public.visit_logs
  FOR INSERT WITH CHECK (true);
```

### 4. Función de logging
```sql
CREATE OR REPLACE FUNCTION public.log_visit(
  p_memorial_slug TEXT,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_referrer TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.visit_logs (memorial_slug, ip_address, user_agent, referrer)
  VALUES (p_memorial_slug, p_ip_address, p_user_agent, p_referrer);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 5. Función completa con logging
```sql
CREATE OR REPLACE FUNCTION public.increment_visit_with_log(
  p_memorial_slug TEXT,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_referrer TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  SELECT public.increment_memorial_visits_secure(p_memorial_slug) INTO new_count;
  PERFORM public.log_visit(p_memorial_slug, p_ip_address, p_user_agent, p_referrer);
  RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## ✅ Funcionalidad

- **Contador sutil**: Esquina inferior derecha de perfiles memoriales
- **Incremento automático**: Al cargar el perfil
- **Rate limiting**: 5 incrementos/minuto por IP en producción
- **Logging completo**: IP, User-Agent, Referrer
- **Seguridad**: Validaciones y protección contra ataques

## 🚀 Listo para Producción

El contador de visitas está completamente implementado y listo para usar.
