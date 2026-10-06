"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Clock,
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
  ListTodo,
  RotateCcw,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, Badge, Button } from "../UIComponents";

/* ─────────────────────────────────────────────────────────────────────────────
   Design tokens centralizzati
   ─────────────────────────────────────────────────────────────────────────── */

/**
 * Superficie card unificata — chiaro / scuro.
 *
 * Luce:  bianco pieno + ombra leggera viola
 * Scuro: gray-900 (#111827) solido — nessuna trasparenza, nessun viola
 *        hardcoded che rischiava di confondersi con lo sfondo della pagina.
 */
const CARD_BASE =
  "bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm";

/** Card con angoli standard */
const CARD_ROUNDED = `${CARD_BASE} rounded-2xl`;

/** Card con angoli grandi (sezioni principali) */
const CARD_ROUNDED_LG = `${CARD_BASE} rounded-3xl`;

/** Accent viola coerente */
const ACCENT = "#7b39fc";
const ACCENT_LIGHT = "#a67cff";

/* ─────────────────────────────────────────────────────────────────────────────
   Tipi condivisi
   ─────────────────────────────────────────────────────────────────────────── */

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

/* ─────────────────────────────────────────────────────────────────────────────
   Componente di empty state riutilizzabile
   ─────────────────────────────────────────────────────────────────────────── */

function EmptyState({
  icon: Icon,
  label,
  iconColor = "text-gray-300 dark:text-gray-600",
}: {
  icon: React.ElementType;
  label: string;
  iconColor?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-3">
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-50 dark:bg-gray-800/60 ${iconColor}`}>
        <Icon size={20} />
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 font-medium text-center max-w-[200px]">{label}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Widget: statistiche rapide
   ─────────────────────────────────────────────────────────────────────────── */

export interface QuickStat {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  bgClass?: string;
  sub?: string;
}

export function QuickStatsWidget({ stats }: { stats: QuickStat[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((s, idx) => (
        <motion.div
          key={idx}
          whileHover={{ y: -3 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div className={`${CARD_ROUNDED} p-4 flex items-center gap-3.5 h-full`}>
            <div className={`p-2.5 rounded-xl ${s.bgClass || "bg-[#7b39fc]/10"} shrink-0`}>
              {s.icon}
            </div>
            <div className="min-w-0">
              <p className="text-lg font-black text-gray-900 dark:text-white leading-none">
                {s.value}
              </p>
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5 truncate">
                {s.label}
              </p>
              {s.sub && (
                <span className="text-[9px] font-semibold text-gray-400 dark:text-gray-500">
                  {s.sub}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Widget: focus di oggi
   ─────────────────────────────────────────────────────────────────────────── */

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
    <div className={`${CARD_ROUNDED_LG} relative overflow-hidden`}>
      {/* Accent left border */}
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#7b39fc] to-[#a67cff] rounded-l-3xl" />
      <div className="p-5 pl-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#7b39fc] dark:text-[#a67cff]">
              <Zap size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                {labels.focus}
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-snug">
              {focus}
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#7b39fc]/10 text-[#7b39fc] dark:bg-[#7b39fc]/20 dark:text-[#a67cff]">
                {criticalCount} {labels.critical}
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300">
                {activeGoalsCount} {labels.activeGoals}
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                {completedCount} {labels.done}
              </span>
            </div>
          </div>

          {/* Circular progress */}
          <div className="shrink-0 flex items-center justify-center">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                <circle
                  cx="50" cy="50" r="42"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="7"
                  className="text-gray-100 dark:text-gray-800"
                />
                <circle
                  cx="50" cy="50" r="42"
                  fill="transparent"
                  stroke={`url(#${gradientId})`}
                  strokeWidth="9"
                  strokeDasharray="263.9"
                  strokeDashoffset={263.9 - (263.9 * completionRate) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={ACCENT} />
                    <stop offset="100%" stopColor={ACCENT_LIGHT} />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-gray-900 dark:text-white leading-none">
                  {completionRate}%
                </span>
                <span className="text-[8px] font-black uppercase tracking-tighter text-gray-400 dark:text-gray-500 mt-0.5">
                  {labels.completed}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Widget: trend settimanale — vuoto se non ci sono dati reali
   ─────────────────────────────────────────────────────────────────────────── */

export interface TrendPoint {
  day: string;
  val: number;   // 0-100 percentuale attività
  count: number; // n. task completati
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
  const hasData = data.some((d) => d.count > 0);
  const maxVal = Math.max(...data.map((d) => d.val), 1);

  return (
    <div className={CARD_ROUNDED_LG}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#7b39fc]/10 dark:bg-[#7b39fc]/15">
              <TrendingUp size={16} className="text-[#7b39fc] dark:text-[#a67cff]" />
            </div>
            <div>
              <h4 className="text-sm font-black text-gray-800 dark:text-gray-100">
                {title}
              </h4>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-[#7b39fc]/10 text-[#7b39fc] dark:bg-[#7b39fc]/15 dark:text-[#a67cff]">
            {statusLabel}
          </span>
        </div>

        {/* Chart or empty state */}
        {hasData ? (
          <div className="grid grid-cols-7 gap-2 items-end h-32">
            {data.map((d, i) => {
              const pct = maxVal > 0 ? (d.val / maxVal) * 100 : 0;
              return (
                <div key={i} className="flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[9px] font-bold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.count > 0 ? `${d.count}` : "—"}
                  </span>
                  <div className="w-full max-w-[28px] bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden h-20 flex flex-col justify-end p-0.5">
                    {pct > 0 ? (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${pct}%` }}
                        transition={{ duration: 0.7, delay: i * 0.05, ease: "easeOut" }}
                        className="w-full rounded-lg bg-gradient-to-t from-[#7b39fc] to-[#a67cff]"
                      />
                    ) : (
                      <div className="w-full h-[4%] rounded-lg bg-gray-200 dark:bg-gray-700" />
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500">{d.day}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={BarChart3}
            label="Nessuna attività registrata questa settimana. Completa i tuoi task per vedere il trend."
          />
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Link decorativo
   ─────────────────────────────────────────────────────────────────────────── */

function DecorativeLink({
  href,
  className,
  children,
}: {
  href?: string;
  className: string;
  children: React.ReactNode;
}) {
  if (href) return <Link href={href} className={className}>{children}</Link>;
  return <span className={className}>{children}</span>;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Widget section header (riutilizzabile)
   ─────────────────────────────────────────────────────────────────────────── */

function SectionHeader({
  icon: Icon,
  iconClass,
  title,
  actionLabel,
  actionHref,
  actionClass,
}: {
  icon: React.ElementType;
  iconClass: string;
  title: string;
  actionLabel?: string;
  actionHref?: string;
  actionClass?: string;
}) {
  return (
    <div className="flex items-center justify-between px-1 mb-3">
      <h4 className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 text-gray-500 dark:text-gray-400`}>
        <Icon size={14} className={iconClass} />
        {title}
      </h4>
      {actionLabel && (
        <DecorativeLink
          href={actionHref}
          className={actionClass || "text-[10px] font-black uppercase tracking-wider hover:underline text-[#7b39fc]"}
        >
          {actionLabel}
        </DecorativeLink>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Widget: task ad alta priorità
   ─────────────────────────────────────────────────────────────────────────── */

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
    <div className="space-y-3">
      <SectionHeader
        icon={Flame}
        iconClass="text-orange-500"
        title={title}
        actionLabel={seeAllLabel}
        actionHref={seeAllHref}
        actionClass="text-[10px] font-black text-[#7b39fc] dark:text-[#a67cff] uppercase tracking-wider hover:underline"
      />
      <div className="space-y-2">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`${CARD_ROUNDED} px-4 py-3 flex items-center gap-3 hover:scale-[1.01] transition-transform`}
            >
              <div className="w-2 h-2 rounded-full bg-red-500 shadow-sm shadow-red-500/40 shrink-0" />
              <span className="text-sm font-semibold truncate flex-1 text-gray-800 dark:text-gray-100">
                {task.title}
              </span>
              {task.deadline && (
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 flex items-center gap-1 shrink-0">
                  <Clock size={10} />
                  {task.deadline}
                </span>
              )}
            </div>
          ))
        ) : (
          <div className={`${CARD_ROUNDED} overflow-hidden`}>
            <EmptyState icon={Flame} label={emptyLabel} iconClass="text-orange-400 dark:text-orange-500/60" />
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Widget: brain dump
   ─────────────────────────────────────────────────────────────────────────── */

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
    <div className="space-y-3">
      <SectionHeader
        icon={Lightbulb}
        iconClass="text-amber-500"
        title={title}
        actionLabel={linkLabel}
        actionHref={linkHref}
        actionClass="text-[10px] font-black text-amber-500 dark:text-amber-400 uppercase tracking-wider hover:underline"
      />
      <div className="space-y-2">
        {ideas.length > 0 ? (
          ideas.map((idea) => (
            <div
              key={idea.id}
              className={`${CARD_ROUNDED} border-l-4 border-l-amber-400 px-4 py-3`}
            >
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 line-clamp-1">
                &ldquo;{idea.title}&rdquo;
              </p>
              <p className="text-[9px] font-black text-amber-600/70 dark:text-amber-400/60 uppercase mt-1.5 tracking-wider">
                {idea.category || defaultCategory}
              </p>
            </div>
          ))
        ) : (
          <div className={`${CARD_ROUNDED} overflow-hidden`}>
            <EmptyState icon={Lightbulb} label={emptyLabel} iconClass="text-amber-400 dark:text-amber-500/60" />
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Widget: avanzamento obiettivi
   ─────────────────────────────────────────────────────────────────────────── */

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
    <div
      className="rounded-3xl text-white overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_LIGHT} 100%)` }}
    >
      <div className="p-6">
        <h4 className="text-xs font-black uppercase tracking-widest opacity-80 mb-5 flex items-center gap-2">
          <Target size={14} />
          {title}
        </h4>
        <div className="space-y-5">
          {goals.length > 0 ? (
            goals.map((goal) => {
              const subGoals = goal.subGoals || [];
              const completed = subGoals.filter((s) => s.completed).length;
              const pct =
                subGoals.length > 0
                  ? Math.round((completed / subGoals.length) * 100)
                  : goal.completed ? 100 : 0;

              return (
                <div key={goal.id} className="space-y-1.5">
                  <div className="flex justify-between items-center text-[11px] font-bold">
                    <span className="truncate pr-4 opacity-90">{goal.title}</span>
                    <span className="opacity-80 shrink-0">{pct}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-white rounded-full"
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center py-4 gap-2 opacity-70">
              <Target size={24} className="opacity-50" />
              <p className="text-xs text-center opacity-80">{emptyLabel}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Widget: azioni rapide
   ─────────────────────────────────────────────────────────────────────────── */

export function QuickNavWidget({
  labels,
}: {
  labels: { title: string; newProject: string; newIdea: string };
}) {
  return (
    <div className={CARD_ROUNDED_LG}>
      <div className="p-5">
        <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">
          {labels.title}
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="flex flex-col items-center gap-2 py-4 rounded-2xl border border-[#7b39fc]/20 dark:border-[#7b39fc]/30 hover:bg-[#7b39fc]/8 dark:hover:bg-[#7b39fc]/15 transition-all text-center"
          >
            <div className="w-8 h-8 rounded-xl bg-[#7b39fc]/10 dark:bg-[#7b39fc]/20 flex items-center justify-center">
              <Plus size={16} className="text-[#7b39fc] dark:text-[#a67cff]" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-300">
              {labels.newProject}
            </span>
          </button>
          <button
            type="button"
            className="flex flex-col items-center gap-2 py-4 rounded-2xl border border-amber-500/20 dark:border-amber-500/30 hover:bg-amber-500/8 dark:hover:bg-amber-500/10 transition-all text-center"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 flex items-center justify-center">
              <Lightbulb size={16} className="text-amber-500" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-300">
              {labels.newIdea}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Widget: analisi AI
   ─────────────────────────────────────────────────────────────────────────── */

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
    <div className={`${CARD_ROUNDED_LG} overflow-hidden`}>
      {/* Sottile gradient top bar */}
      <div className="h-0.5 bg-gradient-to-r from-[#7b39fc] via-[#a67cff] to-[#7b39fc]" />
      <div className="p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#7b39fc]/10 dark:bg-[#7b39fc]/20 flex items-center justify-center mx-auto">
          <Sparkles size={22} className="text-[#7b39fc] dark:text-[#a67cff]" />
        </div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed">{text}</p>
        <button
          type="button"
          onClick={onAction}
          className="w-full text-[10px] font-black uppercase tracking-widest h-10 inline-flex items-center justify-center rounded-xl bg-[#7b39fc] hover:bg-[#8b4dff] text-white shadow-md shadow-[#7b39fc]/20 transition-colors cursor-pointer"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Widget: strumenti & risorse
   ─────────────────────────────────────────────────────────────────────────── */

export function ToolsResourcesWidget({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <SectionHeader
        icon={Wrench}
        iconClass="text-[#7b39fc] dark:text-[#a67cff]"
        title={title}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{children}</div>
    </div>
  );
}

export function ToolsPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${CARD_ROUNDED_LG} overflow-hidden hover:shadow-md transition-shadow`}>
      <div className="p-0">{children}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Toolbar e menù di personalizzazione
   ─────────────────────────────────────────────────────────────────────────── */

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
    <div className="flex items-center justify-between gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/70 border-b border-gray-100 dark:border-gray-700/60 rounded-t-3xl text-xs font-bold text-gray-500 dark:text-gray-400">
      <div className="flex items-center gap-2">
        <GripVertical size={13} className="opacity-50" />
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
          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
          title="Sposta su"
        >
          <ArrowUp size={13} />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={isLast}
          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
          title="Sposta giù"
        >
          <ArrowDown size={13} />
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
            <><EyeOff size={11} /> Nascondi</>
          ) : (
            <><Eye size={11} /> Mostra</>
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
    <div className="absolute right-0 top-full mt-2 w-72 p-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl z-50 space-y-2">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2 mb-2">
        <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">
          {labels.title}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
        >
          <X size={13} />
        </button>
      </div>
      <div className="space-y-0.5 max-h-60 overflow-y-auto">
        {ALL_WIDGET_DEFS.map((w) => {
          const IconComp = ICONS[w.icon] || Layers;
          const isVis = visibility[w.id] !== false;
          return (
            <button
              key={w.id}
              type="button"
              onClick={() => onToggle(w.id)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl text-left hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-semibold transition-colors text-gray-700 dark:text-gray-300"
            >
              <span className="flex items-center gap-2 truncate">
                <IconComp size={13} className="text-[#7b39fc] dark:text-[#a67cff] shrink-0" />
                <span className="truncate">{w.label}</span>
              </span>
              <span
                className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                  isVis
                    ? "bg-[#7b39fc] text-white"
                    : "border border-gray-300 dark:border-gray-700"
                }`}
              >
                {isVis && <Check size={10} />}
              </span>
            </button>
          );
        })}
      </div>

      <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-1">
        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 px-1">
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
              className="px-2 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-[#7b39fc]/10 dark:hover:bg-[#7b39fc]/15 text-[10px] font-bold text-gray-600 dark:text-gray-300 text-center transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Registry icone per il menu widget */
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

/* ─────────────────────────────────────────────────────────────────────────────
   Header della dashboard
   ─────────────────────────────────────────────────────────────────────────── */

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
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md shadow-[#7b39fc]/20"
          style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_LIGHT} 100%)` }}
        >
          <Sparkles size={20} className="text-white/90" />
        </motion.div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-px w-5 bg-gradient-to-r from-[#7b39fc]/0 to-[#7b39fc]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7b39fc] dark:text-[#a67cff]">
              {eyebrow}
            </span>
          </div>
          <h2 className="font-extrabold text-2xl md:text-3xl leading-tight tracking-tight text-gray-900 dark:text-white">
            {title}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-0.5 text-sm">
            {subtitle}
          </p>
        </div>
      </div>

      {showCustomize && onToggleEdit && (
        <button
          type="button"
          id="customize-analytics-btn"
          onClick={onToggleEdit}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md cursor-pointer ${
            isEditing
              ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
              : "bg-gradient-to-r from-[#7b39fc] to-[#a67cff] hover:brightness-110 text-white shadow-[#7b39fc]/20"
          }`}
        >
          {isEditing ? (
            <><Check size={14} /><span>{customizeLabel}</span></>
          ) : (
            <><SlidersHorizontal size={14} /><span>{customizeLabel}</span></>
          )}
        </button>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Banner di personalizzazione
   ─────────────────────────────────────────────────────────────────────────── */

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
    <div className="p-4 md:p-5 rounded-3xl bg-[#7b39fc]/8 dark:bg-[#7b39fc]/12 border border-[#7b39fc]/20 dark:border-[#7b39fc]/25 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-black uppercase tracking-widest text-[#7b39fc] dark:text-[#a67cff]">
            {title}
          </span>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400">{description}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={onManage}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Layers size={13} className="text-[#7b39fc] dark:text-[#a67cff]" />
            <span>{labels.manage}</span>
          </button>
          {manager}
        </div>

        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          title="Ripristina layout predefinito"
        >
          <RotateCcw size={12} />
          <span>{labels.reset}</span>
        </button>

        <button
          type="button"
          onClick={onDone}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7b39fc] hover:bg-[#8b4dff] text-white text-xs font-black uppercase tracking-wider transition-colors shadow-md shadow-[#7b39fc]/20"
        >
          <Check size={13} />
          <span>{labels.done}</span>
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Banner quota piano
   ─────────────────────────────────────────────────────────────────────────── */

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
    <div className={`${CARD_ROUNDED} flex items-center gap-3 px-4 py-3`}>
      <div className="w-9 h-9 rounded-xl bg-[#7b39fc]/10 dark:bg-[#7b39fc]/20 flex items-center justify-center shrink-0">
        <Zap size={16} className="text-[#7b39fc] dark:text-[#a67cff]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-bold text-gray-600 dark:text-gray-300">
            {label}{" "}
            <span className="font-black uppercase tracking-widest text-[#7b39fc] dark:text-[#a67cff]">
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
            <span className="shrink-0 text-[9px] font-black uppercase tracking-widest text-emerald-500 dark:text-emerald-400">
              {nextUpLabel} {max - used}
            </span>
          )}
        </div>
        <div className="mt-2 h-1 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(100, (used / max) * 100)}%`,
              background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT_LIGHT})`,
            }}
          />
        </div>
      </div>
    </div>
  );
}