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

    const { name, email, password } = body as {
      name?: string;
      email?: string;
      password?: string;
    };

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Name, email and password are required" },
        { status: 400 },
      );
    }

    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (error) {
      if (
        error.message &&
        /already registered|already been registered|exists/i.test(error.message)
      ) {
        return NextResponse.json(
          { message: "User already exists with this email" },
          { status: 400 },
        );
      }
      return NextResponse.json(
        { message: error.message || "Error registering user" },
        { status: 400 },
      );
    }

    // If email confirmation is enabled, no session is returned yet
    if (!data.session) {
      return NextResponse.json(
        {
          message:
            "Account creato. Controlla la tua email per confermare la registrazione.",
        },
        { status: 201 },
      );
    }

    const payload = await buildSessionResponse(data.session);
    return NextResponse.json(
      { message: "User registered successfully", ...payload },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Error registering user" },
      { status: 500 },
    );
  }
}
