import { supabaseAdmin } from '../config/supabase.ts';

const runMigrations = async () => {
  try {
    console.log('🚀 Creando buckets de storage...');
    
    const buckets = [
      { name: 'memorial-media', public: true },
      { name: 'memorial-qr-codes', public: true },
      { name: 'avatars', public: true }
    ];
    
    for (const bucket of buckets) {
      const { error } = await supabaseAdmin.storage.createBucket(bucket.name, {
        public: bucket.public,
        fileSizeLimit: 52428800 // 50MB
      });
      
      if (error && !error.message.includes('already exists')) {
        console.error(`❌ Error creando bucket ${bucket.name}:`, error);
      } else {
        console.log(`✅ Bucket ${bucket.name} creado/verificado`);
      }
    }
    
    console.log('✅ Configuración completada');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

runMigrations();