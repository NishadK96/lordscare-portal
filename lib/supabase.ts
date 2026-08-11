import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { publicSupabaseKey, publicSupabaseUrl } from "./public-supabase-config";

let browserClient: SupabaseClient | null = null;

export const isSupabaseConfigured = Boolean(publicSupabaseUrl && publicSupabaseKey);

export function getSupabaseBrowserClient() {
  if (!isSupabaseConfigured) return null;
  if (!browserClient) {
    browserClient = createClient(
      publicSupabaseUrl,
      publicSupabaseKey,
      { auth: { persistSession: true, autoRefreshToken: true } },
    );
  }
  return browserClient;
}
