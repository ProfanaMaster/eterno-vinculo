import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';

const router = express.Router();

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
 * POST /api/family-profiles/:profileId/members
 * Agregar nuevo miembro a la familia
 */
router.post('/:profileId/members', requireAuth, async (req, res) => {
  try {
    const { profileId } = req.params;
    const user_id = req.user.id;
    const {
      name,
      birth_date,
      death_date,
      profile_image_url,
      relationship,
      memorial_video_url,
      gallery_images
    } = req.body;

    // Verificar que el perfil pertenece al usuario
    const { data: familyProfile, error: profileError } = await supabaseAdmin
      .from('family_profiles')
      .select('id, user_id, max_members, current_members')
      .eq('id', profileId)
      .eq('user_id', user_id)
      .is('deleted_at', null)
      .single();

    if (profileError || !familyProfile) {
      return res.status(404).json({ error: 'Perfil familiar no encontrado' });
    }

    // Verificar límite de miembros
    if (familyProfile.current_members >= familyProfile.max_members) {
      return res.status(400).json({ 
        error: `Límite de miembros alcanzado (${familyProfile.max_members} máximo)` 
      });
    }

    // Validaciones
    if (!name?.trim()) {
      return res.status(400).json({ error: 'El nombre del miembro es requerido' });
    }

    if (!birth_date || !death_date) {
      return res.status(400).json({ 
        error: 'Las fechas de nacimiento y fallecimiento son requeridas' 
      });
    }

    // Obtener el siguiente order_index
    const { data: lastMember } = await supabaseAdmin
      .from('family_members')
      .select('order_index')
      .eq('family_profile_id', profileId)
      .order('order_index', { ascending: false })
      .limit(1)
      .single();

    const nextOrderIndex = (lastMember?.order_index || -1) + 1;

    // Crear el miembro
    const memberData = {
      family_profile_id: profileId,
      name: name.trim(),
      birth_date,
      death_date,
      profile_image_url: profile_image_url || null,
      relationship: relationship || null,
      memorial_video_url: memorial_video_url || null,
      gallery_images: gallery_images || [],
      order_index: nextOrderIndex
    };

    const { data: newMember, error: memberError } = await supabaseAdmin
      .from('family_members')
      .insert(memberData)
      .select()
      .single();

    if (memberError) {
      console.error('Error creating family member:', memberError);
      return res.status(500).json({ error: 'Error al crear el miembro de la familia' });
    }

    res.status(201).json({
      success: true,
      data: newMember,
      message: 'Miembro agregado exitosamente'
    });

  } catch (error) {
    console.error('Error in POST /family-profiles/:profileId/members:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * PUT /api/family-profiles/:profileId/members/:memberId
 * Actualizar miembro de la familia
 */
router.put('/:profileId/members/:memberId', requireAuth, async (req, res) => {
  try {
    const { profileId, memberId } = req.params;
    const user_id = req.user.id;
    const {
      name,
      birth_date,
      death_date,
      profile_image_url,
      relationship,
      memorial_video_url,
      gallery_images,
      order_index
    } = req.body;

    // Verificar que el perfil pertenece al usuario
    const { data: familyProfile, error: profileError } = await supabaseAdmin
      .from('family_profiles')
      .select('id, user_id')
      .eq('id', profileId)
      .eq('user_id', user_id)
      .is('deleted_at', null)
      .single();

    if (profileError || !familyProfile) {
      return res.status(404).json({ error: 'Perfil familiar no encontrado' });
    }

    // Verificar que el miembro existe y pertenece al perfil
    const { data: existingMember, error: memberCheckError } = await supabaseAdmin
      .from('family_members')
      .select('id')
      .eq('id', memberId)
      .eq('family_profile_id', profileId)
      .single();

    if (memberCheckError || !existingMember) {
      return res.status(404).json({ error: 'Miembro no encontrado' });
    }

    // Actualizar el miembro
    const updateData = {
      name: name?.trim(),
      birth_date,
      death_date,
      profile_image_url: profile_image_url || null,
      relationship: relationship || null,
      memorial_video_url: memorial_video_url || null,
      gallery_images: gallery_images || [],
      order_index: order_index !== undefined ? order_index : undefined,
      updated_at: new Date().toISOString()
    };

    // Remover campos undefined
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const { data: updatedMember, error: updateError } = await supabaseAdmin
      .from('family_members')
      .update(updateData)
      .eq('id', memberId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating family member:', updateError);
      return res.status(500).json({ error: 'Error al actualizar el miembro' });
    }

    res.json({
      success: true,
      data: updatedMember,
      message: 'Miembro actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error in PUT /family-profiles/:profileId/members/:memberId:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * DELETE /api/family-profiles/:profileId/members/:memberId
 * Eliminar miembro de la familia
 */
router.delete('/:profileId/members/:memberId', requireAuth, async (req, res) => {
  try {
    const { profileId, memberId } = req.params;
    const user_id = req.user.id;

    // Verificar que el perfil pertenece al usuario
    const { data: familyProfile, error: profileError } = await supabaseAdmin
      .from('family_profiles')
      .select('id, user_id, current_members')
      .eq('id', profileId)
      .eq('user_id', user_id)
      .is('deleted_at', null)
      .single();

    if (profileError || !familyProfile) {
      return res.status(404).json({ error: 'Perfil familiar no encontrado' });
    }

    // Verificar que no sea el último miembro
    if (familyProfile.current_members <= 1) {
      return res.status(400).json({ 
        error: 'No puedes eliminar el último miembro de la familia' 
      });
    }

    // Verificar que el miembro existe y pertenece al perfil
    const { data: existingMember, error: memberCheckError } = await supabaseAdmin
      .from('family_members')
      .select('id, name')
      .eq('id', memberId)
      .eq('family_profile_id', profileId)
      .single();

    if (memberCheckError || !existingMember) {
      return res.status(404).json({ error: 'Miembro no encontrado' });
    }

    // Eliminar el miembro
    const { error: deleteError } = await supabaseAdmin
      .from('family_members')
      .delete()
      .eq('id', memberId);

    if (deleteError) {
      console.error('Error deleting family member:', deleteError);
      return res.status(500).json({ error: 'Error al eliminar el miembro' });
    }

    res.json({
      success: true,
      message: 'Miembro eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error in DELETE /family-profiles/:profileId/members/:memberId:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * PUT /api/family-profiles/:profileId/members/reorder
 * Reordenar miembros de la familia
 */
router.put('/:profileId/members/reorder', requireAuth, async (req, res) => {
  try {
    const { profileId } = req.params;
    const user_id = req.user.id;
    const { memberIds } = req.body; // Array de IDs en el nuevo orden

    if (!Array.isArray(memberIds)) {
      return res.status(400).json({ error: 'Se requiere un array de IDs de miembros' });
    }

    // Verificar que el perfil pertenece al usuario
    const { data: familyProfile, error: profileError } = await supabaseAdmin
      .from('family_profiles')
      .select('id, user_id')
      .eq('id', profileId)
      .eq('user_id', user_id)
      .is('deleted_at', null)
      .single();

    if (profileError || !familyProfile) {
      return res.status(404).json({ error: 'Perfil familiar no encontrado' });
    }

    // Verificar que todos los miembros pertenecen al perfil
    const { data: existingMembers, error: membersError } = await supabaseAdmin
      .from('family_members')
      .select('id')
      .eq('family_profile_id', profileId);

    if (membersError) {
      console.error('Error fetching family members:', membersError);
      return res.status(500).json({ error: 'Error al verificar miembros' });
    }

    const existingIds = existingMembers.map(m => m.id);
    const invalidIds = memberIds.filter(id => !existingIds.includes(id));

    if (invalidIds.length > 0) {
      return res.status(400).json({ 
        error: 'Algunos miembros no pertenecen a esta familia' 
      });
    }

    // Actualizar el order_index de cada miembro
    const updates = memberIds.map((memberId, index) => 
      supabaseAdmin
        .from('family_members')
        .update({ order_index: index })
        .eq('id', memberId)
    );

    await Promise.all(updates);

    res.json({
      success: true,
      message: 'Orden de miembros actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error in PUT /family-profiles/:profileId/members/reorder:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
