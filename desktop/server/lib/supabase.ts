
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

let client = null;

/**
 * Admin (service-role) Supabase client used by the desktop Express server.
 * It bypasses RLS, so every row-level ownership check lives in the routes.
 * The SAME credentials as the web project are used, so the desktop shares the
 * exact same database (and the same auth.users identities) as the web app.
 */
function getSupabase() {
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

async function ensureProfile(id, { name, email, picture } = {}) {
  const supabase = getSupabase();
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (!existing) {
    await supabase.from("profiles").insert({
      id,
      name: name || "",
      email: email || null,
      picture: picture || null,
    });
  } else if (name !== undefined || picture !== undefined) {
    const patch = {};
    if (name !== undefined) patch.name = name;
    if (picture !== undefined) patch.picture = picture;
    await supabase.from("profiles").update(patch).eq("id", id);
  }
  return getProfile(id);
}

async function getProfile(id) {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data;
}

module.exports = {
  getSupabase,
  ensureProfile,
  getProfile,
  SUPABASE_URL,
  SUPABASE_JWT_SECRET,
};

