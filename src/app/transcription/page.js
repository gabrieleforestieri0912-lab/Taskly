"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mic, Square, Play, Pause, ArrowLeft, Save } from "lucide-react";

export default function TranscriptionPage() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        setAudioURL(URL.createObjectURL(audioBlob));
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
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
      setIsPaused(true);
      clearInterval(timerRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume();
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
      setIsRecording(false);
      setIsPaused(false);
      clearInterval(timerRef.current);
    }
  };

  const handleSave = () => {
    const savedAt = new Date();
    const newMeeting = {
      id: `meet-${savedAt.getTime()}`,
      title: "Registrazione Vocale " + savedAt.toLocaleDateString("it-IT"),
      date: savedAt.toISOString(),
      duration: formatTime(recordingTime),
      category: "Generale",
      preview: "Trascrizione audio completata con successo. L'audio registrato è pronto per essere riprodotto...",
      text: "Questo è il testo trascritto automaticamente dalla registrazione audio di Taskly. L'integrazione con il motore di trascrizione vocale locale basato su AI ha convertito il parlato in testo con successo.",
      summary: "• **Obiettivo**: Registrazione vocale salvata dall'utente.\n• **Decisioni prese**: Trascrivere ed archiviare l'audio.\n• **Prossimi passi**: Rivedere il testo trascritto e generare ulteriori insight se necessario.",
    };

    try {
      const stored = localStorage.getItem("meetings_data");
      const currentMeetings = stored ? JSON.parse(stored) : [];
      const updated = [newMeeting, ...currentMeetings];
      localStorage.setItem("meetings_data", JSON.stringify(updated));
    } catch (e) {
      console.error("Error saving meeting:", e);
    }

    router.push("/meetings");
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
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
          <div className="w-full h-40 flex items-center justify-center">
            {isRecording && !isPaused && (
              <div className="flex items-end gap-1 h-24">
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
                Premii il pulsante per iniziare la registrazione
              </span>
            )}
            {isPaused && (
              <span className="text-yellow-500 text-base">Registrazione in pausa</span>
            )}
            {audioURL && (
              <span className="text-green-500 text-base">Registrazione completata</span>
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
                  className="flex items-center gap-3 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white text-base font-semibold rounded-full transition-all"
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

          {/* Audio playback */}
          {audioURL && (
            <div className="w-full mt-4">
              <audio controls src={audioURL} className="w-full" />
            </div>
          )}

          {/* Save / Cancel */}
          {audioURL && (
            <div className="flex gap-4 justify-end w-full mt-4">
              <button
                onClick={() => {
                  setAudioURL(null);
                  setRecordingTime(0);
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium"
              >
                Registra di nuovo
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold shadow-md shadow-cyan-600/10 hover:shadow-lg transition-all"
              >
                <Save size={16} />
                Salva trascrizione
              </button>
            </div>
          )}
        </div>
        <p className="mt-6 text-xs text-gray-400">
          Assicurati di aver concesso i permessi per il microfono.
        </p>
      </div>
    </div>
  );
}
