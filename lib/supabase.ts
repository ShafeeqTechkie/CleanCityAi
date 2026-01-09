import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Client Configuration
 * 
 * Secure Public Coding:
 * 1. Prioritizes environment variables (SUPABASE_URL, SUPABASE_ANON_KEY).
 * 2. Uses provided fallbacks only if environment variables are missing.
 * 3. Validates configuration before initializing the client.
 */

const getEnv = (key: string): string | undefined => {
  try {
    // Attempt to access process.env safely
    return typeof process !== 'undefined' ? process.env[key] : undefined;
  } catch (e) {
    return undefined;
  }
};

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL') || getEnv('SUPABASE_URL') || 'https://fjgpcrczvfbdbgadygsr.supabase.co';
const supabaseAnonKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') || getEnv('SUPABASE_ANON_KEY') || 'sb_publishable_2ZoY_TUg2OqhVGztJZNb4w_yD1Ipkkm';

// Validation to ensure the client doesn't initialize with empty strings or invalid formats
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey !== 'placeholder'
);

// Initialize the Supabase client
// We use a fallback URL if the key is missing to prevent total app crash
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
);
