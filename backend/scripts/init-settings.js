import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bhbnmuernqfbahkazbyg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoYm5tdWVybnFmYmFoa2F6YnlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM2MjMzNiwiZXhwIjoyMDcwOTM4MzM2fQ.Eoakt8Xxj3E6OmBixiivl9M71wRam3BvoNgxgQs_YuI';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function initializeSettings() {
  try {
    console.log('Initializing site settings...');

    // Insertar configuraciones por defecto
    const defaultSettings = [
      {
        key: 'hero_section',
        value: {
          title: 'Honra la memoria de tus seres queridos',
          subtitle: 'Crea perfiles memoriales digitales únicos con fotos, videos y recuerdos. Comparte momentos especiales que perdurarán para siempre.',
          cta_primary: '🚀 Crear Memorial Ahora',
          cta_secondary: '📖 Ver Ejemplos'
        },
        description: 'Configuración de la sección hero del sitio web'
      },
      {
        key: 'footer_info',
        value: {
          company_name: 'Eterno Vínculo',
          description: 'Preservando memorias, conectando corazones',
          address: 'Bogotá, Colombia',
          phone: '+57 300 123 4567',
          email: 'contacto@eternovinculo.com',
          social: {
            facebook: 'https://facebook.com/eternovinculo',
            instagram: 'https://instagram.com/eternovinculo',
            twitter: 'https://twitter.com/eternovinculo'
          }
        },
        description: 'Información del footer del sitio web'
      },
      {
        key: 'payment_methods',
        value: {
          bancolombia: {
            name: 'Bancolombia',
            account: '123-456789-01',
            type: 'Cuenta de Ahorros',
            owner: 'Eterno Vínculo SAS'
          },
          nequi: {
            name: 'Nequi',
            account: '300 123 4567',
            type: 'Cuenta Digital',
            owner: 'Eterno Vínculo'
          },
          daviplata: {
            name: 'DaviPlata',
            account: '300 123 4567',
            type: 'Cuenta Digital',
            owner: 'Eterno Vínculo'
          }
        },
        description: 'Métodos de pago disponibles'
      },
      {
        key: 'site_stats',
        value: {
          memorials_created: 1200,
          monthly_visits: 50000,
          rating: 4.9
        },
        description: 'Estadísticas del sitio web'
      },
      {
        key: 'pricing_plan',
        value: {
          name: 'Memorial Digital Completo',
          subtitle: 'Todo lo que necesitas para honrar la memoria',
          price: 150000,
          currency: 'COP',
          features: [
            'Perfil memorial personalizado',
            'Galería de fotos',
            'Videos conmemorativos',
            'Código QR personalizado',
            'Libro de condolencias digital',
            'Acceso permanente',
            'Soporte técnico incluido',
            'Diseño profesional'
          ]
        },
        description: 'Configuración del plan de precios'
      }
    ];

    // Verificar si la tabla existe
    const { data: existingSettings, error: checkError } = await supabaseAdmin
      .from('site_settings')
      .select('key')
      .limit(1);

    if (checkError) {
      console.error('Table does not exist or error checking:', checkError);
      console.log('Please create the site_settings table manually in Supabase dashboard');
      return;
    }

    console.log('Table exists, inserting settings...');

    for (const setting of defaultSettings) {
      const { error } = await supabaseAdmin
        .from('site_settings')
        .upsert(setting, { onConflict: 'key' });
      
      if (error) {
        console.error(`Error inserting ${setting.key}:`, error);
      } else {
        console.log(`✓ Inserted ${setting.key}`);
      }
    }

    console.log('Site settings initialized successfully!');

  } catch (error) {
    console.error('Error:', error);
  }
}

initializeSettings();