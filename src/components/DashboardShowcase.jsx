"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  LayoutDashboard,
  ListTodo,
  Target,
  Calendar,
  FileText,
  Lightbulb,
  Search,
  Bell,
  Plus,
  Sparkles,
  Zap,
  Flame,
  CheckCircle2,
  Circle,
  Clock,
  TrendingUp,
  Bot,
  Send,
  ChevronDown,
  MoreHorizontal,
  PanelLeft,
  BarChart3,
  ArrowUpRight,
  CalendarDays,
  KanbanSquare,
  ListChecks,
  Users,
  BookOpen,
  Rocket,
  Globe,
  ChevronRight,
} from "lucide-react";

/* ── Shared bits ─────────────────────────────────────────────────────── */

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: ListTodo, label: "Task" },
  { icon: Target, label: "Obiettivi" },
  { icon: Calendar, label: "Calendario" },
  { icon: FileText, label: "Note" },
  { icon: Lightbulb, label: "Idee" },
];

const SPACE_ITEMS = [
  { icon: BookOpen, label: "Letture" },
  { icon: Users, label: "Team Dev" },
  { icon: Rocket, label: "Lancio v3.2" },
];

const STATS = [
  {
    icon: CheckCircle2,
    label: "Task completati",
    value: 24,
    suffix: "",
    delta: "+12%",
    color: "#7b39fc",
  },
  {
    icon: Flame,
    label: "Sequenza giorni",
    value: 12,
    suffix: "",
    delta: "🔥",
    color: "#a67cff",
  },
  {
    icon: Zap,
    label: "Produttività",
    value: 87,
    suffix: "%",
    delta: "+6%",
    color: "#8b4dff",
  },
  {
    icon: Clock,
    label: "Ore focus",
    value: 31,
    suffix: "h",
    delta: "sett. scorsa",
    color: "#c4a6ff",
  },
];

const TODOS = [
  {
    id: 1,
    title: "Rivedere proposta cliente Alpha",
    tag: "Lavoro",
    tagColor: "#7b39fc",
    time: "09:30",
    done: false,
  },
  {
    id: 2,
    title: "Preparare slide demo prodotto",
    tag: "Progetto",
    tagColor: "#a67cff",
    time: "11:00",
    done: true,
  },
  {
    id: 3,
    title: "Allenamento serale",
    tag: "Salute",
    tagColor: "#5a1fd4",
    time: "18:00",
    done: false,
  },
  {
    id: 4,
    title: "Leggere 20 pagine di Deep Work",
    tag: "Crescita",
    tagColor: "#8b4dff",
    time: "21:30",
    done: false,
  },
];

const KANBAN = [
  {
    column: "Da fare",
    color: "#8b4dff",
    cards: [
      { title: "Definire roadmap Q4", tag: "Strategia", priority: "Alta" },
      { title: "Rispondere ai ticket supporto", tag: "Supporto", priority: "Media" },
    ],
  },
  {
    column: "In corso",
    color: "#7b39fc",
    cards: [
      { title: "Nuova board Kanban", tag: "Sviluppo", priority: "Alta" },
      { title: "Copy landing v3.2", tag: "Marketing", priority: "Media" },
      { title: "Integrazione calendario", tag: "Sviluppo", priority: "Bassa" },
    ],
  },
  {
    column: "Revisione",
    color: "#a67cff",
    cards: [
      { title: "Review design system", tag: "Design", priority: "Alta" },
    ],
  },
  {
    column: "Fatto",
    color: "#22c55e",
    cards: [
      { title: "Onboarding nuovi utenti", tag: "Prodotto", priority: "Media" },
      { title: "Piano marketing Q3", tag: "Marketing", priority: "Bassa" },
    ],
  },
];

const CAL_WEEK = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

const WEEK_EVENTS = {
  1: ["09:30 — Review proposta"],
  3: ["11:00 — Standup team", "15:00 — Call cliente Alpha"],
  5: ["09:00 — Design review"],
  6: ["10:30 — Allenamento"],
};

const AI_SUGGESTIONS = [
  "Riassumi le note di oggi",
  "Pianifica la mia settimana",
  "Crea una pagina obiettivo",
];

const AI_MESSAGES = [
  { from: "ai", text: "Ciao Sofia! 👋 Oggi hai 3 task prioritari e 2 obiettivi vicini alla scadenza." },
  { from: "user", text: "Organizza la mia giornata per priorità" },
  { from: "ai", text: "Perfetto, ho pianificato la tua giornata: 1) Proposta Alpha alle 9:30, 2) Slide demo alle 11:00, 3) Allenamento alle 18:00. Vuoi che crei anche i blocchi sul calendario?" },
];

/* ── Number counter ──────────────────────────────────────────────────── */

function CountUp({ value, suffix = "" }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          const duration = 1100;
          const start = performance.now();
          const tick = (now) => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setDisplay(Math.round(eased * value));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <span ref={ref}>
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ── Sidebar mock ────────────────────────────────────────────────────── */

function MockSidebar() {
  return (
    <div className="hidden h-full w-56 shrink-0 flex-col border-r border-[#2b2344]/60 bg-[#120d20]/95 p-4 md:flex">
      <div className="mb-6 flex items-center gap-2.5 px-1">
        <svg viewBox="0 0 24 24" fill="#7b39fc" className="h-6 w-6">
          <path d="M1.04356 6.35771L13.6437 0.666504L23.3335 6.35771V17.6423L13.6437 23.3335L1.04356 17.6423V6.35771ZM12.5 4.2L4.5 8.5V15.5L12.5 19.8L20.5 15.5V8.5L12.5 4.2Z" />
        </svg>
        <span className="font-manrope text-[15px] font-bold tracking-tight text-white">
          Taskly
        </span>
      </div>

      <button className="mb-4 flex items-center justify-between rounded-xl border border-[#a484d7]/20 bg-[#7b39fc]/10 px-3 py-2 text-left transition-colors hover:bg-[#7b39fc]/20">
        <span className="flex items-center gap-2 text-[13px] font-semibold text-[#a67cff]">
          <Plus size={14} />
          Nuova pagina
        </span>
        <kbd className="rounded-md border border-[#a484d7]/25 bg-[#120d20] px-1.5 py-0.5 text-[9px] font-bold text-[#a67cff]">
          ⌘N
        </kbd>
      </button>

      <div className="flex-1 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className={`flex cursor-default items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium transition-colors ${
                item.active
                  ? "bg-[#7b39fc]/15 text-white shadow-[inset_2px_0_0_#7b39fc]"
                  : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
              }`}
            >
              <Icon size={15} className={item.active ? "text-[#a67cff]" : ""} />
              {item.label}
            </div>
          );
        })}

        <div className="px-3 pb-1 pt-5 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-600">
          Workspace
        </div>
        {SPACE_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="flex cursor-default items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium text-gray-400 transition-colors hover:bg-white/5 hover:text-gray-200"
            >
              <Icon size={15} />
              {item.label}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-[#2b2344]/60 bg-[#1a1528] p-2.5">
        <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[#7b39fc] to-[#5a1fd4] text-xs font-bold text-white">
          S
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[12px] font-semibold text-gray-200">
            Sofia Rossi
          </div>
          <div className="text-[10px] text-gray-500">Plan Pro</div>
        </div>
        <ChevronDown size={14} className="text-gray-500" />
      </div>
    </div>
  );
}

/* ── Stat card ───────────────────────────────────────────────────────── */

function StatCard({ stat, index }) {
  const Icon = stat.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="group rounded-2xl border border-[#a484d7]/12 bg-[#1a1528]/70 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#a484d7]/30 hover:shadow-lg hover:shadow-[#7b39fc]/10"
    >
      <div className="flex items-center justify-between">
        <div
          className="grid h-9 w-9 place-items-center rounded-xl"
          style={{ background: `${stat.color}1f`, color: stat.color }}
        >
          <Icon size={17} />
        </div>
        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
          {stat.delta}
        </span>
      </div>
      <div className="mt-3 font-instrument-serif text-[26px] leading-none text-white">
        <CountUp value={stat.value} suffix={stat.suffix} />
      </div>
      <div className="mt-1 text-[11px] font-medium text-gray-500">
        {stat.label}
      </div>
    </motion.div>
  );
}

/* ── View: Dashboard (task list + AI panel) ──────────────────────────── */

function TasksView() {
  const [todos, setTodos] = useState(TODOS);

  const toggle = (id) =>
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );

  const doneCount = todos.filter((t) => t.done).length;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      {/* Today's tasks */}
      <div className="rounded-2xl border border-[#a484d7]/12 bg-[#1a1528]/70 p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h4 className="font-cabin text-[13px] font-bold uppercase tracking-[0.14em] text-[#a67cff]">
              Oggi
            </h4>
            <p className="mt-0.5 text-[12px] text-gray-500">
              {doneCount} di {todos.length} completati
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button className="grid h-8 w-8 place-items-center rounded-lg border border-[#a484d7]/20 text-gray-400 transition-colors hover:bg-[#7b39fc]/15 hover:text-[#a67cff]">
              <ListChecks size={14} />
            </button>
            <button className="grid h-8 w-8 place-items-center rounded-lg border border-[#a484d7]/20 text-gray-400 transition-colors hover:bg-[#7b39fc]/15 hover:text-[#a67cff]">
              <KanbanSquare size={14} />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-[#2b2344]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#7b39fc] to-[#a67cff]"
            initial={{ width: 0 }}
            whileInView={{ width: `${(doneCount / todos.length) * 100}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        <div className="space-y-2">
          {todos.map((todo) => (
            <motion.button
              key={todo.id}
              type="button"
              onClick={() => toggle(todo.id)}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35 }}
              className={`group flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200 ${
                todo.done
                  ? "border-[#a484d7]/8 bg-[#120d20]/60 opacity-60"
                  : "border-[#a484d7]/12 bg-[#221c3a]/60 hover:border-[#a484d7]/30 hover:bg-[#2b2344]/70"
              }`}
            >
              {todo.done ? (
                <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
              ) : (
                <Circle
                  size={18}
                  className="shrink-0 text-gray-500 transition-colors group-hover:text-[#a67cff]"
                />
              )}
              <div className="min-w-0 flex-1">
                <div
                  className={`truncate text-[13px] font-medium text-gray-200 ${
                    todo.done ? "line-through decoration-gray-600" : ""
                  }`}
                >
                  {todo.title}
                </div>
                <div className="mt-0.5 flex items-center gap-2">
                  <span
                    className="rounded-md px-1.5 py-0.5 text-[10px] font-bold"
                    style={{
                      background: `${todo.tagColor}1c`,
                      color: todo.tagColor,
                    }}
                  >
                    {todo.tag}
                  </span>
                  <span className="text-[10px] text-gray-600">{todo.time}</span>
                </div>
              </div>
              <MoreHorizontal
                size={15}
                className="shrink-0 text-gray-600 opacity-0 transition-opacity group-hover:opacity-100"
              />
            </motion.button>
          ))}
        </div>

        <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#a484d7]/25 py-2.5 text-[12px] font-semibold text-gray-500 transition-colors hover:border-[#a67cff]/50 hover:text-[#a67cff]">
          <Plus size={14} />
          Aggiungi task
        </button>
      </div>

      {/* AI panel */}
      <div className="flex flex-col overflow-hidden rounded-2xl border border-[#7b39fc]/25 bg-gradient-to-b from-[#221c3a]/80 to-[#120d20]/90">
        <div className="flex items-center gap-2 border-b border-[#a484d7]/12 px-4 py-3">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-[#7b39fc] text-white">
            <Bot size={15} />
          </div>
          <div className="flex-1">
            <div className="text-[12px] font-bold text-white">Assistente AI</div>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Online
            </div>
          </div>
          <Sparkles size={15} className="text-[#a67cff]" />
        </div>

        <div className="flex-1 space-y-3 p-4">
          {AI_MESSAGES.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.15 }}
              className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[90%] rounded-2xl px-3 py-2 text-[12px] leading-relaxed ${
                  msg.from === "user"
                    ? "rounded-br-sm bg-[#7b39fc] text-white"
                    : "rounded-bl-sm bg-[#2b2344]/70 text-gray-300"
                }`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}

          <div className="space-y-1.5 pt-1">
            {AI_SUGGESTIONS.map((s, i) => (
              <motion.button
                key={s}
                type="button"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.9 + i * 0.12 }}
                className="flex w-full items-center gap-2 rounded-xl border border-[#a484d7]/20 bg-[#120d20]/70 px-3 py-2 text-left text-[11px] font-medium text-gray-400 transition-all hover:border-[#a67cff]/50 hover:text-[#a67cff]"
              >
                <Sparkles size={12} className="shrink-0 text-[#a67cff]" />
                {s}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="border-t border-[#a484d7]/12 p-3">
          <div className="flex items-center gap-2 rounded-xl border border-[#a484d7]/15 bg-[#120d20] px-3 py-2">
            <input
              readOnly
              placeholder="Chiedi a Taskly…"
              className="min-w-0 flex-1 bg-transparent text-[12px] text-gray-300 placeholder-gray-600 outline-none"
            />
            <Send size={14} className="text-[#a67cff]" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── View: Kanban ────────────────────────────────────────────────────── */

function KanbanView() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {KANBAN.map((col, ci) => (
        <motion.div
          key={col.column}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: ci * 0.08, duration: 0.4 }}
          className="rounded-2xl border border-[#a484d7]/10 bg-[#120d20]/60 p-3"
        >
          <div className="mb-3 flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: col.color }}
              />
              <span className="text-[12px] font-bold text-gray-300">
                {col.column}
              </span>
              <span className="rounded-md bg-[#2b2344] px-1.5 py-0.5 text-[10px] font-bold text-gray-500">
                {col.cards.length}
              </span>
            </div>
            <Plus size={13} className="text-gray-600" />
          </div>

          <div className="space-y-2">
            {col.cards.map((card) => (
              <motion.div
                key={card.title}
                whileHover={{ y: -3, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                className="group cursor-default rounded-xl border border-[#a484d7]/12 bg-[#221c3a]/70 p-3 transition-colors hover:border-[#a484d7]/35"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[12px] font-semibold leading-snug text-gray-200">
                    {card.title}
                  </span>
                  <MoreHorizontal
                    size={13}
                    className="mt-0.5 shrink-0 text-gray-600 opacity-0 transition-opacity group-hover:opacity-100"
                  />
                </div>
                <div className="mt-2.5 flex items-center justify-between">
                  <span className="rounded-md bg-[#7b39fc]/12 px-1.5 py-0.5 text-[10px] font-bold text-[#a67cff]">
                    {card.tag}
                  </span>
                  <span
                    className={`text-[10px] font-semibold ${
                      card.priority === "Alta"
                        ? "text-rose-400"
                        : card.priority === "Media"
                          ? "text-amber-400"
                          : "text-gray-500"
                    }`}
                  >
                    {card.priority}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ── View: Calendar ──────────────────────────────────────────────────── */

function CalendarView() {
  const today = 3; // Wednesday
  return (
    <div className="rounded-2xl border border-[#a484d7]/12 bg-[#1a1528]/70 p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h4 className="font-cabin text-[13px] font-bold uppercase tracking-[0.14em] text-[#a67cff]">
            Ottobre 2026
          </h4>
          <p className="mt-0.5 text-[12px] text-gray-500">
            La tua settimana, a colpo d&apos;occhio
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button className="grid h-8 w-8 place-items-center rounded-lg border border-[#a484d7]/20 text-gray-400 transition-colors hover:bg-[#7b39fc]/15 hover:text-[#a67cff]">
            <ChevronRight size={14} className="rotate-180" />
          </button>
          <button className="grid h-8 w-8 place-items-center rounded-lg border border-[#a484d7]/20 text-gray-400 transition-colors hover:bg-[#7b39fc]/15 hover:text-[#a67cff]">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {CAL_WEEK.map((day, i) => {
          const events = WEEK_EVENTS[i + 1] || [];
          const isToday = i + 1 === today;
          return (
            <motion.div
              key={day}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className={`flex min-h-[110px] flex-col rounded-xl border p-2 transition-colors ${
                isToday
                  ? "border-[#7b39fc]/50 bg-[#7b39fc]/10"
                  : "border-[#a484d7]/10 bg-[#120d20]/50 hover:border-[#a484d7]/25"
              }`}
            >
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500">
                  {day}
                </span>
                <span
                  className={`grid h-5 w-5 place-items-center rounded-md text-[10px] font-bold ${
                    isToday ? "bg-[#7b39fc] text-white" : "text-gray-400"
                  }`}
                >
                  {i + 1 + 7}
                </span>
              </div>
              <div className="space-y-1 overflow-hidden">
                {events.map((ev) => (
                  <div
                    key={ev}
                    className="truncate rounded-md bg-[#7b39fc]/15 px-1.5 py-1 text-[9px] font-medium text-[#c9b0ff]"
                  >
                    {ev}
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Main showcase ───────────────────────────────────────────────────── */

const TABS = [
  { id: "overview", label: "Panoramica", icon: BarChart3 },
  { id: "kanban", label: "Kanban", icon: KanbanSquare },
  { id: "calendar", label: "Calendario", icon: CalendarDays },
];

export default function DashboardShowcase() {
  const [tab, setTab] = useState("overview");

  return (
    <section className="landing-section relative overflow-hidden px-4 py-20 sm:px-6 sm:py-28">
      {/* Ambient purple glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-[#7b39fc]/12 blur-[140px]" />
        <div className="absolute bottom-0 right-[-100px] h-[400px] w-[500px] rounded-full bg-[#5a1fd4]/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        {/* Section header */}
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="landing-eyebrow"
          >
            <Sparkles size={13} />
            Una dashboard, tutto il tuo lavoro
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="landing-heading-lg mt-3"
          >
            Il tuo workspace, <span className="landing-display-accent">in tempo reale</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="landing-body mx-auto mt-4 max-w-xl"
          >
            Task, obiettivi, calendario e note vivono nella stessa pagina.
            Esplora la demo: spunta i task, cambia vista e parla con l&apos;assistente AI.
          </motion.p>
        </div>

        {/* Browser frame */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative mt-12"
        >
          {/* Glow behind frame */}
          <div className="absolute -inset-3 rounded-[28px] bg-gradient-to-b from-[#7b39fc]/25 via-[#a67cff]/10 to-transparent blur-lg" />

          <div className="relative overflow-hidden rounded-2xl border border-[#a484d7]/20 bg-[#0d0a1a] shadow-2xl shadow-black/60">
            {/* Window chrome */}
            <div className="flex items-center gap-3 border-b border-[#2b2344]/60 bg-[#120d20] px-4 py-2.5">
              <div className="flex items-center gap-1.5" aria-hidden="true">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              </div>
              <div className="mx-auto flex min-w-0 items-center gap-2 rounded-lg border border-[#2b2344]/70 bg-[#0d0a1a] px-3 py-1 text-[11px] text-gray-500">
                <Globe size={11} className="shrink-0 text-[#7b39fc]" />
                <span className="truncate">app.taskly.io/dashboard</span>
              </div>
              <div className="flex items-center gap-1.5" aria-hidden="true">
                <Search size={13} className="text-gray-600" />
                <Bell size={13} className="text-gray-600" />
              </div>
            </div>

            {/* App body */}
            <div className="flex h-[520px] max-h-[70vh] min-h-[440px]">
              <MockSidebar />

              <div className="flex min-w-0 flex-1 flex-col">
                {/* App topbar */}
                <div className="flex items-center justify-between border-b border-[#2b2344]/60 px-4 py-2.5 sm:px-5">
                  <div className="flex items-center gap-2.5">
                    <button className="grid h-8 w-8 place-items-center rounded-lg border border-[#a484d7]/20 text-gray-500 transition-colors hover:bg-[#7b39fc]/15 hover:text-[#a67cff] md:hidden">
                      <PanelLeft size={14} />
                    </button>
                    <div>
                      <div className="text-[13px] font-bold text-white">
                        Buongiorno, Sofia 👋
                      </div>
                      <div className="hidden text-[10px] text-gray-500 sm:block">
                        Giovedì, 8 ottobre
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="hidden items-center gap-2 rounded-lg border border-[#a484d7]/15 bg-[#120d20] px-2.5 py-1.5 sm:flex">
                      <Search size={12} className="text-gray-600" />
                      <span className="text-[11px] text-gray-500">
                        Cerca (⌘K)
                      </span>
                    </div>
                    <button className="grid h-8 w-8 place-items-center rounded-lg border border-[#a484d7]/20 text-gray-500 transition-colors hover:bg-[#7b39fc]/15 hover:text-[#a67cff] sm:hidden">
                      <Search size={14} />
                    </button>
                    <button className="relative grid h-8 w-8 place-items-center rounded-lg border border-[#a484d7]/20 text-gray-500 transition-colors hover:bg-[#7b39fc]/15 hover:text-[#a67cff]">
                      <Bell size={14} />
                      <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#7b39fc]" />
                    </button>
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[#7b39fc] to-[#5a1fd4] text-[11px] font-bold text-white">
                      S
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                  {/* Stats */}
                  <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {STATS.map((stat, i) => (
                      <StatCard key={stat.label} stat={stat} index={i} />
                    ))}
                  </div>

                  {/* Tab switcher */}
                  <div className="mb-4 flex items-center gap-1 rounded-xl border border-[#a484d7]/12 bg-[#120d20]/70 p-1">
                    {TABS.map((t) => {
                      const Icon = t.icon;
                      const active = tab === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setTab(t.id)}
                          className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-semibold transition-colors ${
                            active
                              ? "text-white"
                              : "text-gray-500 hover:text-gray-300"
                          }`}
                        >
                          {active && (
                            <motion.span
                              layoutId="showcase-tab"
                              className="absolute inset-0 rounded-lg bg-[#7b39fc]/20"
                              transition={{ type: "spring", stiffness: 400, damping: 32 }}
                            />
                          )}
                          <Icon size={13} className="relative z-10" />
                          <span className="relative z-10 hidden sm:inline">
                            {t.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Animated views */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={tab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                      {tab === "overview" && <TasksView />}
                      {tab === "kanban" && <KanbanView />}
                      {tab === "calendar" && <CalendarView />}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          {/* Floating badges */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 18 }}
            className="absolute -right-3 top-24 hidden items-center gap-2 rounded-2xl border border-[#a484d7]/20 bg-[#1a1528]/95 px-4 py-3 shadow-xl shadow-black/40 backdrop-blur lg:flex"
          >
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500/15 text-emerald-400">
              <TrendingUp size={17} />
            </div>
            <div>
              <div className="text-[13px] font-bold text-white">+27% produttività</div>
              <div className="text-[10px] text-gray-500">dopo 2 settimane</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.65, type: "spring", stiffness: 260, damping: 18 }}
            className="absolute -left-3 bottom-24 hidden items-center gap-2 rounded-2xl border border-[#a484d7]/20 bg-[#1a1528]/95 px-4 py-3 shadow-xl shadow-black/40 backdrop-blur lg:flex"
          >
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#7b39fc]/15 text-[#a67cff]">
              <Sparkles size={17} />
            </div>
            <div>
              <div className="text-[13px] font-bold text-white">AI che lavora con te</div>
              <div className="text-[10px] text-gray-500">suggerimenti contestuali</div>
            </div>
          </motion.div>
        </motion.div>

        {/* CTA under the mockup */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-12 flex flex-col items-center gap-4 text-center"
        >
          <p className="max-w-md text-sm text-gray-500">
            Questa è solo un&apos;anteprima. Il tuo workspace è personale, sincronizzato e pronto in 30 secondi.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/register" className="landing-btn-primary">
              Prova Taskly gratis
              <ArrowUpRight size={17} />
            </Link>
            <button
              type="button"
              onClick={() => {
                document
                  .getElementById("demo")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="landing-btn-secondary"
            >
              Guarda il video demo
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
