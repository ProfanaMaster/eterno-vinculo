-- Crear tabla site_settings
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES public.users(id)
);

-- Habilitar RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Política para lectura pública (cualquiera puede leer configuraciones)
DROP POLICY IF EXISTS "Anyone can read site settings" ON public.site_settings;
CREATE POLICY "Anyone can read site settings" ON public.site_settings
  FOR SELECT USING (true);

-- Política para admin solo (solo admins pueden modificar)
DROP POLICY IF EXISTS "Only admins can modify site settings" ON public.site_settings;
CREATE POLICY "Only admins can modify site settings" ON public.site_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND email = 'carolupe23@gmail.com'
    )
  );

-- Insertar configuraciones por defecto
INSERT INTO public.site_settings (key, value, description) VALUES
(
  'hero_section',
  '{
    "title": "Honra la memoria de tus seres queridos",
    "subtitle": "Crea perfiles memoriales digitales únicos con fotos, videos y recuerdos. Comparte momentos especiales que perdurarán para siempre.",
    "cta_primary": "🚀 Crear Memorial Ahora",
    "cta_secondary": "📖 Ver Ejemplos"
  }'::jsonb,
  'Configuración de la sección hero del sitio web'
),
(
  'footer_info',
  '{
    "company_name": "Eterno Vínculo",
    "description": "Preservando memorias, conectando corazones",
    "address": "Bogotá, Colombia",
    "phone": "+57 300 123 4567",
    "email": "contacto@eternovinculo.com",
    "social": {
      "facebook": "https://facebook.com/eternovinculo",
      "instagram": "https://instagram.com/eternovinculo",
      "twitter": "https://twitter.com/eternovinculo"
    }
  }'::jsonb,
  'Información del footer del sitio web'
),
(
  'payment_methods',
  '{
    "bancolombia": {
      "name": "Bancolombia",
      "account": "123-456789-01",
      "type": "Cuenta de Ahorros",
      "owner": "Eterno Vínculo SAS"
    },
    "nequi": {
      "name": "Nequi",
      "account": "300 123 4567",
      "type": "Cuenta Digital",
      "owner": "Eterno Vínculo"
    },
    "daviplata": {
      "name": "DaviPlata",
      "account": "300 123 4567",
      "type": "Cuenta Digital",
      "owner": "Eterno Vínculo"
    }
  }'::jsonb,
  'Métodos de pago disponibles'
),
(
  'site_stats',
  '{
    "memorials_created": 1200,
    "monthly_visits": 50000,
    "rating": 4.9
  }'::jsonb,
  'Estadísticas del sitio web'
),
(
  'pricing_plan',
  '{
    "name": "Memorial Digital Completo",
    "subtitle": "Todo lo que necesitas para honrar la memoria",
    "price": 150000,
    "currency": "COP",
    "features": [
      "Perfil memorial personalizado",
      "Galería de fotos ilimitada",
      "Videos conmemorativos",
      "Código QR personalizado",
      "Libro de condolencias digital",
      "Acceso permanente",
      "Soporte técnico incluido",
      "Diseño profesional"
    ]
  }'::jsonb,
  'Configuración del plan de precios'
)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();