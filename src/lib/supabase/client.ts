import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a dummy client wrapper or standard browser client with empty strings
    // handled gracefully in helper functions.
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  );
}
