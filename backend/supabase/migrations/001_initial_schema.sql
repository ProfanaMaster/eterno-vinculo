-- Usuarios
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Paquetes disponibles
CREATE TABLE packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  features JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Órdenes de compra
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  package_id UUID REFERENCES packages(id),
  status VARCHAR(50) DEFAULT 'pending', -- pending, paid, completed, cancelled
  payment_id VARCHAR(255),
  payment_method VARCHAR(50),
  amount DECIMAL(10,2) NOT NULL,
  qr_code_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Perfiles conmemorativos
CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  profile_image_url TEXT,
  banner_image_url TEXT,
  video_url TEXT,
  gallery_images JSONB, -- Array de URLs
  is_published BOOLEAN DEFAULT false,
  edit_count INTEGER DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Plantillas de descripción
CREATE TABLE description_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_profiles_order_id ON profiles(order_id);
CREATE INDEX idx_profiles_published ON profiles(is_published);

-- Insertar paquete básico
INSERT INTO packages (name, price, description, features) VALUES 
('Paquete Básico', 29.99, 'Perfil conmemorativo completo', 
 '{"max_photos": 6, "video_duration": 180, "edit_limit": 1}'::jsonb);

-- Insertar plantillas básicas
INSERT INTO description_templates (title, content, category) VALUES 
('Memoria Eterna', 'En memoria de una persona especial que siempre vivirá en nuestros corazones...', 'general'),
('Despedida Amorosa', 'Tu amor y bondad permanecerán para siempre en nuestros recuerdos...', 'familia');