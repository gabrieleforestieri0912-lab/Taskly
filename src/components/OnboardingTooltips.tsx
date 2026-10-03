"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { getOnboardingState, type OnboardingStepId } from "../hooks/useOnboarding";

const TOOLTIP_KEY = "taskly_tooltips_seen_v1";

function readSeen(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(TOOLTIP_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

export function markTooltipSeen(id: string) {
  try {
    const cur = readSeen();
    cur[id] = true;
    localStorage.setItem(TOOLTIP_KEY, JSON.stringify(cur));
  } catch {}
}

export function hasTooltipSeen(id: string): boolean {
  try {
    return !!readSeen()[id];
  } catch {
    return false;
  }
}

export function OneTimeTooltip({
  id,
  title,
  body,
  position = "bottom",
  /** Se passato, il tooltip viene mostrato SOLO se quello step non e' ancora stato completato (adattivo) */
  whileStepPending,
}: {
  id: string;
  title: string;
  body: string;
  position?: "bottom" | "top";
  whileStepPending?: OnboardingStepId;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    try {
      if (readSeen()[id]) return;
      if (whileStepPending) {
        const s = getOnboardingState();
        if (s.stepsDone[whileStepPending]) return;
      }
      const t = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(t);
    } catch {}
  }, [id, whileStepPending]);
  if (!visible) return null;
  const dismiss = () => {
    markTooltipSeen(id);
    setVisible(false);
  };
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: position === "bottom" ? -6 : 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className={`absolute ${position === "bottom" ? "top-full mt-2" : "bottom-full mb-2"} left-0 z-50 w-60 rounded-2xl border border-[#7b39fc]/25 bg-white dark:bg-gray-900 shadow-2xl p-3`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[#7b39fc]">
            <Sparkles size={13} />
            <span className="text-[11px] font-black uppercase tracking-widest">Suggerimento</span>
          </div>
          <button onClick={dismiss} className="text-gray-400 hover:text-gray-600" aria-label="Chiudi suggerimento">
            <X size={13} />
          </button>
        </div>
        <p className="text-xs font-bold text-gray-900 dark:text-white mt-1">{title}</p>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{body}</p>
        <button
          onClick={dismiss}
          className="mt-2 w-full py-1.5 rounded-xl text-[11px] font-bold text-white bg-[#7b39fc] hover:brightness-110"
        >
          Capito
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
