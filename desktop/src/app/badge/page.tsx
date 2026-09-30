"use client";
import { useEffect, useState } from "react";
import { Mic, Volume2, CheckCircle2, Loader2 } from "lucide-react";
import type { BadgeState } from "../../lib/badge";

// Finestra overlay always-on-top (trasparente, in alto al centro).
// Riceve lo stato via IPC dal processo main (vedi desktop/main.ts).
export default function BadgePage() {
  const [state, setState] = useState<BadgeState>({ status: "idle" });

  useEffect(() => {
    // La finestra Electron è trasparente: azzera lo sfondo del body
    const prev = document.body.style.background;
    document.body.style.background = "transparent";
    document.documentElement.style.background = "transparent";
    return () => {
      document.body.style.background = prev;
    };
  }, []);

  useEffect(() => {
    const api = window.electronAPI;
    if (!api?.onBadgeUpdate) return;
    const offUpdate = api.onBadgeUpdate((s) =>
      setState((prev) => ({ ...prev, ...s })),
    );
    const offAudio =
      api.onBadgeAudio?.((info) =>
        setState((prev) => ({ ...prev, pageAudio: info.pageAudio })),
      ) ?? (() => {});
    return () => {
      offUpdate();
      offAudio();
    };
  }, []);

  if (state.status === "idle" && !state.pageAudio) return null;

  const audioActive = state.pageAudio && state.status !== "transcribing" && state.status !== "listening";

  return (
    <div className="w-screen h-screen flex items-start justify-center bg-transparent pointer-events-none">
      <div className="mt-1 flex items-center gap-2.5 pl-3 pr-4 py-2 rounded-full bg-zinc-900/90 backdrop-blur border border-white/10 shadow-2xl text-white max-w-[440px]">
        {state.status === "listening" && (
          <span className="relative flex h-3 w-3 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
          </span>
        )}
        {state.status === "transcribing" && (
          <Loader2 size={14} className="animate-spin text-cyan-300 shrink-0" />
        )}
        {state.status === "done" && (
          <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
        )}
        {(audioActive || state.status === "audio") && (
          <Volume2 size={14} className="text-amber-300 shrink-0 animate-pulse" />
        )}
        {state.status === "idle" && state.pageAudio && (
          <Volume2 size={14} className="text-amber-300 shrink-0 animate-pulse" />
        )}
        <div className="min-w-0 leading-tight">
          <p className="text-[11px] font-bold flex items-center gap-1.5">
            <Mic size={11} className="text-cyan-300 shrink-0" />
            {state.status === "listening" && "Taskly in ascolto"}
            {state.status === "transcribing" && "Trascrizione live"}
            {state.status === "done" && "Trascrizione completata"}
            {state.status === "audio" && "Audio rilevato nella pagina"}
            {state.status === "idle" && "Audio rilevato nella pagina"}
          </p>
          {(state.label || audioActive) && (
            <p className="text-[10px] text-zinc-300 truncate">
              {state.label ||
                "Una pagina sta riproducendo audio — apri Trascrizione per catturarlo."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
