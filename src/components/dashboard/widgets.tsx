"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Eye,
  EyeOff,
  Flame,
  GripVertical,
  Layers,
  Lightbulb,
  Plus,
  SlidersHorizontal,
  Sparkles,
  Target,
  TrendingUp,
  Wrench,
  X,
  Zap,
  Clock,
  ListTodo,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent, Badge, Button } from "../UIComponents";

/* ── Tipi condivisi ───────────────────────────────────────────────────── */

export type WidgetId =
  | "quick_stats"
  | "today_focus"
  | "weekly_trend"
  | "critical_tasks"
  | "recent_ideas"
  | "goal_progress"
  | "quick_nav"
  | "ai_insights"
  | "tools_resources";

export interface WidgetMeta {
  id: WidgetId;
  label: string;
  description: string;
  icon: any;
  category: "analytics" | "planning" | "tools";
}

export const ALL_WIDGET_DEFS: WidgetMeta[] = [
  {
    id: "quick_stats",
    label: "Statistiche & Metriche Rapide",
    description: "Panoramica a colpo d'occhio di task, obiettivi e idee attive.",
    icon: "ListTodo",
    category: "analytics",
  },
  {
    id: "today_focus",
    label: "Focus di Oggi & Tasso Completamento",
    description: "Obiettivo cardine giornaliero con indicatore circolare.",
    icon: "Zap",
    category: "planning",
  },
  {
    id: "weekly_trend",
    label: "Trend & Produttività Settimanale",
    description: "Grafico dell'andamento e tasso di attività negli ultimi 7 giorni.",
    icon: "TrendingUp",
    category: "analytics",
  },
  {
    id: "critical_tasks",
    label: "Task ad Alta Priorità",
    description: "Elenco dei task urgenti in attesa con scadenze evidenziate.",
    icon: "Flame",
    category: "planning",
  },
  {
    id: "recent_ideas",
    label: "Brain Dump & Idee Recenti",
    description: "Spunti creativi catturati di recente pronti per essere sviluppati.",
    icon: "Lightbulb",
    category: "planning",
  },
  {
    id: "goal_progress",
    label: "Avanzamento Obiettivi",
    description: "Barre di progressione verso i tuoi traguardi chiave.",
    icon: "Target",
    category: "planning",
  },
  {
    id: "quick_nav",
    label: "Azioni Rapide",
    description: "Scorciatoie con un click per creare nuovi progetti e idee.",
    icon: "Plus",
    category: "tools",
  },
  {
    id: "ai_insights",
    label: "Analisi Intelligente AI",
    description: "Suggerimenti proattivi generati dall'assistente per ottimizzare il flusso.",
    icon: "Sparkles",
    category: "analytics",
  },
  {
    id: "tools_resources",
    label: "Strumenti & Risorse",
    description: "Caricamento file, galleria template e funzioni di import/export.",
    icon: "Wrench",
    category: "tools",
  },
];

export const DEFAULT_WIDGET_ORDER: WidgetId[] = ALL_WIDGET_DEFS.map((w) => w.id);

/* ── Widget: statistiche rapide ───────────────────────────────────────── */

export interface QuickStat {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  bgClass?: string;
  sub?: string;
}

export function QuickStatsWidget({ stats }: { stats: QuickStat[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-1">
      {stats.map((s, idx) => (
        <motion.div
          key={idx}
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="h-full rounded-2xl border border-[#7b39fc]/10 bg-white/70 shadow-lg shadow-[#7b39fc]/5 backdrop-blur-xl dark:bg-[#17103a]/60">
            <CardContent className="p-4">
              <div className="flex items-center gap-3.5">
                <div className={`p-2.5 rounded-xl ${s.bgClass || "bg-[#7b39fc]/10"}`}>
                  {s.icon}
                </div>
                <div>
                  <p className="text-base font-bold text-gray-800 dark:text-white">
                    {s.value}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-widest">
                    {s.label}
                  </p>
                  <span className="text-[9px] font-semibold text-gray-500 dark:text-gray-400">
                    {s.sub}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

/* ── Widget: focus di oggi ────────────────────────────────────────────── */

export function TodayFocusWidget({
  focus,
  completionRate,
  criticalCount,
  activeGoalsCount,
  completedCount,
  labels,
  gradientId = "dashProgressGradient",
}: {
  focus: string;
  completionRate: number;
  criticalCount: number;
  activeGoalsCount: number;
  completedCount: number;
  labels: {
    focus: string;
    critical: string;
    activeGoals: string;
    done: string;
    completed: string;
  };
  gradientId?: string;
}) {
  return (
    <Card className="relative overflow-hidden rounded-2xl border border-[#7b39fc]/15 bg-white/70 shadow-xl shadow-[#7b39fc]/10 backdrop-blur-xl dark:bg-[#1d1630]/60">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#7b39fc] to-[#a67cff]" />
      <CardContent className="p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#7b39fc] dark:text-[#a67cff]">
              <Zap size={18} />
              <span className="text-xs font-bold uppercase tracking-[0.2em]">
                {labels.focus}
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
              {focus}
            </h3>
            <div className="flex flex-wrap gap-3">
              <Badge
                variant="default"
                className="bg-[#7b39fc]/10 text-[#7b39fc] border-none dark:bg-[#7b39fc]/25 dark:text-[#a67cff]"
              >
                {criticalCount} {labels.critical}
              </Badge>
              <Badge
                variant="default"
                className="bg-[#a67cff]/10 text-[#8b4dff] border-none dark:bg-[#a67cff]/20 dark:text-[#a67cff]"
              >
                {activeGoalsCount} {labels.activeGoals}
              </Badge>
              <Badge
                variant="default"
                className="bg-emerald-500/10 text-emerald-600 border-none dark:bg-emerald-500/20 dark:text-emerald-400"
              >
                {completedCount} {labels.done}
              </Badge>
            </div>
          </div>
          <div className="shrink-0 flex items-center justify-center">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full transform -rotate-90 drop-shadow-sm"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-gray-100 dark:text-gray-700/50"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="transparent"
                  stroke={`url(#${gradientId})`}
                  strokeWidth="10"
                  strokeDasharray="263.9"
                  strokeDashoffset={263.9 - (263.9 * completionRate) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7b39fc" />
                    <stop offset="100%" stopColor="#a67cff" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-gray-900 dark:text-white leading-none">
                  {completionRate}%
                </span>
                <span className="text-[8px] font-black uppercase tracking-tighter text-gray-400 mt-1">
                  {labels.completed}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Widget: trend settimanale ────────────────────────────────────────── */

export interface TrendPoint {
  day: string;
  val: number;
  count: number;
}

export function WeeklyTrendWidget({
  data,
  title,
  subtitle,
  statusLabel,
}: {
  data: TrendPoint[];
  title: string;
  subtitle: string;
  statusLabel: string;
}) {
  return (
    <Card className="rounded-[2rem] border border-[#7b39fc]/15 bg-white/70 shadow-xl shadow-[#7b39fc]/5 backdrop-blur-xl dark:bg-[#1a1528]/50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#7b39fc]/10 text-[#7b39fc] dark:text-[#a67cff]">
              <TrendingUp size={18} />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase tracking-widest text-gray-800 dark:text-gray-100">
                {title}
              </h4>
              <p className="text-xs text-gray-400">{subtitle}</p>
            </div>
          </div>
          <Badge
            variant="default"
            className="bg-[#7b39fc]/10 text-[#7b39fc] border-none text-[10px] font-black uppercase"
          >
            {statusLabel}
          </Badge>
        </div>

        <div className="grid grid-cols-7 gap-2 items-end h-32 pt-4">
          {data.map((d, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-2 h-full justify-end group"
            >
              <span className="text-[10px] font-bold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                {d.val}%
              </span>
              <div className="w-full max-w-[28px] bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden h-20 flex flex-col justify-end p-0.5">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${d.val}%` }}
                  transition={{ duration: 0.8, delay: i * 0.05 }}
                  className="w-full rounded-lg bg-gradient-to-t from-[#7b39fc] to-[#a67cff]"
                />
              </div>
              <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                {d.day}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Link decorativo: naviga solo se riceve un href ───────────────────── */

function DecorativeLink({
  href,
  className,
  children,
}: {
  href?: string;
  className: string;
  children: React.ReactNode;
}) {
  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return <span className={className}>{children}</span>;
}

/* ── Widget: task ad alta priorità ────────────────────────────────────── */

export interface CriticalTask {
  id: any;
  title: string;
  deadline?: string;
}

export function CriticalTasksWidget({
  tasks,
  title,
  seeAllLabel,
  seeAllHref,
  emptyLabel,
}: {
  tasks: CriticalTask[];
  title: string;
  seeAllLabel: string;
  seeAllHref?: string;
  emptyLabel: string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h4 className="text-sm font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
          <Flame size={16} className="text-orange-500" /> {title}
        </h4>
        <DecorativeLink
          href={seeAllHref}
          className="text-[10px] font-black text-[#7b39fc] uppercase tracking-wider hover:underline"
        >
          {seeAllLabel}
        </DecorativeLink>
      </div>
      <div className="space-y-3">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <Card
              key={task.id}
              className="rounded-2xl border border-[#7b39fc]/10 bg-white/70 shadow-lg shadow-[#7b39fc]/5 backdrop-blur-xl dark:bg-[#1a1528]/40 hover:scale-[1.01] transition-transform"
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-lg shadow-red-500/40 shrink-0" />
                <span className="text-sm font-bold truncate flex-1 text-gray-800 dark:text-gray-100">
                  {task.title}
                </span>
                {task.deadline && (
                  <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1 shrink-0">
                    <Clock size={11} /> {task.deadline}
                  </span>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white/40 dark:bg-white/5">
            <CardContent className="p-6 text-center text-xs text-gray-400 font-medium">
              {emptyLabel}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

/* ── Widget: brain dump ───────────────────────────────────────────────── */

export interface IdeaItem {
  id: any;
  title: string;
  category?: string;
}

export function RecentIdeasWidget({
  ideas,
  title,
  linkLabel,
  linkHref,
  emptyLabel,
  defaultCategory,
}: {
  ideas: IdeaItem[];
  title: string;
  linkLabel: string;
  linkHref?: string;
  emptyLabel: string;
  defaultCategory: string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h4 className="text-sm font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
          <Lightbulb size={16} className="text-amber-500" /> {title}
        </h4>
        <DecorativeLink
          href={linkHref}
          className="text-[10px] font-black text-amber-500 uppercase tracking-wider hover:underline"
        >
          {linkLabel}
        </DecorativeLink>
      </div>
      <div className="space-y-3">
        {ideas.length > 0 ? (
          ideas.map((idea) => (
            <Card
              key={idea.id}
              className="rounded-2xl border-l-4 border-l-amber-400 bg-amber-50/40 dark:bg-amber-900/10 border-gray-100 dark:border-gray-800/40"
            >
              <CardContent className="p-4">
                <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
                  &quot;{idea.title}&quot;
                </p>
                <p className="text-[9px] font-black text-amber-600/70 uppercase mt-2">
                  {idea.category || defaultCategory}
                </p>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white/40 dark:bg-white/5">
            <CardContent className="p-6 text-center text-xs text-gray-400 font-medium">
              {emptyLabel}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

/* ── Widget: avanzamento obiettivi ────────────────────────────────────── */

export interface GoalLike {
  id: any;
  title: string;
  completed?: boolean;
  subGoals?: { completed?: boolean }[];
}

export function GoalProgressWidget({
  goals,
  title,
  emptyLabel,
}: {
  goals: GoalLike[];
  title: string;
  emptyLabel: string;
}) {
  return (
    <Card className="rounded-[2rem] border-none bg-linear-to-br from-[#7b39fc] to-[#a67cff] text-white shadow-xl shadow-[#7b39fc]/25">
      <CardContent className="p-6">
        <h4 className="text-sm font-black uppercase tracking-widest opacity-90 mb-6 flex items-center gap-2">
          <Target size={16} /> {title}
        </h4>
        <div className="space-y-6">
          {goals.length > 0 ? (
            goals.map((goal) => {
              const subGoals = goal.subGoals || [];
              const completed = subGoals.filter((s) => s.completed).length;
              const pct =
                subGoals.length > 0
                  ? Math.round((completed / subGoals.length) * 100)
                  : goal.completed
                    ? 100
                    : 0;

              return (
                <div key={goal.id} className="space-y-2">
                  <div className="flex justify-between items-center text-[11px] font-bold">
                    <span className="truncate pr-4">{goal.title}</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-1000"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-xs opacity-75">{emptyLabel}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Widget: azioni rapide ────────────────────────────────────────────── */

export function QuickNavWidget({
  labels,
}: {
  labels: { title: string; newProject: string; newIdea: string };
}) {
  return (
    <Card className="rounded-[2rem] border border-[#7b39fc]/10 bg-white/70 shadow-xl shadow-[#7b39fc]/10 backdrop-blur-xl dark:bg-[#1a1528]/50">
      <CardContent className="p-6">
        <h4 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-4">
          {labels.title}
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="ghost"
            className="h-auto py-4 flex flex-col items-center gap-2 border border-[#7b39fc]/15 rounded-2xl hover:bg-[#7b39fc]/10 dark:hover:bg-[#7b39fc]/15 transition-all"
          >
            <Plus size={20} className="text-[#7b39fc]" />
            <span className="text-[9px] font-black uppercase tracking-widest">
              {labels.newProject}
            </span>
          </Button>
          <Button
            variant="ghost"
            className="h-auto py-4 flex flex-col items-center gap-2 border border-amber-500/20 rounded-2xl hover:bg-amber-500/10 dark:hover:bg-amber-500/15 transition-all"
          >
            <Lightbulb size={20} className="text-amber-500" />
            <span className="text-[9px] font-black uppercase tracking-widest">
              {labels.newIdea}
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Widget: analisi AI ───────────────────────────────────────────────── */

export function AiInsightsWidget({
  text,
  actionLabel,
  onAction,
}: {
  text: string;
  actionLabel: string;
  onAction?: () => void;
}) {
  return (
    <Card className="rounded-[2rem] border-2 border-[#7b39fc]/20 bg-[#7b39fc]/5 dark:bg-[#7b39fc]/10">
      <CardContent className="p-6 text-center space-y-4">
        <Sparkles className="mx-auto text-[#a67cff]" size={32} />
        <p className="text-xs font-bold text-gray-700 dark:text-gray-200">{text}</p>
        <button
          type="button"
          onClick={onAction}
          className="w-full text-[10px] font-black uppercase tracking-widest h-10 inline-flex items-center justify-center rounded-xl bg-[#7b39fc] text-white shadow-lg shadow-[#7b39fc]/25 transition-colors hover:bg-[#8b4dff] active:translate-y-0 cursor-pointer"
        >
          {actionLabel}
        </button>
      </CardContent>
    </Card>
  );
}

/* ── Widget: strumenti ────────────────────────────────────────────────── */

export function ToolsResourcesWidget({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-black uppercase tracking-widest text-gray-500 px-2 flex items-center gap-2">
        <Wrench size={16} className="text-[#7b39fc]" /> {title}
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{children}</div>
    </div>
  );
}

export function ToolsPanel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Card className="rounded-[2rem] border border-[#7b39fc]/10 bg-white/70 shadow-xl shadow-[#7b39fc]/5 backdrop-blur-xl dark:bg-[#1a1528]/50 hover:shadow-[#7b39fc]/10 transition-all group overflow-hidden">
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  );
}

/* ── Toolbar e menù di personalizzazione ──────────────────────────────── */

export function WidgetEditToolbar({
  label,
  isVisible,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onToggle,
  hiddenLabel,
}: {
  label: string;
  isVisible: boolean;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggle: () => void;
  hiddenLabel: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2 px-4 py-2 bg-[#7b39fc]/10 dark:bg-[#7b39fc]/20 border-b border-[#7b39fc]/20 rounded-t-3xl text-xs font-bold text-[#7b39fc] dark:text-[#a67cff]">
      <div className="flex items-center gap-2">
        <GripVertical size={14} className="opacity-60" />
        <span className="font-extrabold uppercase tracking-wider text-[10px]">{label}</span>
        {!isVisible && (
          <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[9px] font-black uppercase">
            {hiddenLabel}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={isFirst}
          className="p-1 rounded-lg hover:bg-[#7b39fc]/20 disabled:opacity-30 transition-colors"
          title="Sposta su"
        >
          <ArrowUp size={14} />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={isLast}
          className="p-1 rounded-lg hover:bg-[#7b39fc]/20 disabled:opacity-30 transition-colors"
          title="Sposta giù"
        >
          <ArrowDown size={14} />
        </button>
        <button
          type="button"
          onClick={onToggle}
          className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors ${
            isVisible
              ? "bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400"
              : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
          }`}
          title={isVisible ? "Nascondi widget" : "Mostra widget"}
        >
          {isVisible ? (
            <>
              <EyeOff size={12} /> Nascondi
            </>
          ) : (
            <>
              <Eye size={12} /> Mostra
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export function WidgetManagerMenu({
  visibility,
  onToggle,
  onPreset,
  onClose,
  labels,
}: {
  visibility: Record<WidgetId, boolean>;
  onToggle: (id: WidgetId) => void;
  onPreset: (preset: "all" | "focus" | "analytics" | "minimal") => void;
  onClose: () => void;
  labels: {
    title: string;
    presets: string;
    all: string;
    analytics: string;
    focus: string;
    minimal: string;
  };
}) {
  return (
    <div className="absolute right-0 top-full mt-2 w-72 p-3 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 space-y-2">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-2 mb-2">
        <span className="text-xs font-black uppercase tracking-wider text-gray-500">
          {labels.title}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400"
        >
          <X size={14} />
        </button>
      </div>
      <div className="space-y-1 max-h-60 overflow-y-auto">
        {ALL_WIDGET_DEFS.map((w) => {
          const IconComp = ICONS[w.icon] || Layers;
          const isVis = visibility[w.id] !== false;
          return (
            <button
              key={w.id}
              type="button"
              onClick={() => onToggle(w.id)}
              className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-gray-50 dark:hover:bg-zinc-900 text-xs font-semibold transition-colors"
            >
              <span className="flex items-center gap-2 truncate">
                <IconComp size={14} className="text-[#7b39fc] shrink-0" />
                <span className="truncate">{w.label}</span>
              </span>
              <span
                className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${
                  isVis
                    ? "bg-[#7b39fc] text-white"
                    : "border border-gray-300 dark:border-zinc-700"
                }`}
              >
                {isVis && <Check size={10} />}
              </span>
            </button>
          );
        })}
      </div>

      <div className="pt-2 border-t border-gray-100 dark:border-zinc-800 space-y-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
          {labels.presets}
        </p>
        <div className="grid grid-cols-2 gap-1">
          {(
            [
              ["all", labels.all],
              ["analytics", labels.analytics],
              ["focus", labels.focus],
              ["minimal", labels.minimal],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => onPreset(key)}
              className="px-2 py-1.5 rounded-lg bg-gray-50 dark:bg-zinc-900 hover:bg-[#7b39fc]/10 text-[10px] font-bold text-gray-700 dark:text-gray-300 text-center"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Registry icone per il menu widget (le definizioni restano serializzabili) */
const ICONS: Record<string, any> = {
  ListTodo,
  Zap,
  TrendingUp,
  Flame,
  Lightbulb,
  Target,
  Plus,
  Sparkles,
  Wrench,
};

/* ── Header della dashboard ───────────────────────────────────────────── */

export function DashboardHeader({
  eyebrow,
  title,
  subtitle,
  customizeLabel,
  isEditing,
  onToggleEdit,
  showCustomize = true,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  customizeLabel: string;
  isEditing?: boolean;
  onToggleEdit?: () => void;
  showCustomize?: boolean;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-start gap-4">
        <motion.div
          whileHover={{ scale: 1.05, rotate: -3 }}
          className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7b39fc] to-[#a67cff] flex items-center justify-center shrink-0 shadow-lg shadow-[#7b39fc]/25"
        >
          <Sparkles size={22} className="text-white/90" />
        </motion.div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-px w-6 bg-gradient-to-r from-[#7b39fc]/0 to-[#7b39fc]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7b39fc] dark:text-[#a67cff]">
              {eyebrow}
            </span>
          </div>
          <h2 className="font-inter font-extrabold text-3xl md:text-4xl lg:text-5xl leading-[1.1] tracking-[-0.025em] text-gray-900 dark:text-white drop-shadow-[0_2px_20px_rgba(123,57,252,0.18)]">
            {title}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm font-medium">
            {subtitle}
          </p>
        </div>
      </div>

      {showCustomize && onToggleEdit && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            id="customize-analytics-btn"
            onClick={onToggleEdit}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-lg cursor-pointer ${
              isEditing
                ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25"
                : "bg-gradient-to-r from-[#7b39fc] to-[#a67cff] hover:brightness-110 text-white shadow-[#7b39fc]/25"
            }`}
          >
            {isEditing ? (
              <>
                <Check size={16} />
                <span>{customizeLabel}</span>
              </>
            ) : (
              <>
                <SlidersHorizontal size={16} />
                <span>{customizeLabel}</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Banner di personalizzazione ──────────────────────────────────────── */

export function EditModeBanner({
  title,
  description,
  onManage,
  onReset,
  onDone,
  labels,
  manager,
}: {
  title: string;
  description: string;
  onManage: () => void;
  onReset: () => void;
  onDone: () => void;
  labels: { manage: string; reset: string; done: string };
  manager: React.ReactNode;
}) {
  return (
    <div className="p-4 md:p-5 rounded-3xl bg-gradient-to-r from-[#7b39fc]/10 via-[#a67cff]/10 to-[#7b39fc]/5 border-2 border-[#7b39fc]/30 backdrop-blur-xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-black uppercase tracking-widest text-[#7b39fc] dark:text-[#a67cff]">
            {title}
          </span>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-300">{description}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={onManage}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-gray-900 border border-[#7b39fc]/20 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Layers size={14} className="text-[#7b39fc]" />
            <span>{labels.manage}</span>
          </button>
          {manager}
        </div>

        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          title="Ripristina layout predefinito"
        >
          <RotateCcw size={13} />
          <span>{labels.reset}</span>
        </button>

        <button
          type="button"
          onClick={onDone}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7b39fc] hover:bg-[#8b4dff] text-white text-xs font-black uppercase tracking-wider transition-colors shadow-lg shadow-[#7b39fc]/20"
        >
          <Check size={14} />
          <span>{labels.done}</span>
        </button>
      </div>
    </div>
  );
}

/* ── Banner quota piano ───────────────────────────────────────────────── */

export function PlanQuotaBanner({
  planName,
  used,
  max,
  label,
  word,
  upgradeLabel,
  nextUpLabel,
  upgradeHref,
}: {
  planName: string;
  used: number;
  max: number;
  label: string;
  word: string;
  upgradeLabel: string;
  nextUpLabel: string;
  upgradeHref?: string;
}) {
  const isFull = used >= max;
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#7b39fc]/15 bg-white/60 dark:bg-white/5 px-4 py-3">
      <div className="w-10 h-10 rounded-xl bg-[#7b39fc]/10 flex items-center justify-center shrink-0">
        <Zap size={18} className="text-[#a67cff]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-bold text-gray-600 dark:text-gray-300">
            {label}{" "}
            <span className="font-black uppercase tracking-widest text-[#7b39fc]">
              {planName}
            </span>{" "}
            · {used} / {max} {word}
          </p>
          {isFull ? (
            upgradeHref ? (
              <Link
                href={upgradeHref}
                className="shrink-0 px-3 py-1.5 rounded-lg bg-[#7b39fc] text-white text-[9px] font-black uppercase tracking-widest hover:brightness-110 transition-all"
              >
                {upgradeLabel}
              </Link>
            ) : (
              <span className="shrink-0 px-3 py-1.5 rounded-lg bg-[#7b39fc] text-white text-[9px] font-black uppercase tracking-widest">
                {upgradeLabel}
              </span>
            )
          ) : (
            <span className="shrink-0 text-[9px] font-black uppercase tracking-widest text-emerald-500">
              {nextUpLabel} {max - used}
            </span>
          )}
        </div>
        <div className="mt-2 h-1.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-[#7b39fc] to-[#a67cff] rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (used / max) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}