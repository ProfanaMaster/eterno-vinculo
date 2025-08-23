import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function seedSettings() {
  try {
    console.log('🌱 Insertando configuraciones por defecto del sitio...');
    
    // Verificar si ya existen configuraciones
    const { data: existing } = await supabaseAdmin
      .from('site_settings')
      .select('key')
      .limit(1);
    
    if (existing && existing.length > 0) {
      console.log('⚠️  Configuraciones ya existen. Use --force para sobrescribir.');
      const force = process.argv.includes('--force');
      if (!force) {
        console.log('💡 Para sobrescribir: node seed-settings.js --force');
        return;
      }
      console.log('🔄 Sobrescribiendo configuraciones existentes...');
    }

    const settings = [
      {
        key: 'hero_section',
        value: {
          title: "Honra la memoria de tus seres queridos",
          subtitle: "Crea perfiles memoriales digitales únicos con fotos, videos y recuerdos. Comparte momentos especiales que perdurarán para siempre.",
          cta_primary: "Crear Memorial Ahora",
          cta_secondary: "📖 Ver Ejemplos"
        },
        description: 'Configuración de la sección hero'
      },
      {
        key: 'footer_info',
        value: {
          company_name: "Eterno Vínculo",
          description: "Preservamos memorias, honramos vidas",
          address: "Calle 123 #45-67, Bogotá, Colombia",
          phone: "+57 300 123 4567",
          email: "contacto@eternovinculo.com",
          social: {
            facebook: "https://facebook.com/eternovinculo",
            instagram: "https://instagram.com/eternovinculo",
            twitter: "https://twitter.com/eternovinculo"
          }
        },
        description: 'Información del footer'
      },
      {
        key: 'payment_methods',
        value: {
          bancolombia: {
            name: "Bancolombia",
            account: "123-456-789-01",
            type: "Cuenta de Ahorros",
            owner: "Eterno Vínculo SAS"
          },
          nequi: {
            name: "Nequi",
            account: "300-123-4567",
            type: "Cuenta Nequi",
            owner: "Eterno Vínculo"
          },
          transfiya: {
            name: "Transfiya",
            account: "eternovinculo@transfiya.com",
            type: "Cuenta Transfiya",
            owner: "Eterno Vínculo"
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
        description: 'Estadísticas del sitio'
      },
      {
        key: 'pricing_plan',
        value: {
          name: "Memorial Digital Completo",
          subtitle: "Todo lo que necesitas para honrar la memoria",
          price: 150000,
          currency: "COP",
          features: [
            "Perfil memorial personalizado",
            "Galería de fotos ilimitada",
            "Videos conmemorativos",
            "Código QR personalizado",
            "Libro de condolencias digital",
            "Acceso permanente",
            "Soporte técnico incluido",
            "Diseño profesional"
          ]
        },
        description: 'Configuración del plan de precios'
      }
    ];

    for (const setting of settings) {
      const { data: existing } = await supabaseAdmin
        .from('site_settings')
        .select('id')
        .eq('key', setting.key)
        .single();

      if (!existing) {
        const { error } = await supabaseAdmin
          .from('site_settings')
          .insert(setting);

        if (error) {
          console.error(`❌ Error insertando ${setting.key}:`, error);
        } else {
          console.log(`✅ Configuración ${setting.key} insertada`);
        }
      } else {
        console.log(`ℹ️ Configuración ${setting.key} ya existe`);
      }
    }

    console.log('🎉 Configuraciones insertadas exitosamente');

  } catch (error) {
    console.error('❌ Error en seed de configuraciones:', error);
    process.exit(1);
  }
}

seedSettings();