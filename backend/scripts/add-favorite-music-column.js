import { supabaseAdmin } from '../src/config/supabase.js'

async function addFavoriteMusicColumn() {
  try {
    // Agregar columna favorite_music a la tabla memorial_profiles
    const { error } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        ALTER TABLE memorial_profiles 
        ADD COLUMN IF NOT EXISTS favorite_music TEXT;
      `
    })

    if (error) {
      console.error('❌ Error agregando columna:', error)
      // Intentar método alternativo
      console.log('🔄 Intentando método alternativo...')
      
      const { error: altError } = await supabaseAdmin
        .from('memorial_profiles')
        .select('favorite_music')
        .limit(1)
      
      if (altError && altError.message.includes('column "favorite_music" does not exist')) {
        console.log('⚠️ La columna favorite_music no existe. Necesitas agregarla manualmente en Supabase.')
        console.log('📝 SQL para ejecutar en Supabase:')
        console.log('   ALTER TABLE memorial_profiles ADD COLUMN favorite_music TEXT;')
      } else {
        console.log('✅ La columna favorite_music ya existe')
      }
    } else {
      console.log('✅ Columna favorite_music agregada exitosamente')
    }

  } catch (error) {
    console.error('Error:', error)
  }
}

addFavoriteMusicColumn()