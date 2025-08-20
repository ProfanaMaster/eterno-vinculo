import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '..', '.env') })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_KEY no está configurado')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkColumns() {
  try {
    console.log('🔍 Verificando estructura de memorial_profiles...')
    
    // Intentar hacer una consulta que use las nuevas columnas
    const { data, error } = await supabase
      .from('memorial_profiles')
      .select('id, profile_name, edit_count, max_edits, deleted_at')
      .limit(1)
    
    if (error) {
      console.error('❌ Error al consultar columnas:', error.message)
      console.log('💡 Las columnas probablemente no existen. Ejecuta la migración.')
    } else {
      console.log('✅ Columnas encontradas correctamente')
      console.log('📊 Datos de ejemplo:', data)
    }
    
    // Verificar todos los memoriales del usuario actual
    console.log('\n🔍 Verificando todos los memoriales...')
    const { data: allMemorials, error: allError } = await supabase
      .from('memorial_profiles')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (allError) {
      console.error('❌ Error:', allError.message)
    } else {
      console.log('📋 Total de memoriales:', allMemorials?.length || 0)
      allMemorials?.forEach(memorial => {
        console.log(`- ${memorial.profile_name} (${memorial.user_id}) - Eliminado: ${memorial.deleted_at ? 'SÍ' : 'NO'}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkColumns()