import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Env } from './core-utils';
let supabase: SupabaseClient;
export const getSupabaseClient = (env: Env): SupabaseClient => {
  if (!supabase) {
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      throw new Error('Supabase URL and Anon Key must be provided.');
    }
    supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
  }
  return supabase;
};