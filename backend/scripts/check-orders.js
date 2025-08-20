import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkOrders() {
  try {
    console.log('🔍 Verificando órdenes en la base de datos...');

    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        users (
          email,
          first_name,
          last_name
        ),
        packages (
          name,
          description
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error:', error);
      return;
    }

    console.log(`\n📦 Total de órdenes: ${orders.length}`);
    
    if (orders.length > 0) {
      console.log('\n📋 Órdenes encontradas:');
      orders.forEach((order, index) => {
        console.log(`${index + 1}. ID: ${order.id}`);
        console.log(`   Usuario: ${order.users?.first_name} ${order.users?.last_name} (${order.users?.email})`);
        console.log(`   Paquete: ${order.packages?.name}`);
        console.log(`   Estado: ${order.status}`);
        console.log(`   Monto: $${order.total_amount}`);
        console.log(`   Método: ${order.payment_method}`);
        console.log(`   Fecha: ${new Date(order.created_at).toLocaleString()}`);
        console.log('---');
      });
    } else {
      console.log('\n❌ No se encontraron órdenes');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkOrders();