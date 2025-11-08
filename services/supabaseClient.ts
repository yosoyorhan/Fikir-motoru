import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

// Export a single top-level binding to satisfy ES module syntax.
// We assign to this variable depending on whether env vars exist.
// This avoids using `export` inside a conditional block which breaks build.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _supabase: any;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Supabase URL and Anon Key must be provided. Check your .env (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) and restart the dev server.'
  );

  const handler: ProxyHandler<any> = {
    get() {
      throw new Error(
        'Supabase client is not initialized because VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing.'
      );
    },
    apply() {
      throw new Error(
        'Supabase client is not initialized because VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing.'
      );
    },
  };

  _supabase = new Proxy({}, handler);
} else {
  _supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = _supabase;
