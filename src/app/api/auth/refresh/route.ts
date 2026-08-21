import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/server/supabase";
import { parseBody } from "@/lib/server/http";

export async function POST(request: NextRequest) {
  try {
    const body = await parseBody(request);
    if (body === undefined) {
      return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
    }

    const { refreshToken } = body as { refreshToken?: string };
    if (!refreshToken) {
      return NextResponse.json(
        { message: "refreshToken required" },
        { status: 400 },
      );
    }

    const supabase = getSupabase();
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      return NextResponse.json(
        { message: "Refresh token non valido" },
        { status: 401 },
      );
    }

    return NextResponse.json({
      token: data.session.access_token,
      refreshToken: data.session.refresh_token,
    });
  } catch (error) {
    console.error("Refresh error:", error);
    return NextResponse.json(
      { message: "Error refreshing token" },
      { status: 500 },
    );
  }
}
