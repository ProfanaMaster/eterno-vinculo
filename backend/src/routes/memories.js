import express from 'express';
import rateLimit from 'express-rate-limit';
import { supabaseAdmin } from '../config/supabase.js';
import { deleteR2File } from '../services/r2CleanupService.js';

// Función para obtener usuario desde token
const getUserFromToken = async (token) => {
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return null;
    }
    return user;
  } catch (error) {
    return null;
  }
};

// Middleware de autenticación
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
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

const router = express.Router();

// Rate limiting estricto para memories públicas
const memoriesRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 3, // máximo 3 recuerdos por IP cada 15 minutos
  message: { error: 'Demasiados recuerdos enviados. Intenta de nuevo en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true
});

// Función para sanitizar texto
const sanitizeText = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .trim()
    .replace(/<[^>]*>/g, '') // Remover HTML tags
    .replace(/[<>'"&]/g, '') // Remover caracteres peligrosos
    .substring(0, 1000); // Limitar longitud
};

// Función para validar URL de imagen
const isValidImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const urlObj = new URL(url);
    
    // Permitir URLs de Supabase storage (legacy)
    const isSupabaseUrl = urlObj.hostname.includes('supabase.co') && 
                         urlObj.pathname.includes('/storage/v1/object/public/');
    
    // Permitir URLs de Cloudflare R2
    const isCloudflareR2Url = urlObj.hostname.includes('r2.cloudflarestorage.com') ||
                             urlObj.hostname.includes('cloudflare.com') ||
                             urlObj.hostname.includes('r2.dev') ||
                             urlObj.hostname === process.env.CLOUDFLARE_R2_DOMAIN;
    
    return isSupabaseUrl || isCloudflareR2Url;
  } catch {
    return false;
  }
};

/**
 * POST /api/memories
 * Crear nuevo recuerdo (público, sin autenticación)
 */
router.post('/', memoriesRateLimit, async (req, res) => {
  try {
    const {
      memorial_profile_id,
      photo_url,
      author_name,
      message,
      song,
      things_list
    } = req.body;

    // Validaciones estrictas
    if (!memorial_profile_id || typeof memorial_profile_id !== 'string') {
      return res.status(400).json({ error: 'ID de memorial requerido' });
    }

    console.log('📸 Validando URL de imagen:', photo_url);
    
    if (!photo_url || !isValidImageUrl(photo_url)) {
      console.log('❌ URL de imagen inválida:', photo_url);
      return res.status(400).json({ error: 'URL de imagen inválida' });
    }
    
    console.log('✅ URL de imagen válida:', photo_url);

    const cleanAuthorName = sanitizeText(author_name);
    if (!cleanAuthorName || cleanAuthorName.length < 2) {
      return res.status(400).json({ error: 'Nombre del autor requerido (mínimo 2 caracteres)' });
    }

    const cleanMessage = sanitizeText(message);
    if (!cleanMessage || cleanMessage.length < 10) {
      return res.status(400).json({ error: 'Mensaje requerido (mínimo 10 caracteres)' });
    }

    // Verificar que el memorial existe y está publicado
    const { data: memorial, error: memorialError } = await supabaseAdmin
      .from('memorial_profiles')
      .select('id')
      .eq('id', memorial_profile_id)
      .eq('is_published', true)
      .is('deleted_at', null)
      .single();

    if (memorialError || !memorial) {
      return res.status(404).json({ error: 'Memorial no encontrado' });
    }

    // Preparar datos limpios
    const memoryData = {
      memorial_profile_id,
      photo_url,
      author_name: cleanAuthorName,
      message: cleanMessage,
      song: song ? sanitizeText(song) : null,
      things_list: Array.isArray(things_list) 
        ? things_list.map(item => sanitizeText(item)).filter(item => item.length > 0).slice(0, 5)
        : [],
      is_authorized: false, // Siempre false - solo el propietario puede autorizar
      likes: 0
    };

    // Insertar usando supabaseAdmin para bypasear RLS
    const { data: memory, error } = await supabaseAdmin
      .from('memories')
      .insert(memoryData)
      .select()
      .single();

    if (error) {
      console.error('Error creating memory:', error);
      return res.status(500).json({ error: 'Error al crear el recuerdo' });
    }

    res.status(201).json({
      success: true,
      data: memory,
      message: 'Recuerdo enviado exitosamente. Será visible una vez que el propietario lo autorice.'
    });

  } catch (error) {
    console.error('Error in POST /memories:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * DELETE /api/memories/:id
 * Eliminar un recuerdo (memoria) individual
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Obtener la memoria con datos del memorial para verificar propiedad
    const { data: memory, error: fetchError } = await supabaseAdmin
      .from('memories')
      .select(`
        id, 
        photo_url,
        memorial_profile_id,
        memorial_profiles!inner(user_id)
      `)
      .eq('id', id)
      .single();

    if (fetchError || !memory) {
      return res.status(404).json({ error: 'Recuerdo no encontrado' });
    }

    // Verificar que el usuario es propietario del memorial
    if (memory.memorial_profiles.user_id !== userId) {
      return res.status(403).json({ error: 'No tienes permisos para eliminar este recuerdo' });
    }

    // Eliminar el registro de la BD
    const { error: deleteError } = await supabaseAdmin
      .from('memories')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting memory:', deleteError);
      return res.status(500).json({ error: 'Error al eliminar el recuerdo' });
    }

    // Limpiar archivo multimedia de R2 (no bloquear la respuesta)
    if (memory.photo_url) {
      setImmediate(async () => {
        try {
          console.log(`🧹 Eliminando archivo de recuerdo: ${memory.photo_url}`);
          const result = await deleteR2File(memory.photo_url);
          if (result) {
            console.log(`✅ Archivo de recuerdo eliminado exitosamente`);
          } else {
            console.log(`⚠️ No se pudo eliminar el archivo de recuerdo`);
          }
        } catch (cleanupError) {
          console.error(`❌ Error eliminando archivo de recuerdo:`, cleanupError);
        }
      });
    }

    res.json({
      success: true,
      message: 'Recuerdo eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error in DELETE /memories/:id:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;