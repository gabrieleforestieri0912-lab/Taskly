import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Body sanitizer — replaces the old express-mongo-sanitize middleware.
// PostgREST parameterized queries are not vulnerable to NoSQL operator
// injection, but we keep a defensive sanitizer that strips `$`-prefixed keys
// and dotted keys from request bodies.
// ---------------------------------------------------------------------------
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

export function sanitize<T>(value: T): T {
  return sanitizeValue(value);
}

/**
 * Reads and parses a JSON request body, applying the sanitizer.
 * Returns undefined when the body is not valid JSON (the handler can then
 * answer 400). Returns {} for empty bodies.
 */
export async function parseBody(
  request: NextRequest,
): Promise<any | undefined> {
  const text = await request.text();
  if (!text.trim()) return {};
  try {
    return sanitize(JSON.parse(text));
  } catch {
    return undefined;
  }
}

/** Best-effort client IP, taking proxies / serverless edge into account. */
export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/** 401 helper matching the old `authRequired` middleware responses. */
export function unauthorized(
  message = "No token, authorization denied",
): NextResponse {
  return NextResponse.json({ message }, { status: 401 });
}
