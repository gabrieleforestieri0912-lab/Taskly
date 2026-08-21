import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/server/auth";

// GET /api/integrations/google/callback?code=... → exchange code for tokens
export async function GET(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) {
    return new Response("Authentication required", { status: 401 });
  }

  try {
    const code = String(request.nextUrl.searchParams.get("code") || "");
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = String(
      process.env.GOOGLE_REDIRECT_URI ||
        request.nextUrl.searchParams.get("redirect_uri") ||
        `${new URL(request.url).origin}/api/integrations/google/callback`,
    );
    if (!code) {
      return new Response("Parametro code mancante", { status: 400 });
    }
    if (!clientId || !clientSecret) {
      return new Response("Integrazione Google non configurata sul server.", {
        status: 500,
      });
    }
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
    const tokens = await tokenRes.json();
    if (!tokenRes.ok) {
      console.error("Google token error", tokens);
      return new Response("Scambio token Google fallito.", { status: 500 });
    }
    return new Response(
      `<!DOCTYPE html>
      <html><body style="font-family:sans-serif;text-align:center;padding-top:80px;">
        <h2>\u2713 Taskly collegato a Google Calendar</h2>
        <p>Puoi chiudere questa finestra e tornare a Taskly.</p>
      </body></html>`,
      { headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  } catch (e) {
    console.error(e);
    return new Response("Errore durante il collegamento Google.", {
      status: 500,
    });
  }
}
