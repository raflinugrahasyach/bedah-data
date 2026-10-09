import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env, isMock } from "@/lib/env";

/**
 * Browser/server client using the anon key (subject to RLS).
 *
 * With the mock environment variables from .env.local, this is created against
 * a placeholder URL and is never called: the service layer checks
 * `isSupabaseMock` and serves data from the in-memory store instead.
 */
export const supabase: SupabaseClient = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export const isSupabaseMock = isMock.supabase;

/**
 * Service-role client. Server only: it bypasses RLS, so it must never be
 * imported from a client component.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (typeof window !== "undefined") {
    throw new Error("getSupabaseAdmin() must only be called on the server.");
  }
  return createClient(env.supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY ?? "mock-service-role-key", {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
