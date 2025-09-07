import express from 'express';
import rateLimit from 'express-rate-limit';
import { supabaseAdmin } from '../config/supabase.js';
import { deleteR2File } from '../services/r2CleanupService.js';
import svgCaptcha from 'svg-captcha';

// Cache para almacenar captchas generados (en producción usar Redis)
const captchaCache = new Map();
const CAPTCHA_TTL = 10 * 60 * 1000; // 10 minutos

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

// Función para validar contenido de imagen más robusta
const validateImageContent = async (url) => {
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
    
    if (!isSupabaseUrl && !isCloudflareR2Url) {
      return false;
    }

    // Verificar que la imagen sea realmente una imagen válida
    const response = await fetch(url, { 
      method: 'HEAD',
      timeout: 5000 // 5 segundos de timeout
    });
    
    if (!response.ok) return false;
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      return false;
    }

    // Verificar tamaño de imagen (máximo 2MB - consistente con frontend)
    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 2 * 1024 * 1024) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error validando imagen:', error);
    return false;
  }
};

// Función para generar captcha
const generateCaptcha = () => {
  const captcha = svgCaptcha.create({
    size: 4,
    noise: 2,
    color: true,
    background: '#f0f0f0'
  });
  
  const captchaId = Math.random().toString(36).substring(2, 15);
  captchaCache.set(captchaId, {
    text: captcha.text.toLowerCase(),
    timestamp: Date.now()
  });
  
  // Limpiar captchas expirados
  const now = Date.now();
  for (const [key, value] of captchaCache.entries()) {
    if (now - value.timestamp > CAPTCHA_TTL) {
      captchaCache.delete(key);
    }
  }
  
  return { id: captchaId, svg: captcha.data };
};

// Función para verificar captcha
const verifyCaptcha = (captchaId, userInput) => {
  const captcha = captchaCache.get(captchaId);
  if (!captcha) return false;
  
  const isValid = captcha.text === userInput.toLowerCase();
  if (isValid) {
    captchaCache.delete(captchaId); // Usar una sola vez
  }
  
  return isValid;
};

/**
 * GET /api/memories/captcha
 * Generar nuevo captcha para el formulario
 */
router.get('/captcha', (req, res) => {
  try {
    const captcha = generateCaptcha();
    
    res.set({
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    res.json({
      success: true,
      data: {
        captchaId: captcha.id,
        svg: captcha.svg
      }
    });
  } catch (error) {
    console.error('Error generando captcha:', error);
    res.status(500).json({ error: 'Error generando captcha' });
  }
});

/**
 * GET /api/memories/:profileId
 * Obtener recuerdos autorizados de un perfil (individual o familiar)
 */
router.get('/:profileId', async (req, res) => {
  try {
    const { profileId } = req.params;
    const { type } = req.query; // 'individual' o 'family'

    let whereClause = {};
    if (type === 'family') {
      whereClause = { family_profile_id: profileId };
    } else {
      whereClause = { memorial_profile_id: profileId };
    }

    const { data: memories, error } = await supabaseAdmin
      .from('memories')
      .select('*')
      .match(whereClause)
      .eq('is_authorized', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching memories:', error);
      return res.status(500).json({ error: 'Error al cargar los recuerdos' });
    }

    res.json({
      success: true,
      data: memories || []
    });

  } catch (error) {
    console.error('Error in GET /memories:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * POST /api/memories
 * Crear nuevo recuerdo (público, sin autenticación)
 */
router.post('/', memoriesRateLimit, async (req, res) => {
  try {
    const {
      memorial_profile_id,
      family_profile_id,
      photo_url,
      author_name,
      message,
      song,
      things_list,
      captcha_id,
      captcha_input
    } = req.body;

    // Validaciones estrictas - debe tener al menos uno de los dos IDs
    if ((!memorial_profile_id && !family_profile_id) || 
        (memorial_profile_id && family_profile_id)) {
      return res.status(400).json({ error: 'Se requiere ID de memorial o perfil familiar' });
    }

    const profileId = memorial_profile_id || family_profile_id;
    const isFamilyProfile = !!family_profile_id;

    // Validar captcha
    if (!captcha_id || !captcha_input) {
      return res.status(400).json({ error: 'Captcha requerido' });
    }

    if (!verifyCaptcha(captcha_id, captcha_input)) {
      return res.status(400).json({ error: 'Captcha incorrecto' });
    }

    // console.log('📸 Validando URL de imagen:', photo_url);
    
    if (!photo_url || !isValidImageUrl(photo_url)) {
      // console.log('❌ URL de imagen inválida:', photo_url);
      return res.status(400).json({ error: 'URL de imagen inválida' });
    }
    
    // Validación robusta del contenido de la imagen
    const isImageValid = await validateImageContent(photo_url);
    if (!isImageValid) {
      // console.log('❌ Contenido de imagen inválido:', photo_url);
      return res.status(400).json({ error: 'La imagen no es válida o está corrupta' });
    }
    
    // console.log('✅ URL de imagen válida:', photo_url);

    const cleanAuthorName = sanitizeText(author_name);
    if (!cleanAuthorName || cleanAuthorName.length < 2) {
      return res.status(400).json({ error: 'Nombre del autor requerido (mínimo 2 caracteres)' });
    }

    const cleanMessage = sanitizeText(message);
    if (!cleanMessage || cleanMessage.length < 10) {
      return res.status(400).json({ error: 'Mensaje requerido (mínimo 10 caracteres)' });
    }

    // Verificar que el perfil existe y está publicado
    const tableName = isFamilyProfile ? 'family_profiles' : 'memorial_profiles';
    const { data: profile, error: profileError } = await supabaseAdmin
      .from(tableName)
      .select('id')
      .eq('id', profileId)
      .eq('is_published', true)
      .is('deleted_at', null)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ error: 'Perfil no encontrado' });
    }

    // Preparar datos limpios
    const memoryData = {
      memorial_profile_id: isFamilyProfile ? null : profileId,
      family_profile_id: isFamilyProfile ? profileId : null,
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