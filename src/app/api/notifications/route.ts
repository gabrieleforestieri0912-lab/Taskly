import { NextRequest, NextResponse } from "next/server";
import { listNotifications, createNotification } from "@/lib/server/db";
import { getAuthUser } from "@/lib/server/auth";
import { parseBody, unauthorized } from "@/lib/server/http";

export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) return unauthorized();

  try {
    const body = await parseBody(request);
    if (body === undefined) {
      return NextResponse.json({ error: "invalid_json" }, { status: 400 });
    }
    const n = await createNotification(user.id, body);
    return NextResponse.json(n);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) return unauthorized();

  try {
    const workspace = request.nextUrl.searchParams.get("workspace") || "";
    const items = await listNotifications(user.id, workspace, 100);
    return NextResponse.json(items);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
