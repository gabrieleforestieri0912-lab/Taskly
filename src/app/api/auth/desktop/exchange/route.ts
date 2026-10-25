import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/server/supabase";
import { parseBody } from "@/lib/server/http";
import { buildSessionResponse } from "@/lib/server/session";

/**
 * Scambio del `code` OAuth di Google per l'app DESKTOP (vedi desktop/start).
 * Qui vivono i segreti: GOOGLE_CLIENT_SECRET per lo scambio del code e
 * l'accesso a Supabase per creare/recuperare l'utente e la sessione.
 * Risposta identica alle altre rotte auth: { token, refreshToken, user }.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await parseBody(request);
    if (body === undefined) {
      return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
    }
    const { code, redirect_uri: redirectUriParam } = body as {
      code?: string;
      redirect_uri?: string;
    };

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { message: "Google auth non configurato sul deployment: impostare GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET" },
        { status: 500 },
      );
    }
    if (!code) {
      return NextResponse.json({ message: "code mancante" }, { status: 400 });
    }
    const redirectUri =
      redirectUriParam && redirectUriParam.startsWith("http://127.0.0.1")
        ? redirectUriParam
        : "http://127.0.0.1:5000/api/auth/google/callback";

    // Scambio del code con Google (application/x-www-form-urlencoded).
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    const tokens = (await tokenRes.json()) as { id_token?: string; error?: string };
    if (!tokenRes.ok || !tokens.id_token) {
      console.error("Desktop exchange: token endpoint error:", tokens.error || tokenRes.status);
      return NextResponse.json(
        { message: "Autenticazione Google fallita" },
        { status: 401 },
      );
    }

    // Supabase gestisce l'utente/provider Google direttamente dall'id_token.
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: tokens.id_token,
    });
    if (error || !data.session) {
      console.error("Desktop exchange: signInWithIdToken error:", error?.message || error);
      return NextResponse.json(
        { message: "Autenticazione Google fallita" },
        { status: 401 },
      );
    }

    const payload = await buildSessionResponse(data.session);
    return NextResponse.json(payload);
  } catch (error) {
    console.error("Desktop exchange error:", error);
    return NextResponse.json(
      { message: "Autenticazione Google fallita" },
      { status: 401 },
    );
  }
}
