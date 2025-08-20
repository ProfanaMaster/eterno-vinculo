import { supabase } from '../config/supabase.ts'

async function checkTriggers() {
  console.log('🔍 VERIFICANDO TRIGGERS EN SUPABASE')
  console.log('='.repeat(40))
  
  try {
    // Verificar triggers en memorial_profiles
    console.log('\n1️⃣ Buscando triggers en memorial_profiles...')
    
    const { data: triggers, error: triggersError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT 
            trigger_name,
            event_manipulation,
            action_timing,
            action_statement
          FROM information_schema.triggers 
          WHERE event_object_table = 'memorial_profiles'
          AND event_object_schema = 'public';
        `
      })
    
    if (triggersError) {
      console.log('Error consultando triggers:', triggersError)
    } else if (triggers && triggers.length > 0) {
      console.log('🚨 TRIGGERS ENCONTRADOS:')
      triggers.forEach(trigger => {
        console.log(`  - ${trigger.trigger_name}`)
        console.log(`    Evento: ${trigger.event_manipulation}`)
        console.log(`    Timing: ${trigger.action_timing}`)
        console.log(`    Acción: ${trigger.action_statement}`)
        console.log('    ---')
      })
    } else {
      console.log('✅ No hay triggers en memorial_profiles')
    }
    
    // Verificar funciones que puedan estar afectando
    console.log('\n2️⃣ Buscando funciones relacionadas...')
    
    const { data: functions, error: functionsError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT 
            routine_name,
            routine_definition
          FROM information_schema.routines 
          WHERE routine_schema = 'public'
          AND (routine_definition ILIKE '%memorial_profiles%' 
               OR routine_definition ILIKE '%is_published%');
        `
      })
    
    if (functionsError) {
      console.log('Error consultando funciones:', functionsError)
    } else if (functions && functions.length > 0) {
      console.log('🔍 FUNCIONES ENCONTRADAS:')
      functions.forEach(func => {
        console.log(`  - ${func.routine_name}`)
        console.log(`    Definición: ${func.routine_definition.substring(0, 200)}...`)
        console.log('    ---')
      })
    } else {
      console.log('✅ No hay funciones sospechosas')
    }
    
    // Verificar políticas RLS
    console.log('\n3️⃣ Verificando políticas RLS...')
    
    const { data: policies, error: policiesError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT 
            policyname,
            cmd,
            qual,
            with_check
          FROM pg_policies 
          WHERE tablename = 'memorial_profiles';
        `
      })
    
    if (policiesError) {
      console.log('Error consultando políticas:', policiesError)
    } else if (policies && policies.length > 0) {
      console.log('🔒 POLÍTICAS RLS:')
      policies.forEach(policy => {
        console.log(`  - ${policy.policyname} (${policy.cmd})`)
        console.log(`    Condición: ${policy.qual || 'N/A'}`)
        console.log(`    Check: ${policy.with_check || 'N/A'}`)
        console.log('    ---')
      })
    } else {
      console.log('✅ No hay políticas RLS')
    }
    
  } catch (error) {
    console.error('Error general:', error)
  }
}

checkTriggers()