import { Request, Response } from 'express'
import { ProfileService } from '../services/profileService.js'
import { QRService } from '../services/qrService.js'
import { catchAsync, ValidationError } from '../middleware/errorHandler.js'
import { supabase } from '../../config/supabase.js'

const profileService = new ProfileService()
const qrService = new QRService()

// Crear perfil
export const createProfile = catchAsync(async (req: Request, res: Response) => {
  const { 
    profile_name, 
    description, 
    birth_date, 
    death_date, 
    profile_image_url,

    gallery_images,
    memorial_video_url,
    template_id 
  } = req.body
  
  const user_id = req.user?.id

  // Verificar que el usuario tenga una orden completada
  const { data: completedOrder } = await supabase
    .from('orders')
    .select('id')
    .eq('user_id', user_id)
    .eq('status', 'completed')
    .limit(1)
    .single()

  if (!completedOrder) {
    throw new ValidationError('Necesitas una orden completada para crear un memorial')
  }

  // Validaciones básicas
  if (!profile_name?.trim()) {
    throw new ValidationError('El nombre del perfil es requerido')
  }
  
  if (!birth_date || !death_date) {
    throw new ValidationError('Las fechas de nacimiento y fallecimiento son requeridas')
  }
  
  if (!profile_image_url) {
    throw new ValidationError('La foto de perfil es requerida')
  }

  // Generar slug único
  const baseSlug = profile_name.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50)
  const slug = `${baseSlug}-${Date.now()}`

  const profileData = {
    user_id,
    order_id: completedOrder.id,
    slug,
    profile_name: profile_name.trim(),
    description: description?.trim() || '',
    birth_date,
    death_date,
    profile_image_url,

    gallery_images: gallery_images || [],
    memorial_video_url: memorial_video_url || null,
    template_id: template_id || null,
    is_published: true,
    published_at: new Date().toISOString()
  }

  const profile = await profileService.createProfile(profileData)

  res.status(201).json({
    success: true,
    data: profile,
    message: 'Memorial creado y publicado exitosamente'
  })
})

// Actualizar perfil
export const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const user_id = req.user?.id
  const updateData = req.body

  const profile = await profileService.updateProfile(id, user_id, updateData)

  res.json({
    success: true,
    data: profile,
    message: 'Perfil actualizado exitosamente'
  })
})

// Publicar perfil
export const publishProfile = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const user_id = req.user?.id

  const profile = await profileService.publishProfile(id, user_id)
  
  // Generar QR después de publicar
  const qrUrl = await qrService.generateQR(profile.id, profile.slug)

  res.json({
    success: true,
    data: { ...profile, qr_code_url: qrUrl },
    message: 'Perfil publicado exitosamente'
  })
})

// Obtener perfil público
export const getPublicProfile = catchAsync(async (req: Request, res: Response) => {
  const { slug } = req.params

  const profile = await profileService.getPublicProfile(slug)

  res.json({
    success: true,
    data: profile
  })
})

// Obtener perfiles del usuario
export const getUserProfiles = catchAsync(async (req: Request, res: Response) => {
  const user_id = req.user?.id
  
  const profiles = await profileService.getUserProfiles(user_id)
  
  res.json({
    success: true,
    data: profiles
  })
})

// Obtener perfil por ID (para edición)
export const getProfile = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const user_id = req.user?.id
  
  const profile = await profileService.getProfileById(id, user_id)
  
  res.json({
    success: true,
    data: profile
  })
})

// Eliminar perfil
export const deleteProfile = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const user_id = req.user?.id

  const profile = await profileService.deleteProfile(id, user_id)

  res.json({
    success: true,
    data: profile,
    message: 'Memorial eliminado exitosamente'
  })
})

// Verificar si el usuario puede crear un memorial
export const canCreateMemorial = catchAsync(async (req: Request, res: Response) => {
  const user_id = req.user?.id
  
  const canCreate = await profileService.canUserCreateMemorial(user_id)
  
  res.json({
    success: true,
    data: { canCreate },
    message: canCreate ? 'Puedes crear un memorial' : 'No puedes crear más memoriales'
  })
})

// Obtener plantillas
export const getTemplates = catchAsync(async (req: Request, res: Response) => {
  const templates = await profileService.getTemplates()

  res.json({
    success: true,
    data: templates
  })
})