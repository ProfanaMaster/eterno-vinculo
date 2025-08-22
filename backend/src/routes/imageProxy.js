import { Router } from 'express'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'

const router = Router()

// Cliente S3 para Cloudflare R2
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
})

/**
 * GET /api/image-proxy/:key
 * Servir imágenes desde R2 como proxy
 */
router.get('/:key(*)', async (req, res) => {
  try {
    const key = req.params.key
    console.log('🖼️ Sirviendo imagen via proxy:', key)
    
    const command = new GetObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
      Key: key,
    })
    
    const response = await r2Client.send(command)
    
    // Configurar headers apropiados
    res.set({
      'Content-Type': response.ContentType || 'image/jpeg',
      'Content-Length': response.ContentLength,
      'Cache-Control': 'public, max-age=31536000', // Cache por 1 año
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD',
      'Access-Control-Allow-Headers': '*',
    })
    
    // Stream la imagen
    response.Body.pipe(res)
    
  } catch (error) {
    console.error('❌ Error sirviendo imagen:', error)
    res.status(404).json({ error: 'Imagen no encontrada' })
  }
})

export default router
