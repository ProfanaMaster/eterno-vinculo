import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';

const router = express.Router();

/**
 * GET /api/packages
 * Obtener paquetes disponibles
 */
router.get('/', async (req, res) => {
  try {
    const { data: packages, error } = await supabaseAdmin
      .from('packages')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching packages:', error);
      return res.status(500).json({ error: 'Error al obtener los paquetes' });
    }

    res.json({
      success: true,
      data: packages
    });

  } catch (error) {
    console.error('Error in GET /packages:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;