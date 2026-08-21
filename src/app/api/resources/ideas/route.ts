import { NextRequest, NextResponse } from "next/server";
import { createIdeaRow } from "@/lib/server/db";
import { getAuthUser } from "@/lib/server/auth";
import { parseBody, unauthorized } from "@/lib/server/http";

export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) return unauthorized();

  try {
    const body = await parseBody(request);
    if (body === undefined) {
      return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
    }
    const result = await createIdeaRow(user.id, body);
    return NextResponse.json({ ok: true, data: result });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
