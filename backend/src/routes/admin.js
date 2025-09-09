import express from 'express';
import { supabaseAdmin, getUserFromToken } from '../config/supabase.js';

const router = express.Router();

// Middleware para verificar admin
const requireAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Token requerido' });
    }

    const user = await getUserFromToken(token);
    
    // Verificar que el usuario existe
    if (!user || !user.id) {
      return res.status(401).json({ error: 'Token inválido o usuario no encontrado' });
    }
    
    // Verificar rol de admin
    const { data: userData, error } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error || !userData || !['admin', 'super_admin'].includes(userData.role)) {
      return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });
    }

    req.user = user;
    req.userRole = userData.role;
    next();
  } catch (error) {
    console.error('Error in admin middleware:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
};

/**
 * GET /api/admin/dashboard
 * Verificar acceso de administrador
 */
router.get('/dashboard', requireAdmin, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.userRole
      },
      message: 'Acceso de administrador verificado'
    });
  } catch (error) {
    console.error('Error in dashboard route:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/admin/settings
 * Obtener todas las configuraciones del sitio
 */
router.get('/settings', requireAdmin, async (req, res) => {
  try {
    const { data: settings, error } = await supabaseAdmin
      .from('site_settings')
      .select('*')
      .order('key');


    if (error) throw error;

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Error al obtener configuraciones' });
  }
});

/**
 * PUT /api/admin/settings/:key
 * Actualizar configuración específica
 */
router.put('/settings/:key', requireAdmin, async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    const { data: setting, error } = await supabaseAdmin
      .from('site_settings')
      .update({
        value,
        updated_at: new Date().toISOString(),
        updated_by: req.user.id
      })
      .eq('key', key)
      .select()
      .single();


    if (error) throw error;

    res.json({
      success: true,
      data: setting,
      message: 'Configuración actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ error: 'Error al actualizar configuración' });
  }
});

/**
 * GET /api/admin/users
 * Obtener lista de usuarios con paginación
 */
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    // Contar total de usuarios
    let countQuery = supabaseAdmin
      .from('users')
      .select('id', { count: 'exact', head: true });

    if (search) {
      countQuery = countQuery.or(`email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
    }

    const { count: totalUsers } = await countQuery;

    // Obtener usuarios con paginación
    let query = supabaseAdmin
      .from('users')
      .select(`
        id,
        email,
        first_name,
        last_name,
        role,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (search) {
      query = query.or(`email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
    }

    const { data: users, error } = await query;

    if (error) throw error;

    // Obtener conteos adicionales para cada usuario
    const processedUsers = await Promise.all(
      users.map(async (user) => {
        const [ordersCount, profilesCount] = await Promise.all([
          supabaseAdmin
            .from('orders')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id),
          supabaseAdmin
            .from('memorial_profiles')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
        ]);

        return {
          ...user,
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email.split('@')[0],
          is_active: true, // Por defecto activo
          orders_count: ordersCount.count || 0,
          profiles_count: profilesCount.count || 0
        };
      })
    );

    res.json({
      success: true,
      data: processedUsers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalUsers || 0,
        totalPages: Math.ceil((totalUsers || 0) / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

/**
 * POST /api/admin/users
 * Crear nuevo usuario
 */
router.post('/users', requireAdmin, async (req, res) => {
  try {
    const { email, first_name, last_name, role = 'user', password, send_magic_link = false } = req.body;

    // Validar datos requeridos
    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ error: 'Email, nombre, apellido y contraseña son requeridos' });
    }

    // Validar contraseña
    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Verificar que el email no exista
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Crear usuario en Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: password, // Siempre crear con contraseña
      email_confirm: true,
      user_metadata: { 
        first_name,
        last_name,
        full_name: `${first_name} ${last_name}`,
        needs_password_setup: send_magic_link // Marcar si necesita configurar contraseña
      }
    });

    if (authError) throw authError;

    // Generar enlace de login directo si se solicita
    let loginLink = null;
    if (send_magic_link) {
      try {
        // Generar un token temporal para login directo
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'magiclink',
          email: email,
          options: {
            redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/magic-link`
          }
        });
        
        if (!linkError && linkData?.properties?.action_link) {
          loginLink = linkData.properties.action_link;
        } else {
          // Método alternativo: crear un enlace personalizado
          try {
            const { data: customLinkData, error: customLinkError } = await supabaseAdmin.auth.admin.generateLink({
              type: 'recovery',
              email: email,
              options: {
                redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/magic-link`
              }
            });
            
            if (!customLinkError && customLinkData?.properties?.action_link) {
              loginLink = customLinkData.properties.action_link;
            }
          } catch (altError) {
            console.error('Error en método alternativo:', altError);
          }
        }
      } catch (error) {
        console.error('Error generating magic link:', error);
        // No fallar la creación del usuario por error en generación de enlace
      }
    }

    // Crear registro en la tabla users
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert({
        id: authUser.user.id,
        email,
        first_name,
        last_name,
        role
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: user,
      loginLink: loginLink, // Incluir el enlace en la respuesta
      message: send_magic_link 
        ? (loginLink 
            ? 'Usuario creado exitosamente. Copia y envía este enlace al usuario para que inicie sesión automáticamente.'
            : 'Usuario creado exitosamente. No se pudo generar el enlace de login.')
        : 'Usuario creado exitosamente'
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

/**
 * PUT /api/admin/users/:id
 * Actualizar usuario
 */
router.put('/users/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { email, first_name, last_name, role, password } = req.body;

    // Validar datos requeridos
    if (!email || !first_name || !last_name) {
      return res.status(400).json({ error: 'Email, nombre y apellido son requeridos' });
    }

    // Validar contraseña si se proporciona
    if (password && password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Validar rol si se está cambiando
    if (role && !['user', 'admin', 'super_admin'].includes(role)) {
      return res.status(400).json({ error: 'Rol inválido' });
    }

    // Solo super_admin puede crear otros super_admin
    if (role === 'super_admin' && req.userRole !== 'super_admin') {
      return res.status(403).json({ error: 'Solo super_admin puede asignar este rol' });
    }

    // Actualizar en Supabase Auth
    const authUpdateData = {
      email,
      user_metadata: { 
        first_name,
        last_name,
        full_name: `${first_name} ${last_name}` 
      }
    };
    
    // Solo incluir contraseña si se proporciona
    if (password) {
      authUpdateData.password = password;
    }
    
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, authUpdateData);
    if (authError) throw authError;

    // Actualizar en la tabla users
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update({
        email,
        first_name,
        last_name,
        role,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    // Agregar nombre completo
    if (user) {
      user.name = `${user.first_name} ${user.last_name}`.trim();
      user.is_active = true;
    }

    if (error) throw error;

    res.json({
      success: true,
      data: user,
      message: 'Usuario actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

/**
 * DELETE /api/admin/users/:id
 * Eliminar usuario y todos sus archivos multimedia
 */
router.delete('/users/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // No permitir eliminar super_admin a menos que sea otro super_admin
    const { data: userToDelete } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', id)
      .single();

    if (userToDelete?.role === 'super_admin' && req.userRole !== 'super_admin') {
      return res.status(403).json({ error: 'No puedes eliminar un super_admin' });
    }

    // Obtener todos los perfiles del usuario para eliminar archivos
    const { data: profiles } = await supabaseAdmin
      .from('memorial_profiles')
      .select('profile_image_url, banner_image_url, gallery_images, memorial_video_url')
      .eq('user_id', id);

    // Obtener recuerdos del usuario para eliminar fotos
    const { data: memories } = await supabaseAdmin
      .from('memories')
      .select('photo_url')
      .in('memorial_profile_id', 
        profiles?.map(p => p.id) || []
      );

    // Recopilar todas las URLs de archivos a eliminar
    const filesToDelete = [];
    
    if (profiles) {
      profiles.forEach(profile => {
        // Imagen de perfil
        if (profile.profile_image_url) {
          const fileName = profile.profile_image_url.split('/').pop();
          if (fileName) filesToDelete.push({ bucket: 'uploads', file: fileName });
        }
        
        // Banner
        if (profile.banner_image_url) {
          const fileName = profile.banner_image_url.split('/').pop();
          if (fileName) filesToDelete.push({ bucket: 'uploads', file: fileName });
        }
        
        // Video memorial
        if (profile.memorial_video_url) {
          const fileName = profile.memorial_video_url.split('/').pop();
          if (fileName) filesToDelete.push({ bucket: 'uploads', file: fileName });
        }
        
        // Galería de imágenes
        if (profile.gallery_images && Array.isArray(profile.gallery_images)) {
          profile.gallery_images.forEach(imageUrl => {
            const fileName = imageUrl.split('/').pop();
            if (fileName) filesToDelete.push({ bucket: 'uploads', file: fileName });
          });
        }
      });
    }
    
    // Fotos de recuerdos
    if (memories) {
      memories.forEach(memory => {
        if (memory.photo_url) {
          const fileName = memory.photo_url.split('/').pop();
          if (fileName) filesToDelete.push({ bucket: 'memories', file: fileName });
        }
      });
    }

    // Eliminar archivos del storage
    for (const fileInfo of filesToDelete) {
      try {
        await supabaseAdmin.storage
          .from(fileInfo.bucket)
          .remove([fileInfo.file]);
      } catch (storageError) {
        console.warn(`Error eliminando archivo ${fileInfo.file}:`, storageError);
      }
    }

    // Eliminar de Supabase Auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (authError) throw authError;

    // Eliminar de la tabla users (las cascadas eliminarán el resto)
    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: `Usuario eliminado exitosamente. Se eliminaron ${filesToDelete.length} archivos multimedia.`
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

/**
 * GET /api/admin/users/:id/memorial
 * Obtener memorial de usuario (mantenido para compatibilidad)
 */
router.get('/users/:id/memorial', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: memorial, error } = await supabaseAdmin
      .from('memorial_profiles')
      .select('id, slug, profile_name, is_published')
      .eq('user_id', id)
      .eq('is_published', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (!memorial) {
      return res.status(404).json({ error: 'No se encontró memorial publicado para este usuario' });
    }

    res.json({
      success: true,
      data: memorial
    });
  } catch (error) {
    console.error('Error fetching user memorial:', error);
    res.status(500).json({ error: 'Error al obtener memorial del usuario' });
  }
});

/**
 * GET /api/admin/users/:id/profiles
 * Obtener todos los perfiles de un usuario
 */
router.get('/users/:id/profiles', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: profiles, error } = await supabaseAdmin
      .from('memorial_profiles')
      .select('id, slug, profile_name, is_published, created_at')
      .eq('user_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: profiles || []
    });
  } catch (error) {
    console.error('Error fetching user profiles:', error);
    res.status(500).json({ error: 'Error al obtener perfiles del usuario' });
  }
});

/**
 * PUT /api/admin/users/:id/role
 * Cambiar rol de usuario
 */
router.put('/users/:id/role', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin', 'super_admin'].includes(role)) {
      return res.status(400).json({ error: 'Rol inválido' });
    }

    // Solo super_admin puede crear otros admins
    if (role === 'super_admin' && req.userRole !== 'super_admin') {
      return res.status(403).json({ error: 'Solo super_admin puede asignar este rol' });
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update({ role })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data: user,
      message: 'Rol actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Error al actualizar rol' });
  }
});

/**
 * GET /api/admin/orders/pending-count
 * Obtener conteo de órdenes pendientes
 */
router.get('/orders/pending-count', requireAdmin, async (req, res) => {
  try {
    const { count, error } = await supabaseAdmin
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (error) throw error;

    res.json({
      success: true,
      count: count || 0
    });
  } catch (error) {
    console.error('Error fetching pending orders count:', error);
    res.status(500).json({ error: 'Error al obtener conteo de órdenes pendientes' });
  }
});

/**
 * GET /api/admin/orders
 * Obtener órdenes pendientes de validación
 */
router.get('/orders', requireAdmin, async (req, res) => {
  try {
    const { 
      status, 
      search = '', 
      page = 1, 
      limit = 10 
    } = req.query;
    
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('orders')
      .select(`
        *,
        users (
          id,
          email,
          first_name,
          last_name
        ),
        packages (
          name,
          description
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Aplicar filtro de status solo si se especifica
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Aplicar búsqueda si se proporciona
    if (search) {
      query = query.ilike('payment_intent_id', `%${search}%`);
    }

    const { data: orders, error, count } = await query;

    if (error) {
      console.error('Supabase error fetching orders:', error);
      throw error;
    }


    res.json({
      success: true,
      data: orders || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Error al obtener órdenes' });
  }
});

/**
 * PATCH /api/admin/orders/:id
 * Actualizar estado de orden
 */
router.patch('/orders/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, verified_by } = req.body;

    const updateData = {
      status
    };

    if (status === 'completed') {
      updateData.paid_at = new Date().toISOString();
    }

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;



    res.json({
      success: true,
      data: order,
      message: `Orden ${status === 'completed' ? 'aceptada' : 'rechazada'} exitosamente`
    });
  } catch (error) {
    console.error('Error updating order:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ error: 'Error al actualizar orden', details: error.message });
  }
});

/**
 * PUT /api/admin/orders/:id/verify
 * Verificar pago de orden
 */
router.put('/orders/:id/verify', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body; // 'verified' o 'failed'

    const updateData = {
      status,
      updated_at: new Date().toISOString()
    };

    if (status === 'verified') {
      updateData.paid_at = new Date().toISOString();
    }

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        users (email, first_name, last_name)
      `)
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data: order,
      message: `Orden ${status === 'verified' ? 'verificada' : 'rechazada'} exitosamente`
    });
  } catch (error) {
    console.error('Error verifying order:', error);
    res.status(500).json({ error: 'Error al verificar orden' });
  }
});

/**
 * POST /api/admin/orders
 * Crear nueva orden manualmente
 */
router.post('/orders', requireAdmin, async (req, res) => {
  try {
    const {
      user_id,
      package_id,
      payment_method,
      payment_intent_id,
      total_amount,
      currency = 'COP',
      status = 'completed',
      paid_at,
      payer_name
    } = req.body;

    // Validaciones
    if (!user_id || !package_id || !payment_method || !payment_intent_id || !total_amount) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos: user_id, package_id, payment_method, payment_intent_id, total_amount' 
      });
    }

    // Verificar que el usuario existe
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, first_name, last_name')
      .eq('id', user_id)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar que el paquete existe
    const { data: packageData, error: packageError } = await supabaseAdmin
      .from('packages')
      .select('id, name, price, package_type')
      .eq('id', package_id)
      .single();

    if (packageError || !packageData) {
      return res.status(404).json({ error: 'Paquete no encontrado' });
    }

    // Validar método de pago
    const validPaymentMethods = ['Nequi', 'Transfiya', 'Bancolombia'];
    if (!validPaymentMethods.includes(payment_method)) {
      return res.status(400).json({ 
        error: 'Método de pago inválido. Debe ser: Nequi, Transfiya o Bancolombia' 
      });
    }

    // Validar monto
    const amount = parseFloat(total_amount);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'El monto debe ser un número mayor a 0' });
    }

    // Crear la orden
    const orderData = {
      user_id,
      package_id,
      payment_method,
      payment_intent_id,
      total_amount: amount,
      currency,
      status,
      paid_at: paid_at || new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    const { data: newOrder, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert(orderData)
      .select(`
        id,
        user_id,
        package_id,
        payment_method,
        payment_intent_id,
        total_amount,
        currency,
        status,
        paid_at,
        created_at,
        users (
          id,
          email,
          first_name,
          last_name
        ),
        packages (
          id,
          name,
          price,
          package_type
        )
      `)
      .single();

    if (orderError) {
      return res.status(500).json({ error: 'Error al crear la orden' });
    }

    res.status(201).json({
      success: true,
      data: newOrder,
      message: 'Orden creada exitosamente'
    });

  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/admin/users/search
 * Buscar usuarios por email
 */
router.get('/users/search', requireAdmin, async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email || email.length < 3) {
      return res.json({
        success: true,
        users: []
      });
    }

    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('id, email, first_name, last_name')
      .ilike('email', `%${email}%`)
      .limit(10)
      .order('email');

    if (error) {
      return res.status(500).json({ error: 'Error al buscar usuarios' });
    }

    res.json({
      success: true,
      users: users || []
    });

  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/admin/stats
 * Estadísticas del dashboard con ingresos
 */
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const [usersResult, ordersResult, profilesResult, revenueResult] = await Promise.allSettled([
      supabaseAdmin.from('users').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('orders').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('memorial_profiles').select('id', { count: 'exact', head: true }),
      supabaseAdmin
        .from('orders')
        .select('total_amount, users!inner(role)')
        .eq('status', 'completed')
        .not('users.role', 'in', '(admin,super_admin)')
    ])

    // Calcular ingresos totales
    let totalRevenue = 0
    if (revenueResult.status === 'fulfilled' && revenueResult.value.data) {
      totalRevenue = revenueResult.value.data.reduce((sum, order) => {
        return sum + (parseFloat(order.total_amount) || 0)
      }, 0)
    }

    res.json({
      success: true,
      data: {
        users: usersResult.status === 'fulfilled' ? usersResult.value.count || 0 : 0,
        orders: ordersResult.status === 'fulfilled' ? ordersResult.value.count || 0 : 0,
        profiles: profilesResult.status === 'fulfilled' ? profilesResult.value.count || 0 : 0,
        revenue: totalRevenue
      }
    })
  } catch (error) {
    res.json({
      success: true,
      data: {
        users: 0,
        orders: 0,
        profiles: 0,
        revenue: 0
      }
    })
  }
})

/**
 * GET /api/admin/packages
 * Obtener todos los paquetes
 */
router.get('/packages', requireAdmin, async (req, res) => {
  try {
    const { data: packages, error } = await supabaseAdmin
      .from('packages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: packages
    });
  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({ error: 'Error al obtener paquetes' });
  }
});

/**
 * PUT /api/admin/packages/:id
 * Actualizar paquete
 */
router.put('/packages/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, features, is_active, package_type } = req.body;

    const { data: packageData, error } = await supabaseAdmin
      .from('packages')
      .update({
        name,
        description,
        price,
        features,
        is_active,
        package_type,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data: packageData,
      message: 'Paquete actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error updating package:', error);
    res.status(500).json({ error: 'Error al actualizar paquete' });
  }
});

/**
 * POST /api/admin/packages/sync-pricing
 * Sincronizar datos de pricing con la tabla packages
 */
router.post('/packages/sync-pricing', requireAdmin, async (req, res) => {
  try {
    const { pricingData } = req.body;
    
    // Verificar si tiene estructura de múltiples paquetes
    if (pricingData.packages && Array.isArray(pricingData.packages)) {
      // Sincronizar múltiples paquetes
      const results = [];
      
      for (const pkg of pricingData.packages) {
        const updateData = {
          name: pkg.name || 'Memorial Digital',
          description: pkg.subtitle || 'Memorial digital completo',
          price: pkg.price || 150000,
          currency: pkg.currency || 'COP',
          features: pkg.features || [],
          is_active: true
        };

        const { data: packageData, error } = await supabaseAdmin
          .from('packages')
          .upsert({
            id: pkg.id,
            ...updateData,
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) {
          console.error(`Error updating package ${pkg.id}:`, error);
          continue;
        }

        results.push(packageData);
      }

      res.json({
        success: true,
        data: results,
        message: `${results.length} paquetes sincronizados exitosamente`
      });

    } else {
      // Mantener compatibilidad con estructura antigua (un solo paquete)
      const packageId = 'e454b0bf-ba21-4a38-8149-1b3c0dbc2a91';
      
      const updateData = {
        name: pricingData.name || 'Memorial Digital Completo',
        description: pricingData.subtitle || 'Todo lo que necesitas para honrar la memoria',
        price: pricingData.price || 150000,
        currency: pricingData.currency || 'COP',
        features: pricingData.features || []
      };

      const { data: packageData, error } = await supabaseAdmin
        .from('packages')
        .update(updateData)
        .eq('id', packageId)
        .select()
        .single();

      if (error) {
        console.error('Error updating package:', error);
        return res.status(500).json({ error: 'Error al actualizar paquete' });
      }

      res.json({
        success: true,
        data: packageData,
        message: 'Paquete sincronizado exitosamente'
      });
    }

  } catch (error) {
    console.error('Error in POST /admin/packages/sync-pricing:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * POST /api/admin/packages
 * Crear nuevo paquete
 */
router.post('/packages', requireAdmin, async (req, res) => {
  try {
    const { name, description, price, features, is_active = true } = req.body;

    const { data: packageData, error } = await supabaseAdmin
      .from('packages')
      .insert({
        name,
        description,
        price,
        features,
        is_active
      })
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data: packageData,
      message: 'Paquete creado exitosamente'
    });
  } catch (error) {
    console.error('Error creating package:', error);
    res.status(500).json({ error: 'Error al crear paquete' });
  }
});

/**
 * DELETE /api/admin/packages/:id
 * Eliminar paquete
 */
router.delete('/packages/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('packages')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Paquete eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error deleting package:', error);
    res.status(500).json({ error: 'Error al eliminar paquete' });
  }
});

/**
 * POST /api/admin/settings/init
 * Inicializar configuraciones por defecto
 */
router.post('/settings/init', requireAdmin, async (req, res) => {
  try {
    const defaultSettings = [
      {
        key: 'hero_section',
        value: {
          title: 'Preserva los Recuerdos que Más Importan',
          subtitle: 'Crea un memorial digital personalizado para honrar la memoria de tus seres queridos. Un espacio eterno donde los recuerdos viven para siempre.',
          cta_primary: 'Crear Memorial',
          cta_secondary: 'Ver Ejemplos'
        },
        description: 'Configuración de la sección hero del sitio web'
      },
      {
        key: 'footer_info',
        value: {
          company_name: 'Eterno Vínculo',
          description: 'Preservando memorias, conectando corazones',
          address: 'Bogotá, Colombia',
          phone: '+57 300 123 4567',
          email: 'contacto@eternovinculo.com',
          social: {
            facebook: 'https://facebook.com/eternovinculo',
            instagram: 'https://instagram.com/eternovinculo',
            twitter: 'https://twitter.com/eternovinculo'
          }
        },
        description: 'Información del footer del sitio web'
      },
      {
        key: 'payment_methods',
        value: {
          bancolombia: {
            name: 'Bancolombia',
            account: '123-456789-01',
            type: 'Cuenta de Ahorros',
            owner: 'Eterno Vínculo SAS'
          },
          nequi: {
            name: 'Nequi',
            account: '300 123 4567',
            type: 'Cuenta Digital',
            owner: 'Eterno Vínculo'
          },
          transfiya: {
            name: 'Transfiya',
            account: 'eternovinculo@transfiya.com',
            type: 'Cuenta Transfiya',
            owner: 'Eterno Vínculo'
          }
        },
        description: 'Métodos de pago disponibles'
      },
      {
        key: 'site_stats',
        value: {
          memorials_created: 150,
          monthly_visits: 2500,
          rating: 4.8
        },
        description: 'Estadísticas del sitio web'
      }
    ];

    for (const setting of defaultSettings) {
      const { error } = await supabaseAdmin
        .from('site_settings')
        .upsert(setting, { onConflict: 'key' });
      
      if (error) {
        console.error(`Error inserting ${setting.key}:`, error);
      }
    }

    res.json({
      success: true,
      message: 'Configuraciones inicializadas exitosamente'
    });
  } catch (error) {
    console.error('Error initializing settings:', error);
    res.status(500).json({ error: 'Error al inicializar configuraciones' });
  }
});

/**
 * GET /api/admin/memorial-profiles
 * Obtener perfiles memoriales (individuales y familiares) para autocompletado
 */
router.get('/memorial-profiles', requireAdmin, async (req, res) => {
  try {
    // Obtener perfiles memoriales individuales
    const { data: individualProfiles, error: individualError } = await supabaseAdmin
      .from('memorial_profiles')
      .select('id, profile_name, profile_image_url, birth_date, death_date, slug, description')
      .order('profile_name');

    if (individualError) throw individualError;

    // Obtener perfiles memoriales familiares
    const { data: familyProfiles, error: familyError } = await supabaseAdmin
      .from('family_profiles')
      .select('id, family_name, description, slug, created_at')
      .is('deleted_at', null)
      .order('family_name');

    if (familyError) throw familyError;

    // Transformar perfiles familiares para que tengan la misma estructura
    const transformedFamilyProfiles = familyProfiles?.map(profile => ({
      id: profile.id,
      profile_name: profile.family_name,
      profile_image_url: null, // Los perfiles familiares no tienen imagen principal
      birth_date: null, // Los perfiles familiares no tienen fecha de nacimiento única
      death_date: null, // Los perfiles familiares no tienen fecha de muerte única
      slug: profile.slug,
      description: profile.description,
      type: 'family' // Marcar como perfil familiar
    })) || [];

    // Transformar perfiles individuales para marcar su tipo
    const transformedIndividualProfiles = individualProfiles?.map(profile => ({
      ...profile,
      type: 'individual' // Marcar como perfil individual
    })) || [];

    // Combinar ambos tipos de perfiles
    const allProfiles = [...transformedIndividualProfiles, ...transformedFamilyProfiles];

    res.json({
      success: true,
      data: allProfiles
    });
  } catch (error) {
    console.error('Error fetching memorial profiles:', error);
    res.status(500).json({ error: 'Error al obtener perfiles memoriales' });
  }
});


/**
 * POST /api/admin/couple-profiles
 * Crear un nuevo perfil de pareja
 */
router.post('/couple-profiles', requireAdmin, async (req, res) => {
  try {
    const {
      couple_name,
      description,
      profile_image_url,
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
      is_published
    } = req.body;

    // Validaciones básicas
    if (!couple_name || !description || !person1_name || !person2_name) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos: couple_name, description, person1_name, person2_name' 
      });
    }

    // Crear el perfil de pareja
    const { data: coupleProfile, error: coupleError } = await supabaseAdmin
      .from('couple_profiles')
      .insert({
        couple_name,
        description,
        profile_image_url,
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
        common_interests: JSON.stringify(common_interests || []),
        person1_suegros: JSON.stringify(person1_suegros || []),
        person2_suegros: JSON.stringify(person2_suegros || []),
        person1_cunados: JSON.stringify(person1_cunados || []),
        person2_cunados: JSON.stringify(person2_cunados || []),
        pets,
        short_term_goals,
        medium_term_goals,
        long_term_goals,
        template_id: template_id || 'couple-1',
        is_published: is_published || false,
        created_by: req.user.id,
        slug: `${couple_name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`
      })
      .select()
      .single();

    if (coupleError) {
      console.error('Error creating couple profile:', coupleError);
      return res.status(500).json({ error: 'Error al crear el perfil de pareja' });
    }

    res.json({
      success: true,
      coupleProfile,
      message: 'Perfil de pareja creado exitosamente'
    });

  } catch (error) {
    console.error('Error in create couple profile:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * POST /api/admin/couple-profiles/:id/gallery
 * Subir fotos a la galería de un perfil de pareja
 */
router.post('/couple-profiles/:id/gallery', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { photos } = req.body; // Array de objetos { file_url, title }

    if (!photos || !Array.isArray(photos)) {
      return res.status(400).json({ error: 'Se requiere un array de fotos' });
    }

    // Insertar fotos en la galería
    const galleryPhotos = photos.map((photo, index) => ({
      couple_profile_id: id,
      photo_url: photo.file_url,
      photo_title: photo.title || '',
      display_order: index + 1
    }));

    const { data, error } = await supabaseAdmin
      .from('couple_gallery_photos')
      .insert(galleryPhotos)
      .select();

    if (error) {
      console.error('Error uploading gallery photos:', error);
      return res.status(500).json({ error: 'Error al subir las fotos' });
    }

    res.json({
      success: true,
      photos: data,
      message: 'Fotos subidas exitosamente'
    });

  } catch (error) {
    console.error('Error in upload gallery photos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * POST /api/admin/couple-profiles/:id/songs
 * Agregar canciones favoritas a un perfil de pareja
 */
router.post('/couple-profiles/:id/songs', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { songs } = req.body; // Array de objetos { title, youtube_url }

    if (!songs || !Array.isArray(songs)) {
      return res.status(400).json({ error: 'Se requiere un array de canciones' });
    }

    // Insertar canciones
    const favoriteSongs = songs.map(song => ({
      couple_profile_id: id,
      song_title: song.title,
      youtube_url: song.youtube_url
    }));

    const { data, error } = await supabaseAdmin
      .from('couple_favorite_songs')
      .insert(favoriteSongs)
      .select();

    if (error) {
      console.error('Error adding favorite songs:', error);
      return res.status(500).json({ error: 'Error al agregar las canciones' });
    }

    res.json({
      success: true,
      songs: data,
      message: 'Canciones agregadas exitosamente'
    });

  } catch (error) {
    console.error('Error in add favorite songs:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * POST /api/admin/couple-profiles/:id/videos
 * Subir videos especiales a un perfil de pareja
 */
router.post('/couple-profiles/:id/videos', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { videos } = req.body; // Array de objetos { file_url, title }

    if (!videos || !Array.isArray(videos)) {
      return res.status(400).json({ error: 'Se requiere un array de videos' });
    }

    // Insertar videos
    const specialVideos = videos.map(video => ({
      couple_profile_id: id,
      video_url: video.file_url,
      video_filename: video.title || ''
    }));

    const { data, error } = await supabaseAdmin
      .from('couple_special_videos')
      .insert(specialVideos)
      .select();

    if (error) {
      console.error('Error uploading special videos:', error);
      return res.status(500).json({ error: 'Error al subir los videos' });
    }

    res.json({
      success: true,
      videos: data,
      message: 'Videos subidos exitosamente'
    });

  } catch (error) {
    console.error('Error in upload special videos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/admin/couple-profiles
 * Obtener todos los perfiles de pareja
 */
router.get('/couple-profiles', requireAdmin, async (req, res) => {
  try {
    const { data: coupleProfiles, error } = await supabaseAdmin
      .from('couple_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching couple profiles:', error);
      return res.status(500).json({ error: 'Error al obtener los perfiles de pareja' });
    }

    res.json({
      success: true,
      coupleProfiles: coupleProfiles || [],
      message: 'Perfiles de pareja obtenidos exitosamente'
    });

  } catch (error) {
    console.error('Error in get couple profiles:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/admin/couple-profiles/:id
 * Obtener un perfil de pareja específico
 */
router.get('/couple-profiles/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener el perfil principal
    const { data: coupleProfile, error: profileError } = await supabaseAdmin
      .from('couple_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (profileError) {
      console.error('Error fetching couple profile:', profileError);
      return res.status(404).json({ error: 'Perfil de pareja no encontrado' });
    }

    // Obtener fotos de la galería
    const { data: galleryPhotos } = await supabaseAdmin
      .from('couple_gallery_photos')
      .select('*')
      .eq('couple_profile_id', id)
      .order('display_order');

    // Obtener canciones favoritas
    const { data: favoriteSongs } = await supabaseAdmin
      .from('couple_favorite_songs')
      .select('*')
      .eq('couple_profile_id', id)
      .order('display_order');

    // Obtener videos especiales
    const { data: specialVideos } = await supabaseAdmin
      .from('couple_special_videos')
      .select('*')
      .eq('couple_profile_id', id)
      .order('display_order');

    // Combinar todos los datos
    const completeProfile = {
      ...coupleProfile,
      common_interests: coupleProfile.common_interests ? JSON.parse(coupleProfile.common_interests) : [],
      person1_suegros: coupleProfile.person1_suegros ? JSON.parse(coupleProfile.person1_suegros) : [],
      person2_suegros: coupleProfile.person2_suegros ? JSON.parse(coupleProfile.person2_suegros) : [],
      person1_cunados: coupleProfile.person1_cunados ? JSON.parse(coupleProfile.person1_cunados) : [],
      person2_cunados: coupleProfile.person2_cunados ? JSON.parse(coupleProfile.person2_cunados) : [],
      gallery_photos: galleryPhotos || [],
      favorite_songs: favoriteSongs || [],
      special_videos: specialVideos || []
    };

    res.json({
      success: true,
      coupleProfile: completeProfile,
      message: 'Perfil de pareja obtenido exitosamente'
    });

  } catch (error) {
    console.error('Error in get couple profile:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;