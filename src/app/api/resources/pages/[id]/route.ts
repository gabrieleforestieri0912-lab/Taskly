import { NextRequest, NextResponse } from "next/server";
import { updatePageRow, deletePageRow } from "@/lib/server/db";
import { getAuthUser } from "@/lib/server/auth";
import { parseBody, unauthorized } from "@/lib/server/http";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = getAuthUser(request);
  if (!user) return unauthorized();

  try {
    const body = await parseBody(request);
    if (body === undefined) {
      return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
    }
    const { id } = await params;
    const result = await updatePageRow(user.id, String(id), body);
    if (result === null) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, data: result });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = getAuthUser(request);
  if (!user) return unauthorized();

  try {
    const { id } = await params;
    await deletePageRow(user.id, String(id));
    return NextResponse.json({ ok: true, data: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
