
const express = require("express");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const { getSupabase, ensureProfile, getProfile, SUPABASE_JWT_SECRET } = require("../lib/supabase");

const router = express.Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
// Redirect loopback verso questo stesso server Express: il browser esterno
// (dove avviene il login Google) rimanda qui il `code` OAuth. Deve essere
// registrato tra gli "Authorized redirect URIs" del client OAuth su
// Google Cloud Console (oppure usare un client di tipo "Desktop app").
function googleRedirectUri() {
  if (process.env.GOOGLE_DESKTOP_REDIRECT_URI) return process.env.GOOGLE_DESKTOP_REDIRECT_URI;
  const port = process.env.PORT || 5000;
  return `http://127.0.0.1:${port}/api/auth/google/callback`;
}
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;
function googleCodeClient() {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) return null;
  return new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, googleRedirectUri());
}

// ── Login Google via browser esterno (per app desktop/Electron) ────────────
// Il bottone GIS incorporato non funziona dentro Electron (Google blocca i
// webview embedded: 403 disallowed_useragent). Flusso:
//  1. renderer chiama GET /google/start?format=json → { url, state }
//  2. renderer apre `url` nel browser di sistema (shell.openExternal)
//  3. Google rimanda a GET /google/callback?code=...&state=... (loopback)
//  4. il server scambia il code, crea/recupera l'utente e salva il risultato
//  5. il renderer fa polling su GET /google/result?state=... e completa il login
const googlePending = new Map(); // state -> { createdAt, token?, user? }
const GOOGLE_STATE_TTL_MS = 10 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of googlePending) {
    if (now - v.createdAt > GOOGLE_STATE_TTL_MS) googlePending.delete(k);
  }
}, 60 * 1000).unref?.();

const crypto = require("crypto");

router.get("/google/start", (req, res) => {
  const client = googleCodeClient();
  if (!client) {
    return res.status(500).json({
      message: "Google auth non configurato sul server: impostare GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET",
    });
  }
  const state = typeof req.query.state === "string" && req.query.state.length >= 16
    ? String(req.query.state).slice(0, 128)
    : crypto.randomBytes(24).toString("hex");
  googlePending.set(state, { createdAt: Date.now() });
  const url = client.generateAuthUrl({
    access_type: "online",
    scope: ["openid", "email", "profile"],
    prompt: "select_account",
    state,
  });
  if (req.query.format === "json") {
    return res.json({ url, state });
  }
  return res.redirect(url);
});

function googleResultPage(ok, title, message) {
  const color = ok ? "#16a34a" : "#dc2626";
  return `<!DOCTYPE html><html lang="it"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head><body style="font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#fcfaff;"><div style="text-align:center;max-width:420px;padding:32px;"><div style="font-size:48px;margin-bottom:16px;">${ok ? "✅" : "⚠️"}</div><h1 style="font-size:22px;margin:0 0 8px;">${title}</h1><p style="color:${color};font-weight:600;">${message}</p><p style="color:#6b7280;font-size:14px;">Torna all'app Taskly per continuare.</p><script>setTimeout(()=>{try{window.close()}catch(e){}},4000)<\/script></div></body></html>`;
}

router.get("/google/callback", async (req, res) => {
  const { code, state, error } = req.query;
  if (error) {
    return res.status(400).send(googleResultPage(false, "Accesso annullato", "Hai annullato l'accesso con Google."));
  }
  if (!code || !state || !googlePending.has(String(state))) {
    return res.status(400).send(googleResultPage(false, "Sessione non valida", "Riprova il login dall'app Taskly."));
  }
  const client = googleCodeClient();
  if (!client) {
    return res.status(500).send(googleResultPage(false, "Server non configurato", "Manca la configurazione Google sul server."));
  }
  try {
    const { tokens } = await client.getToken(String(code));
    const idToken = tokens.id_token;
    if (!idToken) throw new Error("id_token mancante");
    const ticket = await googleClient.verifyIdToken({ idToken, audience: GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    const email = payload?.email;
    const name = payload?.name || "Utente Google";
    const googleId = payload?.sub;
    const picture = payload?.picture;
    if (!email || !googleId) throw new Error("Token Google non valido");

    const supabase = getSupabase();
    let user = await findUserByEmail(email);
    if (!user) {
      const { data, error: createError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { name, picture: picture || "" },
      });
      if (createError) {
        return res.status(400).send(googleResultPage(false, "Registrazione fallita", createError.message));
      }
      user = data.user;
    }
    const profile = await ensureProfile(user.id, { name, email, picture });
    const token = signToken(user.id, email);
    googlePending.set(String(state), {
      createdAt: Date.now(),
      token,
      user: publicUser(profile, user.id, email),
    });
    return res.send(googleResultPage(true, "Accesso completato", "Hai effettuato l'accesso con Google."));
  } catch (err) {
    console.error("Google web callback error:", err?.message || err);
    return res.status(401).send(googleResultPage(false, "Autenticazione fallita", "Riprova il login dall'app Taskly."));
  }
});

// Polling del renderer: restituisce il token una sola volta, poi cancella.
router.get("/google/result", (req, res) => {
  const state = String(req.query.state || "");
  if (!state) return res.status(400).json({ message: "state mancante" });
  const entry = googlePending.get(state);
  if (!entry) return res.status(404).json({ done: false });
  if (Date.now() - entry.createdAt > GOOGLE_STATE_TTL_MS) {
    googlePending.delete(state);
    return res.status(410).json({ done: false, message: "Sessione scaduta" });
  }
  if (!entry.token) return res.json({ done: false });
  googlePending.delete(state);
  return res.json({ done: true, token: entry.token, user: entry.user });
});

// Mint a Supabase-compatible JWT (HS256, same secret the middleware verifies).
function signToken(userId, email) {
  // Fail closed: never mint tokens with a public fallback secret.
  const secret = SUPABASE_JWT_SECRET;
  if (!secret) {
    throw new Error("SUPABASE_JWT_SECRET must be set to mint tokens");
  }
  return jwt.sign(
    { sub: userId, email, role: "authenticated", aud: "authenticated" },
    secret,
    { expiresIn: "7d" },
  );
}

async function findUserByEmail(email) {
  const supabase = getSupabase();
  try {
    const { data } = await supabase.auth.admin.listUsers({ email, perPage: 1 });
    const users = data?.users || [];
    return users.find((u) => (u.email || "").toLowerCase() === String(email).toLowerCase()) || null;
  } catch {
    return null;
  }
}

function publicUser(profile, id, email) {
  return {
    id,
    name: profile?.name || "",
    email: profile?.email || email || "",
    picture: profile?.picture || null,
  };
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const supabase = getSupabase();
    let userId;
    let session = null;
    const created = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, picture: "" },
    });
    if (created.error) {
      // Email likely already registered: try signing in with the password.
      const login = await supabase.auth.signInWithPassword({ email, password });
      if (login.error) {
        return res.status(400).json({ message: login.error.message });
      }
      session = login.data.session;
      userId = login.data.user.id;
    } else {
      userId = created.data.user.id;
      // Obtain a real Supabase session (with refresh token) for parity.
      const login = await supabase.auth.signInWithPassword({ email, password });
      session = login.data?.session || null;
    }

    const profile = await ensureProfile(userId, { name, email });
    const token = session?.access_token || signToken(userId, email);

    res.status(201).json({
      message: "User registered successfully",
      token,
      refreshToken: session?.refresh_token || null,
      user: publicUser(profile, userId, email),
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Error registering user" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      // Detect accounts that only exist via Google (no password set).
      const u = await findUserByEmail(email).catch(() => null);
      const isGoogleOnly = u && (!u.identities || u.identities.length === 0 ||
        u.identities.every((i) => i.provider !== "password"));
      if (isGoogleOnly) {
        return res.status(400).json({ message: "Questo account usa Google. Accedi con Google." });
      }
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const userId = data.user.id;
    const profile = await ensureProfile(userId, { email });
    res.json({
      token: data.session.access_token,
      refreshToken: data.session.refresh_token || null,
      user: publicUser(profile, userId, email),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error logging in" });
  }
});

router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;

    if (!googleClient || !GOOGLE_CLIENT_ID) {
      return res.status(500).json({ message: "Google auth non configurato sul server" });
    }
    if (!credential) {
      return res.status(400).json({ message: "Google credential mancante" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload?.email;
    const name = payload?.name || "Utente Google";
    const googleId = payload?.sub;
    const picture = payload?.picture;

    if (!email || !googleId) {
      return res.status(400).json({ message: "Token Google non valido" });
    }

    const supabase = getSupabase();
    let user = await findUserByEmail(email);
    if (!user) {
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { name, picture: picture || "" },
      });
      if (error) {
        return res.status(400).json({ message: error.message });
      }
      user = data.user;
    }

    const profile = await ensureProfile(user.id, { name, email, picture });
    const token = signToken(user.id, email);

    res.json({
      token,
      refreshToken: null,
      user: publicUser(profile, user.id, email),
    });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(401).json({ message: "Autenticazione Google fallita" });
  }
});

// Refresh an access token using a Supabase refresh token (parity with web/Flutter).
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body || {};
    if (!refreshToken) {
      return res.status(400).json({ message: "refreshToken required" });
    }
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
    if (error || !data.session) {
      return res.status(401).json({ message: "Refresh token non valido" });
    }
    res.json({
      token: data.session.access_token,
      refreshToken: data.session.refresh_token,
    });
  } catch (error) {
    console.error("Refresh error:", error);
    res.status(500).json({ message: "Error refreshing token" });
  }
});

router.post("/logout", (req, res) => {
  res.json({ ok: true });
});

module.exports = router;

