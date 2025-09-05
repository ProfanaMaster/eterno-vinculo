import { Request, Response } from 'express'
import { supabaseAdmin } from '../../config/supabase.js'
import { QRService } from '../services/qrService.js'
import { catchAsync } from '../middleware/errorHandler.js'

const qrService = new QRService()

export const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
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
      totalRevenue = revenueResult.value.data.reduce((sum: number, order: any) => {
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

export const getOrders = catchAsync(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, search = '' } = req.query
  const offset = (Number(page) - 1) * Number(limit)

  let query = supabaseAdmin
    .from('orders')
    .select(`
      *
    `, { count: 'exact' })
    .order('created_at', { ascending: false })

  if (search) {
    query = query.ilike('payment_intent_id', `%${search}%`)
  }

  const { data, error, count } = await query
    .range(offset, offset + Number(limit) - 1)

  if (error) throw error

  res.json({
    success: true,
    data: {
      orders: data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        pages: Math.ceil(count / Number(limit))
      }
    }
  })
})

export const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const { status, verified_by } = req.body

  const updateData: any = { status, updated_at: new Date().toISOString() }
  
  if (status === 'verified') {
    updateData.verified_at = new Date().toISOString()
    updateData.verified_by = verified_by
  }

  const { data, error } = await supabaseAdmin
    .from('orders')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  res.json({
    success: true,
    data
  })
})

export const getQROrders = catchAsync(async (req: Request, res: Response) => {
  const qrOrders = await qrService.getQROrders()

  res.json({
    success: true,
    data: qrOrders
  })
})

export const updateQROrderStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const { fabrication_status, fabrication_notes } = req.body

  const { data, error } = await supabaseAdmin
    .from('qr_orders')
    .update({ fabrication_status, fabrication_notes })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  res.json({
    success: true,
    data
  })
})

export const getSettings = catchAsync(async (req: Request, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from('site_settings')
    .select('*')
    .order('key')

  if (error) throw error

  res.json({
    success: true,
    data
  })
})

export const updateSetting = catchAsync(async (req: Request, res: Response) => {
  const { key } = req.params
  const { value } = req.body
  const userId = req.user?.id

  const { data, error } = await supabaseAdmin
    .from('site_settings')
    .update({ 
      value, 
      updated_at: new Date().toISOString(),
      updated_by: userId 
    })
    .eq('key', key)
    .select()
    .single()

  if (error) throw error

  res.json({
    success: true,
    setting: data
  })
})

export const getPublicSettings = catchAsync(async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .select('*')
      .order('key')

    if (error) throw error

    // Filtrar solo configuraciones públicas
    const publicSettings = data.filter((setting: any) => {
      const key = setting.key
      // Solo permitir configuraciones públicas
      return [
        'hero_section',
        'site_stats', 
        'pricing_plan',
        'footer_info',
        'examples_section',
        'payment_methods' // Necesario para el frontend - incluir completo
      ].includes(key)
    })

    res.json({
      success: true,
      data: publicSettings
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error obteniendo configuraciones públicas'
    })
  }
})