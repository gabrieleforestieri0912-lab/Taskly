import { NextRequest, NextResponse } from "next/server";
import { insertAnalytics } from "@/lib/server/db";
import { parseBody } from "@/lib/server/http";

export async function POST(request: NextRequest) {
  const body = await parseBody(request);
  if (body === undefined) {
    return NextResponse.json(
      { ok: false, message: "events must be an array" },
      { status: 400 },
    );
  }

  const { events } = body as { events?: unknown[] };
  if (!Array.isArray(events)) {
    return NextResponse.json(
      { ok: false, message: "events must be an array" },
      { status: 400 },
    );
  }

  try {
    const { ok, received } = await insertAnalytics(events);
    return NextResponse.json({ ok, received });
  } catch (err) {
    console.error("Failed to store analytics events", err);
    return NextResponse.json({ ok: false, error: "internal" }, { status: 500 });
  }
}
