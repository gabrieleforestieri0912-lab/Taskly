import { NextRequest, NextResponse } from "next/server";

/**
 * Endpoint Google specifico per l'app DESKTOP (Electron) in modalità
 * "backend remoto": l'app contiene solo il frontend web (nessuna chiave) e
 * questo deployment detiene le configurazioni. Il flusso:
 *  1. il server Express locale (:5000) chiama qui con `state` e `redirect_uri`
 *     (il proprio callback loopback già registrato su Google Cloud Console)
 *  2. qui si costruisce SOLO l'URL di autenticazione Google (il client ID è
 *     pubblico: nessun segreto serve per generarlo)
 *  3. l'utente completa l'accesso sul browser: Google rimanda quel
 *     `redirect_uri` (localExpress) con `?code&state`
 *  4. l'Express locale POSTa il `code` qui → /api/auth/desktop/exchange
 *     che lo scambia con Google (qui vivono GOOGLE_CLIENT_SECRET e l'accesso
 *     a Supabase) e ritorna la sessione {token, refreshToken, user}.
 */
export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { message: "Google auth non configurato sul deployment: impostare GOOGLE_CLIENT_ID" },
      { status: 500 },
    );
  }

  const state = request.nextUrl.searchParams.get("state") ?? "";
  const redirectUri =
    request.nextUrl.searchParams.get("redirect_uri") ??
    "http://127.0.0.1:5000/api/auth/google/callback";

  // Lo state viene generato e verificato dall'Express locale: qui lo
  // ripassiamo a Google tale e quale (min 16 char, come app-client).
  if (state.length < 16 || state.length > 128) {
    return NextResponse.json({ message: "state invalid" }, { status: 400 });
  }
  if (!isLoopbackRedirect(redirectUri)) {
    return NextResponse.json({ message: "redirect_uri is not a loopback" }, { status: 400 });
  }

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("prompt", "select_account");
  url.searchParams.set("access_type", "online");
  url.searchParams.set("state", state);

  return NextResponse.json({ url: url.toString() });
}

function isLoopbackRedirect(redirectUri: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(redirectUri);
  } catch {
    return false;
  }
  const isLoopbackHost =
    parsed.hostname === "localhost" ||
    parsed.hostname === "127.0.0.1" ||
    parsed.hostname === "[::1]";
  return parsed.protocol === "http:" && isLoopbackHost;
}
