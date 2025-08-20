import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://bhbnmuernqfbahkazbyg.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoYm5tdWVybnFmYmFoa2F6YnlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNjIzMzYsImV4cCI6MjA3MDkzODMzNn0.I-ar00nqn4s__1cLYy5drLGGFeYyKc3B5vfcNRV85rg'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Cliente con permisos de servicio para operaciones admin
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoYm5tdWVybnFmYmFoa2F6YnlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM2MjMzNiwiZXhwIjoyMDcwOTM4MzM2fQ.Eoakt8Xxj3E6OmBixiivl9M71wRam3BvoNgxgQs_YuI'
)