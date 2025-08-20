import { supabaseAdmin } from '../src/config/supabase.js'

async function createStorageBucket() {
  try {
    // Crear bucket para archivos multimedia
    const { data, error } = await supabaseAdmin.storage.createBucket('memorial-media', {
      public: true,
      allowedMimeTypes: [
        'image/jpeg',
        'image/png', 
        'image/webp',
        'video/mp4',
        'video/webm',
        'video/quicktime'
      ],
      fileSizeLimit: 52428800 // 50MB
    })

    if (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ Bucket memorial-media ya existe')
      } else {
        console.error('❌ Error creando bucket:', error)
        return
      }
    } else {
      console.log('✅ Bucket memorial-media creado exitosamente')
    }

    // Verificar bucket
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets()
    
    if (listError) {
      console.error('❌ Error listando buckets:', listError)
      return
    }

    console.log('📦 Buckets disponibles:')
    buckets.forEach(bucket => {
      console.log(`   - ${bucket.name} (${bucket.public ? 'público' : 'privado'})`)
    })

  } catch (error) {
    console.error('Error:', error)
  }
}

createStorageBucket()