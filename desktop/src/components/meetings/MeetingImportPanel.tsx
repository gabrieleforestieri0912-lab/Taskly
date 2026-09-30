"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Video,
  CalendarDays,
  Youtube,
  FileUp,
  Sparkles,
  Loader2,
  CheckCircle2,
  Play,
} from "lucide-react";
import { apiFetch } from "../../lib/api";
import {
  MEETING_PROVIDERS,
  getMeetingProvider,
  normalizeTranscriptFile,
  parseZoomMeetingId,
  parseYouTubeVideoId,
  buildYouTubeEmbedUrl,
  buildYouTubeWatchUrl,
  buildRecapPrompt,
  fallbackRecap,
  type MeetingSource,
} from "../../lib/meetings/providers";

interface Props {
  onImported?: () => void;
}

/** Import trascrizioni da Zoom / Meet / YouTube / file (desktop). */
export default function MeetingImportPanel({ onImported }: Props) {
  const router = useRouter();
  const [source, setSource] = useState<MeetingSource>("zoom");
  const [title, setTitle] = useState("");
  const [externalId, setExternalId] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [recap, setRecap] = useState("");
  const [recapping, setRecapping] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const [playingVideoId, setPlayingVideoId] = useState("");

  const provider = getMeetingProvider(source);
  const youtubeId = parseYouTubeVideoId(meetingUrl);

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
      const res = await apiFetch("/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: buildRecapPrompt(transcript.trim(), "it"),
        }),
      });
      if (!res.ok) throw new Error("AI non disponibile");
      const data = await res.json().catch(() => ({}));
      setRecap(data.message || fallbackRecap(transcript.trim(), "it"));
    } catch {
      // Fallback locale garantito (Ollama spento, offline, …)
      setRecap(fallbackRecap(transcript.trim(), "it"));
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
          : source === "youtube"
            ? youtubeId || externalId.trim() || undefined
            : externalId.trim() || undefined;
      const finalUrl =
        source === "youtube" && youtubeId
          ? buildYouTubeWatchUrl(youtubeId)
          : meetingUrl.trim() || undefined;
      const payload = {
        title:
          title.trim() ||
          `${provider.label} ${new Date().toLocaleDateString("it-IT")}`,
        transcript: transcript.trim(),
        summary: recap || undefined,
        category: "Generale",
        date: new Date().toISOString(),
        duration: "00:00",
        source,
        externalId: finalExternalId,
        meetingUrl: finalUrl,
      };
      // Salvataggio locale (sempre) + sync server (se loggato)
      const stored = localStorage.getItem("meetings_data");
      const current = stored ? JSON.parse(stored) : [];
      const localMeeting = {
        id: `meet-${Date.now()}`,
        preview: payload.transcript.slice(0, 120),
        text: payload.transcript,
        ...payload,
      };
      try {
        const res = await apiFetch("/meetings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          if (data?.meeting?.id) localMeeting.id = data.meeting.id;
        }
      } catch {}
      localStorage.setItem(
        "meetings_data",
        JSON.stringify([localMeeting, ...current]),
      );
      onImported?.();
      router.push("/meetings");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Import fallito");
    } finally {
      setImporting(false);
    }
  };

  const icons: Record<string, React.ReactNode> = {
    zoom: <Video size={18} />,
    google_meet: <CalendarDays size={18} />,
    youtube: <Youtube size={18} />,
    upload: <FileUp size={18} />,
  };

  return (
    <div className="w-full space-y-5">
      {/* Selettore provider */}
      <div className="grid grid-cols-4 gap-2">
        {MEETING_PROVIDERS.filter((p) => p.id !== "manual").map((p) => (
          <button
            key={p.id}
            onClick={() => setSource(p.id)}
            className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-bold transition-all ${
              source === p.id
                ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300"
                : "border-gray-200 dark:border-gray-700 text-gray-500 hover:border-cyan-300"
            }`}
          >
            {icons[p.id]}
            {p.shortLabel}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
        {provider.description} {provider.connectHelp}
      </p>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titolo della riunione / video (opzionale)"
        className="w-full bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
      />

      {/* YouTube: link + player integrato */}
      {source === "youtube" && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              value={meetingUrl}
              onChange={(e) => {
                setMeetingUrl(e.target.value);
                setPlayingVideoId("");
              }}
              placeholder="Link YouTube (watch, youtu.be, shorts, live…)"
              className="flex-1 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
            <button
              onClick={() => youtubeId && setPlayingVideoId(youtubeId)}
              disabled={!youtubeId}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-bold disabled:opacity-50"
            >
              <Play size={14} />
              Riproduci
            </button>
          </div>
          {playingVideoId && (
            <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <iframe
                width="100%"
                height="280"
                src={buildYouTubeEmbedUrl(playingVideoId)}
                title="YouTube player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              <p className="text-[11px] text-gray-500 dark:text-gray-400 px-3 py-2 bg-gray-50 dark:bg-gray-850">
                Mentre il video suona, usa la tab «Microfono + Sistema» per
                trascriverlo in tempo reale — il badge in alto mostra lo stato.
              </p>
            </div>
          )}
        </div>
      )}

      {source !== "upload" && source !== "youtube" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
            className="w-full bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
          <input
            value={source === "zoom" ? meetingUrl : externalId}
            onChange={(e) =>
              source === "zoom"
                ? setMeetingUrl(e.target.value)
                : setExternalId(e.target.value)
            }
            placeholder={
              source === "zoom"
                ? "Link registrazione (opzionale)"
                : "ID evento (opzionale)"
            }
            className="w-full bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Trascrizione
          </label>
          <label className="flex items-center gap-1.5 text-xs font-bold text-cyan-600 dark:text-cyan-400 cursor-pointer hover:underline">
            <FileUp size={13} />
            Carica .vtt/.srt/.txt
            <input
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
          placeholder="Incolla qui la trascrizione (i file VTT/SRT vengono puliti automaticamente)…"
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

      {error && <p className="text-xs font-semibold text-red-500">{error}</p>}

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
