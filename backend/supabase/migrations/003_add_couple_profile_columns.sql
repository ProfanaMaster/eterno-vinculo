-- =====================================================
-- MIGRACIÓN: Agregar columnas faltantes a couple_profiles
-- Fecha: 2024-12-19
-- Descripción: Agregar columnas person1_suegros, person2_suegros, person1_cunados, person2_cunados
-- =====================================================

-- Agregar las columnas faltantes a la tabla couple_profiles
ALTER TABLE couple_profiles 
ADD COLUMN IF NOT EXISTS person1_suegros TEXT,
ADD COLUMN IF NOT EXISTS person2_suegros TEXT,
ADD COLUMN IF NOT EXISTS person1_cunados TEXT,
ADD COLUMN IF NOT EXISTS person2_cunados TEXT;

-- Comentarios para documentar las columnas
COMMENT ON COLUMN couple_profiles.person1_suegros IS 'Lista JSON de suegros de la primera persona';
COMMENT ON COLUMN couple_profiles.person2_suegros IS 'Lista JSON de suegros de la segunda persona';
COMMENT ON COLUMN couple_profiles.person1_cunados IS 'Lista JSON de cuñados de la primera persona';
COMMENT ON COLUMN couple_profiles.person2_cunados IS 'Lista JSON de cuñados de la segunda persona';

-- Actualizar la vista couple_profiles_complete si existe
DROP VIEW IF EXISTS couple_profiles_complete;

CREATE VIEW couple_profiles_complete AS
SELECT 
    cp.*,
    COALESCE(
        (SELECT json_agg(
            json_build_object(
                'id', cgp.id,
                'photo_url', cgp.photo_url,
                'photo_title', cgp.photo_title,
                'display_order', cgp.display_order
            ) ORDER BY cgp.display_order
        )
        FROM couple_gallery_photos cgp 
        WHERE cgp.couple_profile_id = cp.id), 
        '[]'::json
    ) as gallery_photos,
    COALESCE(
        (SELECT json_agg(
            json_build_object(
                'id', cfs.id,
                'song_title', cfs.song_title,
                'youtube_url', cfs.youtube_url,
                'display_order', cfs.display_order
            ) ORDER BY cfs.display_order
        )
        FROM couple_favorite_songs cfs 
        WHERE cfs.couple_profile_id = cp.id), 
        '[]'::json
    ) as favorite_songs,
    COALESCE(
        (SELECT json_agg(
            json_build_object(
                'id', csv.id,
                'video_url', csv.video_url,
                'video_filename', csv.video_filename,
                'video_size', csv.video_size,
                'video_type', csv.video_type,
                'display_order', csv.display_order
            ) ORDER BY csv.display_order
        )
        FROM couple_special_videos csv 
        WHERE csv.couple_profile_id = cp.id), 
        '[]'::json
    ) as special_videos
FROM couple_profiles cp;

-- Actualizar la vista couple_profiles_public si existe
DROP VIEW IF EXISTS couple_profiles_public;

CREATE VIEW couple_profiles_public AS
SELECT 
    id,
    couple_name,
    description,
    profile_image_url,
    slug,
    person1_name,
    person1_alias,
    person1_birth_date,
    person1_zodiac_sign,
    person2_name,
    person2_alias,
    person2_birth_date,
    person2_zodiac_sign,
    relationship_start_date,
    anniversary_date,
    common_interests,
    person1_suegros,
    person2_suegros,
    person1_cunados,
    person2_cunados,
    pets,
    short_term_goals,
    medium_term_goals,
    long_term_goals,
    template_id,
    visit_count,
    created_at,
    updated_at,
    COALESCE(
        (SELECT json_agg(
            json_build_object(
                'id', cgp.id,
                'photo_url', cgp.photo_url,
                'photo_title', cgp.photo_title,
                'display_order', cgp.display_order
            ) ORDER BY cgp.display_order
        )
        FROM couple_gallery_photos cgp 
        WHERE cgp.couple_profile_id = cp.id), 
        '[]'::json
    ) as gallery_photos,
    COALESCE(
        (SELECT json_agg(
            json_build_object(
                'id', cfs.id,
                'song_title', cfs.song_title,
                'youtube_url', cfs.youtube_url,
                'display_order', cfs.display_order
            ) ORDER BY cfs.display_order
        )
        FROM couple_favorite_songs cfs 
        WHERE cfs.couple_profile_id = cp.id), 
        '[]'::json
    ) as favorite_songs,
    COALESCE(
        (SELECT json_agg(
            json_build_object(
                'id', csv.id,
                'video_url', csv.video_url,
                'video_filename', csv.video_filename,
                'video_size', csv.video_size,
                'video_type', csv.video_type,
                'display_order', csv.display_order
            ) ORDER BY csv.display_order
        )
        FROM couple_special_videos csv 
        WHERE csv.couple_profile_id = cp.id), 
        '[]'::json
    ) as special_videos
FROM couple_profiles cp
WHERE cp.is_published = true;



