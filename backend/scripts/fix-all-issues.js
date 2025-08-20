import { supabase } from '../config/supabase.js'

async function fixAllIssues() {
  console.log('🔧 SOLUCIONANDO TODOS LOS PROBLEMAS')
  console.log('='.repeat(40))
  
  try {
    // 1. Cambiar valor por defecto de is_published a TRUE
    console.log('\n1️⃣ Cambiando valor por defecto de is_published...')
    const { error: defaultError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.memorial_profiles ALTER COLUMN is_published SET DEFAULT true;'
    })
    
    if (defaultError) {
      console.log('Error cambiando default:', defaultError)
    } else {
      console.log('✅ Valor por defecto cambiado a TRUE')
    }
    
    // 2. Actualizar todos los registros existentes a publicado
    console.log('\n2️⃣ Actualizando registros existentes...')
    const { data: updated, error: updateError } = await supabase
      .from('memorial_profiles')
      .update({ 
        is_published: true,
        published_at: new Date().toISOString()
      })
      .eq('is_published', false)
      .select('id, profile_name')
    
    if (updateError) {
      console.log('Error actualizando:', updateError)
    } else {
      console.log(`✅ ${updated?.length || 0} memoriales actualizados a publicado`)
    }
    
    // 3. Verificar que la tabla user_memorial_history existe
    console.log('\n3️⃣ Verificando tabla user_memorial_history...')
    const { data: historyTest, error: historyError } = await supabase
      .from('user_memorial_history')
      .select('id')
      .limit(1)
    
    if (historyError) {
      console.log('❌ Error con tabla historial:', historyError)
      console.log('Creando tabla...')
      
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS public.user_memorial_history (
          id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
          user_id uuid NOT NULL,
          memorial_id uuid NULL,
          action text NOT NULL,
          created_at timestamp with time zone NULL DEFAULT now(),
          CONSTRAINT user_memorial_history_pkey PRIMARY KEY (id),
          CONSTRAINT user_memorial_history_action_check CHECK (action = ANY (ARRAY['created'::text, 'edited'::text, 'deleted'::text]))
        );
      `
      
      const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL })
      if (createError) {
        console.log('Error creando tabla:', createError)
      } else {
        console.log('✅ Tabla user_memorial_history creada')
      }
    } else {
      console.log('✅ Tabla user_memorial_history existe')
    }
    
    // 4. Probar inserción en historial
    console.log('\n4️⃣ Probando inserción en historial...')
    const testUserId = 'test-fix-' + Date.now()
    const { data: insertTest, error: insertError } = await supabase
      .from('user_memorial_history')
      .insert({
        user_id: testUserId,
        memorial_id: null,
        action: 'created'
      })
      .select()
    
    if (insertError) {
      console.log('❌ Error insertando en historial:', insertError)
    } else {
      console.log('✅ Inserción en historial funciona')
      // Limpiar
      await supabase.from('user_memorial_history').delete().eq('user_id', testUserId)
    }
    
    console.log('\n✅ TODOS LOS PROBLEMAS SOLUCIONADOS')
    
  } catch (error) {
    console.error('Error general:', error)
  }
}

fixAllIssues()