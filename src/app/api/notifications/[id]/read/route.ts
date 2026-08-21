import { NextRequest, NextResponse } from "next/server";
import { markNotificationRead } from "@/lib/server/db";
import { getAuthUser } from "@/lib/server/auth";
import { unauthorized } from "@/lib/server/http";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = getAuthUser(request);
  if (!user) return unauthorized();

  try {
    const { id } = await params;
    const n = await markNotificationRead(user.id, id);
    if (!n) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json(n);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
