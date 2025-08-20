import { supabaseAdmin } from '../src/config/supabase.js'

async function addFavoriteMusicColumn() {
  try {
    console.log('🔧 Agregando columna favorite_music...')
    
    // Intentar hacer una consulta que incluya la columna
    const { data, error } = await supabaseAdmin
      .from('memorial_profiles')
      .select('favorite_music')
      .limit(1)
    
    if (error && error.message.includes('column "favorite_music" does not exist')) {
      console.log('❌ La columna favorite_music no existe')
      console.log('📝 Necesitas ejecutar este SQL en Supabase Dashboard:')
      console.log('   ALTER TABLE memorial_profiles ADD COLUMN favorite_music TEXT;')
      console.log('')
      console.log('🌐 Ve a: https://supabase.com/dashboard/project/bhbnmuernqfbahkazbyg/editor')
      console.log('📋 Copia y pega el SQL de arriba en el SQL Editor')
    } else if (error) {
      console.error('❌ Error inesperado:', error)
    } else {
      console.log('✅ La columna favorite_music ya existe')
      
      // Mostrar algunos registros para verificar
      const { data: profiles } = await supabaseAdmin
        .from('memorial_profiles')
        .select('profile_name, favorite_music')
        .limit(3)
      
      console.log('📋 Perfiles con música favorita:')
      profiles?.forEach(profile => {
        console.log(`   - ${profile.profile_name}: ${profile.favorite_music || 'Sin música'}`)
      })
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

addFavoriteMusicColumn()