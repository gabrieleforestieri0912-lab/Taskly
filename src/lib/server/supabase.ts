import { createClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

let client: SupabaseClient | null = null;

/**
 * Admin (service-role) Supabase client used by the Next.js API routes.
 * It bypasses RLS, so all row-level ownership checks live in the routes.
 * Environment variables are loaded automatically by Next.js from .env*.
 */
function getSupabase(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "Supabase non configurato: imposta SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nel file .env",
    );
  }
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

export { getSupabase, SUPABASE_URL, SUPABASE_JWT_SECRET };
