import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Configuración para cliente público (con RLS)
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: false, // No persistir en backend
      detectSessionInUrl: false
    }
  }
);

// Cliente admin (sin RLS) para operaciones administrativas
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  }
);

// Configuración de Storage
export const STORAGE_BUCKETS = {
  MEMORIAL_MEDIA: 'memorial-media',
  QR_CODES: 'memorial-qr-codes',
  AVATARS: 'avatars'
};

// Helper para obtener URL pública de archivo
export const getPublicUrl = (bucket, path) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  
  return data.publicUrl;
};

// Helper para subir archivo
export const uploadFile = async (bucket, path, file, options = {}) => {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, file, {
      upsert: options.upsert || false,
      contentType: options.contentType,
      ...options
    });

  if (error) throw error;
  
  return {
    path: data.path,
    publicUrl: getPublicUrl(bucket, data.path)
  };
};

// Helper para eliminar archivo
export const deleteFile = async (bucket, path) => {
  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .remove([path]);

  if (error) throw error;
  return true;
};

// Helper para crear usuario con admin client
export const createUser = async (email, password, metadata = {}) => {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    user_metadata: metadata,
    email_confirm: true // Auto-confirmar en backend
  });

  if (error) throw error;
  return data;
};

// Helper para obtener usuario por JWT
export const getUserFromToken = async (token) => {
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    throw new Error('Invalid token or user not found');
  }
  
  return user;
};

export default supabase;