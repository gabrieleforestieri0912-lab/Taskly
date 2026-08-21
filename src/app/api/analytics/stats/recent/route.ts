import { NextResponse } from "next/server";
import { recentAnalytics } from "@/lib/server/db";

export async function GET() {
  try {
    const recent = await recentAnalytics(50);
    return NextResponse.json({ ok: true, recent });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
