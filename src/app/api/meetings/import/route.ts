import { NextRequest, NextResponse } from "next/server";
import { createMeeting } from "@/lib/server/db";
import { getAuthUser } from "@/lib/server/auth";
import { parseBody, unauthorized } from "@/lib/server/http";
import { isKnownMeetingSource } from "@/lib/meetings/providers";

// POST /api/meetings/import → importa una trascrizione da un provider esterno
// Body: { source: "zoom" | "google_meet" | "upload" | "manual",
//         title?, transcript, summary?, category?, duration?, date?,
//         externalId?, meetingUrl? }
export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) return unauthorized();

  try {
    const body = await parseBody(request);
    if (body === undefined) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    const transcript = String(body?.transcript || "").trim();
    if (!transcript) {
      return NextResponse.json(
        { ok: false, message: "Trascrizione mancante" },
        { status: 400 },
      );
    }
    const source = isKnownMeetingSource(body?.source)
      ? body.source
      : "manual";
    const meeting = await createMeeting(user.id, {
      title: body?.title || "",
      transcript,
      summary: body?.summary || null,
      category: body?.category || "Generale",
      duration: body?.duration || null,
      date: body?.date,
      source,
      externalId: body?.externalId || body?.external_id || null,
      meetingUrl: body?.meetingUrl || body?.meeting_url || null,
    });
    return NextResponse.json({ ok: true, meeting });
  } catch (e) {
    console.error("Error importing meeting", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
