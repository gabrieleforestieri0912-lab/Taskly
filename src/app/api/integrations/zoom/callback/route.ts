import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/server/auth";
import { setIntegration } from "@/lib/server/db";

// GET /api/integrations/zoom/callback?code=... → exchange code for tokens
export async function GET(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) {
    return new Response("Authentication required", { status: 401 });
  }

  try {
    const code = String(request.nextUrl.searchParams.get("code") || "");
    const clientId = process.env.ZOOM_CLIENT_ID;
    const clientSecret = process.env.ZOOM_CLIENT_SECRET;
    const redirectUri = String(
      process.env.ZOOM_REDIRECT_URI ||
        process.env.ZOOM_REDIRECT_URL ||
        request.nextUrl.searchParams.get("redirect_uri") ||
        `${new URL(request.url).origin}/api/integrations/zoom/callback`,
    );
    if (!code) return new Response("Parametro code mancante", { status: 400 });
    if (!clientId || !clientSecret) {
      return new Response("Integrazione Zoom non configurata sul server.", {
        status: 500,
      });
    }
    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const tokenRes = await fetch("https://zoom.us/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basic}`,
      },
      body: new URLSearchParams({
        code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    const tokens = await tokenRes.json();
    if (!tokenRes.ok) {
      console.error("Zoom token error", tokens);
      return new Response("Scambio token Zoom fallito.", { status: 500 });
    }
    await setIntegration(
      user.id,
      "zoom",
      {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresIn: tokens.expires_in,
        scope: tokens.scope,
        connectedAt: new Date().toISOString(),
      },
      true,
    );
    return new Response(
      `<!DOCTYPE html>
      <html><body style="font-family:sans-serif;text-align:center;padding-top:80px;">
        <h2>\u2713 Taskly collegato a Zoom</h2>
        <p>Puoi chiudere questa finestra e tornare a Taskly.</p>
      </body></html>`,
      { headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  } catch (e) {
    console.error(e);
    return new Response("Errore durante il collegamento Zoom.", {
      status: 500,
    });
  }
}
