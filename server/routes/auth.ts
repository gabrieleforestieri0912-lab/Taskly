import express, { Router, Request, Response } from "express";
import { getSupabase } from "../supabase/client";
import { ensureProfile, getProfile } from "../supabase/db";

const router: Router = express.Router();

interface PublicUser {
  id: string;
  name: string | null;
  email: string | null;
  picture: string | null;
}

function publicUser(profile: {
  id: string;
  name?: string | null;
  email?: string | null;
  picture?: string | null;
} | null): PublicUser | null {
  if (!profile) return null;
  return {
    id: profile.id,
    name: profile.name ?? null,
    email: profile.email ?? null,
    picture: profile.picture ?? null,
  };
}

async function buildSessionResponse(
  res: Response,
  session: {
    access_token: string;
    refresh_token: string;
    user: {
      id: string;
      email?: string;
      user_metadata?: { name?: string; picture?: string | null };
    };
  },
) {
  // Keep the profile row in sync with the auth user metadata
  await ensureProfile(session.user);

  const profile = await getProfile(session.user.id);
  const token = session.access_token;

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return {
    token,
    refreshToken: session.refresh_token,
    user: publicUser(
      profile || {
        id: session.user.id,
        name: session.user.user_metadata?.name || "",
        email: session.user.email || null,
        picture: session.user.user_metadata?.picture || null,
      },
    ),
  };
}

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body as {
      name?: string;
      email?: string;
      password?: string;
    };

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (error) {
      if (
        error.message &&
        /already registered|already been registered|exists/i.test(error.message)
      ) {
        return res
          .status(400)
          .json({ message: "User already exists with this email" });
      }
      return res
        .status(400)
        .json({ message: error.message || "Error registering user" });
    }

    // If email confirmation is enabled, no session is returned yet
    if (!data.session) {
      return res.status(201).json({
        message:
          "Account creato. Controlla la tua email per confermare la registrazione.",
      });
    }

    const payload = await buildSessionResponse(res, data.session);
    return res.status(201).json({
      message: "User registered successfully",
      ...payload,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Error registering user" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      if (error?.message && /email not confirmed/i.test(error.message)) {
        return res.status(401).json({
          message:
            "Email non ancora confermata. Controlla la tua casella di posta.",
        });
      }
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const payload = await buildSessionResponse(res, data.session);
    res.json(payload);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error logging in" });
  }
});

router.post("/google", async (req: Request, res: Response) => {
  try {
    const { credential } = req.body as { credential?: string };

    if (!credential) {
      return res.status(400).json({ message: "Google credential mancante" });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: credential,
    });

    if (error || !data.session) {
      console.error("Google auth error:", error?.message || error);
      return res.status(401).json({ message: "Autenticazione Google fallita" });
    }

    const payload = await buildSessionResponse(res, data.session);
    res.json(payload);
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(401).json({ message: "Autenticazione Google fallita" });
  }
});

// Refresh an expired access token with the Supabase refresh token
router.post("/refresh", async (req: Request, res: Response) => {
  try {
    const { refreshToken } = (req.body || {}) as { refreshToken?: string };
    if (!refreshToken) {
      return res.status(400).json({ message: "refreshToken required" });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

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

router.post("/logout", (req: Request, res: Response) => {
  res.clearCookie("token");
  res.json({ ok: true });
});

export default router;
