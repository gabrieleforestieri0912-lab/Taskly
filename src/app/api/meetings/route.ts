import { NextRequest, NextResponse } from "next/server";
import { createMeeting, listMeetings } from "@/lib/server/db";
import { getAuthUser } from "@/lib/server/auth";
import { parseBody, unauthorized } from "@/lib/server/http";

// Save a meeting (transcript + summary) transcribed on the client
export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) return unauthorized();

  try {
    const body = await parseBody(request);
    if (body === undefined) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    const meeting = await createMeeting(user.id, body || {});
    return NextResponse.json({ ok: true, meeting });
  } catch (e) {
    console.error("Error saving meeting", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

// List the user's meetings
export async function GET(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) return unauthorized();

  try {
    const meetings = await listMeetings(user.id);
    return NextResponse.json({ ok: true, meetings });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
