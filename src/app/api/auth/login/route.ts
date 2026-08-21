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

    const { email, password } = body as { email?: string; password?: string };

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 },
      );
    }

    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      if (error?.message && /email not confirmed/i.test(error.message)) {
        return NextResponse.json(
          {
            message:
              "Email non ancora confermata. Controlla la tua casella di posta.",
          },
          { status: 401 },
        );
      }
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 },
      );
    }

    const payload = await buildSessionResponse(data.session);
    return NextResponse.json(payload);
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ message: "Error logging in" }, { status: 500 });
  }
}
