import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://djxukpbhlbomtvxejxtl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqeHVrcGJobGJvbXR2eGVqeHRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1OTg2MTIsImV4cCI6MjA3NjE3NDYxMn0.IGNiKLwsqbXetRFRLVuyvJQSzi3G5zzyGG8OOzRcjJY';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be provided.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
