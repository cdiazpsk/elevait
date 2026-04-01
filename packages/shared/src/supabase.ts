// Supabase client factory - used by both web and mobile apps
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type Database = {
  // Generated types will replace this once `supabase gen types` is run
  // For now, this provides the basic client structure
  public: {
    Tables: Record<string, unknown>;
    Views: Record<string, unknown>;
    Functions: Record<string, unknown>;
    Enums: Record<string, unknown>;
  };
};

/**
 * Create a Supabase client for use in web/mobile apps (uses anon key).
 * Auth state is managed automatically.
 */
export function createSupabaseClient(
  supabaseUrl: string,
  supabaseAnonKey: string,
  options?: {
    persistSession?: boolean;
    autoRefreshToken?: boolean;
  }
): SupabaseClient<Database> {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: options?.persistSession ?? true,
      autoRefreshToken: options?.autoRefreshToken ?? true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });
}

/**
 * Create a Supabase service client for use in Edge Functions (uses service_role key).
 * Bypasses RLS - use only in trusted server-side code.
 */
export function createServiceClient(
  supabaseUrl: string,
  serviceRoleKey: string
): SupabaseClient<Database> {
  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
