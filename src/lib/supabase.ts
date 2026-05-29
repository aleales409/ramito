import { createClient } from '@supabase/supabase-js';

// Retrieve Supabase credentials or use safe fallbacks to prevent crash if not configured
let supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isUrlValid = supabaseUrl && (supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://'));

if (!isUrlValid) {
  supabaseUrl = 'https://placeholder.supabase.co';
}

if (!supabaseAnonKey) {
  supabaseAnonKey = 'placeholder-anon-key';
}

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn(
    'Supabase configuration is missing or invalid. VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be provided. ' +
    'The application is running with simulated offline features and local storage fallbacks.'
  );
}

export const isSupabaseConfigured = !!(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  isUrlValid &&
  !import.meta.env.VITE_SUPABASE_URL.includes('placeholder')
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

