// WARNING: Do not commit .env file to version control. It contains sensitive
// information.

// Supabase Credentials - Vite uses import.meta.env
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Gemini API Key
export const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
