import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// Fallback values for development - DO NOT USE IN PRODUCTION
const FALLBACK_URL = 'http://localhost:54321';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Get environment variables or use fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || FALLBACK_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_KEY;

// Create and configure the Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Show warning if using fallback values
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn(
    'Using fallback Supabase configuration. To use your own project:',
    '\n1. Create a .env file in the project root',
    '\n2. Add your Supabase URL and anon key:',
    '\n   VITE_SUPABASE_URL=your-project-url',
    '\n   VITE_SUPABASE_ANON_KEY=your-anon-key',
    '\n3. Restart the development server',
    '\n\nCurrent values:',
    '\n- URL:', supabaseUrl,
    '\n- KEY:', supabaseAnonKey.substring(0, 10) + '...'
  );
}
