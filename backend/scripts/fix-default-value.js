import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  'https://bhbnmuernqfbahkazbyg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoYm5tdWVybnFmYmFoa2F6YnlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM2MjMzNiwiZXhwIjoyMDcwOTM4MzM2fQ.Eoakt8Xxj3E6OmBixiivl9M71wRam3BvoNgxgQs_YuI'
)

async function fixDefaultValue() {
  console.log('🔧 CAMBIANDO VALOR POR DEFECTO DE is_published')
  console.log('='.repeat(45))
  
  try {
    // Cambiar valor por defecto a TRUE
    console.log('\n1️⃣ Cambiando valor por defecto...')
    const { data: result1, error: error1 } = await supabaseAdmin
      .rpc('exec_sql', {
        sql: 'ALTER TABLE public.memorial_profiles ALTER COLUMN is_published SET DEFAULT true;'
      })
    
    if (error1) {
      console.log('❌ Error:', error1)
    } else {
      console.log('✅ Valor por defecto cambiado a TRUE')
    }
    
    // Actualizar registros existentes
    console.log('\n2️⃣ Actualizando registros existentes...')
    const { data: updated, error: error2 } = await supabaseAdmin
      .from('memorial_profiles')
      .update({ 
        is_published: true,
        published_at: new Date().toISOString()
      })
      .eq('is_published', false)
      .select('id, profile_name')
    
    if (error2) {
      console.log('❌ Error:', error2)
    } else {
      console.log(`✅ ${updated?.length || 0} registros actualizados`)
    }
    
    console.log('\n✅ PROBLEMA SOLUCIONADO')
    console.log('Ahora todos los memoriales se crearán como publicados')
    
  } catch (error) {
    console.error('Error general:', error)
  }
}

fixDefaultValue()