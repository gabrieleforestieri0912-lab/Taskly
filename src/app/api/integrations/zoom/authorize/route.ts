import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/server/auth";
import { unauthorized } from "@/lib/server/http";

// POST /api/integrations/zoom/authorize → build the Zoom OAuth consent URL
export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) return unauthorized();

  try {
    const clientId = process.env.ZOOM_CLIENT_ID;
    const origin = new URL(request.url).origin;
    const redirectUri =
      process.env.ZOOM_REDIRECT_URI ||
      process.env.ZOOM_REDIRECT_URL ||
      `${origin}/api/integrations/zoom/callback`;
    if (!clientId) {
      return NextResponse.json(
        { ok: false, message: "Integrazione Zoom non configurata sul server" },
        { status: 503 },
      );
    }
    const url =
      `https://zoom.us/oauth/authorize?` +
      `client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code`;
    return NextResponse.json({ ok: true, url, redirectUri });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
