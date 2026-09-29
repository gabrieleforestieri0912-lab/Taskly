
const jwt = require("jsonwebtoken");
const { SUPABASE_JWT_SECRET, getSupabase } = require("../lib/supabase");

function getSecret() {
  return SUPABASE_JWT_SECRET || "dev-only-secret-change-me";
}

// Verify a token. Two cases:
//  1) Our own HS256-minted tokens (used for register/google) — verified locally.
//  2) Real Supabase-issued access tokens (used for login/refresh) which may be
//     signed with ES256; verified through the Supabase client (JWKS-aware).
async function verifyToken(token) {
  // 1) HS256 minted tokens
  try {
    const decoded = jwt.verify(token, getSecret(), { algorithms: ["HS256"] });
    const payload = typeof decoded === "string" ? { sub: decoded } : decoded;
    if (payload && payload.sub) {
      return { sub: payload.sub, email: payload.email };
    }
  } catch {
    /* fall through to Supabase verification */
  }

  // 2) Real Supabase tokens (handles ES256 via JWKS)
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.getUser(token);
    if (!error && data?.user) {
      return { sub: data.user.id, email: data.user.email };
    }
  } catch {
    /* ignore */
  }

  throw new Error("Invalid token");
}

async function authRequired(req, res, next) {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }
  try {
    const decoded = await verifyToken(token);
    req.userId = decoded.sub;
    req.user = { id: decoded.sub, email: decoded.email };
    return next();
  } catch {
    return res.status(401).json({ message: "Token is not valid" });
  }
}

async function authOptional(req, res, next) {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return next();
  try {
    const decoded = await verifyToken(token);
    req.userId = decoded.sub;
    req.user = { id: decoded.sub, email: decoded.email };
  } catch {
    req.userId = null;
    req.user = null;
  }
  return next();
}

module.exports = { authRequired, authOptional, verifyToken };

