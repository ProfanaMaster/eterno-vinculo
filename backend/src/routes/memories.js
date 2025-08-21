import express from 'express';
import rateLimit from 'express-rate-limit';
import { supabaseAdmin } from '../config/supabase.js';

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
    // Solo permitir URLs de Supabase storage
    return urlObj.hostname.includes('supabase.co') && 
           urlObj.pathname.includes('/storage/v1/object/public/memories/');
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

    if (!photo_url || !isValidImageUrl(photo_url)) {
      return res.status(400).json({ error: 'URL de imagen inválida' });
    }

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
      is_authorized: false, // Por defecto oculto hasta que el propietario lo autorice
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

export default router;