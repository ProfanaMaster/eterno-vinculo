-- =====================================================
-- MIGRACIÓN: Actualizar campos de perfiles de pareja
-- Fecha: 2024-12-19
-- Descripción: Cambiar "Suegros" y "Cuñados" por "Comidas Favoritas" y "Series y Películas Favoritas"
-- =====================================================

-- Renombrar las columnas existentes
ALTER TABLE couple_profiles 
RENAME COLUMN person1_suegros TO person1_comidas_favoritas;

ALTER TABLE couple_profiles 
RENAME COLUMN person2_suegros TO person2_comidas_favoritas;

ALTER TABLE couple_profiles 
RENAME COLUMN person1_cunados TO person1_series_peliculas;

ALTER TABLE couple_profiles 
RENAME COLUMN person2_cunados TO person2_series_peliculas;

-- Actualizar los comentarios
COMMENT ON COLUMN couple_profiles.person1_comidas_favoritas IS 'Lista JSON de comidas favoritas de la primera persona';
COMMENT ON COLUMN couple_profiles.person2_comidas_favoritas IS 'Lista JSON de comidas favoritas de la segunda persona';
COMMENT ON COLUMN couple_profiles.person1_series_peliculas IS 'Lista JSON de series y películas favoritas de la primera persona';
COMMENT ON COLUMN couple_profiles.person2_series_peliculas IS 'Lista JSON de series y películas favoritas de la segunda persona';

-- Actualizar la vista couple_profiles_complete si existe
DROP VIEW IF EXISTS couple_profiles_complete;

CREATE VIEW couple_profiles_complete AS
SELECT 
    cp.*,
    COALESCE(
        json_agg(
            json_build_object(
                'id', cgp.id,
                'photo_url', cgp.photo_url,
                'photo_title', cgp.photo_title,
                'display_order', cgp.display_order
            ) ORDER BY cgp.display_order
        ) FILTER (WHERE cgp.id IS NOT NULL),
        '[]'::json
    ) as gallery_photos,
    COALESCE(
        json_agg(
            json_build_object(
                'id', cfs.id,
                'song_title', cfs.song_title,
                'youtube_url', cfs.youtube_url,
                'display_order', cfs.display_order
            ) ORDER BY cfs.display_order
        ) FILTER (WHERE cfs.id IS NOT NULL),
        '[]'::json
    ) as favorite_songs,
    COALESCE(
        json_agg(
            json_build_object(
                'id', csv.id,
                'video_url', csv.video_url,
                'video_filename', csv.video_filename,
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



