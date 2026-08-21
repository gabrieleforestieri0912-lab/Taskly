import { NextRequest, NextResponse } from "next/server";
import { listIntegrations } from "@/lib/server/db";
import { getAuthUser } from "@/lib/server/auth";
import { unauthorized } from "@/lib/server/http";

// GET /api/integrations → all connected providers (sanitized)
export async function GET(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) return unauthorized();

  try {
    const list = await listIntegrations(user.id);
    return NextResponse.json({ ok: true, integrations: list });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
