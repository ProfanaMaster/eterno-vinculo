import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function seedDatabase() {
  try {
    console.log('🌱 Iniciando seed de la base de datos...');

    // Insertar paquete único
    const { data: existingPackage } = await supabaseAdmin
      .from('packages')
      .select('id')
      .eq('name', 'Memorial Digital Completo')
      .single();

    if (!existingPackage) {
      const { data: packageData, error: packageError } = await supabaseAdmin
        .from('packages')
        .insert({
          name: 'Memorial Digital Completo',
          description: 'Todo lo que necesitas para honrar la memoria de tus seres queridos',
          price: 150000,
          currency: 'COP',
          features: [
            "Perfil memorial personalizado",
            "Galería de fotos ilimitada", 
            "Videos conmemorativos",
            "Código QR personalizado",
            "Libro de condolencias digital",
            "Acceso permanente",
            "Soporte técnico incluido",
            "Diseño profesional"
          ],
          is_active: true
        })
        .select()
        .single();

      if (packageError) {
        console.error('❌ Error creando paquete:', packageError);
      } else {
        console.log('✅ Paquete creado:', packageData.name);
      }
    } else {
      console.log('ℹ️ Paquete ya existe');
    }

    console.log('🎉 Seed completado exitosamente');

  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  }
}

seedDatabase();