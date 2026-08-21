import { NextRequest, NextResponse } from "next/server";
import { markActivityRead } from "@/lib/server/db";
import { getAuthUser } from "@/lib/server/auth";
import { parseBody, unauthorized } from "@/lib/server/http";

// Mark activities read
export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) return unauthorized();

  try {
    const body = await parseBody(request);
    if (body === undefined) {
      return NextResponse.json(
        { ok: false, message: "ids must be array" },
        { status: 400 },
      );
    }

    const { ids = [] } = body as { ids?: string[] };
    if (!Array.isArray(ids)) {
      return NextResponse.json(
        { ok: false, message: "ids must be array" },
        { status: 400 },
      );
    }
    await markActivityRead(user.id, ids);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
