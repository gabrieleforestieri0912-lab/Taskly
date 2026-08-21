import { NextRequest, NextResponse } from "next/server";
import { createActivity } from "@/lib/server/db";
import { getAuthUser } from "@/lib/server/auth";
import { parseBody, unauthorized } from "@/lib/server/http";

// Create activity (for server-side events or admin actions)
export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) return unauthorized();

  try {
    const body = await parseBody(request);
    if (body === undefined) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    const activity = await createActivity(user.id, body || {});
    return NextResponse.json({ ok: true, activity });
  } catch (e) {
    console.error("Error creating activity", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
