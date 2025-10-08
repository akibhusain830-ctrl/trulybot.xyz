import { createBrowserClient } from '@supabase/ssr';

// Validate environment variables at startup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
  console.warn('⚠️ Using development mode - some Supabase features may not work');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('placeholder')) {
  console.warn('⚠️ Using development mode - some Supabase features may not work');
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);