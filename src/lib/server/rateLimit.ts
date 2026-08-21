import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getClientIp } from "./http";

const WINDOW_MS =
  Number(process.env.RATE_LIMIT_WINDOW_MS) > 0
    ? Number(process.env.RATE_LIMIT_WINDOW_MS)
    : 15 * 60 * 1000;
const MAX_REQUESTS =
  Number(process.env.RATE_LIMIT_MAX) > 0 ? Number(process.env.RATE_LIMIT_MAX) : 200;

function limitedResponse(): NextResponse {
  return NextResponse.json(
    {
      error: {
        message: "Too many requests",
        status: 429,
        code: "RATE_LIMITED",
      },
    },
    { status: 429, headers: { "Retry-After": String(Math.ceil(WINDOW_MS / 1000)) } },
  );
}

// ---------------------------------------------------------------------------
// In-memory fallback — fine for development and single-node deployments.
// On serverless platforms each instance keeps its own counters, so configure
// UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN for accurate global limits.
// ---------------------------------------------------------------------------
const memory = new Map<string, { count: number; resetAt: number }>();
const MAX_MEMORY_ENTRIES = 10_000;

// Opportunistically prune expired entries so the map can't grow forever.
function pruneMemory(now: number) {
  if (memory.size < MAX_MEMORY_ENTRIES) return;
  for (const [key, entry] of memory) {
    if (entry.resetAt <= now) memory.delete(key);
  }
}

async function checkMemory(key: string): Promise<NextResponse | null> {
  const now = Date.now();
  pruneMemory(now);
  const entry = memory.get(key);
  if (!entry || entry.resetAt <= now) {
    memory.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return null;
  }
  entry.count += 1;
  if (entry.count > MAX_REQUESTS) return limitedResponse();
  return null;
}

// ---------------------------------------------------------------------------
// Upstash Redis REST (fixed window). No extra dependency — plain fetch calls.
// ---------------------------------------------------------------------------
async function checkUpstash(key: string): Promise<NextResponse | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL!;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!;
  const windowSec = Math.max(1, Math.floor(WINDOW_MS / 1000));
  const redisKey = `rate:${key}`;
  try {
    const res = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", redisKey],
        ["EXPIRE", redisKey, windowSec],
      ]),
    });
    if (!res.ok) return null; // fail open when the limiter is unreachable
    const [count] = (await res.json()) as number[];
    if (typeof count === "number" && count > MAX_REQUESTS) {
      return limitedResponse();
    }
    return null;
  } catch {
    return null; // fail open
  }
}

/**
 * Returns a 429 NextResponse when the client exceeds the rate limit,
 * or null to let the request continue. Disable with RATE_LIMIT_DISABLED=1.
 *
 * Note: the client IP comes from x-forwarded-for, which serverless platforms
 * (Vercel) overwrite with the real IP; on self-hosted setups behind plain
 * proxies it is client-spoofable.
 */
export async function checkRateLimit(
  request: NextRequest,
): Promise<NextResponse | null> {
  const disabled =
    process.env.RATE_LIMIT_DISABLED === "1" ||
    process.env.RATE_LIMIT_DISABLED === "true";
  if (disabled) return null;

  const key = getClientIp(request);
  if (
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    return checkUpstash(key);
  }
  return checkMemory(key);
}
