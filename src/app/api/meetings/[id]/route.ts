import { NextRequest, NextResponse } from "next/server";
import { deleteMeeting, updateMeeting } from "@/lib/server/db";
import { getAuthUser } from "@/lib/server/auth";
import { parseBody, unauthorized } from "@/lib/server/http";

// Delete a meeting
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = getAuthUser(request);
  if (!user) return unauthorized();

  try {
    const { id } = await params;
    await deleteMeeting(user.id, String(id));
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

// PATCH /api/meetings/:id → aggiorna summary / metadati (es. recap AI)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = getAuthUser(request);
  if (!user) return unauthorized();

  try {
    const { id } = await params;
    const body = await parseBody(request);
    if (body === undefined) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    const meeting = await updateMeeting(user.id, String(id), body || {});
    return NextResponse.json({ ok: true, meeting });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
