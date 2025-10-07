
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY as string;

export let supabase: SupabaseClient | null = null;
export let isMockMode = false;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '%c[DEMO MODE]%c Supabase credentials not found. The app is running in a mock environment.',
    'background: #e94560; color: black; font-weight: bold; padding: 2px 6px; border-radius: 3px;',
    'background: transparent; color: inherit;'
  );
  isMockMode = true;
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}
