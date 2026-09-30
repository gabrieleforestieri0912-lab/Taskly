"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Mic,
  Square,
  Play,
  Pause,
  ArrowLeft,
  Save,
  Sparkles,
  Loader2,
  MonitorUp,
  Volume2,
} from "lucide-react";
import { apiFetch } from "../../lib/api";
import { pushBadge, showBadge, hideBadge } from "../../lib/badge";
import {
  buildRecapPrompt,
  fallbackRecap,
} from "../../lib/meetings/providers";
import MeetingImportPanel from "../../components/meetings/MeetingImportPanel";

declare global {
  interface Window {
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    SpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
}

type CaptureMode = "mic" | "system";

export default function TranscriptionPage() {
  const router = useRouter();
  const [sourceTab, setSourceTab] = useState<"live" | "import">("live");
  const [captureMode, setCaptureMode] = useState<CaptureMode>("mic");
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [summary, setSummary] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sttSupported, setSttSupported] = useState(true);
  const [title, setTitle] = useState("");
  const [pageAudio, setPageAudio] = useState(false);
  const [level, setLevel] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finalTranscriptRef = useRef("");
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      (!window.SpeechRecognition && !window.webkitSpeechRecognition)
    ) {
      setSttSupported(false);
    }
    // Stato audio pagina dal processo main (badge + banner)
    const off = window.electronAPI?.onAudioState?.((audible: boolean) => {
      setPageAudio(audible);
      if (audible) {
        pushBadge({
          status: "audio",
          label: "Una pagina sta riproducendo audio",
          pageAudio: true,
        });
      }
    });
    return () => {
      off?.();
      hideBadge();
    };
  }, []);

  // Level meter per la cattura audio di sistema
  const startLevelMeter = (stream: MediaStream) => {
    try {
      const Ctx = window.AudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      audioCtxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      analyserRef.current = analyser;
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length / 255;
        setLevel(Math.min(1, avg * 2));
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch (e) {
      console.error("Level meter error:", e);
    }
  };

  const stopLevelMeter = () => {
    cancelAnimationFrame(rafRef.current);
    setLevel(0);
    try {
      audioCtxRef.current?.close();
    } catch {}
    audioCtxRef.current = null;
    analyserRef.current = null;
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const pushBadgeProgress = (status: "listening" | "transcribing") => {
    pushBadge({
      status,
      label: `${formatTime(recordingTime)} • ${(
        finalTranscriptRef.current || ""
      ).slice(-60)}`,
      pageAudio,
    });
  };

  const handleSttResult = (event: SpeechRecognitionEventLike) => {
    let interimText = "";
    let finalText = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const res = event.results[i];
      const text = res[0].transcript;
      if (res.isFinal) finalText += text;
      else interimText += text;
    }
    if (finalText) {
      finalTranscriptRef.current += finalText + " ";
      setTranscript(finalTranscriptRef.current);
    }
    setInterim(interimText);
    pushBadge({
      status: "transcribing",
      label: (finalTranscriptRef.current + interimText).slice(-80),
      pageAudio,
    });
  };

  const startSpeech = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "it-IT";
    rec.onresult = handleSttResult;
    rec.onerror = (e) => {
      if (e.error && e.error !== "no-speech" && e.error !== "aborted") {
        console.error("STT error:", e.error);
      }
    };
    rec.start();
    recognitionRef.current = rec;
  };

  const startRecording = async () => {
    try {
      let stream: MediaStream;
      if (captureMode === "mic") {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } else {
        // Cattura audio di sistema (riunioni, video YouTube, …)
        stream = await navigator.mediaDevices.getDisplayMedia({
          audio: true,
          video: true,
        });
        // Scarta il video: serve solo l'audio
        stream.getVideoTracks().forEach((t) => t.stop());
        if (stream.getAudioTracks().length === 0) {
          alert("Condividi una scheda/finestra con audio attivo.");
          return;
        }
        startLevelMeter(stream);
      }
      audioChunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/wav";
      const rec = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = rec;
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioURL(URL.createObjectURL(audioBlob));
      };
      rec.start();
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      if (captureMode === "mic" && sttSupported) startSpeech();
      showBadge();
      pushBadge({
        status: "listening",
        label:
          captureMode === "mic"
            ? "In ascolto dal microfono…"
            : "Cattura audio di sistema…",
        pageAudio,
      });
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const next = prev + 1;
          if (next % 3 === 0) {
            pushBadge({
              status: captureMode === "mic" ? "transcribing" : "listening",
              label: `${formatTime(next)} • ${(finalTranscriptRef.current || "").slice(-60)}`,
              pageAudio,
            });
          }
          return next;
        });
      }, 1000);
    } catch (error) {
      console.error("Error accessing audio:", error);
      alert(
        captureMode === "mic"
          ? "Microfono non accessibile. Verifica i permessi."
          : "Cattura audio annullata o non supportata.",
      );
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      recognitionRef.current?.stop();
      setIsPaused(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume();
      if (captureMode === "mic" && sttSupported) startSpeech();
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      recognitionRef.current?.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) clearInterval(timerRef.current);
      stopLevelMeter();
      pushBadge({ status: "done", label: "Registrazione completata", pageAudio });
    }
  };

  const generateSummary = async () => {
    if (!transcript.trim()) return;
    setIsSummarizing(true);
    try {
      const res = await apiFetch("/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: buildRecapPrompt(transcript, "it"),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSummary(data.message || fallbackRecap(transcript, "it"));
      } else {
        setSummary(fallbackRecap(transcript, "it"));
      }
    } catch (e) {
      console.error("Summary error:", e);
      setSummary(fallbackRecap(transcript, "it"));
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleSave = async () => {
    const savedAt = new Date();
    const text = transcript.trim();
    const newMeeting = {
      id: `meet-${savedAt.getTime()}`,
      title:
        title.trim() ||
        "Registrazione Vocale " + savedAt.toLocaleDateString("it-IT"),
      date: savedAt.toISOString(),
      duration: formatTime(recordingTime),
      category: "Generale",
      preview:
        (text || "Trascrizione audio completata.").slice(0, 120) ||
        "Trascrizione audio completata.",
      text: text || "Nessun testo riconosciuto.",
      summary:
        summary ||
        "• **Obiettivo**: Registrazione vocale salvata dall'utente.\n• **Prossimi passi**: Rivedere il testo trascritto.",
      source: captureMode === "system" ? "upload" : "manual",
    };

    setIsSaving(true);
    try {
      const stored = localStorage.getItem("meetings_data");
      const currentMeetings = stored ? JSON.parse(stored) : [];
      localStorage.setItem(
        "meetings_data",
        JSON.stringify([newMeeting, ...currentMeetings]),
      );
      try {
        const res = await apiFetch("/meetings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: newMeeting.title,
            transcript: text,
            summary: newMeeting.summary,
            category: newMeeting.category,
            duration: newMeeting.duration,
            date: newMeeting.date,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.meeting?.id) newMeeting.id = data.meeting.id;
        }
      } catch (e) {
        console.error("Sync to server failed:", e);
      }
    } catch (e) {
      console.error("Error saving meeting:", e);
    } finally {
      setIsSaving(false);
    }
    pushBadge({ status: "idle", pageAudio });
    router.push("/meetings");
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      cancelAnimationFrame(rafRef.current);
      recognitionRef.current?.stop();
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        try {
          mediaRecorderRef.current.stream
            ?.getTracks()
            ?.forEach((t) => t.stop());
        } catch {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-3xl flex flex-col items-center">
        {/* Header */}
        <div className="w-full flex items-center mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Torna alla dashboard</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 ml-auto mr-0">
            Nuova Trascrizione
          </h1>
        </div>

        {/* Banner audio pagina rilevato */}
        {pageAudio && (
          <div className="w-full mb-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-xs font-semibold text-amber-700 dark:text-amber-300">
            <Volume2 size={14} className="animate-pulse shrink-0" />
            Una pagina sta producendo audio — il badge in alto al centro dello
            schermo lo segnala. Avvia la cattura «Audio di sistema» per
            registrarlo.
          </div>
        )}

        <div className="w-full p-8 sm:p-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex flex-col items-center gap-8">
          {/* Sorgente */}
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900 rounded-full p-1">
            <button
              onClick={() => setSourceTab("live")}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                sourceTab === "live"
                  ? "bg-white dark:bg-gray-700 shadow text-purple-700 dark:text-purple-300"
                  : "text-gray-500"
              }`}
            >
              Live
            </button>
            <button
              onClick={() => setSourceTab("import")}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                sourceTab === "import"
                  ? "bg-white dark:bg-gray-700 shadow text-purple-700 dark:text-purple-300"
                  : "text-gray-500"
              }`}
            >
              Zoom / Meet / YouTube / File
            </button>
          </div>

          {sourceTab === "import" ? (
            <MeetingImportPanel />
          ) : (
            <>
              {/* Scelta cattura */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCaptureMode("mic")}
                  disabled={isRecording}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all disabled:opacity-60 ${
                    captureMode === "mic"
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300"
                      : "border-gray-200 dark:border-gray-700 text-gray-500"
                  }`}
                >
                  <Mic size={14} />
                  Microfono + testo live
                </button>
                <button
                  onClick={() => setCaptureMode("system")}
                  disabled={isRecording}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all disabled:opacity-60 ${
                    captureMode === "system"
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300"
                      : "border-gray-200 dark:border-gray-700 text-gray-500"
                  }`}
                >
                  <MonitorUp size={14} />
                  Audio di sistema (riunioni, YouTube)
                </button>
              </div>

              {/* Visualizer */}
              <div className="w-full h-20 flex items-center justify-center">
                {isRecording && !isPaused && captureMode === "mic" && (
                  <div className="flex items-end gap-1 h-12">
                    {Array.from({ length: 40 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-purple-500 rounded-full animate-pulse"
                        style={{
                          height: `${15 + (Math.sin(i * 0.5) + 1) * 25}%`,
                          animationDelay: `${i * 0.05}s`,
                        }}
                      />
                    ))}
                  </div>
                )}
                {isRecording && !isPaused && captureMode === "system" && (
                  <div className="w-full max-w-sm">
                    <div className="h-3 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all"
                        style={{ width: `${Math.round(level * 100)}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1.5 text-center">
                      {level > 0.02
                        ? "Audio in cattura…"
                        : "In attesa di audio dal sistema…"}
                    </p>
                  </div>
                )}
                {!isRecording && !audioURL && (
                  <span className="text-gray-400 text-base">
                    Premi il pulsante per iniziare la registrazione
                  </span>
                )}
                {isPaused && (
                  <span className="text-yellow-500 text-base">
                    Registrazione in pausa
                  </span>
                )}
                {audioURL && (
                  <span className="text-green-500 text-base">
                    Registrazione completata
                  </span>
                )}
              </div>

              {/* Timer */}
              <div className="text-4xl font-mono font-bold text-gray-800 dark:text-gray-200">
                {formatTime(recordingTime)}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-6">
                {!isRecording && !audioURL && (
                  <button
                    onClick={startRecording}
                    className="flex items-center gap-3 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white text-lg font-bold rounded-full shadow-lg transition-all"
                  >
                    <Play size={24} />
                    Inizia registrazione
                  </button>
                )}
                {isRecording && !isPaused && (
                  <>
                    <button
                      onClick={pauseRecording}
                      className="flex items-center gap-3 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white text-base font-semibold rounded-full transition-all"
                    >
                      <Pause size={20} />
                      Pausa
                    </button>
                    <button
                      onClick={stopRecording}
                      className="flex items-center gap-3 px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-base font-semibold rounded-full transition-all"
                    >
                      <Square size={20} />
                      Stop
                    </button>
                  </>
                )}
                {isRecording && isPaused && (
                  <>
                    <button
                      onClick={resumeRecording}
                      className="flex items-center gap-3 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white text-base font-semibold rounded-full transition-all"
                    >
                      <Play size={20} />
                      Riprendi
                    </button>
                    <button
                      onClick={stopRecording}
                      className="flex items-center gap-3 px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-base font-semibold rounded-full transition-all"
                    >
                      <Square size={20} />
                      Stop
                    </button>
                  </>
                )}
              </div>

              {/* Live transcript (solo microfono) */}
              {captureMode === "mic" &&
                (isRecording || transcript || interim) &&
                !audioURL && (
                  <div className="w-full mt-2">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Mic size={13} className="text-purple-500" />
                        Trascrizione in tempo reale
                      </p>
                      {!sttSupported && (
                        <span className="text-[10px] font-semibold text-amber-500">
                          STT non disponibile in questo browser
                        </span>
                      )}
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-xl p-4 min-h-[80px] max-h-48 overflow-y-auto text-sm text-gray-700 dark:text-gray-200 leading-relaxed custom-scrollbar">
                      {transcript || interim ? (
                        <>
                          {transcript}
                          {interim && (
                            <span className="text-gray-400 italic">
                              {interim}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-400">
                          {isRecording && isPaused
                            ? "Registrazione in pausa"
                            : "Stai parlando... il testo apparirà qui in tempo reale."}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              {captureMode === "system" && isRecording && !audioURL && (
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center max-w-md">
                  Stai catturando l&apos;audio del sistema (riunione, video
                  YouTube, …). Il badge in alto al centro mostra lo stato anche
                  fuori da questa finestra.
                </p>
              )}

              {/* Audio playback */}
              {audioURL && (
                <div className="w-full mt-2">
                  <audio controls src={audioURL} className="w-full" />
                </div>
              )}

              {/* Summary / Save / Cancel */}
              {audioURL && (
                <div className="w-full mt-4 space-y-4">
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Titolo della riunione / video (opzionale)"
                    className="w-full bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                  {transcript.trim() && (
                    <div className="rounded-xl border border-purple-200 dark:border-purple-800/40 bg-purple-50/40 dark:bg-purple-950/15 p-4">
                      {summary ? (
                        <div>
                          <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Sparkles size={13} />
                            Riassunto AI
                          </p>
                          <div
                            className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{
                              __html: summary
                                .replace(/\n/g, "<br/>")
                                .replace(
                                  /\*\*(.*?)\*\*/g,
                                  "<strong>$1</strong>",
                                ),
                            }}
                          />
                        </div>
                      ) : (
                        <button
                          onClick={generateSummary}
                          disabled={isSummarizing}
                          className="flex items-center gap-2 text-sm font-bold text-purple-600 dark:text-purple-400 hover:underline disabled:opacity-60"
                        >
                          {isSummarizing ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : (
                            <Sparkles size={15} />
                          )}
                          {isSummarizing
                            ? "Genero il riassunto..."
                            : "Genera riassunto con AI"}
                        </button>
                      )}
                    </div>
                  )}
                  <div className="flex gap-4 justify-end w-full">
                    <button
                      onClick={() => {
                        setAudioURL(null);
                        setRecordingTime(0);
                        setTranscript("");
                        setInterim("");
                        setSummary("");
                        setTitle("");
                        finalTranscriptRef.current = "";
                        pushBadge({ status: "idle", pageAudio });
                      }}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium"
                    >
                      Registra di nuovo
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold shadow-md shadow-purple-600/10 hover:shadow-lg transition-all disabled:opacity-60"
                    >
                      {isSaving ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Save size={16} />
                      )}
                      {isSaving ? "Salvataggio..." : "Salva trascrizione"}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        <p className="mt-6 text-xs text-gray-400 text-center max-w-md">
          Il badge in alto al centro dello schermo resta visibile anche fuori
          dal programma e segnala quando una pagina produce audio.
        </p>
      </div>
    </div>
  );
}
