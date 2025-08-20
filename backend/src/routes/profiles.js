import express from 'express';
import rateLimit from 'express-rate-limit';
import { supabaseAdmin } from '../config/supabase.js';

// Función para obtener usuario desde token
const getUserFromToken = async (token) => {
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error) {
      console.error('Error getting user from token:', error);
      return null;
    }
    return user;
  } catch (error) {
    console.error('Exception getting user from token:', error);
    return null;
  }
};

const router = express.Router();

// Cache simple para perfiles
const profilesCache = new Map();
const CACHE_TTL = 30000; // 30 segundos

// Rate limiting para perfiles
const profilesRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // máximo 10 requests por minuto
  message: { error: 'Demasiadas solicitudes, intenta de nuevo en un minuto' },
  standardHeaders: true,
  legacyHeaders: false
});

// Middleware para verificar autenticación
const requireAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token requerido' });
    }

    const user = await getUserFromToken(token);
    
    if (!user) {
      return res.status(401).json({ error: 'Token inválido' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Error in auth middleware:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
};

/**
 * POST /api/profiles
 * Crear nuevo perfil memorial
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      profile_name,
      description,
      birth_date,
      death_date,
      profile_image_url,

      gallery_images,
      memorial_video_url,
      template_id,
      favorite_music
    } = req.body;

    const user_id = req.user.id;


    // Verificar que el usuario tenga una orden completada
    const { data: completedOrder, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('user_id', user_id)
      .eq('status', 'completed')
      .limit(1)
      .single();

    if (orderError || !completedOrder) {
      return res.status(400).json({ 
        error: 'Necesitas una orden completada para crear un memorial' 
      });
    }

    // Verificar que el usuario no tenga ya un memorial activo
    const { data: existingProfile, error: profileError } = await supabaseAdmin
      .from('memorial_profiles')
      .select('id')
      .eq('user_id', user_id)
      .is('deleted_at', null)
      .limit(1)
      .single();

    if (existingProfile) {
      return res.status(400).json({ 
        error: 'Solo puedes crear un memorial. Elimina el existente para crear uno nuevo.' 
      });
    }
    
    // Verificar si ya eliminó un memorial anteriormente
    const { data: deletedHistory } = await supabaseAdmin
      .from('user_memorial_history')
      .select('id')
      .eq('user_id', user_id)
      .eq('action', 'deleted')
      .limit(1);
    
    if (deletedHistory && deletedHistory.length > 0) {
      return res.status(400).json({ 
        error: 'Ya eliminaste un memorial anteriormente. No puedes crear más memoriales.' 
      });
    }

    // Validaciones básicas
    if (!profile_name?.trim()) {
      return res.status(400).json({ error: 'El nombre del perfil es requerido' });
    }

    if (!birth_date || !death_date) {
      return res.status(400).json({ 
        error: 'Las fechas de nacimiento y fallecimiento son requeridas' 
      });
    }

    // Generar slug único
    const baseSlug = profile_name.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
    const slug = `${baseSlug}-${Date.now()}`;

    const profileData = {
      user_id,
      order_id: completedOrder.id,
      slug,
      profile_name: profile_name.trim(),
      description: description?.trim() || '',
      birth_date,
      death_date,
      profile_image_url: profile_image_url || 'https://via.placeholder.com/300x300',

      gallery_images: gallery_images || [],
      memorial_video_url: memorial_video_url || null,
      template_id: template_id || null,
      favorite_music: favorite_music || null,
      is_published: true,
      published_at: new Date().toISOString(),
      edit_count: 0,
      max_edits: 3
    };

    const { data: profile, error } = await supabaseAdmin
      .from('memorial_profiles')
      .insert(profileData)
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      return res.status(500).json({ error: 'Error al crear el memorial' });
    }

    // Limpiar cache al crear nuevo perfil
    const cacheKey = `profiles_${user_id}`;
    profilesCache.delete(cacheKey);

    res.status(201).json({
      success: true,
      data: profile,
      message: 'Memorial creado exitosamente'
    });

  } catch (error) {
    console.error('Error in POST /profiles:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/profiles/my-profiles
 * Obtener perfiles del usuario autenticado
 */
router.get('/my-profiles', profilesRateLimit, requireAuth, async (req, res) => {
  try {
    const user_id = req.user.id;
    const cacheKey = `profiles_${user_id}`;
    const now = Date.now();
    
    
    // Verificar cache
    const cached = profilesCache.get(cacheKey);
    if (cached && (now - cached.timestamp) < CACHE_TTL) {
      return res.json({
        success: true,
        data: cached.data,
        cached: true
      });
    }


    const { data: profiles, error } = await supabaseAdmin
      .from('memorial_profiles')
      .select('*')
      .eq('user_id', user_id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });


    if (error) {
      console.error('Supabase error fetching profiles:', error);
      return res.status(500).json({ error: 'Error al obtener perfiles' });
    }

    // Guardar en cache
    profilesCache.set(cacheKey, {
      data: profiles || [],
      timestamp: now
    });

    res.json({
      success: true,
      data: profiles || []
    });

  } catch (error) {
    console.error('Error in GET /profiles/my-profiles:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/profiles/public/:slug
 * Vista pública - solo memoriales publicados, sin autenticación
 */
router.get('/public/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const { data: profile, error } = await supabaseAdmin
      .from('memorial_profiles')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .is('deleted_at', null)
      .single();

    if (error || !profile) {
      return res.status(404).json({ error: 'Memorial no encontrado o no publicado' });
    }

    res.json({
      success: true,
      data: profile
    });

  } catch (error) {
    console.error('Error in GET /profiles/public/:slug:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/profiles/preview/:slug
 * Vista privada - propietario puede ver su memorial (publicado o no)
 */
router.get('/preview/:slug', requireAuth, async (req, res) => {
  try {
    const { slug } = req.params;
    const user_id = req.user.id;

    const { data: profile, error } = await supabaseAdmin
      .from('memorial_profiles')
      .select('*')
      .eq('slug', slug)
      .eq('user_id', user_id)
      .is('deleted_at', null)
      .single();

    if (error || !profile) {
      return res.status(404).json({ error: 'Memorial no encontrado' });
    }

    res.json({
      success: true,
      data: profile
    });

  } catch (error) {
    console.error('Error in GET /profiles/preview/:slug:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * DELETE /api/profiles/:id
 * Eliminar memorial del usuario autenticado
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Verificar que el memorial pertenece al usuario
    const { data: profile, error: fetchError } = await supabaseAdmin
      .from('memorial_profiles')
      .select('id')
      .eq('id', id)
      .eq('user_id', user_id)
      .is('deleted_at', null)
      .single();

    if (fetchError || !profile) {
      return res.status(404).json({ error: 'Memorial no encontrado' });
    }

    // Soft delete del memorial
    const { error: deleteError } = await supabaseAdmin
      .from('memorial_profiles')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    
    // Registrar en historial
    try {
      await supabaseAdmin
        .from('user_memorial_history')
        .insert({
          user_id,
          memorial_id: id,
          action: 'deleted'
        });
    } catch (historyError) {
      console.error('Error registrando en historial:', historyError);
    }

    if (deleteError) {
      console.error('Error deleting profile:', deleteError);
      return res.status(500).json({ error: 'Error al eliminar el memorial' });
    }

    // Limpiar cache al eliminar perfil
    const cacheKey = `profiles_${user_id}`;
    profilesCache.delete(cacheKey);

    res.json({
      success: true,
      message: 'Memorial eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error in DELETE /profiles/:id:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;