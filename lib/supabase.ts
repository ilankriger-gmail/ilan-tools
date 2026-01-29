import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gsxanzgwstlpfvnqcmiu.supabase.co';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY not set');
    _supabase = createClient(url, key);
  }
  return _supabase;
}

// backward compat
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getSupabase() as any)[prop];
  }
});
