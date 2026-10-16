import { createClient } from "@supabase/supabase-js";

// Server-side only. The anon key can do nothing except call register_owner(),
// because Row Level Security blocks all direct table access.
export function supabaseServer() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables.");
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
