import { supabaseAdmin } from '../src/config/supabase.js'

async function createTestOrder() {
  try {
    const { data: users } = await supabaseAdmin
      .from('users')
      .select('id')
      .limit(1)

    if (!users?.length) {
      console.log('❌ No hay usuarios')
      return
    }

    const userId = users[0].id

    const testOrder = {
      user_id: userId,
      package_id: 'basic',
      status: 'completed',
      total_amount: 50000,
      payment_method: 'test',
      payment_status: 'paid'
    }

    const { data, error } = await supabaseAdmin
      .from('orders')
      .insert(testOrder)
      .select()

    if (error) {
      console.error('❌ Error:', error)
      return
    }

    console.log('✅ Orden de prueba creada:', data[0].id)
    
  } catch (error) {
    console.error('Error:', error)
  }
}

createTestOrder()