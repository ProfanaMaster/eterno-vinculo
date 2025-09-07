import express from 'express';
import rateLimit from 'express-rate-limit';
import { supabaseAdmin } from '../config/supabase.js';
import { cleanupFamilyProfileMedia, cleanupMemoriesMedia } from '../services/r2CleanupService.js';

const router = express.Router();

// Rate limiting para endpoints de visitas
const visitRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máximo 10 visitas por IP cada 15 minutos
  message: { error: 'Demasiadas visitas registradas, intenta más tarde' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting para creación de perfiles
const createProfileRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // máximo 5 perfiles por usuario cada hora
  message: { error: 'Demasiados perfiles creados, intenta más tarde' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware de autenticación (copiado de profiles.js)
const requireAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Token de acceso requerido' });
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Error in requireAuth middleware:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
};

/**
 * POST /api/family-profiles
 * Crear nuevo perfil familiar
 */
router.post('/', requireAuth, createProfileRateLimit, async (req, res) => {
  try {
    const {
      family_name,
      description,
      memorial_video_url,
      gallery_images,
      template_id,
      favorite_music,
      members
    } = req.body;

    const user_id = req.user.id;

    // Validar que el usuario tenga una orden pagada de tipo familiar
    const { data: familyOrders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        package_id,
        packages (
          id,
          name,
          package_type
        )
      `)
      .eq('user_id', user_id)
      .not('paid_at', 'is', null);

    if (ordersError) {
      console.error('Error fetching family orders:', ordersError);
      return res.status(500).json({ error: 'Error al verificar órdenes familiares' });
    }

    const familyOrder = familyOrders?.find(order => 
      order.packages?.package_type === 'family'
    );

    if (!familyOrder) {
      return res.status(400).json({ 
        error: 'Necesitas una orden pagada de tipo familiar para crear este memorial' 
      });
    }

    // Validaciones básicas
    if (!family_name?.trim()) {
      return res.status(400).json({ error: 'El nombre de la familia es requerido' });
    }

    if (family_name.trim().length > 100) {
      return res.status(400).json({ error: 'El nombre de la familia no puede exceder 100 caracteres' });
    }

    if (description && description.length > 1000) {
      return res.status(400).json({ error: 'La descripción no puede exceder 1000 caracteres' });
    }

    if (!members || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ error: 'Debe incluir al menos un miembro de la familia' });
    }

    if (members.length > 10) {
      return res.status(400).json({ error: 'Máximo 10 miembros permitidos por familia' });
    }

    // Validar cada miembro
    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      if (!member.name?.trim()) {
        return res.status(400).json({ error: `El nombre del miembro ${i + 1} es requerido` });
      }
      if (member.name.trim().length > 50) {
        return res.status(400).json({ error: `El nombre del miembro ${i + 1} no puede exceder 50 caracteres` });
      }
      if (!member.birth_date || !member.death_date) {
        return res.status(400).json({ 
          error: `Las fechas de nacimiento y fallecimiento del miembro ${i + 1} son requeridas` 
        });
      }
      
      // Validar formato de fechas
      const birthDate = new Date(member.birth_date);
      const deathDate = new Date(member.death_date);
      const today = new Date();
      
      if (isNaN(birthDate.getTime()) || isNaN(deathDate.getTime())) {
        return res.status(400).json({ 
          error: `Las fechas del miembro ${i + 1} tienen formato inválido` 
        });
      }
      
      if (deathDate > today) {
        return res.status(400).json({ 
          error: `La fecha de fallecimiento del miembro ${i + 1} no puede ser futura` 
        });
      }
      
      if (birthDate >= deathDate) {
        return res.status(400).json({ 
          error: `La fecha de nacimiento del miembro ${i + 1} debe ser anterior a la de fallecimiento` 
        });
      }
    }

    // Validar URLs de archivos (deben ser de Cloudflare R2)
    const validateR2Url = (url) => {
      if (!url) return true; // URLs opcionales están permitidas
      return url.includes('pub-') && url.includes('.r2.cloudflarestorage.com');
    };

    if (memorial_video_url && !validateR2Url(memorial_video_url)) {
      return res.status(400).json({ error: 'URL de video inválida' });
    }

    if (gallery_images && Array.isArray(gallery_images)) {
      for (const imageUrl of gallery_images) {
        if (!validateR2Url(imageUrl)) {
          return res.status(400).json({ error: 'URL de imagen inválida en la galería' });
        }
      }
    }

    // Validar URLs de miembros
    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      if (member.profile_image_url && !validateR2Url(member.profile_image_url)) {
        return res.status(400).json({ error: `URL de imagen inválida para el miembro ${i + 1}` });
      }
      if (member.memorial_video_url && !validateR2Url(member.memorial_video_url)) {
        return res.status(400).json({ error: `URL de video inválida para el miembro ${i + 1}` });
      }
    }

    // Generar slug único para el perfil familiar
    const baseSlug = family_name.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
    const slug = `familia-${baseSlug}-${Date.now()}`;

    // Crear el perfil familiar
    const familyProfileData = {
      user_id,
      order_id: familyOrder.id,
      slug,
      family_name: family_name.trim(),
      description: description?.trim() || '',
      memorial_video_url: memorial_video_url || null,
      gallery_images: gallery_images || [],
      template_id: template_id || null,
      favorite_music: favorite_music || null,
      is_published: true,
      published_at: new Date().toISOString(),
      max_members: 10,
      current_members: members.length
    };

    const { data: familyProfile, error: profileError } = await supabaseAdmin
      .from('family_profiles')
      .insert(familyProfileData)
      .select()
      .single();

    if (profileError) {
      console.error('Error creating family profile:', profileError);
      return res.status(500).json({ error: 'Error al crear el perfil familiar' });
    }

    // Crear los miembros de la familia
    const membersData = members.map((member, index) => ({
      family_profile_id: familyProfile.id,
      name: member.name.trim(),
      birth_date: member.birth_date,
      death_date: member.death_date,
      profile_image_url: member.profile_image_url || null,
      relationship: member.relationship || null,
      memorial_video_url: member.memorial_video_url || null,
      order_index: index
    }));

    const { data: createdMembers, error: membersError } = await supabaseAdmin
      .from('family_members')
      .insert(membersData)
      .select();

    if (membersError) {
      console.error('Error creating family members:', membersError);
      // Limpiar el perfil creado si falla la creación de miembros
      await supabaseAdmin
        .from('family_profiles')
        .delete()
        .eq('id', familyProfile.id);
      
      return res.status(500).json({ error: 'Error al crear los miembros de la familia' });
    }

    // Respuesta exitosa con el perfil y sus miembros
    res.status(201).json({
      success: true,
      data: {
        ...familyProfile,
        members: createdMembers
      },
      message: 'Perfil familiar creado exitosamente'
    });

  } catch (error) {
    console.error('Error in POST /family-profiles:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/family-profiles/public/:slug
 * Obtener perfil familiar público por slug
 */
router.get('/public/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    // Obtener el perfil familiar con sus miembros
    const { data: familyProfile, error: profileError } = await supabaseAdmin
      .from('family_profiles')
      .select(`
        *,
        family_members (*)
      `)
      .eq('slug', slug)
      .eq('is_published', true)
      .is('deleted_at', null)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Perfil familiar no encontrado' });
      }
      console.error('Error fetching family profile:', profileError);
      return res.status(500).json({ error: 'Error al obtener el perfil familiar' });
    }

    // Ordenar miembros por order_index
    if (familyProfile.family_members) {
      familyProfile.family_members.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
    }

    res.json({
      success: true,
      data: familyProfile
    });

  } catch (error) {
    console.error('Error in GET /family-profiles/public/:slug:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * POST /api/family-profiles/public/:slug/visit
 * Incrementar contador de visitas para perfil familiar (público)
 */
router.post('/public/:slug/visit', visitRateLimit, async (req, res) => {
  try {
    const { slug } = req.params;

    // Buscar el perfil por slug
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('family_profiles')
      .select('id, visit_count')
      .eq('slug', slug)
      .eq('is_published', true)
      .is('deleted_at', null)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ error: 'Perfil familiar no encontrado' });
    }

    // Incrementar contador usando función SQL
    const { data, error } = await supabaseAdmin
      .rpc('increment_family_profile_visits', { 
        profile_id: profile.id 
      });

    if (error) {
      return res.status(500).json({ error: 'Error al incrementar visitas' });
    }

    res.json({
      success: true,
      visit_count: data || 0
    });

  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * POST /api/family-profiles/:id/visit
 * Incrementar contador de visitas para perfil familiar
 */
router.post('/:id/visit', visitRateLimit, async (req, res) => {
  try {
    const { id } = req.params;

    // Incrementar contador usando función SQL
    const { data, error } = await supabaseAdmin
      .rpc('increment_family_profile_visits', { 
        profile_id: id 
      });

    if (error) {
      return res.status(500).json({ error: 'Error al incrementar visitas' });
    }

    res.json({
      success: true,
      visit_count: data || 0
    });

  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/family-profiles/my-profiles
 * Obtener perfiles familiares del usuario autenticado
 */
router.get('/my-profiles', requireAuth, async (req, res) => {
  try {
    const user_id = req.user.id;

    const { data: familyProfiles, error } = await supabaseAdmin
      .from('family_profiles')
      .select(`
        *,
        family_members (*)
      `)
      .eq('user_id', user_id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user family profiles:', error);
      return res.status(500).json({ error: 'Error al obtener perfiles familiares' });
    }

    // Ordenar miembros de cada perfil
    familyProfiles?.forEach(profile => {
      if (profile.family_members) {
        profile.family_members.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
      }
    });

    res.json({
      success: true,
      data: familyProfiles || []
    });

  } catch (error) {
    console.error('Error in GET /family-profiles/my-profiles:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * PUT /api/family-profiles/:id
 * Actualizar perfil familiar
 */
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    const {
      family_name,
      description,
      memorial_video_url,
      gallery_images,
      template_id,
      favorite_music
    } = req.body;

    // Verificar que el perfil pertenece al usuario
    const { data: existingProfile, error: checkError } = await supabaseAdmin
      .from('family_profiles')
      .select('id, user_id')
      .eq('id', id)
      .eq('user_id', user_id)
      .is('deleted_at', null)
      .single();

    if (checkError || !existingProfile) {
      return res.status(404).json({ error: 'Perfil familiar no encontrado' });
    }

    // Actualizar el perfil
    const updateData = {
      family_name: family_name?.trim(),
      description: description?.trim() || '',
      memorial_video_url: memorial_video_url || null,
      gallery_images: gallery_images || [],
      template_id: template_id || null,
      favorite_music: favorite_music || null,
      updated_at: new Date().toISOString()
    };

    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from('family_profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating family profile:', updateError);
      return res.status(500).json({ error: 'Error al actualizar el perfil familiar' });
    }

    res.json({
      success: true,
      data: updatedProfile,
      message: 'Perfil familiar actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error in PUT /family-profiles/:id:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * DELETE /api/family-profiles/:id
 * Eliminar perfil familiar (soft delete)
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Obtener datos completos del perfil y sus miembros para limpieza de archivos
    const { data: existingProfile, error: checkError } = await supabaseAdmin
      .from('family_profiles')
      .select(`
        id, 
        user_id, 
        family_name,
        memorial_video_url,
        gallery_images,
        family_members (*)
      `)
      .eq('id', id)
      .eq('user_id', user_id)
      .is('deleted_at', null)
      .single();

    if (checkError || !existingProfile) {
      return res.status(404).json({ error: 'Perfil familiar no encontrado' });
    }

    // Obtener recuerdos asociados al perfil familiar para limpiar sus archivos
    const { data: memories, error: memoriesError } = await supabaseAdmin
      .from('memories')
      .select('id, photo_url')
      .eq('family_profile_id', id);

    if (memoriesError) {
      console.error('Error fetching memories for cleanup:', memoriesError);
    }

    // Limpiar archivos multimedia del perfil familiar y sus miembros
    try {
      console.log(`🧹 Iniciando limpieza de archivos para perfil familiar: ${existingProfile.family_name}`);
      
      // Limpiar archivos del perfil familiar y miembros
      const profileCleanupResult = await cleanupFamilyProfileMedia(
        existingProfile, 
        existingProfile.family_members || []
      );
      
      // Limpiar archivos de recuerdos asociados
      let memoriesCleanupResult = { success: [], failed: [] };
      if (memories && memories.length > 0) {
        memoriesCleanupResult = await cleanupMemoriesMedia(memories);
      }
      
      console.log(`✅ Limpieza completada - Perfil: ${profileCleanupResult.success.length} exitosos, ${profileCleanupResult.failed.length} fallidos`);
      console.log(`✅ Limpieza completada - Recuerdos: ${memoriesCleanupResult.success.length} exitosos, ${memoriesCleanupResult.failed.length} fallidos`);
      
    } catch (cleanupError) {
      console.error('Error during media cleanup:', cleanupError);
      // Continuar con la eliminación aunque falle la limpieza de archivos
    }

    // Soft delete del perfil familiar
    const { error: deleteError } = await supabaseAdmin
      .from('family_profiles')
      .update({ 
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting family profile:', deleteError);
      return res.status(500).json({ error: 'Error al eliminar el perfil familiar' });
    }

    res.json({
      success: true,
      message: 'Perfil familiar eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error in DELETE /family-profiles/:id:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
