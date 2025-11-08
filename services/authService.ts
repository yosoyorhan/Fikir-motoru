import { type AuthError, type AuthResponse, type User } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';

export type AuthState = {
  user: User | null;
  error: AuthError | null;
  loading: boolean;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type SignupCredentials = LoginCredentials & {
  metadata?: { [key: string]: any };
};

// Email/Password Sign Up
export const signUpWithEmail = async ({ email, password, metadata = {} }: SignupCredentials) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error signing up:', error);
    return { data: null, error };
  }
};

// Email/Password Login
export const signInWithEmail = async ({ email, password }: LoginCredentials) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error signing in:', error);
    return { data: null, error };
  }
};

// Magic Link Login
export const signInWithMagicLink = async (email: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error sending magic link:', error);
    return { data: null, error };
  }
};

// Sign Out
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error signing out:', error);
    return { error };
  }
};

// Get Current User
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return { user, error: null };
  } catch (error) {
    console.error('Error getting user:', error);
    return { user: null, error };
  }
};

// Reset Password
export const resetPassword = async (email: string) => {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error resetting password:', error);
    return { data: null, error };
  }
};

// Update User
export const updateUser = async (updates: {
  email?: string;
  password?: string;
  data?: { [key: string]: any };
}) => {
  try {
    const { data, error } = await supabase.auth.updateUser(updates);
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating user:', error);
    return { data: null, error };
  }
};

// Auth State Change Listener
export const onAuthStateChange = (callback: (event: AuthState) => void) => {
  try {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const user = session?.user ?? null;
        callback({ user, error: null, loading: false });
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  } catch (error) {
    console.error('Error setting up auth listener:', error);
    callback({ user: null, error: error as AuthError, loading: false });
    return () => {};
  }
};