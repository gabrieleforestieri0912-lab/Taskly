"use client";
import { useLanguage } from "../../lib/LanguageContext";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Webhook, MessageSquare, ArrowLeft, Check, Link as LinkIcon, ExternalLink, Loader2 } from "lucide-react";
import { apiFetch } from "../../lib/api";
import GoogleCalendarIcon from "../../components/GoogleCalendarIcon";

type IntegrationState = {
  slack: boolean;
  google: boolean;
};

export default function IntegrationsPage() {
  const { t } = useLanguage();
  const [connected, setConnected] = useState<IntegrationState>({ slack: false, google: false });
  const [webhookUrl, setWebhookUrl] = useState("");
  const [testMessage, setTestMessage] = useState("");
  const [slackBusy, setSlackBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  // Load persisted integrations
  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch("/integrations");
        if (!res.ok) return;
        const data = await res.json();
        const list: any[] = data?.integrations || [];
        const state: IntegrationState = { slack: false, google: false };
        list.forEach((it) => {
          if (it.provider === "slack") state.slack = !!it.connected;
          if (it.provider === "google") state.google = !!it.connected;
        });
        setConnected(state);
      } catch {
        /* guest / offline — leave disconnected */
      }
    })();
  }, []);

  const connectSlack = async () => {
    if (!webhookUrl.trim()) {
      setStatus(t("auth.intPasteWebhook"));
      return;
    }
    setSlackBusy(true);
    setStatus(null);
    try {
      const res = await apiFetch("/integrations/slack/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: webhookUrl.trim() }),
      });
      if (res.ok) {
        setConnected((c) => ({ ...c, slack: true }));
        setStatus(t("auth.intSlackConnected"));
      } else {
        const d = await res.json();
        setStatus(d?.message || t("auth.intConnectError"));
      }
    } catch (e) {
      setStatus(t("auth.intNetworkError"));
    } finally {
      setSlackBusy(false);
    }
  };

  const testSlack = async () => {
    setSlackBusy(true);
    setStatus(null);
    try {
      const res = await apiFetch("/integrations/slack/webhook-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: testMessage || t("auth.intDefaultTestMessage") }),
      });
      const d = await res.json();
      setStatus(d?.message || t("auth.intSlackSent"));
    } catch {
      setStatus(t("auth.intSlackSendError"));
    } finally {
      setSlackBusy(false);
    }
  };

  const disconnectSlack = async () => {
    await apiFetch("/integrations/slack", { method: "DELETE" }).catch(() => {});
    setConnected((c) => ({ ...c, slack: false }));
    setWebhookUrl("");
    setStatus(t("auth.intSlackDisconnected"));
  };

  const connectGoogle = async () => {
    setGoogleBusy(true);
    setStatus(null);
    try {
      const res = await apiFetch("/integrations/google/authorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const d = await res.json();
      if (d?.url) {
        window.location.href = d.url;
      } else {
        setStatus(d?.message || t("auth.intGoogleNotConfigured"));
      }
    } catch {
      setStatus(t("auth.intGoogleConnectError"));
    } finally {
      setGoogleBusy(false);
    }
  };

  const disconnectGoogle = async () => {
    await apiFetch("/integrations/google", { method: "DELETE" }).catch(() => {});
    setConnected((c) => ({ ...c, google: false }));
    setStatus(t("auth.intGoogleDisconnected"));
  };

  const inp =
    "w-full bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-(--accent)/40";

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-(--accent) dark:hover:text-(--accent-300)">
          <ArrowLeft size={16} />{t("land.mockNavDashboard")}</Link>
        <h1 className="mt-8 text-3xl font-black text-gray-900 dark:text-white">{t("auth.intTitle")}</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t("auth.intSubtitle")}</p>

        {status && (
          <div className="mt-6 px-4 py-3 rounded-xl border border-(--accent)/25 bg-(--accent)/10 text-sm font-bold text-(--accent) dark:text-(--accent-300)">
            {status}
          </div>
        )}

        {/* Google Calendar */}
        <section className="mt-8 landing-card !p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="landing-icon-wrap !p-1">
                <GoogleCalendarIcon className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2 font-black text-gray-900 dark:text-white">
                  Google Calendar
                  {connected.google && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                      <Check size={11} />{t("auth.intConnectedBadge")}</span>
                  )}
                </div>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t("auth.intGoogleDesc")}</div>
              </div>
            </div>
            <button
              onClick={connected.google ? disconnectGoogle : connectGoogle}
              disabled={googleBusy}
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-(--accent) hover:brightness-110 text-white text-xs font-bold transition-all disabled:opacity-60"
            >
              {googleBusy ? <Loader2 size={14} /> : connected.google ? <ExternalLink size={14} /> : <LinkIcon size={14} />}
              {googleBusy ? "..." : connected.google ? t("auth.intDisconnect") : t("auth.intConnect")}
            </button>
          </div>
        </section>

        {/* Slack */}
        <section className="mt-4 landing-card !p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="landing-icon-wrap">
                <MessageSquare size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2 font-black text-gray-900 dark:text-white">
                  Slack
                  {connected.slack && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                      <Check size={11} />{t("auth.intConnectedBadge")}</span>
                  )}
                </div>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t("auth.intSlackDesc")}</div>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://hooks.slack.com/services/T0000/B0000/XXXX"
                disabled={connected.slack}
                className={inp}
              />
              {connected.slack ? (
                <button
                  onClick={disconnectSlack}
                  className="shrink-0 px-4 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-sm font-bold text-gray-700 dark:text-gray-200 transition-all"
                >{t("auth.intDisconnect")}</button>
              ) : (
                <button
                  onClick={connectSlack}
                  disabled={slackBusy}
                  className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-(--accent) hover:brightness-110 text-white text-sm font-bold transition-all disabled:opacity-60"
                >
                  {slackBusy ? <Loader2 size={14} /> : <LinkIcon size={14} />}
                  Collega webhook
                </button>
              )}
            </div>

            {connected.slack && (
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder={t("auth.intTestPlaceholder")}
                  className={inp}
                />
                <button
                  onClick={testSlack}
                  disabled={slackBusy}
                  className="shrink-0 px-4 py-2.5 rounded-xl border border-(--accent)/40 text-(--accent) dark:text-(--accent-300) text-sm font-bold hover:bg-(--accent)/10 transition-all disabled:opacity-60"
                >
                  {slackBusy ? <Loader2 size={14} className="animate-spin inline" /> : t("auth.intSendTest")}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Webhook API */}
        <section className="mt-4 landing-card !p-6">
          <div className="flex items-center gap-4">
            <div className="landing-icon-wrap">
              <Webhook size={22} />
            </div>
            <div>
              <div className="font-black text-gray-900 dark:text-white">Webhook API</div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t("auth.intWebhookDesc")}</div>
            </div>
          </div>
          <code className="mt-4 block px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
            POST /api/webhooks/taskly &rarr; {"{ type, title, body, payload }"}
          </code>
        </section>
      </div>
    </main>
  );
}