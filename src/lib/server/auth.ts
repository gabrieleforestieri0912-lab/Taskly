import jwt from "jsonwebtoken";
import type { NextRequest } from "next/server";

// Secret resolution is lazy so route modules can be imported at build time:
// next build evaluates route handlers with NODE_ENV=production, where a
// missing variable would otherwise throw at import instead of at runtime.
export function getJwtSecret(): string {
  const secret = process.env.SUPABASE_JWT_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("SUPABASE_JWT_SECRET must be set in production");
  }
  return secret || "dev-only-secret-change-me";
}

// Constant used by tests to sign tokens — always matches what verifyToken
// will use (getJwtSecret returns the same value unless the env changes).
export const JWT_SECRET =
  process.env.SUPABASE_JWT_SECRET || "dev-only-secret-change-me";

export interface AuthUser {
  id: string;
  email?: string;
}

interface JwtPayload {
  sub?: string;
  email?: string;
  role?: string;
}

export function getBearerToken(request: NextRequest): string | null {
  return (
    request.headers.get("Authorization")?.replace("Bearer ", "") ||
    request.cookies.get("token")?.value ||
    null
  );
}

/**
 * Verifies a Supabase Auth access token.
 * Supabase signs access tokens with HS256 using the project JWT secret
 * (Settings → API → JWT Secret). Claims: sub = user UUID, email, role.
 */
export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, getJwtSecret(), {
    algorithms: ["HS256"],
  }) as JwtPayload | string;
  const payload =
    typeof decoded === "string" ? { sub: decoded } : (decoded as JwtPayload);
  if (!payload || !payload.sub) throw new Error("Invalid token payload");
  return payload;
}

/**
 * Next.js replacement for the Express `authRequired` / `authOptional`
 * middlewares. Returns the authenticated user or null; the route handler
 * decides whether null means 401 (required) or anonymous access (optional).
 */
export function getAuthUser(request: NextRequest): AuthUser | null {
  const token = getBearerToken(request);
  if (!token) return null;
  try {
    const decoded = verifyToken(token);
    return { id: decoded.sub as string, email: decoded.email };
  } catch {
    return null;
  }
}
