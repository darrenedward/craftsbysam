
import { createClient } from '@supabase/supabase-js';

// STANDARD PRACTICE: Access environment variables via import.meta.env (Vite)
const env = (import.meta as any).env;

export const supabaseUrl = env?.VITE_SUPABASE_URL || '';
export const supabaseAnonKey = env?.VITE_SUPABASE_ANON_KEY || '';

// Detect if we are in a demo/mock environment based on the URL or missing keys
export const isMockMode = 
  !supabaseUrl || 
  supabaseUrl.includes('placeholder') || 
  supabaseUrl.includes('demo.supabase') || 
  supabaseUrl.includes('your-project-id');

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "WARNING: Supabase configuration is missing. Defaulting to Demo Mode."
  );
}

// Initialize with valid URL format if missing to prevent createClient crash
const urlToUse = supabaseUrl || 'https://demo.supabase.co';
const keyToUse = supabaseAnonKey || 'demo-key';

export const supabase = createClient(urlToUse, keyToUse);
