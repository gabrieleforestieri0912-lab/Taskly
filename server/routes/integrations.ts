import express, { Router, Request, Response } from "express";
import {
  getIntegration,
  listIntegrations,
  setIntegration,
  deleteIntegration,
} from "../supabase/db";
import { authRequired } from "../middleware/auth";

const router: Router = express.Router();

router.use(authRequired);

// GET /api/integrations → all connected providers (sanitized)
router.get("/", async (req: Request, res: Response) => {
  try {
    const list = await listIntegrations(req.userId as string);
    res.json({ ok: true, integrations: list });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false });
  }
});

// DELETE /api/integrations/:provider → disconnect
router.delete("/:provider", async (req: Request, res: Response) => {
  try {
    await deleteIntegration(req.userId as string, String(req.params.provider));
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false });
  }
});

// POST /api/integrations/slack/webhook → store a Slack Incoming Webhook URL
router.post("/slack/webhook", async (req: Request, res: Response) => {
  try {
    const { url } = (req.body || {}) as { url?: string };
    if (!url || !/^https:\/\//.test(url)) {
      return res
        .status(400)
        .json({ ok: false, message: "URL webhook Slack non valido" });
    }
    const saved = await setIntegration(req.userId as string, "slack", {
      webhookUrl: url,
      channel: req.body?.channel || "#general",
    });
    res.json({ ok: true, integration: saved });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false });
  }
});

// POST /api/integrations/slack/webhook-test → send a real payload to the webhook
router.post("/slack/webhook-test", async (req: Request, res: Response) => {
  try {
    const existing = await getIntegration(req.userId as string, "slack");
    const webhookUrl = existing?.config?.webhookUrl || (req.body as any)?.url;
    if (!webhookUrl || webhookUrl === "***") {
      return res
        .status(400)
        .json({ ok: false, message: "Configura prima un webhook Slack" });
    }
    const message =
      (req.body as any)?.message ||
      "Collegamento Slack di Taskly verificato con successo \u2705";
    const r = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message }),
    });
    if (!r.ok) {
      return res.status(r.status).json({ ok: false, message: "Slack: " + r.statusText });
    }
    res.json({ ok: true, message: "Messaggio inviato a Slack" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, message: "Errore di invio a Slack" });
  }
});

// POST /api/integrations/google/authorize → build the OAuth consent URL
router.post("/google/authorize", async (req: Request, res: Response) => {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri =
      process.env.GOOGLE_REDIRECT_URI || `${req.protocol}://${req.get("host")}/api/integrations/google/callback`;
    if (!clientId) {
      return res
        .status(503)
        .json({ ok: false, message: "Integrazione Google non configurata sul server" });
    }
    const scope =
      "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events";
    const url =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code&scope=${encodeURIComponent(scope)}` +
      `&access_type=offline&prompt=consent`;
    res.json({ ok: true, url, redirectUri });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false });
  }
});

// GET /api/integrations/google/callback?code=... → exchange code for tokens
router.get("/google/callback", async (req: Request, res: Response) => {
  try {
    const code = String(req.query.code || "");
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = String(
      process.env.GOOGLE_REDIRECT_URI ||
        req.query.redirect_uri ||
        `${req.protocol}://${req.get("host")}/api/integrations/google/callback`,
    );
    if (!code) return res.status(400).send("Parametro code mancante");
    if (!clientId || !clientSecret) {
      return res
        .status(500)
        .send("Integrazione Google non configurata sul server.");
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
      return res.status(500).send("Scambio token Google fallito.");
    }
    res.status(200).send(`
      <html><body style="font-family:sans-serif;text-align:center;padding-top:80px;">
        <h2>\u2713 Taskly collegato a Google Calendar</h2>
        <p>Puoi chiudere questa finestra e tornare a Taskly.</p>
      </body></html>`);
  } catch (e) {
    console.error(e);
    res.status(500).send("Errore durante il collegamento Google.");
  }
});

export default router;