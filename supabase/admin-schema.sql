-- Tabla de configuraciones del sitio
CREATE TABLE public.site_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES public.users(id)
);

-- Tabla de roles de usuario
ALTER TABLE public.users ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin'));

-- Insertar configuraciones por defecto
INSERT INTO public.site_settings (key, value, description) VALUES
('hero_section', '{
  "title": "Honra la memoria de tus seres queridos",
  "subtitle": "Crea perfiles memoriales digitales únicos con fotos, videos y recuerdos. Comparte momentos especiales que perdurarán para siempre.",
  "cta_primary": "🚀 Crear Memorial Ahora",
  "cta_secondary": "📖 Ver Ejemplos"
}', 'Configuración de la sección hero'),

('footer_info', '{
  "company_name": "Eterno Vínculo",
  "description": "Preservamos memorias, honramos vidas",
  "address": "Calle 123 #45-67, Bogotá, Colombia",
  "phone": "+57 300 123 4567",
  "email": "contacto@eternovinculo.com",
  "social": {
    "facebook": "https://facebook.com/eternovinculo",
    "instagram": "https://instagram.com/eternovinculo",
    "twitter": "https://twitter.com/eternovinculo"
  }
}', 'Información del footer'),

('payment_methods', '{
  "bancolombia": {
    "name": "Bancolombia",
    "account": "123-456-789-01",
    "type": "Cuenta de Ahorros",
    "owner": "Eterno Vínculo SAS"
  },
  "nequi": {
    "name": "Nequi",
    "account": "300-123-4567",
    "type": "Cuenta Nequi",
    "owner": "Eterno Vínculo"
  },
  "transfiya": {
    "name": "Transfiya",
    "account": "eternovinculo@transfiya.com",
    "type": "Cuenta Transfiya",
    "owner": "Eterno Vínculo"
  }
}', 'Métodos de pago disponibles'),

('site_stats', '{
  "memorials_created": 1200,
  "monthly_visits": 50000,
  "rating": 4.9
}', 'Estadísticas del sitio');

-- RLS para configuraciones
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Solo admins pueden ver/editar configuraciones
CREATE POLICY "Admins can manage site settings" ON public.site_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- Crear usuario admin por defecto (cambiar email y password)
-- INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, created_at, updated_at)
-- VALUES ('admin@eternovinculo.com', crypt('admin123', gen_salt('bf')), NOW(), NOW(), NOW());

-- Actualizar rol de admin
-- UPDATE public.users SET role = 'super_admin' WHERE email = 'admin@eternovinculo.com';