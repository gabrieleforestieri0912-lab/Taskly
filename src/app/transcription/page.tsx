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
} from "lucide-react";
import { apiFetch } from "../../lib/api";

declare global {
  interface Window {
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
  }
}

export default function TranscriptionPage() {
  const router = useRouter();
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

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioChunksRef = useRef<any[]>([]);
  const timerRef = useRef<any>(null);
  const transcriptRef = useRef("");
  const finalTranscriptRef = useRef("");

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      (!window.SpeechRecognition && !window.webkitSpeechRecognition)
    ) {
      setSttSupported(false);
    }
  }, []);

  const handleSttResult = (event: any) => {
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
      transcriptRef.current = finalTranscriptRef.current + interimText;
      setTranscript(finalTranscriptRef.current);
    }
    setInterim(interimText);
  };

  const startTranscription = (stream: MediaStream) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "it-IT";
    rec.onresult = handleSttResult;
    rec.onerror = (e: any) => {
      if (e.error && e.error !== "no-speech" && e.error !== "aborted") {
        console.error("STT error:", e.error);
      }
    };
    rec.start();
    recognitionRef.current = rec;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [] as any[];
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/wav";
      const rec = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = rec;
      rec.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      rec.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioURL(URL.createObjectURL(audioBlob));
      };
      rec.start();
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      if (sttSupported) startTranscription(stream);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Microfono non accessibile. Verifica i permessi.");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      recognitionRef.current?.stop();
      setIsPaused(true);
      clearInterval(timerRef.current ?? undefined);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume();
      if (sttSupported) {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        const rec = new SR();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = "it-IT";
        rec.onresult = handleSttResult;
        rec.onerror = (e: any) => {
          if (e.error && e.error !== "no-speech" && e.error !== "aborted") {
            console.error("STT error:", e.error);
          }
        };
        rec.start();
        recognitionRef.current = rec;
      }
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
      clearInterval(timerRef.current ?? undefined);
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
          message:
            "Riassumi questa trascrizione di una riunione in italiano. " +
            "Restituisci: Obiettivo, Decisioni prese, Prossimi passi. Usa elenchi puntati con ** grassetti **.\n\nTrascrizione:\n" +
            transcript,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSummary(data.message || "");
      }
    } catch (e) {
      console.error("Summary error:", e);
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
        console.error("Sync to server failed (guest or offline):", e);
      }
    } catch (e) {
      console.error("Error saving meeting:", e);
    } finally {
      setIsSaving(false);
    }
    router.push("/meetings");
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      recognitionRef.current?.stop();
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream?.getTracks()?.forEach((t) => t.stop());
      }
    };
  }, [isRecording]);

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

        {/* Voice recording container centered */}
        <div className="w-full p-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex flex-col items-center gap-10">
          {/* Visualizer placeholder */}
          <div className="w-full h-20 flex items-center justify-center">
            {isRecording && !isPaused && (
              <div className="flex items-end gap-1 h-12">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-cyan-500 rounded-full animate-pulse"
                    style={{
                      height: `${15 + (Math.sin(i * 0.5) + 1) * 25}%`,
                      animationDelay: `${i * 0.05}s`,
                    }}
                  />
                ))}
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
                className="flex items-center gap-3 px-8 py-4 bg-cyan-600 hover:bg-cyan-700 text-white text-lg font-bold rounded-full shadow-lg transition-all"
              >
                <Play size={24} />
                Inizia registrazione
              </button>
            )}
            {isRecording && !isPaused && (
              <>
                <button
                  onClick={pauseRecording}
                  className="flex items-center gap-3 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white text-base font-semibold rounded transition-all"
                >
                  <Pause size={20} />
                  Pausa
                </button>
                <button
                  onClick={stopRecording}
                  className="flex items-center gap-3 px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-base font-semibold rounded transition-all"
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
                  className="flex items-center gap-3 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white text-base font-semibold rounded transition-all"
                >
                  <Play size={20} />
                  Riprendi
                </button>
                <button
                  onClick={stopRecording}
                  className="flex items-center gap-3 px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-base font-semibold rounded transition-all"
                >
                  <Square size={20} />
                  Stop
                </button>
              </>
            )}
          </div>

          {/* Live transcript */}
          {(isRecording || transcript || interim) && !audioURL && (
            <div className="w-full mt-2">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Mic size={13} className="text-cyan-500" />
                  Trascrizione in tempo reale
                </p>
                {!sttSupported && (
                  <span className="text-[10px] font-semibold text-amber-500">
                    STT non disponibile: usa un browser Chrome/Edge
                  </span>
                )}
              </div>
              <div className="bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-xl p-4 min-h-[80px] max-h-48 overflow-y-auto text-sm text-gray-700 dark:text-gray-200 leading-relaxed custom-scrollbar">
                {transcript || interim ? (
                  <>
                    {transcript}
                    {interim && (
                      <span className="text-gray-400 italic">{interim}</span>
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
                placeholder="Titolo della riunione (opzionale)"
                className="w-full bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
              {transcript.trim() && (
                <div className="rounded-xl border border-cyan-200 dark:border-cyan-800/40 bg-cyan-50/40 dark:bg-cyan-950/15 p-4">
                  {summary ? (
                    <div>
                      <p className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Sparkles size={13} />
                        Riassunto AI
                      </p>
                      <div
                        className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{
                          __html: summary
                            .replace(/\n/g, "<br/>")
                            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
                        }}
                      />
                    </div>
                  ) : (
                    <button
                      onClick={generateSummary}
                      disabled={isSummarizing}
                      className="flex items-center gap-2 text-sm font-bold text-cyan-600 dark:text-cyan-400 hover:underline disabled:opacity-60"
                    >
                      {isSummarizing ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <Sparkles size={15} />
                      )}
                      {isSummarizing ? "Genero il riassunto..." : "Genera riassunto con AI"}
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
                    transcriptRef.current = "";
                    finalTranscriptRef.current = "";
                  }}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium"
                >
                  Registra di nuovo
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold shadow-md shadow-cyan-600/10 hover:shadow-lg transition-all disabled:opacity-60"
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
        </div>
        <p className="mt-6 text-xs text-gray-400 text-center max-w-md">
          Assicurati di aver concesso i permessi per il microfono. La
          trascrizione avviene in tempo reale via riconoscimento vocale del
          browser.
        </p>
      </div>
    </div>
  );
}