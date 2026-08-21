import { NextRequest, NextResponse } from "next/server";
import { getIntegration } from "@/lib/server/db";
import { getAuthUser } from "@/lib/server/auth";
import { parseBody, unauthorized } from "@/lib/server/http";

// POST /api/integrations/slack/webhook-test → send a real payload to the webhook
export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) return unauthorized();

  try {
    const body = await parseBody(request);
    if (body === undefined) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const existing = await getIntegration(user.id, "slack");
    const webhookUrl = existing?.config?.webhookUrl || (body as any)?.url;
    if (!webhookUrl || webhookUrl === "***") {
      return NextResponse.json(
        { ok: false, message: "Configura prima un webhook Slack" },
        { status: 400 },
      );
    }
    const message =
      (body as any)?.message ||
      "Collegamento Slack di Taskly verificato con successo \u2705";
    const r = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message }),
    });
    if (!r.ok) {
      return NextResponse.json(
        { ok: false, message: "Slack: " + r.statusText },
        { status: r.status },
      );
    }
    return NextResponse.json({ ok: true, message: "Messaggio inviato a Slack" });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { ok: false, message: "Errore di invio a Slack" },
      { status: 500 },
    );
  }
}
