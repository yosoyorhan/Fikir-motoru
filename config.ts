// WARNING: Do not commit .env file to version control. It contains sensitive
// information.

// Supabase Credentials - Vite uses import.meta.env
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Supabase URL and Anon Key must be provided in .env file. Please create a .env file and add the required variables."
  );
}

// Gemini API Key
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error(
    "Gemini API Key must be provided in .env file. Please create a .env file and add the required variables."
  );
}

export { SUPABASE_URL, SUPABASE_ANON_KEY, API_KEY };
