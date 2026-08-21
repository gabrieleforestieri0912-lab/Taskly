import type { NextRequest } from "next/server";
import { getClientIp } from "./http";

/**
 * Fire-and-forget audit logging, mirroring the old Express `auditLogger`
 * middleware. Best-effort only: it never blocks or fails the request.
 * Runs inside proxy.ts on every /api request.
 */
export async function auditRequest(request: NextRequest): Promise<void> {
  try {
    const url = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) return;

    const event = {
      name: "http_request",
      payload: {
        method: request.method,
        path: request.nextUrl.pathname,
        ip: getClientIp(request),
        user: null,
      },
      ts: Date.now(),
    };

    await fetch(`${url}/rest/v1/analytics_events`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ workspace_id: null, event }),
    });
  } catch {
    // best effort only
  }
}
