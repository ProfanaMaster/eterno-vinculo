import { supabase } from '../config/supabase.js'

async function checkHistoryTable() {
  console.log('🔍 VERIFICANDO TABLA user_memorial_history')
  console.log('='.repeat(45))
  
  try {
    // Verificar si la tabla existe
    console.log('\n1️⃣ Verificando existencia de la tabla...')
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'user_memorial_history')
    
    if (tablesError) {
      console.log('Error consultando tablas:', tablesError)
    } else if (tables && tables.length > 0) {
      console.log('✅ Tabla existe')
    } else {
      console.log('❌ Tabla NO existe')
      return
    }
    
    // Probar inserción
    console.log('\n2️⃣ Probando inserción...')
    const testUserId = 'test-user-history'
    const testMemorialId = 'test-memorial-id'
    
    const { data: insertData, error: insertError } = await supabase
      .from('user_memorial_history')
      .insert({
        user_id: testUserId,
        memorial_id: testMemorialId,
        action: 'created'
      })
      .select()
    
    if (insertError) {
      console.log('❌ Error insertando:', insertError)
    } else {
      console.log('✅ Inserción exitosa:', insertData)
      
      // Limpiar datos de prueba
      await supabase
        .from('user_memorial_history')
        .delete()
        .eq('user_id', testUserId)
      console.log('🧹 Datos de prueba limpiados')
    }
    
    // Verificar registros existentes
    console.log('\n3️⃣ Verificando registros existentes...')
    const { data: existingRecords, error: recordsError } = await supabase
      .from('user_memorial_history')
      .select('*')
      .limit(5)
    
    if (recordsError) {
      console.log('❌ Error consultando registros:', recordsError)
    } else {
      console.log(`📊 Registros encontrados: ${existingRecords?.length || 0}`)
      if (existingRecords && existingRecords.length > 0) {
        existingRecords.forEach(record => {
          console.log(`  - ${record.action} por ${record.user_id} en ${record.created_at}`)
        })
      }
    }
    
  } catch (error) {
    console.error('Error general:', error)
  }
}

checkHistoryTable()