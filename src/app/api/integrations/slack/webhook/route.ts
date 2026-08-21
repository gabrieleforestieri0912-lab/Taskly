import { NextRequest, NextResponse } from "next/server";
import { setIntegration } from "@/lib/server/db";
import { getAuthUser } from "@/lib/server/auth";
import { parseBody, unauthorized } from "@/lib/server/http";

// POST /api/integrations/slack/webhook → store a Slack Incoming Webhook URL
export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) return unauthorized();

  try {
    const body = await parseBody(request);
    if (body === undefined) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const { url } = body as { url?: string };
    if (!url || !/^https:\/\//.test(url)) {
      return NextResponse.json(
        { ok: false, message: "URL webhook Slack non valido" },
        { status: 400 },
      );
    }
    const saved = await setIntegration(user.id, "slack", {
      webhookUrl: url,
      channel: body?.channel || "#general",
    });
    return NextResponse.json({ ok: true, integration: saved });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
