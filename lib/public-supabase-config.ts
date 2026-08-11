// Supabase publishable browser configuration.
// This key is intentionally public and remains protected by Supabase Row Level Security.
export const publicSupabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://isnncjwrogvghpntrmlk.supabase.co";

export const publicSupabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_hlHC48RbM-Sh6VBmjqc2rw_No5fSWD7";

