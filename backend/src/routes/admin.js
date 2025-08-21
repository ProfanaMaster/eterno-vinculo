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
    const { email, first_name, last_name, role = 'user', password } = req.body;

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
      password,
      email_confirm: true,
      user_metadata: { 
        first_name,
        last_name,
        full_name: `${first_name} ${last_name}` 
      }
    });

    if (authError) throw authError;

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
      message: 'Usuario creado exitosamente'
    });
  } catch (error) {
    console.error('Error creating user:', error);
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
 * Obtener memorial de usuario
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
 * GET /api/admin/stats
 * Estadísticas del dashboard con ingresos
 */
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const [usersResult, ordersResult, profilesResult, revenueResult] = await Promise.allSettled([
      supabaseAdmin.from('users').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('orders').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('memorial_profiles').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('orders').select('total_amount').eq('status', 'completed')
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
    const { name, description, price, features, is_active } = req.body;

    const { data: packageData, error } = await supabaseAdmin
      .from('packages')
      .update({
        name,
        description,
        price,
        features,
        is_active,
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
          daviplata: {
            name: 'DaviPlata',
            account: '300 123 4567',
            type: 'Cuenta Digital',
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

export default router;