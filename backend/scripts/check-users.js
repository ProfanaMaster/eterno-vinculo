import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://bhbnmuernqfbahkazbyg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoYm5tdWVybnFmYmFoa2F6YnlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNjIzMzYsImV4cCI6MjA3MDkzODMzNn0.I-ar00nqn4s__1cLYy5drLGGFeYyKc3B5vfcNRV85rg'
)

async function checkUsers() {
  console.log('👥 VERIFICANDO USUARIOS EXISTENTES')
  console.log('='.repeat(35))
  
  const { data: users, error } = await supabase
    .from('users')
    .select('id, email')
    .limit(5)
  
  if (error) {
    console.log('❌ Error:', error)
  } else {
    console.log('Usuarios encontrados:', users?.length || 0)
    if (users && users.length > 0) {
      console.log('Primer usuario ID:', users[0].id)
      
      // Probar con usuario real
      await testWithRealUser(users[0].id)
    } else {
      console.log('No hay usuarios en la tabla')
    }
  }
}

async function testWithRealUser(userId) {
  console.log('\n🧪 PROBANDO CON USUARIO REAL')
  console.log('User ID:', userId)
  
  const testData = {
    user_id: userId,
    profile_name: 'Test Real User',
    description: 'Test',
    birth_date: '1980-01-01',
    death_date: '2023-01-01',
    profile_image_url: 'https://example.com/test.jpg',
    slug: `test-real-${Date.now()}`,
    is_published: true,
    published_at: new Date().toISOString()
  }
  
  console.log('📤 Insertando con is_published:', testData.is_published)
  
  const { data, error } = await supabase
    .from('memorial_profiles')
    .insert(testData)
    .select('id, is_published, published_at')
    .single()
  
  if (error) {
    console.log('❌ ERROR:', error)
  } else {
    console.log('✅ ÉXITO!')
    console.log('is_published guardado como:', data.is_published)
    
    if (data.is_published === true) {
      console.log('🎉 ¡NO HAY TRIGGERS! El problema está en el código')
    } else {
      console.log('🚨 HAY UN TRIGGER cambiando is_published a false')
    }
    
    // Limpiar
    await supabase.from('memorial_profiles').delete().eq('id', data.id)
    console.log('🧹 Limpiado')
  }
}

checkUsers()