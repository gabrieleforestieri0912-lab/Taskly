"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  CheckSquare,
  Table2,
  CalendarDays,
  StickyNote,
  Target,
  MessageSquare,
} from "lucide-react";

/**
 * Elementi "flottanti" minimalist che vivono dietro la hero.
 *
 * Rappresentano i mattoni del workspace (tabella, task, calendario,
 * note, obiettivi, chat) come piccoli frammenti semitrasparenti.
 *
 * Vincoli di design:
 *  - pointer-events-none: non intercettano i click sui CTA;
 *  - opacità bassa: restano sfondo, non contendono il contenuto;
 *  - hidden sotto lg: su mobile aggiungerebbero solo rumore;
 *  - aria-hidden: decorativi, il testo non è contenuto reale.
 */

type FloaterId = "table" | "task" | "cal" | "note" | "goal" | "chat";

type Floater = {
  id: FloaterId;
  icon: typeof Table2;
  label: string;
  x: string; // posizione orizzontale in %
  y: string; // posizione verticale in %
  rotate: number;
  duration: number; // durata ciclo galleggiamento (s)
  delay: number;
  width: string;
  accent: string;
};

const FLOATERS: Floater[] = [
  { id: "table", icon: Table2, label: "Tasks", x: "3%", y: "15%", rotate: -8, duration: 11, delay: 0, width: "w-[168px]", accent: "from-[#7b39fc]/70" },
  { id: "task", icon: CheckSquare, label: "Oggi", x: "86%", y: "11%", rotate: 7, duration: 13, delay: 0.8, width: "w-[150px]", accent: "from-[#8b4dff]/70" },
  { id: "cal", icon: CalendarDays, label: "Settimana", x: "90%", y: "61%", rotate: 5, duration: 12, delay: 0.4, width: "w-[160px]", accent: "from-[#a67cff]/70" },
  { id: "note", icon: StickyNote, label: "Note", x: "2%", y: "59%", rotate: -6, duration: 14, delay: 1.1, width: "w-[144px]", accent: "from-[#5a1fd4]/70" },
  { id: "goal", icon: Target, label: "Obiettivi", x: "16%", y: "83%", rotate: 4, duration: 15, delay: 0.2, width: "w-[152px]", accent: "from-[#7b39fc]/70" },
  { id: "chat", icon: MessageSquare, label: "Assistente", x: "75%", y: "85%", rotate: -5, duration: 13, delay: 1.5, width: "w-[158px]", accent: "from-[#8b4dff]/70" },
];

/** Riga finta di tabella: pallino di stato + linea di lunghezza variabile. */
const TableRows = () => (
  <div className="mt-2.5 space-y-1.5">
    {[100, 72, 88].map((w) => (
      <div key={w} className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#7b39fc]/40" />
        <span className="h-1 rounded-full bg-gray-300/70 dark:bg-white/15" style={{ width: `${w}%` }} />
      </div>
    ))}
  </div>
);

/** Task finti: una riga da spuntare, una già spuntata. */
const TaskRows = () => (
  <div className="mt-2.5 space-y-2">
    <div className="flex items-center gap-1.5">
      <span className="h-3 w-3 shrink-0 rounded-[3px] border border-[#7b39fc]/40" />
      <span className="h-1 w-16 rounded-full bg-gray-300/70 dark:bg-white/15" />
    </div>
    <div className="flex items-center gap-1.5">
      <span className="h-3 w-3 shrink-0 rounded-[3px] bg-[#7b39fc]/70" />
      <span className="h-1 w-12 rounded-full bg-gray-300/70 dark:bg-white/15" />
    </div>
  </div>
);

/** Calendario finto: 7 celle, una evidenziata. */
const CalRows = () => (
  <div className="mt-2.5 grid grid-cols-7 gap-1">
    {Array.from({ length: 7 }).map((_, i) => (
      <span
        key={i}
        className={`h-4 rounded-[3px] ${i === 3 ? "bg-[#7b39fc]/70" : "bg-gray-200/80 dark:bg-white/10"}`}
      />
    ))}
  </div>
);

/** Nota / obiettivo finti: due righe di testo. */
const NoteRows = () => (
  <div className="mt-2.5 space-y-1.5">
    <span className="block h-1 w-4/5 rounded-full bg-gray-300/70 dark:bg-white/15" />
    <span className="block h-1 w-3/5 rounded-full bg-gray-300/70 dark:bg-white/15" />
  </div>
);

const BODY: Record<FloaterId, () => React.ReactElement> = {
  table: TableRows,
  task: TaskRows,
  cal: CalRows,
  note: NoteRows,
  goal: NoteRows,
  chat: TaskRows,
};

export function FloatingWorkspace() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 hidden lg:block"
    >
      {FLOATERS.map((f) => {
        const Icon = f.icon;
        const Rows = BODY[f.id];

        return (
          <motion.div
            key={f.id}
            className={`absolute ${f.width}`}
            style={{ left: f.x, top: f.y }}
            initial={shouldReduceMotion ? { opacity: 0.45 } : { opacity: 0, y: 18, rotate: f.rotate }}
            animate={
              shouldReduceMotion
                ? { opacity: 0.45 }
                : {
                    opacity: 0.45,
                    y: 0,
                    rotate: f.rotate,
                    transition: {
                      opacity: { duration: 0.8, delay: f.delay },
                      // ciclo infinito "mirror": sale e scende senza scatti
                      y: { duration: f.duration, delay: f.delay, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" },
                      rotate: { duration: f.duration, delay: f.delay, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" },
                    },
                  }
            }
          >
            {/* pastiglia vetrosa: leggera, non domina il contenuto */}
            <div className="rounded-xl border border-white/70 bg-white/55 p-3 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.25)] backdrop-blur-md dark:border-white/10 dark:bg-white/[0.04]">
              <div className="flex items-center gap-2">
                <span className={`grid h-5 w-5 place-items-center rounded-md bg-gradient-to-br ${f.accent} to-transparent`}>
                  <Icon className="h-3 w-3 text-white" />
                </span>
                <span className="text-[11px] font-semibold tracking-tight text-gray-700 dark:text-white/70">
                  {f.label}
                </span>
              </div>
              <Rows />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}