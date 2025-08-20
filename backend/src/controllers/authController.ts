import { supabase, createUser } from '../config/supabase.js';
import { catchAsync, ValidationError, AuthenticationError } from '../middleware/errorHandler.js';

export const register = catchAsync(async (req, res) => {
  const { email, password, first_name, last_name, phone } = req.body;
  
  if (!email || !password || !first_name || !last_name) {
    throw new ValidationError('Missing required fields');
  }
  
  // Crear usuario en Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { first_name, last_name, phone }
    }
  });
  
  if (authError) throw new ValidationError(authError.message);
  
  // Insertar datos adicionales en tabla users
  const { data: userData, error: userError } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      email,
      first_name,
      last_name,
      phone
    })
    .select()
    .single();
  
  if (userError) throw userError;
  
  res.status(201).json({
    success: true,
    data: {
      user: userData,
      session: authData.session
    }
  });
});

export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    throw new ValidationError('Email and password required');
  }
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) throw new AuthenticationError(error.message);
  
  // Obtener datos completos del usuario
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single();
  
  res.json({
    success: true,
    data: {
      user: userData,
      session: data.session
    }
  });
});

export const logout = catchAsync(async (req, res) => {
  const { error } = await supabase.auth.signOut();
  
  if (error) throw error;
  
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

export const getProfile = catchAsync(async (req, res) => {
  const userId = req.user.id;
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  
  res.json({
    success: true,
    data
  });
});