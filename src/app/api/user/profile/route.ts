import { NextRequest, NextResponse } from "next/server";
import { updateProfileName } from "@/lib/server/db";
import { getAuthUser } from "@/lib/server/auth";
import { parseBody, unauthorized } from "@/lib/server/http";

// PUT /api/user/profile { name } → aggiorna il nome visualizzato.
export async function PUT(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) return unauthorized();

  try {
    const body = await parseBody(request);
    if (body === undefined) {
      return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
    }
    const { name } = (body || {}) as { name?: string };
    if (!name || !String(name).trim()) {
      return NextResponse.json({ message: "Name cannot be empty.", code: "name_empty" }, { status: 400 });
    }
    const profile = await updateProfileName(user.id, name);
    return NextResponse.json({ ok: true, profile });
  } catch (e: any) {
    if (e?.message === "empty_name") {
      return NextResponse.json({ message: "Name cannot be empty.", code: "name_empty" }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ message: "Failed to save the profile.", code: "profile_save_failed" }, { status: 500 });
  }
}
