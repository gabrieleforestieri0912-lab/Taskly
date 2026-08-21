import { cookies } from "next/headers";
import { ensureProfile, getProfile } from "./db";

export interface PublicUser {
  id: string;
  name: string | null;
  email: string | null;
  picture: string | null;
}

export function publicUser(profile: {
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

/**
 * Keeps the profile row in sync with the auth user metadata, sets the
 * httpOnly session cookie and returns the payload every auth route sends
 * back (token + refreshToken + public user).
 */
export async function buildSessionResponse(session: {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email?: string;
    user_metadata?: { name?: string; picture?: string | null };
  };
}) {
  await ensureProfile(session.user);

  const profile = await getProfile(session.user.id);

  const cookieStore = await cookies();
  cookieStore.set("token", session.access_token, {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });

  return {
    token: session.access_token,
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
