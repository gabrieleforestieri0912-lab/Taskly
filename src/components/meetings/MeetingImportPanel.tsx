"use client";
import { useLanguage } from "../../lib/LanguageContext";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Video,
  CalendarDays,
  Link2,
  FileUp,
  Sparkles,
  Loader2,
  Plug,
  CheckCircle2,
} from "lucide-react";
import { apiFetch } from "../../lib/api";
import {
  MEETING_PROVIDERS,
  getMeetingProvider,
  normalizeTranscriptFile,
  parseZoomMeetingId,
  type MeetingSource,
} from "../../lib/meetings/providers";

interface Props {
  onImported?: () => void;
}

export default function MeetingImportPanel({ onImported }: Props) {
  const { t } = useLanguage();
  const router = useRouter();
  const [source, setSource] = useState<MeetingSource>("zoom");
  const [title, setTitle] = useState("");
  const [externalId, setExternalId] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [recap, setRecap] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [recapping, setRecapping] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const [connected, setConnected] = useState<Record<string, boolean>>({});

  const provider = getMeetingProvider(source);

  const connectProvider = async (id: MeetingSource) => {
    const p = getMeetingProvider(id);
    if (!p.oauth || !p.authorizePath) return;
    setConnecting(true);
    setError("");
    try {
      const res = await apiFetch(p.authorizePath, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Provider non configurato");
      if (data.url) {
        window.open(data.url, "_blank", "width=600,height=700");
        setConnected((c) => ({ ...c, [id]: true }));
      }
    } catch (e: any) {
      setError(e.message || "Connessione fallita");
    } finally {
      setConnecting(false);
    }
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    const raw = await file.text();
    setTranscript(normalizeTranscriptFile(raw));
    if (!title) setTitle(file.name.replace(/\.(vtt|srt|txt)$/i, ""));
  };

  const handleRecap = async () => {
    if (!transcript.trim()) return;
    setRecapping(true);
    setError("");
    try {
      const res = await apiFetch("/meetings/recap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: transcript.trim(), lang: "it" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Recap fallito");
      setRecap(data.recap || "");
    } catch (e: any) {
      setError(e.message || "Recap fallito");
    } finally {
      setRecapping(false);
    }
  };

  const handleImport = async () => {
    if (!transcript.trim()) {
      setError("Incolla o carica una trascrizione prima di importare.");
      return;
    }
    setImporting(true);
    setError("");
    try {
      const finalExternalId =
        source === "zoom" && externalId
          ? parseZoomMeetingId(externalId)
          : externalId.trim() || undefined;
      const res = await apiFetch("/meetings/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source,
          title: title.trim() || `${provider.label} ${new Date().toLocaleDateString("it-IT")}`,
          transcript: transcript.trim(),
          summary: recap || undefined,
          category: "Generale",
          date: new Date().toISOString(),
          externalId: finalExternalId,
          meetingUrl: meetingUrl.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Import fallito");
      // Mirror locale per ospiti / offline
      try {
        const stored = localStorage.getItem("meetings_data");
        const current = stored ? JSON.parse(stored) : [];
        localStorage.setItem(
          "meetings_data",
          JSON.stringify([
            {
              id: data?.meeting?.id || `meet-${Date.now()}`,
              title: data?.meeting?.title || title,
              date: new Date().toISOString(),
              duration: "00:00",
              category: "Generale",
              preview: transcript.slice(0, 120),
              text: transcript,
              summary: recap,
              source,
              meetingUrl: meetingUrl.trim() || undefined,
            },
            ...current,
          ]),
        );
      } catch {}
      onImported?.();
      router.push("/meetings");
    } catch (e: any) {
      setError(e.message || "Import fallito");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="w-full space-y-5">
      {/* Selettore provider */}
      <div className="grid grid-cols-3 gap-2">
        {MEETING_PROVIDERS.filter((p) => p.id !== "manual").map((p) => (
          <button
            key={p.id}
            onClick={() => setSource(p.id)}
            className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-xs font-bold transition-all ${
              source === p.id
                ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300"
                : "border-gray-200 dark:border-gray-700 text-gray-500 hover:border-cyan-300"
            }`}
          >
            {p.id === "zoom" ? (
              <Video size={18} />
            ) : p.id === "google_meet" ? (
              <CalendarDays size={18} />
            ) : (
              <FileUp size={18} />
            )}
            {p.shortLabel}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
        {provider.description} {provider.connectHelp}
      </p>

      {provider.oauth && (
        <button
          onClick={() => connectProvider(source)}
          disabled={connecting}
          className="flex items-center gap-2 text-xs font-bold text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 rounded-xl px-3 py-2 hover:bg-cyan-50 dark:hover:bg-cyan-950/30 disabled:opacity-60"
        >
          {connected[source] ? (
            <CheckCircle2 size={14} className="text-emerald-500" />
          ) : (
            <Plug size={14} />
          )}
          {connecting
            ? "Connessione..."
            : connected[source]
              ? `${provider.label} collegato (verifica popup)`
              : `Connetti ${provider.label}`}
        </button>
      )}

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t("views.meetTitlePh")}
        className="w-full bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
      />

      {source !== "upload" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="relative">
            <Link2
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={source === "zoom" ? externalId : meetingUrl}
              onChange={(e) =>
                source === "zoom"
                  ? setExternalId(e.target.value)
                  : setMeetingUrl(e.target.value)
              }
              placeholder={
                source === "zoom"
                  ? "ID riunione Zoom o link (es. …/j/123…)"
                  : "Link Google Meet (es. meet.google.com/abc-…)"
              }
              className="w-full bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>
          <input
            value={source === "zoom" ? meetingUrl : externalId}
            onChange={(e) =>
              source === "zoom"
                ? setMeetingUrl(e.target.value)
                : setExternalId(e.target.value)
            }
            placeholder={
              source === "zoom" ? "Link registrazione (opzionale)" : "ID evento (opzionale)"
            }
            className="w-full bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Trascrizione {source === "zoom" ? "(da cloud recording VTT)" : source === "google_meet" ? "(da Meet / Drive)" : ""}
          </label>
          <label className="flex items-center gap-1.5 text-xs font-bold text-cyan-600 dark:text-cyan-400 cursor-pointer hover:underline">
            <FileUp size={13} />{t("views.meetUpload")}<input
              type="file"
              accept=".vtt,.srt,.txt"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </label>
        </div>
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          rows={8}
          placeholder={t("views.meetTranscriptPh")}
          className="w-full bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-cyan-500/50 custom-scrollbar"
        />
      </div>

      {transcript.trim() && (
        <div className="rounded-xl border border-cyan-200 dark:border-cyan-800/40 bg-cyan-50/40 dark:bg-cyan-950/15 p-4">
          {recap ? (
            <div
              className="text-sm leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{
                __html: recap
                  .replace(/\n/g, "<br/>")
                  .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
              }}
            />
          ) : (
            <button
              onClick={handleRecap}
              disabled={recapping}
              className="flex items-center gap-2 text-sm font-bold text-cyan-600 dark:text-cyan-400 hover:underline disabled:opacity-60"
            >
              {recapping ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Sparkles size={15} />
              )}
              {recapping ? "Genero il recap AI..." : "Genera recap con AI"}
            </button>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs font-semibold text-red-500">{error}</p>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleImport}
          disabled={importing || !transcript.trim()}
          className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold shadow-md disabled:opacity-60"
        >
          {importing ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <CheckCircle2 size={16} />
          )}
          {importing ? "Importazione..." : `Importa da ${provider.shortLabel}`}
        </button>
      </div>
    </div>
  );
}
