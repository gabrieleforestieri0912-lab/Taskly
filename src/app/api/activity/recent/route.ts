import { NextRequest, NextResponse } from "next/server";
import { listActivity } from "@/lib/server/db";
import { getAuthUser } from "@/lib/server/auth";
import { unauthorized } from "@/lib/server/http";

// Get recent activities for the user
export async function GET(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) return unauthorized();

  try {
    const limit = Math.min(
      100,
      parseInt(request.nextUrl.searchParams.get("limit") || "50", 10),
    );
    const recent = await listActivity(user.id, limit);
    return NextResponse.json({ ok: true, recent });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
