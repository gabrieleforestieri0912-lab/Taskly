import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/server/auth";
import { unauthorized } from "@/lib/server/http";
import { recentAnalytics } from "@/lib/server/db";

// Operator-only data: require an authenticated caller before reading the
// global analytics stream (the query uses the service-role client).
export async function GET(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) return unauthorized();

  try {
    const recent = await recentAnalytics(50);
    return NextResponse.json({ ok: true, recent });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
