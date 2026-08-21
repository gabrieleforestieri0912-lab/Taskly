import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/server/rateLimit";
import { auditRequest } from "@/lib/server/audit";

/**
 * Global proxy for /api requests — replaces the Express middlewares that
 * used to run on every API call (auditLogger + rateLimiter). Next.js 16
 * renamed the `middleware` file convention to `proxy`.
 *
 * Rate limiting: uses Upstash Redis REST when UPSTASH_REDIS_REST_URL /
 * UPSTASH_REDIS_REST_TOKEN are set (serverless-safe), otherwise falls back
 * to a per-instance in-memory counter. Disable entirely with
 * RATE_LIMIT_DISABLED=1.
 */
export async function proxy(request: NextRequest) {
  auditRequest(request).catch(() => {});

  const limited = await checkRateLimit(request);
  if (limited) return limited;

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
