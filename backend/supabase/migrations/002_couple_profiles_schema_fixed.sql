-- =====================================================
-- MIGRACIÓN: Sistema de Perfiles de Pareja (CORREGIDA)
-- Fecha: 2024-12-19
-- Descripción: Tablas, relaciones, RLS y funciones para perfiles de pareja
-- Compatible con esquema actual (users table)
-- =====================================================

-- =====================================================
-- 1. TABLA PRINCIPAL: COUPLE_PROFILES
-- =====================================================

CREATE TABLE IF NOT EXISTS couple_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Información básica de la pareja
    couple_name VARCHAR(255) NOT NULL,
    description TEXT,
    profile_image_url TEXT,
    slug VARCHAR(255) UNIQUE NOT NULL,
    
    -- Persona 1
    person1_name VARCHAR(255) NOT NULL,
    person1_alias VARCHAR(255),
    person1_birth_date DATE NOT NULL,
    person1_zodiac_sign VARCHAR(50),
    
    -- Persona 2
    person2_name VARCHAR(255) NOT NULL,
    person2_alias VARCHAR(255),
    person2_birth_date DATE NOT NULL,
    person2_zodiac_sign VARCHAR(50),
    
    -- Relación
    relationship_start_date DATE,
    anniversary_date DATE,
    
    -- Información adicional
    common_interests TEXT,
    in_laws TEXT,
    siblings_in_law TEXT,
    pets TEXT,
    short_term_goals TEXT,
    medium_term_goals TEXT,
    long_term_goals TEXT,
    
    -- Configuración
    template_id VARCHAR(50) DEFAULT 'couple-1',
    is_published BOOLEAN DEFAULT false,
    visit_count INTEGER DEFAULT 0,
    
    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- =====================================================
-- 2. TABLA: COUPLE_GALLERY_PHOTOS
-- =====================================================

CREATE TABLE IF NOT EXISTS couple_gallery_photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    couple_profile_id UUID NOT NULL REFERENCES couple_profiles(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    photo_title VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. TABLA: COUPLE_FAVORITE_SONGS
-- =====================================================

CREATE TABLE IF NOT EXISTS couple_favorite_songs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    couple_profile_id UUID NOT NULL REFERENCES couple_profiles(id) ON DELETE CASCADE,
    song_title VARCHAR(255) NOT NULL,
    youtube_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. TABLA: COUPLE_SPECIAL_VIDEOS
-- =====================================================

CREATE TABLE IF NOT EXISTS couple_special_videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    couple_profile_id UUID NOT NULL REFERENCES couple_profiles(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    video_filename VARCHAR(255),
    video_size BIGINT,
    video_type VARCHAR(50),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para couple_profiles
CREATE INDEX IF NOT EXISTS idx_couple_profiles_slug ON couple_profiles(slug);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_published ON couple_profiles(is_published);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_created_at ON couple_profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_couple_profiles_template_id ON couple_profiles(template_id);

-- Índices para galería de fotos
CREATE INDEX IF NOT EXISTS idx_couple_gallery_photos_profile_id ON couple_gallery_photos(couple_profile_id);
CREATE INDEX IF NOT EXISTS idx_couple_gallery_photos_display_order ON couple_gallery_photos(display_order);

-- Índices para canciones favoritas
CREATE INDEX IF NOT EXISTS idx_couple_favorite_songs_profile_id ON couple_favorite_songs(couple_profile_id);
CREATE INDEX IF NOT EXISTS idx_couple_favorite_songs_display_order ON couple_favorite_songs(display_order);

-- Índices para videos especiales
CREATE INDEX IF NOT EXISTS idx_couple_special_videos_profile_id ON couple_special_videos(couple_profile_id);
CREATE INDEX IF NOT EXISTS idx_couple_special_videos_display_order ON couple_special_videos(display_order);

-- =====================================================
-- 6. FUNCIONES DE UTILIDAD
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_couple_profiles_updated_at 
    BEFORE UPDATE ON couple_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_couple_gallery_photos_updated_at 
    BEFORE UPDATE ON couple_gallery_photos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_couple_favorite_songs_updated_at 
    BEFORE UPDATE ON couple_favorite_songs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_couple_special_videos_updated_at 
    BEFORE UPDATE ON couple_special_videos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para calcular signo zodiacal
CREATE OR REPLACE FUNCTION calculate_zodiac_sign(birth_date DATE)
RETURNS VARCHAR(50) AS $$
BEGIN
    CASE 
        WHEN (EXTRACT(MONTH FROM birth_date) = 12 AND EXTRACT(DAY FROM birth_date) >= 22) OR
             (EXTRACT(MONTH FROM birth_date) = 1 AND EXTRACT(DAY FROM birth_date) <= 19) THEN
            RETURN 'Capricornio';
        WHEN (EXTRACT(MONTH FROM birth_date) = 1 AND EXTRACT(DAY FROM birth_date) >= 20) OR
             (EXTRACT(MONTH FROM birth_date) = 2 AND EXTRACT(DAY FROM birth_date) <= 18) THEN
            RETURN 'Acuario';
        WHEN (EXTRACT(MONTH FROM birth_date) = 2 AND EXTRACT(DAY FROM birth_date) >= 19) OR
             (EXTRACT(MONTH FROM birth_date) = 3 AND EXTRACT(DAY FROM birth_date) <= 20) THEN
            RETURN 'Piscis';
        WHEN (EXTRACT(MONTH FROM birth_date) = 3 AND EXTRACT(DAY FROM birth_date) >= 21) OR
             (EXTRACT(MONTH FROM birth_date) = 4 AND EXTRACT(DAY FROM birth_date) <= 19) THEN
            RETURN 'Aries';
        WHEN (EXTRACT(MONTH FROM birth_date) = 4 AND EXTRACT(DAY FROM birth_date) >= 20) OR
             (EXTRACT(MONTH FROM birth_date) = 5 AND EXTRACT(DAY FROM birth_date) <= 20) THEN
            RETURN 'Tauro';
        WHEN (EXTRACT(MONTH FROM birth_date) = 5 AND EXTRACT(DAY FROM birth_date) >= 21) OR
             (EXTRACT(MONTH FROM birth_date) = 6 AND EXTRACT(DAY FROM birth_date) <= 20) THEN
            RETURN 'Géminis';
        WHEN (EXTRACT(MONTH FROM birth_date) = 6 AND EXTRACT(DAY FROM birth_date) >= 21) OR
             (EXTRACT(MONTH FROM birth_date) = 7 AND EXTRACT(DAY FROM birth_date) <= 22) THEN
            RETURN 'Cáncer';
        WHEN (EXTRACT(MONTH FROM birth_date) = 7 AND EXTRACT(DAY FROM birth_date) >= 23) OR
             (EXTRACT(MONTH FROM birth_date) = 8 AND EXTRACT(DAY FROM birth_date) <= 22) THEN
            RETURN 'Leo';
        WHEN (EXTRACT(MONTH FROM birth_date) = 8 AND EXTRACT(DAY FROM birth_date) >= 23) OR
             (EXTRACT(MONTH FROM birth_date) = 9 AND EXTRACT(DAY FROM birth_date) <= 22) THEN
            RETURN 'Virgo';
        WHEN (EXTRACT(MONTH FROM birth_date) = 9 AND EXTRACT(DAY FROM birth_date) >= 23) OR
             (EXTRACT(MONTH FROM birth_date) = 10 AND EXTRACT(DAY FROM birth_date) <= 22) THEN
            RETURN 'Libra';
        WHEN (EXTRACT(MONTH FROM birth_date) = 10 AND EXTRACT(DAY FROM birth_date) >= 23) OR
             (EXTRACT(MONTH FROM birth_date) = 11 AND EXTRACT(DAY FROM birth_date) <= 21) THEN
            RETURN 'Escorpio';
        WHEN (EXTRACT(MONTH FROM birth_date) = 11 AND EXTRACT(DAY FROM birth_date) >= 22) OR
             (EXTRACT(MONTH FROM birth_date) = 12 AND EXTRACT(DAY FROM birth_date) <= 21) THEN
            RETURN 'Sagitario';
        ELSE
            RETURN 'Desconocido';
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar signos zodiacales automáticamente
CREATE OR REPLACE FUNCTION update_zodiac_signs()
RETURNS TRIGGER AS $$
BEGIN
    NEW.person1_zodiac_sign = calculate_zodiac_sign(NEW.person1_birth_date);
    NEW.person2_zodiac_sign = calculate_zodiac_sign(NEW.person2_birth_date);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar signos zodiacales
CREATE TRIGGER update_couple_profiles_zodiac_signs
    BEFORE INSERT OR UPDATE ON couple_profiles
    FOR EACH ROW EXECUTE FUNCTION update_zodiac_signs();

-- =====================================================
-- 7. ROW LEVEL SECURITY (RLS) - SIMPLIFICADO
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE couple_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_gallery_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_favorite_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_special_videos ENABLE ROW LEVEL SECURITY;

-- Políticas simplificadas para couple_profiles
CREATE POLICY "couple_profiles_select_published" ON couple_profiles
    FOR SELECT USING (is_published = true);

-- Política para admins (usando la tabla users existente)
CREATE POLICY "couple_profiles_admin_access" ON couple_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'super_admin')
        )
    );

-- Políticas para tablas relacionadas
CREATE POLICY "couple_gallery_photos_select_published" ON couple_gallery_photos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM couple_profiles 
            WHERE couple_profiles.id = couple_gallery_photos.couple_profile_id 
            AND couple_profiles.is_published = true
        )
    );

CREATE POLICY "couple_gallery_photos_admin_access" ON couple_gallery_photos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "couple_favorite_songs_select_published" ON couple_favorite_songs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM couple_profiles 
            WHERE couple_profiles.id = couple_favorite_songs.couple_profile_id 
            AND couple_profiles.is_published = true
        )
    );

CREATE POLICY "couple_favorite_songs_admin_access" ON couple_favorite_songs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "couple_special_videos_select_published" ON couple_special_videos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM couple_profiles 
            WHERE couple_profiles.id = couple_special_videos.couple_profile_id 
            AND couple_profiles.is_published = true
        )
    );

CREATE POLICY "couple_special_videos_admin_access" ON couple_special_videos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'super_admin')
        )
    );

-- =====================================================
-- 8. VISTAS PARA CONSULTAS OPTIMIZADAS
-- =====================================================

-- Vista completa de perfiles de pareja con datos relacionados
CREATE OR REPLACE VIEW couple_profiles_complete AS
SELECT 
    cp.*,
    -- Galería de fotos como JSON
    COALESCE(
        json_agg(
            jsonb_build_object(
                'id', cgp.id,
                'photo_url', cgp.photo_url,
                'photo_title', cgp.photo_title,
                'display_order', cgp.display_order
            ) ORDER BY cgp.display_order
        ) FILTER (WHERE cgp.id IS NOT NULL),
        '[]'::json
    ) as gallery_photos,
    -- Canciones favoritas como JSON
    COALESCE(
        json_agg(
            jsonb_build_object(
                'id', cfs.id,
                'song_title', cfs.song_title,
                'youtube_url', cfs.youtube_url,
                'display_order', cfs.display_order
            ) ORDER BY cfs.display_order
        ) FILTER (WHERE cfs.id IS NOT NULL),
        '[]'::json
    ) as favorite_songs,
    -- Videos especiales como JSON
    COALESCE(
        json_agg(
            jsonb_build_object(
                'id', csv.id,
                'video_url', csv.video_url,
                'video_filename', csv.video_filename,
                'video_size', csv.video_size,
                'video_type', csv.video_type,
                'display_order', csv.display_order
            ) ORDER BY csv.display_order
        ) FILTER (WHERE csv.id IS NOT NULL),
        '[]'::json
    ) as special_videos
FROM couple_profiles cp
LEFT JOIN couple_gallery_photos cgp ON cp.id = cgp.couple_profile_id
LEFT JOIN couple_favorite_songs cfs ON cp.id = cfs.couple_profile_id
LEFT JOIN couple_special_videos csv ON cp.id = csv.couple_profile_id
GROUP BY cp.id;

-- Vista para perfiles públicos (solo publicados)
CREATE OR REPLACE VIEW couple_profiles_public AS
SELECT * FROM couple_profiles_complete
WHERE is_published = true;

-- =====================================================
-- 9. FUNCIONES DE API
-- =====================================================

-- Función para incrementar contador de visitas
CREATE OR REPLACE FUNCTION increment_couple_profile_visits(profile_slug TEXT)
RETURNS INTEGER AS $$
DECLARE
    new_count INTEGER;
BEGIN
    UPDATE couple_profiles 
    SET visit_count = visit_count + 1
    WHERE slug = profile_slug AND is_published = true
    RETURNING visit_count INTO new_count;
    
    RETURN COALESCE(new_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener perfil de pareja por slug
CREATE OR REPLACE FUNCTION get_couple_profile_by_slug(profile_slug TEXT)
RETURNS TABLE (
    id UUID,
    couple_name VARCHAR,
    description TEXT,
    profile_image_url TEXT,
    slug VARCHAR,
    person1_name VARCHAR,
    person1_alias VARCHAR,
    person1_birth_date DATE,
    person1_zodiac_sign VARCHAR,
    person2_name VARCHAR,
    person2_alias VARCHAR,
    person2_birth_date DATE,
    person2_zodiac_sign VARCHAR,
    relationship_start_date DATE,
    anniversary_date DATE,
    common_interests TEXT,
    in_laws TEXT,
    siblings_in_law TEXT,
    pets TEXT,
    short_term_goals TEXT,
    medium_term_goals TEXT,
    long_term_goals TEXT,
    template_id VARCHAR,
    visit_count INTEGER,
    gallery_photos JSON,
    favorite_songs JSON,
    special_videos JSON,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM couple_profiles_complete
    WHERE slug = profile_slug AND is_published = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 10. COMENTARIOS Y DOCUMENTACIÓN
-- =====================================================

COMMENT ON TABLE couple_profiles IS 'Perfiles de parejas románticas con información completa de ambas personas';
COMMENT ON TABLE couple_gallery_photos IS 'Galería de fotos para perfiles de pareja con títulos personalizados';
COMMENT ON TABLE couple_favorite_songs IS 'Canciones favoritas de la pareja con enlaces a YouTube';
COMMENT ON TABLE couple_special_videos IS 'Videos especiales de la pareja (máximo 65MB, .mp4/.avi)';

COMMENT ON COLUMN couple_profiles.slug IS 'Identificador único para URLs amigables';
COMMENT ON COLUMN couple_profiles.template_id IS 'ID de la plantilla a usar (couple-1, etc.)';
COMMENT ON COLUMN couple_profiles.is_published IS 'Indica si el perfil está publicado y visible públicamente';
COMMENT ON COLUMN couple_profiles.visit_count IS 'Contador de visitas al perfil';

-- =====================================================
-- FIN DE LA MIGRACIÓN CORREGIDA
-- =====================================================
