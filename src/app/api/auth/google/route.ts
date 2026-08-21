import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/server/supabase";
import { buildSessionResponse } from "@/lib/server/session";
import { parseBody } from "@/lib/server/http";

export async function POST(request: NextRequest) {
  try {
    const body = await parseBody(request);
    if (body === undefined) {
      return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
    }

    const { credential } = body as { credential?: string };

    if (!credential) {
      return NextResponse.json(
        { message: "Google credential mancante" },
        { status: 400 },
      );
    }

    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: credential,
    });

    if (error || !data.session) {
      console.error("Google auth error:", error?.message || error);
      return NextResponse.json(
        { message: "Autenticazione Google fallita" },
        { status: 401 },
      );
    }

    const payload = await buildSessionResponse(data.session);
    return NextResponse.json(payload);
  } catch (error) {
    console.error("Google auth error:", error);
    return NextResponse.json(
      { message: "Autenticazione Google fallita" },
      { status: 401 },
    );
  }
}
