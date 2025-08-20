import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

/**
 * Cliente de Supabase para el frontend
 * Configurado con autenticación automática y persistencia de sesión
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'eterno-vinculo-frontend'
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

/**
 * Tipos de base de datos generados por Supabase
 */
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
        }
        Update: {
          email?: string
          name?: string | null
        }
      }
      packages: {
        Row: {
          id: string
          name: string
          type: 'basic' | 'premium' | 'family'
          price: number
          features: string[]
          active: boolean
          created_at: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          package_id: string
          status: 'pending' | 'completed' | 'failed'
          amount: number
          payment_method: string
          created_at: string
        }
        Insert: {
          user_id: string
          package_id: string
          amount: number
          payment_method: string
        }
      }
      memorial_profiles: {
        Row: {
          id: string
          user_id: string
          order_id: string
          slug: string
          profile_name: string
          description: string
          birth_date: string
          death_date: string
          profile_image_url: string | null
          banner_image_url: string | null
          gallery_images: string[]
          memorial_video_url: string | null
          template_id: string | null
          published: boolean
          created_at: string
          updated_at: string
        }
      }
    }
  }
}