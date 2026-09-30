import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/server/auth";
import { parseBody, unauthorized } from "@/lib/server/http";
import { updateMeeting } from "@/lib/server/db";
import { generateMeetingRecap } from "@/lib/server/meetingAi";

// POST /api/meetings/recap → recap AI di una trascrizione.
// Body: { transcript: string, lang?: "it" | "en",
//         meetingId?: string, persist?: boolean }
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
    const lang = body?.lang === "en" ? "en" : "it";
    const recap = await generateMeetingRecap(transcript, lang);

    // Se richiesto, salva il recap sulla riunione esistente
    let meeting: any = null;
    if (body?.meetingId && body?.persist !== false) {
      try {
        meeting = await updateMeeting(user.id, String(body.meetingId), {
          summary: recap,
        });
      } catch (e) {
        console.error("Persist recap failed", e);
      }
    }
    return NextResponse.json({ ok: true, recap, meeting });
  } catch (e) {
    console.error("Error generating recap", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
