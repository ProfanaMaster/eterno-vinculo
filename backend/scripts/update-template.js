import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

async function updateTemplate() {
  try {
    // Actualizar el perfil existente con template de médico
    const { data, error } = await supabase
      .from('memorial_profiles')
      .update({ 
        template_id: 'medico-hombre',
        is_published: true  // También lo publicamos para poder verlo públicamente
      })
      .eq('slug', 'a-1755388849471')
      .select()

    if (error) {
      console.error('❌ Error:', error)
      return
    }

    console.log('✅ Perfil actualizado exitosamente:')
    console.log('   Template:', data[0].template_id)
    console.log('   Publicado:', data[0].is_published)
    console.log('   Slug:', data[0].slug)
    
  } catch (error) {
    console.error('Error:', error)
  }
}

updateTemplate()