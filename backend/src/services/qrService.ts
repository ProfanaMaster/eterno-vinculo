import QRCode from 'qrcode'
import { supabase } from '../../config/supabase.js'

export class QRService {
  async generateQR(profileId: string, slug: string): Promise<string> {
    const profileUrl = `${process.env.FRONTEND_URL}/memorial/${slug}`
    
    // Generar QR con branding personalizado
    const qrOptions = {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    }

    const qrBuffer = await QRCode.toBuffer(profileUrl, qrOptions)
    
    // Subir QR a Supabase Storage
    const fileName = `qr-codes/${profileId}.png`
    
    const { data, error } = await supabase.storage
      .from('qr-codes')
      .upload(fileName, qrBuffer, {
        contentType: 'image/png',
        upsert: true
      })

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from('qr-codes')
      .getPublicUrl(fileName)

    // Actualizar perfil con URL del QR y crear orden de fabricación
    await supabase
      .from('memorial_profiles')
      .update({ 
        qr_code_url: publicUrl,
        qr_data: { url: profileUrl, generated_at: new Date().toISOString() }
      })
      .eq('id', profileId)

    // Crear orden de fabricación
    await supabase
      .from('qr_orders')
      .insert({
        memorial_profile_id: profileId,
        qr_file_path: fileName,
        material: 'acrylic',
        size: 'standard'
      })

    return publicUrl
  }

  async getQROrders() {
    const { data, error } = await supabase
      .from('qr_orders')
      .select(`
        *,
        memorial_profiles!inner(
          profile_name,
          slug,
          user_id,
          users!inner(first_name, last_name, email)
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }
}