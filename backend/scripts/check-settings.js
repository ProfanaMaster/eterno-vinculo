import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkSettings() {
  try {
    console.log('🔍 Consultando configuraciones...');

    const { data: settings, error } = await supabaseAdmin
      .from('site_settings')
      .select('*')
      .order('key');

    if (error) {
      console.error('❌ Error consultando settings:', error);
      return;
    }

    console.log('✅ Settings encontrados:');
    console.log('='.repeat(50));

    settings.forEach(setting => {
      console.log(`\n📋 ${setting.key.toUpperCase()}`);
      console.log(`ID: ${setting.id}`);
      console.log(`Descripción: ${setting.description}`);
      console.log(`Actualizado: ${setting.updated_at}`);
      console.log('Valor:');
      console.log(JSON.stringify(setting.value, null, 2));
      console.log('-'.repeat(30));
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkSettings();