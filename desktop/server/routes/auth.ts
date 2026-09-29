
const express = require("express");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const { getSupabase, ensureProfile, getProfile, SUPABASE_JWT_SECRET } = require("../lib/supabase");

const router = express.Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

// Mint a Supabase-compatible JWT (HS256, same secret the middleware verifies).
function signToken(userId, email) {
  const secret = SUPABASE_JWT_SECRET || "dev-only-secret-change-me";
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

