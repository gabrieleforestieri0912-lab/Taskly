import type { Request, Response, NextFunction } from "express";

/**
 * Replaces express-mongo-sanitize.
 * PostgREST parameterized queries are not vulnerable to NoSQL operator
 * injection, but we keep a defensive sanitizer that strips `$`-prefixed keys
 * and dotted keys from request bodies.
 */
function sanitizeValue<T>(value: T): T {
  if (Array.isArray(value)) return value.map(sanitizeValue) as unknown as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (key.startsWith("$")) continue;
      out[key.replace(/\./g, "_")] = sanitizeValue(val);
    }
    return out as unknown as T;
  }
  return value;
}

export default function sanitize(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeValue(req.body);
  }
  if (req.query && typeof req.query === "object") {
    req.query = sanitizeValue(req.query);
  }
  next();
}
