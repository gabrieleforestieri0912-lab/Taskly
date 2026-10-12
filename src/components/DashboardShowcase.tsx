"use client";

import { useState, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion";
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
import { useLanguage } from "../lib/LanguageContext";

/* ── Shared bits (icons only; labels via t()) ─────────────────────────── */

const NAV_ICONS = [
  LayoutDashboard,
  ListTodo,
  Target,
  Calendar,
  FileText,
  Lightbulb,
];

const SPACE_ICONS = [BookOpen, Users, Rocket];

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
  const { t } = useLanguage();
  const NAV_ITEMS = [
    { icon: NAV_ICONS[0], label: t("land.mockNavDashboard"), active: true },
    { icon: NAV_ICONS[1], label: t("land.mockNavTask") },
    { icon: NAV_ICONS[2], label: t("land.mockNavGoals") },
    { icon: NAV_ICONS[3], label: t("land.mockNavCalendar") },
    { icon: NAV_ICONS[4], label: t("land.mockNavNotes") },
    { icon: NAV_ICONS[5], label: t("land.mockNavIdeas") },
  ];
  const SPACE_ITEMS = [
    { icon: SPACE_ICONS[0], label: t("land.mockSpaceReadings") },
    { icon: SPACE_ICONS[1], label: t("land.mockSpaceTeam") },
    { icon: SPACE_ICONS[2], label: t("land.mockSpaceLaunch") },
  ];
  return (
    <div className="hidden h-full w-56 shrink-0 flex-col border-r border-[#2b2344]/60 bg-[#120d20]/95 p-4 md:flex">
      <div className="mb-6 flex items-center gap-2.5 px-1">
        <svg viewBox="0 0 24 24" fill="#7b39fc" className="h-6 w-6">
          <path d="M1.04356 6.35771L13.6437 0.666504L23.3335 6.35771V17.6423L13.6437 23.3335L1.04356 17.6423V6.35771ZM12.5 4.2L4.5 8.5V15.5L12.5 19.8L20.5 15.5V8.5L12.5 4.2Z" />
        </svg>
        <span className="font-inter text-[15px] font-bold tracking-tight text-white">
          Taskly
        </span>
      </div>

      <button className="mb-4 flex items-center justify-between rounded-xl border border-[#a484d7]/20 bg-[#7b39fc]/10 px-3 py-2 text-left transition-colors hover:bg-[#7b39fc]/20">
        <span className="flex items-center gap-2 text-[13px] font-semibold text-[#a67cff]">
          <Plus size={14} />
          {t("land.mockNewPage")}
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
          {t("land.mockWorkspace")}
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
          <div className="text-[10px] text-gray-500">{t("land.mockPlanPro")}</div>
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
      <div className="mt-3 font-instrument-serif text-[26px] leading-none tracking-[-0.01em] text-white">
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
  const { t } = useLanguage();
  const TODOS = [
    { id: 1, title: t("land.mockTodo1Title"), tag: t("land.mockTagWork"), tagColor: "#7b39fc", time: "09:30", done: false },
    { id: 2, title: t("land.mockTodo2Title"), tag: t("land.mockTagProject"), tagColor: "#a67cff", time: "11:00", done: true },
    { id: 3, title: t("land.mockTodo3Title"), tag: t("land.mockTagHealth"), tagColor: "#5a1fd4", time: "18:00", done: false },
    { id: 4, title: t("land.mockTodo4Title"), tag: t("land.mockTagGrowth"), tagColor: "#8b4dff", time: "21:30", done: false },
  ];
  const AI_SUGGESTIONS = [
    t("land.mockAiSuggestion1"),
    t("land.mockAiSuggestion2"),
    t("land.mockAiSuggestion3"),
  ];
  const AI_MESSAGES = [
    { from: "ai", text: t("land.mockAiMsg1") },
    { from: "user", text: t("land.mockAiMsg2") },
    { from: "ai", text: t("land.mockAiMsg3") },
  ];
  const [todos, setTodos] = useState(TODOS);

  const toggle = (id) =>
    setTodos((prev) =>
      prev.map((td) => (td.id === id ? { ...td, done: !td.done } : td)),
    );

  const doneCount = todos.filter((td) => td.done).length;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      {/* Today's tasks */}
      <div className="rounded-2xl border border-[#a484d7]/12 bg-[#1a1528]/70 p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h4 className="font-inter text-[13px] font-bold uppercase tracking-[0.14em] text-[#a67cff]">
              {t("land.mockToday")}
            </h4>
            <p className="mt-0.5 text-[12px] text-gray-500">
              {t("land.mockProgressDone").replace("{done}", String(doneCount)).replace("{total}", String(todos.length))}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button aria-label={t("land.showcaseTabOverview")} className="grid h-8 w-8 place-items-center rounded-lg border border-[#a484d7]/20 text-gray-400 transition-colors hover:bg-[#7b39fc]/15 hover:text-[#a67cff]">
              <ListChecks size={14} />
            </button>
            <button aria-label={t("land.showcaseTabKanban")} className="grid h-8 w-8 place-items-center rounded-lg border border-[#a484d7]/20 text-gray-400 transition-colors hover:bg-[#7b39fc]/15 hover:text-[#a67cff]">
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
          {t("land.mockAddTask")}
        </button>
      </div>

      {/* AI panel */}
      <div className="flex flex-col overflow-hidden rounded-2xl border border-[#7b39fc]/25 bg-gradient-to-b from-[#221c3a]/80 to-[#120d20]/90">
        <div className="flex items-center gap-2 border-b border-[#a484d7]/12 px-4 py-3">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-[#7b39fc] text-white">
            <Bot size={15} />
          </div>
          <div className="flex-1">
            <div className="text-[12px] font-bold text-white">{t("land.mockAiTitle")}</div>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {t("land.mockAiOnline")}
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
              placeholder={t("land.mockAiPlaceholder")}
              aria-label={t("land.mockAiPlaceholder")}
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
  const { t } = useLanguage();
  const KANBAN = [
    {
      column: t("land.mockColTodo"),
      color: "#8b4dff",
      cards: [
        { title: t("land.mockCardRoadmap"), tag: t("land.mockTagStrategy"), priority: t("land.mockPrioHigh") },
        { title: t("land.mockCardTickets"), tag: t("land.mockTagSupport"), priority: t("land.mockPrioMedium") },
      ],
    },
    {
      column: t("land.mockColDoing"),
      color: "#7b39fc",
      cards: [
        { title: t("land.mockCardKanban"), tag: t("land.mockTagDev"), priority: t("land.mockPrioHigh") },
        { title: t("land.mockCardCopy"), tag: t("land.mockTagMarketing"), priority: t("land.mockPrioMedium") },
        { title: t("land.mockCardCalIntegration"), tag: t("land.mockTagDev"), priority: t("land.mockPrioLow") },
      ],
    },
    {
      column: t("land.mockColReview"),
      color: "#a67cff",
      cards: [
        { title: t("land.mockCardDesignReview"), tag: t("land.mockTagDesign"), priority: t("land.mockPrioHigh") },
      ],
    },
    {
      column: t("land.mockColDone"),
      color: "#22c55e",
      cards: [
        { title: t("land.mockCardOnboarding"), tag: t("land.mockTagProduct"), priority: t("land.mockPrioMedium") },
        { title: t("land.mockCardMarketing"), tag: t("land.mockTagMarketing"), priority: t("land.mockPrioLow") },
      ],
    },
  ];
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
                      card.priority === t("land.mockPrioHigh")
                        ? "text-rose-400"
                        : card.priority === t("land.mockPrioMedium")
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

function ShowcaseCalendarView() {
  const { t } = useLanguage();
  const today = 3; // Wednesday
  const CAL_WEEK = [
    t("land.mockDayMon"), t("land.mockDayTue"), t("land.mockDayWed"),
    t("land.mockDayThu"), t("land.mockDayFri"), t("land.mockDaySat"), t("land.mockDaySun"),
  ];
  const WEEK_EVENTS = {
    1: [t("land.mockEventReview")],
    3: [t("land.mockEventStandup"), t("land.mockEventCall")],
    5: [t("land.mockEventDesign")],
    6: [t("land.mockEventGym")],
  };
  return (
    <div className="rounded-2xl border border-[#a484d7]/12 bg-[#1a1528]/70 p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h4 className="font-inter text-[13px] font-bold uppercase tracking-[0.14em] text-[#a67cff]">
            {t("land.mockCalMonth")}
          </h4>
          <p className="mt-0.5 text-[12px] text-gray-500">
            {t("land.mockCalSubtitle")}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button aria-label={t("land.navMenu")} className="grid h-8 w-8 place-items-center rounded-lg border border-[#a484d7]/20 text-gray-400 transition-colors hover:bg-[#7b39fc]/15 hover:text-[#a67cff]">
            <ChevronRight size={14} className="rotate-180" />
          </button>
          <button aria-label={t("land.navMenu")} className="grid h-8 w-8 place-items-center rounded-lg border border-[#a484d7]/20 text-gray-400 transition-colors hover:bg-[#7b39fc]/15 hover:text-[#a67cff]">
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

export default function DashboardShowcase() {
  const { t } = useLanguage();
  const [tab, setTab] = useState("overview");

  const TABS = [
    { id: "overview", label: t("land.showcaseTabOverview"), icon: BarChart3 },
    { id: "kanban", label: t("land.showcaseTabKanban"), icon: KanbanSquare },
    { id: "calendar", label: t("land.showcaseTabCalendar"), icon: CalendarDays },
  ];

  const STATS = [
    { icon: CheckCircle2, label: t("land.mockStatCompleted"), value: 24, suffix: "", delta: "+12%", color: "#7b39fc" },
    { icon: Flame, label: t("land.mockStatStreak"), value: 12, suffix: "", delta: "🔥", color: "#a67cff" },
    { icon: Zap, label: t("land.mockStatProductivity"), value: 87, suffix: "%", delta: "+6%", color: "#8b4dff" },
    { icon: Clock, label: t("land.mockStatFocusHours"), value: 31, suffix: "h", delta: t("land.mockStatLastWeek"), color: "#c4a6ff" },
  ];

  const tiltRef = useRef<HTMLDivElement | null>(null);
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const springTiltX = useSpring(tiltX, { stiffness: 160, damping: 20 });
  const springTiltY = useSpring(tiltY, { stiffness: 160, damping: 20 });

  const handleTilt = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = tiltRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    tiltY.set(px * 5);
    tiltX.set(-py * 5);
  };

  const resetTilt = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  return (
    <section className="landing-section relative overflow-hidden px-4 py-20 sm:px-6 sm:py-28">
      {/* Ambient purple glow */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          style={{ x: "-50%" }}
          initial={{ opacity: 0.4, scale: 0.85 }}
          animate={{ opacity: [0.4, 0.95, 0.4], scale: [0.85, 1.18, 0.85] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-1/2 top-0 h-[500px] w-[900px] rounded-full bg-[#7b39fc]/12 blur-[140px]"
        />
        <motion.div
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-0 right-[-100px] h-[400px] w-[500px] rounded-full bg-[#5a1fd4]/10 blur-[120px]"
        />
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
            {t("land.showcaseEyebrow")}
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="landing-heading-lg mt-3"
          >
            {t("land.showcaseTitlePrefix")} <span className="landing-display-accent">{t("land.showcaseTitleAccent")}</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="landing-body mx-auto mt-4 max-w-xl"
          >
            {t("land.showcaseSubtitle")}
          </motion.p>
        </div>

        {/* Browser frame */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative mt-12"
          style={{ perspective: 1400 }}
        >
          {/* Glow behind frame */}
          <div className="absolute -inset-3 rounded-[28px] bg-gradient-to-b from-[#7b39fc]/25 via-[#a67cff]/10 to-transparent blur-lg" />

          <motion.div
            ref={tiltRef}
            onMouseMove={handleTilt}
            onMouseLeave={resetTilt}
            style={{
              rotateX: springTiltX,
              rotateY: springTiltY,
              transformStyle: "preserve-3d",
            }}
            whileTap={{ scale: 0.995 }}
          >
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
            <div className="flex">
              <MockSidebar />

              <div className="flex min-w-0 flex-1 flex-col">
                {/* App topbar */}
                <div className="flex items-center justify-between border-b border-[#2b2344]/60 px-4 py-2.5 sm:px-5">
                  <div className="flex items-center gap-2.5">
                    <button aria-label={t("land.navMenu")} className="grid h-8 w-8 place-items-center rounded-lg border border-[#a484d7]/20 text-gray-500 transition-colors hover:bg-[#7b39fc]/15 hover:text-[#a67cff] md:hidden">
                      <PanelLeft size={14} />
                    </button>
                    <div>
                      <div className="text-[13px] font-bold text-white">
                        {t("land.mockGreeting")}
                      </div>
                      <div className="hidden text-[10px] text-gray-500 sm:block">
                        {t("land.mockDateSub")}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="hidden items-center gap-2 rounded-lg border border-[#a484d7]/15 bg-[#120d20] px-2.5 py-1.5 sm:flex">
                      <Search size={12} className="text-gray-600" />
                      <span className="text-[11px] text-gray-500">
                        {t("land.mockSearchHint")}
                      </span>
                    </div>
                    <button aria-label={t("land.mockSearchHint")} className="grid h-8 w-8 place-items-center rounded-lg border border-[#a484d7]/20 text-gray-500 transition-colors hover:bg-[#7b39fc]/15 hover:text-[#a67cff] sm:hidden">
                      <Search size={14} />
                    </button>
                    <button aria-label={t("land.mockSearchHint")} className="relative grid h-8 w-8 place-items-center rounded-lg border border-[#a484d7]/20 text-gray-500 transition-colors hover:bg-[#7b39fc]/15 hover:text-[#a67cff]">
                      <Bell size={14} />
                      <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#7b39fc]" />
                    </button>
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[#7b39fc] to-[#5a1fd4] text-[11px] font-bold text-white">
                      S
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-4 sm:p-5">
                  {/* Stats */}
                  <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {STATS.map((stat, i) => (
                      <StatCard key={stat.label} stat={stat} index={i} />
                    ))}
                  </div>

                  {/* Tab switcher */}
                  <div className="mb-4 flex items-center gap-1 rounded-xl border border-[#a484d7]/12 bg-[#120d20]/70 p-1">
                    {TABS.map((tb) => {
                      const Icon = tb.icon;
                      const active = tab === tb.id;
                      return (
                        <button
                          key={tb.id}
                          type="button"
                          onClick={() => setTab(tb.id)}
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
                            {tb.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Animated views */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={tab}
                      initial={{ opacity: 0, y: 14, scale: 0.99 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.99 }}
                      transition={{ type: "spring", stiffness: 340, damping: 30 }}
                    >
                      {tab === "overview" && <TasksView />}
                      {tab === "kanban" && <KanbanView />}
                      {tab === "calendar" && <ShowcaseCalendarView />}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          {/* Floating badges */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
            className="absolute -right-3 top-24 hidden lg:block"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 18 }}
              className="flex items-center gap-2 rounded-2xl border border-[#a484d7]/20 bg-[#1a1528]/95 px-4 py-3 shadow-xl shadow-black/40 backdrop-blur"
            >
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500/15 text-emerald-400">
                <TrendingUp size={17} />
              </div>
              <div>
                <div className="text-[13px] font-bold text-white">{t("land.mockBadge1Title")}</div>
                <div className="text-[10px] text-gray-500">{t("land.mockBadge1Sub")}</div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
            className="absolute -left-3 bottom-24 hidden lg:block"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.65, type: "spring", stiffness: 260, damping: 18 }}
              className="flex items-center gap-2 rounded-2xl border border-[#a484d7]/20 bg-[#1a1528]/95 px-4 py-3 shadow-xl shadow-black/40 backdrop-blur"
            >
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#7b39fc]/15 text-[#a67cff]">
                <Sparkles size={17} />
              </div>
              <div>
                <div className="text-[13px] font-bold text-white">{t("land.mockBadge2Title")}</div>
                <div className="text-[10px] text-gray-500">{t("land.mockBadge2Sub")}</div>
              </div>
            </motion.div>
          </motion.div>
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
            {t("land.showcasePreviewNote")}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/register" className="landing-btn-primary">
              {t("land.showcaseCtaPrimary")}
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
              {t("land.showcaseCtaSecondary")}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
