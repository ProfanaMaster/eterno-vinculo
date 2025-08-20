import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '..', '.env') })

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://bhbnmuernqfbahkazbyg.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_KEY no está configurado')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  try {
    console.log('🚀 Ejecutando migración de restricciones de memoriales...')
    
    // Ejecutar cada query por separado
    const queries = [
      // Agregar columnas
      `ALTER TABLE public.memorial_profiles 
       ADD COLUMN IF NOT EXISTS edit_count INTEGER DEFAULT 0,
       ADD COLUMN IF NOT EXISTS max_edits INTEGER DEFAULT 1,
       ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE NULL;`,
      
      // Crear tabla de historial
      `CREATE TABLE IF NOT EXISTS public.user_memorial_history (
         id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
         user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
         memorial_id UUID REFERENCES public.memorial_profiles(id) ON DELETE SET NULL,
         action TEXT NOT NULL CHECK (action IN ('created', 'edited', 'deleted')),
         created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
       );`,
      
      // Habilitar RLS
      `ALTER TABLE public.user_memorial_history ENABLE ROW LEVEL SECURITY;`,
      
      // Crear política
      `DROP POLICY IF EXISTS "Users can view own memorial history" ON public.user_memorial_history;
       CREATE POLICY "Users can view own memorial history" ON public.user_memorial_history
         FOR SELECT USING (auth.uid() = user_id);`
    ]
    
    for (const [index, query] of queries.entries()) {
      console.log(`Ejecutando query ${index + 1}/${queries.length}...`)
      const { error } = await supabase.rpc('exec', { sql: query })
      if (error) {
        console.error(`Error en query ${index + 1}:`, error)
      } else {
        console.log(`✅ Query ${index + 1} completada`)
      }
    }
    
    console.log('✅ Migración completada exitosamente')
    
  } catch (error) {
    console.error('❌ Error ejecutando migración:', error)
    process.exit(1)
  }
}

runMigration()