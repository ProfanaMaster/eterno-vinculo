import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkUserRole() {
  try {
    console.log('🔍 Verificando usuarios y roles...');

    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('id, email, role, first_name, last_name')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error:', error);
      return;
    }

    console.log('\n👥 Usuarios registrados:');
    users.forEach(user => {
      console.log(`- Email: ${user.email}`);
      console.log(`  Rol: ${user.role || 'user'}`);
      console.log(`  Nombre: ${user.first_name} ${user.last_name}`);
      console.log('---');
    });

    const admins = users.filter(u => ['admin', 'super_admin'].includes(u.role));
    console.log(`\n🔑 Administradores: ${admins.length}`);

  } catch (error) {
    console.error('Error:', error);
  }
}

checkUserRole();