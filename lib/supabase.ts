import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env, isMock } from "@/lib/env";

/**
 * Browser/server client using the anon key (subject to RLS).
 */
export const supabase: SupabaseClient = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export const isSupabaseMock = false;

/**
 * Service-role client. Server only: it bypasses RLS, so it must never be
 * imported from a client component.
 */
export function getSupabaseAdmin(): SupabaseClient {
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    env.supabaseAnonKey;

  return createClient(env.supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
