import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/server/auth";
import { unauthorized } from "@/lib/server/http";

// POST /api/integrations/google/authorize → build the OAuth consent URL
export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) return unauthorized();

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const origin = new URL(request.url).origin;
    const redirectUri =
      process.env.GOOGLE_REDIRECT_URI ||
      `${origin}/api/integrations/google/callback`;
    if (!clientId) {
      return NextResponse.json(
        {
          ok: false,
          message: "Integrazione Google non configurata sul server",
        },
        { status: 503 },
      );
    }
    const scope =
      "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events";
    const url =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code&scope=${encodeURIComponent(scope)}` +
      `&access_type=offline&prompt=consent`;
    return NextResponse.json({ ok: true, url, redirectUri });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
