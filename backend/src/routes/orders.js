import express from 'express';
import { supabaseAdmin, getUserFromToken } from '../config/supabase.js';

const router = express.Router();

/**
 * POST /api/orders
 * Crear nueva orden de pago
 */
router.post('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Token requerido' });
    }

    const user = await getUserFromToken(token);
    
    if (!user) {
      return res.status(401).json({ error: 'Token inválido' });
    }
    
    const {
      package_id,
      amount,
      payment_method,
      payment_reference,
      payer_name,
      payment_date
    } = req.body;

    // Validar datos requeridos
    if (!package_id || !amount || !payment_method) {
      return res.status(400).json({ 
        error: 'Datos incompletos: package_id, amount y payment_method son requeridos' 
      });
    }

    // Verificar que el paquete existe
    const { data: packageData, error: packageError } = await supabaseAdmin
      .from('packages')
      .select('*')
      .eq('id', package_id)
      .single();

    if (packageError || !packageData) {
      console.error('Package not found:', { package_id, packageError });
      return res.status(400).json({ error: 'Paquete no encontrado' });
    }

    // Crear la orden
    const orderData = {
      user_id: user.id,
      package_id,
      total_amount: amount,
      currency: 'COP',
      payment_method,
      status: 'pending'
    };

    // Agregar datos opcionales si están presentes
    if (payment_reference) orderData.payment_intent_id = payment_reference;
    
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return res.status(500).json({ error: 'Error al crear la orden' });
    }

    res.status(201).json({
      success: true,
      data: order,
      message: 'Orden creada exitosamente. Validaremos tu pago en las próximas 24 horas.'
    });

  } catch (error) {
    console.error('Error in POST /orders:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/orders
 * Obtener órdenes del usuario autenticado
 */
router.get('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Token requerido' });
    }

    const user = await getUserFromToken(token);
    
    if (!user) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        packages (
          name,
          description,
          features
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return res.status(500).json({ error: 'Error al obtener las órdenes' });
    }

    res.json({
      success: true,
      data: orders
    });

  } catch (error) {
    console.error('Error in GET /orders:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;