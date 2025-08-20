import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function getPackageId() {
  try {
    const { data: packages, error } = await supabaseAdmin
      .from('packages')
      .select('*');

    if (error) {
      console.error('Error:', error);
      return;
    }

    console.log('📦 Paquetes disponibles:');
    packages.forEach(pkg => {
      console.log(`- ID: ${pkg.id}`);
      console.log(`  Nombre: ${pkg.name}`);
      console.log(`  Precio: ${pkg.price}`);
      console.log('---');
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

getPackageId();