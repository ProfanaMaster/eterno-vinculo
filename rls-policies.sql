-- 🔒 POLÍTICAS RLS PARA ETERNO VÍNCULO
-- Ejecutar en Supabase SQL Editor

-- ========================================
-- TABLA: users
-- ========================================

-- Los usuarios pueden ver y actualizar solo sus propios datos
CREATE POLICY "Users can view own data" ON users 
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users 
FOR UPDATE USING (auth.uid() = id);

-- Los admins pueden ver todos los usuarios
CREATE POLICY "Admins can view all users" ON users 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);

-- Los admins pueden crear, actualizar y eliminar usuarios
CREATE POLICY "Admins can manage users" ON users 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);

-- ========================================
-- TABLA: memorial_profiles
-- ========================================

-- Los perfiles publicados son visibles para todos
CREATE POLICY "Public profiles are viewable" ON memorial_profiles 
FOR SELECT USING (is_published = true);

-- Los usuarios pueden ver sus propios perfiles (publicados o no)
CREATE POLICY "Users can view own profiles" ON memorial_profiles 
FOR SELECT USING (auth.uid() = user_id);

-- Los usuarios pueden crear sus propios perfiles
CREATE POLICY "Users can create own profiles" ON memorial_profiles 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden actualizar sus propios perfiles
CREATE POLICY "Users can update own profiles" ON memorial_profiles 
FOR UPDATE USING (auth.uid() = user_id);

-- Los usuarios pueden eliminar sus propios perfiles
CREATE POLICY "Users can delete own profiles" ON memorial_profiles 
FOR DELETE USING (auth.uid() = user_id);

-- Los admins pueden ver todos los perfiles
CREATE POLICY "Admins can view all profiles" ON memorial_profiles 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);

-- ========================================
-- TABLA: orders
-- ========================================

-- Los usuarios pueden ver solo sus propias órdenes
CREATE POLICY "Users can view own orders" ON orders 
FOR SELECT USING (auth.uid() = user_id);

-- Los usuarios pueden crear sus propias órdenes
CREATE POLICY "Users can create own orders" ON orders 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden actualizar sus propias órdenes (para pagos)
CREATE POLICY "Users can update own orders" ON orders 
FOR UPDATE USING (auth.uid() = user_id);

-- Los admins pueden ver todas las órdenes
CREATE POLICY "Admins can view all orders" ON orders 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);

-- Los admins pueden actualizar órdenes (para aprobar/rechazar)
CREATE POLICY "Admins can update orders" ON orders 
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);

-- ========================================
-- TABLA: packages (si existe)
-- ========================================

-- Los paquetes activos son visibles para todos
CREATE POLICY "Active packages are viewable" ON packages 
FOR SELECT USING (is_active = true);

-- Los admins pueden gestionar paquetes
CREATE POLICY "Admins can manage packages" ON packages 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);

-- ========================================
-- TABLA: site_settings
-- ========================================

-- Las configuraciones son visibles para todos (solo lectura)
CREATE POLICY "Settings are publicly readable" ON site_settings 
FOR SELECT USING (true);

-- Solo admins pueden modificar configuraciones
CREATE POLICY "Admins can manage settings" ON site_settings 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);

-- ========================================
-- TABLA: qr_orders
-- ========================================

-- Los usuarios pueden ver sus propias órdenes QR
CREATE POLICY "Users can view own qr orders" ON qr_orders 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM memorial_profiles 
    WHERE id = qr_orders.memorial_profile_id 
    AND user_id = auth.uid()
  )
);

-- Los usuarios pueden crear órdenes QR para sus perfiles
CREATE POLICY "Users can create qr orders" ON qr_orders 
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM memorial_profiles 
    WHERE id = memorial_profile_id 
    AND user_id = auth.uid()
  )
);

-- Los admins pueden ver todas las órdenes QR
CREATE POLICY "Admins can view all qr orders" ON qr_orders 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);

-- ========================================
-- TABLA: templates
-- ========================================

-- Las plantillas activas son visibles para todos
CREATE POLICY "Templates are publicly viewable" ON templates 
FOR SELECT USING (true);

-- Solo admins pueden gestionar plantillas
CREATE POLICY "Admins can manage templates" ON templates 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);

-- ========================================
-- TABLA: user_memorial_history
-- ========================================

-- Los usuarios pueden ver su propio historial
CREATE POLICY "Users can view own history" ON user_memorial_history 
FOR SELECT USING (auth.uid() = user_id);

-- Los usuarios pueden crear entradas en su historial
CREATE POLICY "Users can create own history" ON user_memorial_history 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Los admins pueden ver todo el historial
CREATE POLICY "Admins can view all history" ON user_memorial_history 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);



-- ========================================
-- VERIFICACIÓN DE POLÍTICAS
-- ========================================

-- Verificar que las políticas se aplicaron correctamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;