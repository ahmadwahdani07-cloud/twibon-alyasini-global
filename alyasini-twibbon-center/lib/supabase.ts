import { createClient } from '@supabase/supabase-js';

// Public Supabase project settings. NEXT_PUBLIC_* values override these fallbacks.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://eyihjwrewtpmhvrlofyc.supabase.co';
const key =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_HHzEUSp1A85AdHdQXBVWXg_G-Q0rsa9';

export const isSupabaseConfigured = Boolean(url && key && url.startsWith('https://'));
export const supabase = isSupabaseConfigured ? createClient(url, key) : null;
