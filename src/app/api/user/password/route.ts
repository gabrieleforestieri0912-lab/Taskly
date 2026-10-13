import { NextRequest, NextResponse } from "next/server";
import { getProfile } from "@/lib/server/db";
import { getSupabase } from "@/lib/server/supabase";
import { getAuthUser } from "@/lib/server/auth";
import { parseBody, unauthorized } from "@/lib/server/http";

// POST /api/user/password { currentPassword, newPassword } → cambia la
// password su Supabase Auth dopo aver verificato quella attuale.
export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) return unauthorized();

  try {
    const body = await parseBody(request);
    if (body === undefined) {
      return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
    }
    const { currentPassword, newPassword } = (body || {}) as {
      currentPassword?: string;
      newPassword?: string;
    };
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: "Inserisci la password attuale e quella nuova." },
        { status: 400 },
      );
    }
    if (String(newPassword).length < 8) {
      return NextResponse.json(
        { message: "La nuova password deve avere almeno 8 caratteri." },
        { status: 400 },
      );
    }

    const supabase = getSupabase();
    const profile = await getProfile(user.id);
    const email = profile?.email || user.email;
    if (!email) {
      return NextResponse.json({ message: "Account senza email." }, { status: 400 });
    }

    // Verifica la password attuale con un login reale.
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: String(currentPassword),
    });
    if (signInError) {
      return NextResponse.json(
        { message: "La password attuale non è corretta." },
        { status: 401 },
      );
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: String(newPassword) },
    );
    if (updateError) throw updateError;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { message: "Errore nell'aggiornamento della password." },
      { status: 500 },
    );
  }
}
