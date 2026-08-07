import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

function getJwtSecret(): string {
  const secret = process.env.SUPABASE_JWT_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("SUPABASE_JWT_SECRET must be set in production");
  }
  return secret || "dev-only-secret-change-me";
}

function getBearerToken(req: Request): string | null {
  return (
    req.header("Authorization")?.replace("Bearer ", "") ||
    (req.cookies as Record<string, string> | undefined)?.token ||
    null
  );
}

const JWT_SECRET = getJwtSecret();

interface JwtPayload {
  sub?: string;
  email?: string;
  role?: string;
}

/**
 * Verifies a Supabase Auth access token.
 * Supabase signs access tokens with HS256 using the project JWT secret
 * (Settings → API → JWT Secret). Claims: sub = user UUID, email, role.
 */
function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] }) as
    | JwtPayload
    | string;
  const payload =
    typeof decoded === "string" ? { sub: decoded } : (decoded as JwtPayload);
  if (!payload || !payload.sub) throw new Error("Invalid token payload");
  return payload;
}

function authRequired(req: Request, res: Response, next: NextFunction) {
  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = verifyToken(token);
    req.userId = decoded.sub;
    req.user = { id: decoded.sub as string, email: decoded.email };
    return next();
  } catch {
    return res.status(401).json({ message: "Token is not valid" });
  }
}

function authOptional(req: Request, res: Response, next: NextFunction) {
  const token = getBearerToken(req);
  if (!token) return next();

  try {
    const decoded = verifyToken(token);
    req.userId = decoded.sub;
    req.user = { id: decoded.sub as string, email: decoded.email };
  } catch {
    req.userId = null;
    req.user = null;
  }
  return next();
}

export { authRequired, authOptional, JWT_SECRET, verifyToken };
