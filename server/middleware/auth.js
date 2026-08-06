const jwt = require("jsonwebtoken");

function getJwtSecret() {
  const secret = process.env.SUPABASE_JWT_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("SUPABASE_JWT_SECRET must be set in production");
  }
  return secret || "dev-only-secret-change-me";
}

function getBearerToken(req) {
  return req.header("Authorization")?.replace("Bearer ", "") || req.cookies?.token || null;
}

const JWT_SECRET = getJwtSecret();

/**
 * Verifies a Supabase Auth access token.
 * Supabase signs access tokens with HS256 using the project JWT secret
 * (Settings → API → JWT Secret). Claims: sub = user UUID, email, role.
 */
function verifyToken(token) {
  const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] });
  if (!decoded || !decoded.sub) throw new Error("Invalid token payload");
  return decoded;
}

function authRequired(req, res, next) {
  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = verifyToken(token);
    req.userId = decoded.sub;
    req.user = { id: decoded.sub, email: decoded.email };
    return next();
  } catch {
    return res.status(401).json({ message: "Token is not valid" });
  }
}

function authOptional(req, res, next) {
  const token = getBearerToken(req);
  if (!token) return next();

  try {
    const decoded = verifyToken(token);
    req.userId = decoded.sub;
    req.user = { id: decoded.sub, email: decoded.email };
  } catch {
    req.userId = null;
    req.user = null;
  }
  return next();
}

module.exports = { authRequired, authOptional, JWT_SECRET, verifyToken };
