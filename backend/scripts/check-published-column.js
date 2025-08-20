import { supabase } from '../config/supabase.js'

async function checkPublishedColumn() {
  console.log('🔍 VERIFICANDO COLUMNA PUBLISHED')
  console.log('='.repeat(40))
  
  try {
    // Verificar estructura de la tabla
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'memorial_profiles' })
    
    if (columnsError) {
      console.log('Error obteniendo columnas:', columnsError)
      
      // Método alternativo - consultar datos existentes
      const { data: sample, error: sampleError } = await supabase
        .from('memorial_profiles')
        .select('*')
        .limit(1)
      
      if (sample && sample.length > 0) {
        console.log('Columnas encontradas en datos:')
        Object.keys(sample[0]).forEach(col => {
          if (col.includes('publish')) {
            console.log(`  ✅ ${col}: ${sample[0][col]}`)
          }
        })
      }
    } else {
      console.log('Columnas relacionadas con published:')
      columns.forEach(col => {
        if (col.column_name.includes('publish')) {
          console.log(`  ✅ ${col.column_name} (${col.data_type})`)
        }
      })
    }
    
    // Verificar datos actuales
    const { data: profiles, error: profilesError } = await supabase
      .from('memorial_profiles')
      .select('id, profile_name, published, is_published')
      .limit(5)
    
    if (profilesError) {
      console.log('Error consultando perfiles:', profilesError)
    } else {
      console.log('\nPerfiles existentes:')
      profiles.forEach(profile => {
        console.log(`  ID: ${profile.id}`)
        console.log(`  Nombre: ${profile.profile_name}`)
        console.log(`  published: ${profile.published}`)
        console.log(`  is_published: ${profile.is_published}`)
        console.log('  ---')
      })
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

checkPublishedColumn()