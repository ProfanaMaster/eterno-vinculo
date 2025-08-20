import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

async function checkProfiles() {
  try {
    console.log('🔍 Verificando perfiles en la base de datos...\n')
    
    const { data: profiles, error } = await supabase
      .from('memorial_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error:', error)
      return
    }

    console.log(`📦 Total de perfiles: ${profiles?.length || 0}\n`)

    if (profiles && profiles.length > 0) {
      console.log('📋 Perfiles encontrados:')
      profiles.forEach((profile, index) => {
        console.log(`${index + 1}. ID: ${profile.id}`)
        console.log(`   Nombre: ${profile.profile_name}`)
        console.log(`   Slug: ${profile.slug}`)
        console.log(`   Template: ${profile.template_id || 'No definido'}`)
        console.log(`   Música: ${profile.favorite_music || 'No definida'}`)
        console.log(`   Usuario: ${profile.user_id}`)
        console.log(`   Publicado: ${profile.is_published ? 'Sí' : 'No'}`)
        console.log(`   Fecha: ${new Date(profile.created_at).toLocaleString('es-CO')}`)
        console.log('---')
        console.log('---')
        console.log('---')
      })
    } else {
      console.log('📝 No hay perfiles creados aún')
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

checkProfiles()