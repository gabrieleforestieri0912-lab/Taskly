"use client";

import React from "react";
import Link from "next/link";
import {
  ChevronLeft,
  FileText,
  LayoutDashboard,
  ListTodo,
  Lightbulb,
  Target,
  Send,
  Sliders,
  User,
  X,
  Inbox,
  Plus,
  CheckSquare,
  Eye,
  Mic,
  Star,
  MoreHorizontal,
  Calendar,
  Search,
  Sparkles,
  Upload,
  ArrowUpRight,
  Download,
  Globe,
} from "lucide-react";
import { Badge } from "./UIComponents";
import { useLanguage } from "../lib/LanguageContext";
import {
  AiInsightsWidget,
  CriticalTasksWidget,
  DashboardHeader,
  GoalProgressWidget,
  QuickNavWidget,
  QuickStatsWidget,
  RecentIdeasWidget,
  TodayFocusWidget,
  ToolsPanel,
  ToolsResourcesWidget,
  WeeklyTrendWidget,
} from "./dashboard/widgets";
import { formatRelativeTime } from "../lib/formatRelative";

/* ── Dati di esempio ──────────────────────────────────────────────────── */

const DEMO_TASKS = [
  {
    id: "d1",
    title: "Rivedere proposta commerciale Alpha",
    priority: "Alta",
    status: "in_progress",
    deadline: "Oggi",
  },
  {
    id: "d2",
    title: "Invio preventivo a Beta Srl",
    priority: "Alta",
    status: "todo",
    deadline: "Domani",
  },
  {
    id: "d3",
    title: "Aggiornare landing v3.2",
    priority: "Alta",
    status: "todo",
    deadline: "12 Mar",
  },
  {
    id: "d4",
    title: "Refactor auth middleware",
    priority: "Media",
    status: "in_progress",
    deadline: "14 Mar",
  },
  {
    id: "d5",
    title: "Script snapshot DB",
    priority: "Bassa",
    status: "todo",
    deadline: "18 Mar",
  },
  {
    id: "d6",
    title: "Setup schema Supabase",
    priority: "Media",
    status: "done",
  },
  {
    id: "d7",
    title: "Test vitest core",
    priority: "Media",
    status: "done",
  },
  {
    id: "d8",
    title: "Briefing team lunedì",
    priority: "Bassa",
    status: "done",
  },
];

const DEMO_GOALS = [
  {
    id: "g1",
    title: "Lanciare la board Kanban",
    completed: false,
    subGoals: [
      { completed: true },
      { completed: true },
      { completed: true },
      { completed: false },
    ],
  },
  {
    id: "g2",
    title: "Raggiungere 100 utenti attivi",
    completed: false,
    subGoals: [{ completed: true }, { completed: false }, { completed: false }],
  },
  {
    id: "g3",
    title: "Migrare su Taskly",
    completed: true,
    subGoals: [{ completed: true }, { completed: true }],
  },
];

const DEMO_IDEAS = [
  { id: "i1", title: "Template per sprint retro", category: "Produttività" },
  { id: "i2", title: "Sincronizza Google Calendar", category: "Integrazione" },
  { id: "i3", title: "Weekly digest via email", category: "Comunicazione" },
];

// `demoUpdatedAt` is a fixed ISO instant chosen so the relative labels read
// naturally ("4 min fa", "26 h fa", "6 g fa"). It is passed through the same
// formatter the real sidebar uses, so the wording matches exactly.
const DEMO_NOW = "2026-10-06T14:30:00.000Z";

function demoUpdatedAt(minutesBefore: number) {
  return new Date(
    new Date(DEMO_NOW).getTime() - minutesBefore * 60_000,
  ).toISOString();
}

const DEMO_PAGES = [
  {
    id: "p1",
    label: "Roadmap Q4",
    iconColor: "text-[#7b39fc]",
    isFavorite: true,
    demoUpdatedAt: demoUpdatedAt(4),
  },
  {
    id: "p2",
    label: "Riunioni",
    iconColor: "text-cyan-600",
    isFavorite: false,
    demoUpdatedAt: demoUpdatedAt(95),
  },
  {
    id: "p3",
    label: "Clienti",
    iconColor: "text-rose-500",
    isFavorite: true,
    demoUpdatedAt: demoUpdatedAt(60 * 26),
  },
  {
    id: "p4",
    label: "Letture",
    iconColor: "text-amber-500",
    isFavorite: false,
    demoUpdatedAt: demoUpdatedAt(60 * 24 * 6),
  },
];

const TREND = [
  { day: "Lun", val: 80, count: 4 },
  { day: "Mar", val: 100, count: 6 },
  { day: "Mer", val: 45, count: 2 },
  { day: "Gio", val: 90, count: 5 },
  { day: "Ven", val: 63, count: 3 },
  { day: "Sab", val: 30, count: 1 },
  { day: "Dom", val: 60, count: 2 },
];

/* ── Sidebar ──────────────────────────────────────────────────────────── */

/**
 * One page row, mirroring the real PageTreeItem: star + last-modified on
 * hover, inline actions when the row is not hovered.
 */
function PreviewPageRow({
  page,
  language,
}: {
  page: (typeof DEMO_PAGES)[number];
  language: string;
}) {
  // Fixed offsets rather than Date.now() at render time: this must stay a
  // pure function of props, so the label never shifts between renders.
  const updated = formatRelativeTime(
    page.demoUpdatedAt,
    language,
    "",
  );

  return (
    <div
      className="group flex items-center rounded-lg text-sm font-medium relative h-7 select-none text-gray-600"
      style={{ paddingLeft: 6 }}
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded opacity-0 mr-0.5">
        <span className="text-gray-400 text-[10px]">›</span>
      </span>

      {/* Star: always visible once starred, as in the real sidebar */}
      {page.isFavorite && (
        <Star
          size={12}
          aria-hidden="true"
          fill="currentColor"
          className="shrink-0 mr-1 text-amber-400"
        />
      )}

      <span className="flex-1 flex items-center gap-2 py-1 pr-1 min-w-0 h-full overflow-hidden">
        <FileText
          size={15}
          aria-hidden="true"
          className={`${page.iconColor} shrink-0`}
        />
        <span className="truncate text-xs">{page.label}</span>
      </span>

      {/* Last modification, swapped out on hover like the real row */}
      <span className="shrink-0 pr-1.5 text-[9px] font-medium tabular-nums text-gray-400 opacity-0 transition-opacity group-hover:opacity-0">
        {updated}
      </span>

      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity pr-1.5 shrink-0">
        <span
          className={`p-1 rounded ${
            page.isFavorite
              ? "text-amber-400"
              : "text-gray-400"
          }`}
        >
          <Star
            size={13}
            aria-hidden="true"
            fill={page.isFavorite ? "currentColor" : "none"}
          />
        </span>
        <span className="p-1 rounded text-gray-400">
          <MoreHorizontal size={13} aria-hidden="true" />
        </span>
        <span className="p-1 rounded text-gray-400">
          <Plus size={13} aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}

function PreviewSidebar({
  t,
  language,
}: {
  t: (k: string, f?: string) => string;
  language: string;
}) {
  // Counts are derived from the DEMO_* arrays so the sidebar badges and the
  // stat cards can never drift apart.
  const activeTasks = DEMO_TASKS.filter((task) => task.status !== "done").length;
  const inbox = 3;

  // Mirrors SidebarQuickBar in the real sidebar (Sidebar.tsx).
  const quickItems = [
    { icon: Search, label: t("search") },
    { icon: LayoutDashboard, label: t("nav.home", "Home"), active: true },
    { icon: CheckSquare, label: t("nav.tasks", "Task"), badge: activeTasks },
    { icon: Inbox, label: t("nav.inbox", "Inbox"), badge: inbox },
    { icon: FileText, label: t("nav.empty", "Pagina vuota") },
    { icon: Mic, label: t("nav.transcription", "Trascrizione") },
    { icon: Send, label: t("nav.chat", "Chat") },
    { icon: Mic, label: t("nav.meetings", "Riunioni") },
    { icon: Calendar, label: t("nav.calendar", "Calendario") },
  ];

  const shell = (active?: boolean) =>
    [
      "flex flex-col items-center justify-center gap-1 rounded-xl px-1 py-2",
      active
        ? "bg-cyan-50 text-cyan-600"
        : "text-gray-600 hover:bg-gray-100/70",
    ].join(" ");

  return (
    <aside className="relative w-64 shrink-0 flex flex-col bg-white border-r border-gray-200/50">
      {/* Workspace header */}
      <div className="flex items-center px-3 pt-3 pb-1 gap-1">
        <span className="flex shrink-0 items-center gap-2 rounded-xl px-2.5 py-1.5">
          {/* Logo: replica statica di /taskly.png per non dipendere da next/image */}
          <span className="shrink-0 w-[26px] h-[26px] rounded-lg bg-gradient-to-br from-[#7b39fc] to-[#5a1fd4]" />
          <span className="font-inter text-[11px] font-bold text-gray-800">Taskly</span>
        </span>
        <span className="md:hidden p-1.5 rounded-xl text-gray-400">
          <ChevronLeft size={16} aria-hidden="true" />
        </span>
      </div>

      {/* Nav body */}
      <nav
        className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden px-2 pb-2"
        style={{ scrollbarWidth: "thin" }}
        aria-label="Navigazione principale"
      >
        <div role="list" aria-label="Azioni rapide">
          {/* Search row */}
          <div className="group flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600">
            <Search size={16} aria-hidden="true" className="shrink-0" />
            <span className="flex-1 truncate">{t("search")}</span>
          </div>

          <div className="mt-2 grid grid-cols-3 gap-1" role="list" aria-label="Azioni rapide">
            {quickItems.map((item) => {
              const Icon = item.icon;
              const inner = (
                <>
                  <span className="relative">
                    <Icon size={17} aria-hidden="true" className="shrink-0" />
                    {item.badge ? (
                      <span className="absolute -right-2.5 -top-1.5 min-w-[15px] px-1 text-center text-[9px] font-black leading-[15px] tabular-nums rounded-full bg-cyan-100 text-cyan-600">
                        {item.badge}
                      </span>
                    ) : null}
                  </span>
                  <span className="w-full truncate text-center text-[10px] font-semibold leading-tight">
                    {item.label}
                  </span>
                </>
              );
              return (
                <div key={item.label} className={shell(item.active)} aria-current={item.active ? "page" : undefined}>
                  {inner}
                </div>
              );
            })}
          </div>
        </div>

        {/* Google Calendar card */}
        <div className="mt-2 mb-2 px-1 select-none">
          <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-transparent p-3 backdrop-blur-sm shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-white shadow-xs flex items-center justify-center shrink-0 border border-black/5">
                  <Calendar size={14} className="text-[#4285F4]" aria-hidden="true" />
                </div>
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-xs font-bold text-gray-900 truncate">Google Calendar</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 text-[9px] font-black tracking-wider">
                    Sync
                  </span>
                </div>
              </div>
              <span className="text-gray-400">
                <ChevronLeft size={14} className="rotate-90" aria-hidden="true" />
              </span>
            </div>
            <div className="mt-2.5 pt-2 border-t border-blue-500/10 space-y-2">
              <p className="text-[11px] leading-relaxed text-gray-600 font-medium">
                Collega il tuo Google Calendar per sincronizzare scadenze, riunioni ed
                eventi direttamente nel tuo spazio di lavoro.
              </p>
              <div className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-sm">
                <Calendar size={13} />
                <span>Collega Google Calendar</span>
              </div>
            </div>
          </div>
        </div>

        {/* Preferiti — starred pages, most recently edited first */}
        <div className="mt-2">
          <div className="flex items-center px-3 h-6 mb-0.5">
            <span className="flex-1 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 select-none">
              <Star size={11} aria-hidden="true" className="text-amber-400" />
              {t("favorites", "Preferiti")}
            </span>
          </div>
          <ul className="space-y-0.5" role="list" aria-label={t("favorites", "Preferiti")}>
            {DEMO_PAGES.filter((page) => page.isFavorite).map((page) => (
              <li key={`fav-${page.id}`}>
                <PreviewPageRow page={page} language={language} />
              </li>
            ))}
          </ul>
        </div>

        <div className="my-2 border-t border-gray-100" />

        {/* Pages tree */}
        <div className="mt-3">
          <div className="flex items-center px-3 h-6 mb-0.5">
            <span className="flex-1 text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 select-none">
              {t("yourPages", "Privato")}
            </span>
            <span className="opacity-0 p-0.5 rounded-md text-gray-400">
              <Plus size={14} aria-hidden="true" />
            </span>
          </div>
          <ul className="space-y-0.5" role="tree" aria-label="Pagine private">
            {DEMO_PAGES.map((page) => (
              <li key={page.id}>
                <PreviewPageRow page={page} language={language} />
              </li>
            ))}
          </ul>
        </div>

        <div className="flex-1" />
      </nav>

      {/* Account row */}
      <div className="border-t border-gray-100 px-2 py-2 flex items-center gap-1.5">
        <div className="flex flex-1 items-center gap-2 px-2 py-1.5 rounded-lg min-w-0">
          <div className="w-6 h-6 bg-[#7b39fc]/10 rounded-full flex items-center justify-center shrink-0">
            <User size={13} aria-hidden="true" className="text-[#7b39fc]" />
          </div>
          <span className="flex-1 text-sm font-bold text-gray-800 truncate">Sofia Rossi</span>
          <span className="text-gray-400 shrink-0">
            <ChevronLeft size={14} className="rotate-180" aria-hidden="true" />
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-gray-500">
          <Sliders size={16} aria-hidden="true" className="shrink-0" />
          <span className="text-xs font-semibold">{t("nav.more", "Altro")}</span>
        </div>
      </div>
    </aside>
  );
}

/* ── Topbar ───────────────────────────────────────────────────────────── */

function PreviewTopbar() {
  return (
    <div className="sticky top-0 z-50 h-14 border-b border-gray-200/60 bg-white/80 backdrop-blur-xl px-3 flex items-center gap-3">
      <span className="shrink-0 p-2 text-gray-500 rounded-lg">
        <ChevronLeft size={18} className="rotate-180" aria-hidden="true" />
      </span>
      <div className="flex-1 flex items-center gap-2 overflow-x-auto min-w-0">
        <span className="inline-flex shrink-0 items-center gap-1.5 px-3 h-9 rounded-lg text-xs font-bold border border-cyan-200 bg-cyan-50 text-cyan-600">
          <LayoutDashboard size={14} className="shrink-0" />
          <span>Analitiche</span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-2 px-3 h-9 rounded-lg text-xs font-bold border border-gray-200 bg-white text-gray-600">
          <span>Roadmap Q4</span>
          <X size={12} className="shrink-0" />
        </span>
      </div>
      <div className="relative shrink-0 mr-1 p-2.5 rounded-2xl text-gray-500">
        <Inbox size={20} strokeWidth={2.5} aria-hidden="true" />
        <span className="absolute -right-0.5 -top-0.5 min-w-[16px] px-1 text-center text-[9px] font-black leading-4 tabular-nums rounded-full bg-cyan-100 text-cyan-600">
          {3}
        </span>
      </div>
    </div>
  );
}

/* ── Pannelli strumenti (versioni statiche, non interattive) ───────────── */

function StaticFileUploader() {
  return (
    <div className="flex flex-col h-full min-h-80">
      <div className="p-5 border-b border-gray-100">
        <h3 className="text-sm font-black uppercase tracking-widest text-gray-800 flex items-center gap-2">
          <Upload size={16} className="text-cyan-500" />
          Cloud File
        </h3>
      </div>
      <div className="flex-1 p-5 overflow-hidden space-y-3">
        <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-10">
          <Upload size={32} className="mb-2" />
          <p className="text-xs font-bold uppercase tracking-widest">Trascina qui i file</p>
          <p className="text-[10px] mt-1">oppure seleziona da computer</p>
        </div>
      </div>
      <div className="p-4 bg-gray-50/50 border-t border-gray-100">
        <div className="w-full py-2.5 px-4 bg-white border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-2">
          <Upload size={14} className="text-gray-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
            Seleziona file
          </span>
        </div>
      </div>
    </div>
  );
}

function StaticTemplateGallery() {
  const templates = ["Meeting Notes", "Project Plan", "Daily Journal"];
  return (
    <div className="flex flex-col h-full min-h-80">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-widest text-gray-800 flex items-center gap-2">
          <LayoutDashboard size={16} className="text-gray-400" />
          Template
        </h3>
        <Badge
          variant="default"
          className="bg-gray-100 text-gray-600 border-none"
        >
          4 disponibili
        </Badge>
      </div>
      <div className="flex-1 p-4 space-y-2 overflow-hidden">
        {templates.map((name) => (
          <div
            key={name}
            className="p-3 bg-gray-50/50 border border-gray-100 rounded-2xl"
          >
            <div className="text-[11px] font-black text-gray-700 truncate">{name}</div>
            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">
              Usa template
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StaticImportExport() {
  return (
    <div className="flex flex-col h-full min-h-80">
      <div className="p-5 border-b border-gray-100">
        <h3 className="text-sm font-black uppercase tracking-widest text-gray-800 flex items-center gap-2">
          <FileText size={16} className="text-emerald-500" />
          Importa / Esporta
        </h3>
      </div>
      <div className="flex-1 p-5 flex flex-col gap-4">
        <div className="flex-1 p-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-xs font-mono text-gray-400">
          Incolla qui il contenuto Markdown…
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
            <Download size={14} />
            Esporta
          </div>
          <div className="flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-700 rounded-xl text-[10px] font-black uppercase tracking-widest">
            <Upload size={14} />
            Importa
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Sezione landing ──────────────────────────────────────────────────── */

export default function DashboardShowcase() {
  const { t, language } = useLanguage();

  // Every number below is derived from the DEMO_* arrays, so the sidebar
  // badges, the stat cards and the widget lists can never drift apart.
  const activeTasks = DEMO_TASKS.filter((task) => task.status !== "done");
  const doneTasks = DEMO_TASKS.length - activeTasks.length;
  const criticalTasks = DEMO_TASKS.filter(
    (task) => task.priority === "Alta" && task.status !== "done",
  );
  const activeGoals = DEMO_GOALS.filter((goal) => !goal.completed);
  const doneGoals = DEMO_GOALS.length - activeGoals.length;

  const quickStats = [
    {
      label: t("statActiveTasks", "Task Attivi"),
      value: activeTasks.length,
      icon: <ListTodo className="text-[#7b39fc]" />,
      bgClass: "bg-[#7b39fc]/10",
      sub: t("statAwaiting", "In attesa"),
    },
    {
      label: t("statGoals", "Obiettivi"),
      value: DEMO_GOALS.length,
      icon: <Target className="text-rose-500" />,
      bgClass: "bg-rose-500/10",
      sub: `${doneGoals} ${t("statGoalsAchieved", "Completati")}`,
    },
    {
      label: t("statIdeas", "Idee / Spunti"),
      value: DEMO_IDEAS.length,
      icon: <Lightbulb className="text-amber-500" />,
      bgClass: "bg-amber-500/10",
      sub: t("statIdeasAwaiting", "Nel Brain Dump"),
    },
    {
      label: t("statFocus", "Focus di Oggi"),
      value: "Chiudere la...",
      icon: <Sparkles className="text-[#a67cff]" />,
      bgClass: "bg-[#a67cff]/10",
      sub: t("statFocusSub", "Priorità chiave"),
    },
  ];

  return (
    <section className="landing-section relative overflow-hidden px-4 py-20 sm:px-6 sm:py-28">
      <div className="relative mx-auto max-w-6xl">
        {/* Section header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="landing-eyebrow">
            <Sparkles size={13} />
            {t("land.showcaseEyebrow")}
          </div>
          <h2 className="landing-heading-lg mt-3">
            {t("land.showcaseTitlePrefix")}
            <span className="landing-display-accent">{t("land.showcaseTitleAccent")}</span>
          </h2>
          <p className="landing-body mx-auto mt-4 max-w-xl">
            {t("land.showcaseBody")}
          </p>
        </div>

        {/* Browser frame */}
        <div className="relative mt-12">
          <div className="absolute -inset-3 rounded-[28px] bg-gradient-to-b from-[#7b39fc]/25 via-[#a67cff]/10 to-transparent blur-lg" />

          <div className="relative overflow-hidden rounded-2xl border border-gray-200/70 bg-white shadow-2xl shadow-[#7b39fc]/15">
            {/* Window chrome */}
            <div className="flex items-center gap-3 border-b border-gray-200/70 bg-gray-50 px-4 py-2.5">
              <div className="flex items-center gap-1.5" aria-hidden="true">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              </div>
              <div className="mx-auto flex min-w-0 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1 text-[11px] text-gray-500">
                <Globe size={11} className="shrink-0 text-[#7b39fc]" />
                <span className="truncate">app.taskly.io/dashboard</span>
              </div>
              {/* Solo la ricerca: la campanella era un duplicato dell'Inbox
                  mostrato nel topbar dell'app. */}
              <div className="flex items-center gap-1.5" aria-hidden="true">
                <Search size={13} className="text-gray-400" />
              </div>
            </div>

            {/* Badge: chiarisce che il mockup non è interattivo */}
            <div className="pointer-events-none absolute right-4 top-16 z-10 inline-flex items-center gap-1.5 rounded-full border border-[#7b39fc]/25 bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-[#7b39fc] shadow-sm backdrop-blur-sm">
              <Eye size={11} aria-hidden="true" />
              {t("land.showcasePreviewBadge")}
            </div>

            {/* App body: sidebar + main, esattamente come /dashboard.
                È puramente rappresentativo: nessun puntatore, nessun focus,
                nessuna semantica per gli screen reader. */}
            <div
              className="flex min-h-[560px] max-h-[620px] text-left select-none pointer-events-none"
              aria-hidden="true"
              inert
            >
              <PreviewSidebar t={t} language={language} />
              <div className="flex min-w-0 flex-1 flex-col bg-zinc-50">
                <PreviewTopbar />
                <div className="p-3 md:p-6">
                  <div className="max-w-7xl mx-auto space-y-6 pb-12">
                    <DashboardHeader
                      eyebrow={t("land.mockNavDashboard", "Dashboard & Analitiche")}
                      title={t("dashboardTitle", "Panoramica Analitiche")}
                      subtitle={t("dashboardSubtitle", "Monitora produttività, scadenze e obiettivi in un unico spazio.")}
                      customizeLabel={t("dash.customizeAnalytics", "Personalizza Analitiche")}
                      showCustomize={false}
                    />

                    <div className="space-y-8">
                      <QuickStatsWidget stats={quickStats} />

                      <TodayFocusWidget
                        focus={t("dash.demoFocus", "Chiudere la proposta Alpha entro venerdì")}
                        completionRate={Math.round(
                          (doneTasks / DEMO_TASKS.length) * 100,
                        )}
                        criticalCount={criticalTasks.length}
                        activeGoalsCount={activeGoals.length}
                        completedCount={doneTasks}
                        gradientId="showcaseProgressGradient"
                        labels={{
                          focus: t("dash.focusToday", "Focus di Oggi"),
                          critical: t("criticalTasks", "Task Critici"),
                          activeGoals: t("activeGoalsLabel", "Obiettivi Attivi"),
                          done: t("done", "Completati"),
                          completed: t("done", "Completato"),
                        }}
                      />

                      <WeeklyTrendWidget
                        data={TREND}
                        title={t("dash.trendTitle", "Trend & Produttività Settimanale")}
                        subtitle={t("dash.trendSub", "Attività e tasso di completamento ultimi 7 giorni")}
                        statusLabel={t("dash.trendActive", "Attivo")}
                      />

                      <div className="grid lg:grid-cols-2 gap-8">
                        <CriticalTasksWidget
                          tasks={criticalTasks.slice(0, 3)}
                          title={t("priorityHigh", "Task ad Alta Priorità")}
                          seeAllLabel={t("seeAll", "Vedi tutti")}
                          emptyLabel={t("noCriticalTasks", "Nessun task ad alta priorità in sospeso. Ottimo lavoro!")}
                        />
                        <RecentIdeasWidget
                          ideas={DEMO_IDEAS}
                          title={t("recentIdeas", "Brain Dump & Idee")}
                          linkLabel={t("dash.brainDump", "Brain Dump")}
                          emptyLabel={t("noIdeas", "Nessuna idea salvata di recente. Annota i tuoi pensieri liberi!")}
                          defaultCategory={t("dash.generalCategory", "Generale")}
                        />
                      </div>

                      <div className="grid lg:grid-cols-2 gap-8">
                        <GoalProgressWidget
                          goals={activeGoals.slice(0, 2)}
                          title={t("goalProgress", "Progresso Obiettivi")}
                          emptyLabel={t("noActiveGoals", "Nessun obiettivo attivo. Impostane uno per monitorare i tuoi traguardi!")}
                        />
                        <div className="space-y-8">
                          <QuickNavWidget
                            labels={{
                              title: t("quickNav", "Azioni Rapide"),
                              newProject: t("newProject", "Nuovo Progetto"),
                              newIdea: t("newIdea", "Nuova Idea"),
                            }}
                          />
                          <AiInsightsWidget
                            text={t("aiAnalysis", "L'intelligenza artificiale può analizzare i tuoi impegni e suggerire la pianificazione ideale.")}
                            actionLabel={t("aiAction", "Genera Piano Ottimale")}
                          />
                        </div>
                      </div>

                      <ToolsResourcesWidget title={t("resourcesTools", "Strumenti & Risorse")}>
                        <ToolsPanel>
                          <StaticFileUploader />
                        </ToolsPanel>
                        <ToolsPanel>
                          <StaticTemplateGallery />
                        </ToolsPanel>
                        <ToolsPanel>
                          <StaticImportExport />
                        </ToolsPanel>
                      </ToolsResourcesWidget>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA under the mockup */}
        <div className="mt-12 flex flex-col items-center gap-4 text-center">
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
                document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="landing-btn-secondary"
            >
              {t("land.showcaseCtaSecondary")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
