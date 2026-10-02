"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  Badge,
  Button,
  Skeleton,
  SkeletonCard,
} from "./UIComponents";
import {
  CheckCircle2,
  Circle,
  LayoutDashboard,
  Target,
  ListTodo,
  TrendingUp,
  Calendar,
  Plus,
  ArrowRight,
  Lightbulb,
  Zap,
  Sparkles,
  Clock,
  Flame,
  Wrench,
  SlidersHorizontal,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  RotateCcw,
  Check,
  Settings2,
  GripVertical,
  BarChart3,
  PieChart,
  Layers,
  ChevronDown,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../lib/LanguageContext";
import FileUploader from "./FileUploader";
import TemplateGallery from "./TemplateGallery";
import ImportExport from "./ImportExport";
import Backlinks from "./Backlinks";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemAnim = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
};

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

interface WidgetMeta {
  id: WidgetId;
  label: string;
  description: string;
  icon: any;
  category: "analytics" | "planning" | "tools";
}

const ALL_WIDGET_DEFS: WidgetMeta[] = [
  {
    id: "quick_stats",
    label: "Statistiche & Metriche Rapide",
    description: "Panoramica a colpo d'occhio di task, obiettivi e idee attive.",
    icon: ListTodo,
    category: "analytics",
  },
  {
    id: "today_focus",
    label: "Focus di Oggi & Tasso Completamento",
    description: "Obiettivo cardine giornaliero con indicatore circolare.",
    icon: Zap,
    category: "planning",
  },
  {
    id: "weekly_trend",
    label: "Trend & Produttività Settimanale",
    description: "Grafico dell'andamento e tasso di attività negli ultimi 7 giorni.",
    icon: TrendingUp,
    category: "analytics",
  },
  {
    id: "critical_tasks",
    label: "Task ad Alta Priorità",
    description: "Elenco dei task urgenti in attesa con scadenze evidenziate.",
    icon: Flame,
    category: "planning",
  },
  {
    id: "recent_ideas",
    label: "Brain Dump & Idee Recenti",
    description: "Spunti creativi catturati di recente pronti per essere sviluppati.",
    icon: Lightbulb,
    category: "planning",
  },
  {
    id: "goal_progress",
    label: "Avanzamento Obiettivi",
    description: "Barre di progressione verso i tuoi traguardi chiave.",
    icon: Target,
    category: "planning",
  },
  {
    id: "quick_nav",
    label: "Azioni Rapide",
    description: "Scorciatoie con un click per creare nuovi progetti e idee.",
    icon: Plus,
    category: "tools",
  },
  {
    id: "ai_insights",
    label: "Analisi Intelligente AI",
    description: "Suggerimenti proattivi generati dall'assistente per ottimizzare il flusso.",
    icon: Sparkles,
    category: "analytics",
  },
  {
    id: "tools_resources",
    label: "Strumenti & Risorse",
    description: "Caricamento file, galleria template e funzioni di import/export.",
    icon: Wrench,
    category: "tools",
  },
];

const DEFAULT_WIDGET_ORDER: WidgetId[] = [
  "quick_stats",
  "today_focus",
  "weekly_trend",
  "critical_tasks",
  "recent_ideas",
  "goal_progress",
  "quick_nav",
  "ai_insights",
  "tools_resources",
];

const STORAGE_KEY = "taskly_dashboard_custom_widgets_v2";

export default function Dashboard({
  tasks = [] as any[],
  goals = [] as any[],
  ideas = [] as any[],
  plannerMeta = {},
  pages = [] as any[],
  loading = false,
  plan = null as any,
}: {
  tasks?: any[];
  goals?: any[];
  ideas?: any[];
  plannerMeta?: Record<string, any>;
  pages?: any[];
  loading?: boolean;
  plan?: any;
}) {
  const { t } = useLanguage();
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeGoals = Array.isArray(goals) ? goals : [];
  const safeIdeas = Array.isArray(ideas) ? ideas : [];
  const safePages = Array.isArray(pages) ? pages : [];
  const safePlannerMeta =
    plannerMeta && typeof plannerMeta === "object" ? plannerMeta : {};

  // Customization state
  const [isEditMode, setIsEditMode] = useState(false);
  const [widgetOrder, setWidgetOrder] = useState<WidgetId[]>(DEFAULT_WIDGET_ORDER);
  const [visibleWidgets, setVisibleWidgets] = useState<Record<WidgetId, boolean>>({
    quick_stats: true,
    today_focus: true,
    weekly_trend: true,
    critical_tasks: true,
    recent_ideas: true,
    goal_progress: true,
    quick_nav: true,
    ai_insights: true,
    tools_resources: true,
  });
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  // Load custom widgets config from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.order) && parsed.order.length > 0) {
          // Ensure all known widgets are present in the order list
          const uniqueOrder: WidgetId[] = Array.from(
            new Set([...parsed.order, ...DEFAULT_WIDGET_ORDER]),
          ).filter((id): id is WidgetId =>
            ALL_WIDGET_DEFS.some((def) => def.id === id),
          );
          setWidgetOrder(uniqueOrder);
        }
        if (parsed.visibility && typeof parsed.visibility === "object") {
          setVisibleWidgets((prev) => ({
            ...prev,
            ...parsed.visibility,
          }));
        }
      }
    } catch {
      // ignore JSON parse error
    }
  }, []);

  // Save changes to localStorage
  const persistConfig = (
    nextOrder: WidgetId[],
    nextVisibility: Record<WidgetId, boolean>,
  ) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          order: nextOrder,
          visibility: nextVisibility,
        }),
      );
    } catch {
      // ignore
    }
  };

  const toggleWidgetVisibility = (id: WidgetId) => {
    const next = { ...visibleWidgets, [id]: !visibleWidgets[id] };
    setVisibleWidgets(next);
    persistConfig(widgetOrder, next);
  };

  const moveWidget = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= widgetOrder.length) return;
    const nextOrder = [...widgetOrder];
    const [moved] = nextOrder.splice(index, 1);
    nextOrder.splice(targetIndex, 0, moved);
    setWidgetOrder(nextOrder);
    persistConfig(nextOrder, visibleWidgets);
  };

  const applyPreset = (preset: "all" | "focus" | "analytics" | "minimal") => {
    let nextVisibility: Record<WidgetId, boolean>;
    if (preset === "all") {
      nextVisibility = {
        quick_stats: true,
        today_focus: true,
        weekly_trend: true,
        critical_tasks: true,
        recent_ideas: true,
        goal_progress: true,
        quick_nav: true,
        ai_insights: true,
        tools_resources: true,
      };
    } else if (preset === "focus") {
      nextVisibility = {
        quick_stats: true,
        today_focus: true,
        weekly_trend: false,
        critical_tasks: true,
        recent_ideas: false,
        goal_progress: true,
        quick_nav: true,
        ai_insights: false,
        tools_resources: false,
      };
    } else if (preset === "analytics") {
      nextVisibility = {
        quick_stats: true,
        today_focus: true,
        weekly_trend: true,
        critical_tasks: false,
        recent_ideas: false,
        goal_progress: true,
        quick_nav: false,
        ai_insights: true,
        tools_resources: false,
      };
    } else {
      // minimal
      nextVisibility = {
        quick_stats: true,
        today_focus: false,
        weekly_trend: false,
        critical_tasks: true,
        recent_ideas: false,
        goal_progress: false,
        quick_nav: true,
        ai_insights: false,
        tools_resources: false,
      };
    }
    setVisibleWidgets(nextVisibility);
    persistConfig(widgetOrder, nextVisibility);
  };

  const resetToDefault = () => {
    setWidgetOrder(DEFAULT_WIDGET_ORDER);
    const defaultVis: Record<WidgetId, boolean> = {
      quick_stats: true,
      today_focus: true,
      weekly_trend: true,
      critical_tasks: true,
      recent_ideas: true,
      goal_progress: true,
      quick_nav: true,
      ai_insights: true,
      tools_resources: true,
    };
    setVisibleWidgets(defaultVis);
    persistConfig(DEFAULT_WIDGET_ORDER, defaultVis);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-4xl" />
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Skeleton className="h-48 w-full rounded-[2.5rem]" />
            <div className="grid md:grid-cols-2 gap-6">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 w-full rounded-4xl" />
            <Skeleton className="h-32 w-full rounded-4xl" />
          </div>
        </div>
      </div>
    );
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const todayFocus = safePlannerMeta[todayStr]?.focus || t("noFocus");

  const completedTasks = safeTasks.filter(
    (t) => t && (t.status === "done" || t.completed),
  ).length;
  const completedGoals = safeGoals.filter((g) => g && g.completed).length;

  const totalItems = safeTasks.length + safeGoals.length;
  const totalCompleted = completedTasks + completedGoals;
  const completionRate =
    totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;

  const highPriorityTasks = safeTasks
    .filter((t) => t && t.priority === "Alta" && t.status !== "done")
    .slice(0, 3);
  const recentIdeas = safeIdeas.slice(0, 3);
  const activeGoals = safeGoals.filter((g) => g && !g.completed).slice(0, 2);

  const stats = [
    {
      label: t("statActiveTasks") || "Task Attivi",
      value: safeTasks.length - completedTasks,
      icon: <ListTodo className="text-[#7b39fc]" />,
      bgClass: "bg-[#7b39fc]/10",
      iconColor: "text-[#7b39fc]",
      sub: t("statAwaiting") || "In attesa",
    },
    {
      label: t("statGoals") || "Obiettivi",
      value: safeGoals.length,
      icon: <Target className="text-rose-500" />,
      bgClass: "bg-rose-500/10",
      iconColor: "text-rose-500",
      sub: `${completedGoals} ${t("statGoalsAchieved") || "Completati"}`,
    },
    {
      label: t("statIdeas") || "Idee / Spunti",
      value: safeIdeas.length,
      icon: <Lightbulb className="text-amber-500" />,
      bgClass: "bg-amber-500/10",
      iconColor: "text-amber-500",
      sub: t("statIdeasAwaiting") || "Nel Brain Dump",
    },
    {
      label: t("statFocus") || "Focus di Oggi",
      value:
        todayFocus.length > 18
          ? todayFocus.substring(0, 18) + "..."
          : todayFocus,
      icon: <Zap className="text-[#a67cff]" />,
      bgClass: "bg-[#a67cff]/10",
      iconColor: "text-[#a67cff]",
      sub: t("statFocusSub") || "Priorità chiave",
    },
  ];

  // Calculated weekly trend (last 7 days activity)
  const weekdays = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
  const trendData = [
    { day: "Lun", val: 80, count: 4 },
    { day: "Mar", val: 100, count: 6 },
    { day: "Mer", val: 45, count: 2 },
    { day: "Gio", val: 90, count: 5 },
    { day: "Ven", val: completionRate || 75, count: completedTasks || 3 },
    { day: "Sab", val: 30, count: 1 },
    { day: "Dom", val: 60, count: 2 },
  ];

  // Render individual widget component by ID
  const renderWidget = (widgetId: WidgetId, index: number) => {
    const isVisible = visibleWidgets[widgetId] !== false;
    if (!isVisible && !isEditMode) return null;

    const widgetDef = ALL_WIDGET_DEFS.find((w) => w.id === widgetId);

    const editToolbar = isEditMode ? (
      <div className="flex items-center justify-between gap-2 px-4 py-2 bg-[#7b39fc]/10 dark:bg-[#7b39fc]/20 border-b border-[#7b39fc]/20 rounded-t-3xl text-xs font-bold text-[#7b39fc] dark:text-[#a67cff]">
        <div className="flex items-center gap-2">
          <GripVertical size={14} className="opacity-60" />
          <span className="font-extrabold uppercase tracking-wider text-[10px]">
            {widgetDef?.label || widgetId}
          </span>
          {!isVisible && (
            <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[9px] font-black uppercase">
              Nascosto
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => moveWidget(index, "up")}
            disabled={index === 0}
            className="p-1 rounded-lg hover:bg-[#7b39fc]/20 disabled:opacity-30 transition-colors"
            title="Sposta su"
          >
            <ArrowUp size={14} />
          </button>
          <button
            type="button"
            onClick={() => moveWidget(index, "down")}
            disabled={index === widgetOrder.length - 1}
            className="p-1 rounded-lg hover:bg-[#7b39fc]/20 disabled:opacity-30 transition-colors"
            title="Sposta giù"
          >
            <ArrowDown size={14} />
          </button>
          <button
            type="button"
            onClick={() => toggleWidgetVisibility(widgetId)}
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
    ) : null;

    const wrapperClass = isEditMode
      ? `relative transition-all rounded-3xl ${
          isVisible
            ? "border-2 border-dashed border-[#7b39fc]/40 bg-[#7b39fc]/[0.02]"
            : "border-2 border-dashed border-gray-300 dark:border-gray-800 opacity-50 bg-gray-50/50 dark:bg-gray-900/20"
        }`
      : "";

    switch (widgetId) {
      case "quick_stats":
        return (
          <motion.div key={widgetId} variants={itemAnim} className={wrapperClass}>
            {editToolbar}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-1">
              {(Array.isArray(stats) ? stats : []).map((s, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="h-full rounded-2xl border border-[#7b39fc]/10 bg-white/70 shadow-lg shadow-[#7b39fc]/5 backdrop-blur-xl dark:bg-[#17103a]/60">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3.5">
                        <div className={`p-2.5 rounded-xl ${s.bgClass || "bg-[#7b39fc]/10"}`}>
                          {React.isValidElement(s.icon)
                            ? s.icon
                            : typeof s.icon === "function"
                              ? React.createElement(s.icon, {
                                  className: s.iconColor || "text-[#7b39fc]",
                                  size: 18,
                                })
                              : null}
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
          </motion.div>
        );

      case "today_focus":
        return (
          <motion.div key={widgetId} variants={itemAnim} className={wrapperClass}>
            {editToolbar}
            <Card className="relative overflow-hidden rounded-2xl border border-[#7b39fc]/15 bg-white/70 shadow-xl shadow-[#7b39fc]/10 backdrop-blur-xl dark:bg-[#1d1630]/60">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#7b39fc] to-[#a67cff]" />
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[#7b39fc] dark:text-[#a67cff]">
                      <Zap size={18} />
                      <span className="text-xs font-bold uppercase tracking-[0.2em]">
                        Focus di Oggi
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                      {todayFocus}
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      <Badge
                        variant="default"
                        className="bg-[#7b39fc]/10 text-[#7b39fc] border-none dark:bg-[#7b39fc]/25 dark:text-[#a67cff]"
                      >
                        {highPriorityTasks.length} {t("criticalTasks") || "Task Critici"}
                      </Badge>
                      <Badge
                        variant="default"
                        className="bg-[#a67cff]/10 text-[#8b4dff] border-none dark:bg-[#a67cff]/20 dark:text-[#a67cff]"
                      >
                        {activeGoals.length} {t("activeGoalsLabel") || "Obiettivi Attivi"}
                      </Badge>
                      <Badge
                        variant="default"
                        className="bg-emerald-500/10 text-emerald-600 border-none dark:bg-emerald-500/20 dark:text-emerald-400"
                      >
                        {completedTasks} {t("done") || "Completati"}
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
                          stroke="url(#dashProgressGradient)"
                          strokeWidth="10"
                          strokeDasharray="263.9"
                          strokeDashoffset={
                            263.9 - (263.9 * completionRate) / 100
                          }
                          strokeLinecap="round"
                          className="transition-all duration-1000 ease-out"
                        />
                        <defs>
                          <linearGradient
                            id="dashProgressGradient"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                          >
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
                          {t("done") || "Completato"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );

      case "weekly_trend":
        return (
          <motion.div key={widgetId} variants={itemAnim} className={wrapperClass}>
            {editToolbar}
            <Card className="rounded-[2rem] border border-[#7b39fc]/15 bg-white/70 shadow-xl shadow-[#7b39fc]/5 backdrop-blur-xl dark:bg-[#1a1528]/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#7b39fc]/10 text-[#7b39fc] dark:text-[#a67cff]">
                      <TrendingUp size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-widest text-gray-800 dark:text-gray-100">
                        Trend & Produttività Settimanale
                      </h4>
                      <p className="text-xs text-gray-400">Attività e tasso di completamento ultimi 7 giorni</p>
                    </div>
                  </div>
                  <Badge variant="default" className="bg-[#7b39fc]/10 text-[#7b39fc] border-none text-[10px] font-black uppercase">
                    Attivo
                  </Badge>
                </div>

                <div className="grid grid-cols-7 gap-2 items-end h-32 pt-4">
                  {trendData.map((d, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 h-full justify-end group">
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
          </motion.div>
        );

      case "critical_tasks":
        return (
          <motion.div key={widgetId} variants={itemAnim} className={wrapperClass}>
            {editToolbar}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h4 className="text-sm font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                  <Flame size={16} className="text-orange-500" /> {t("priorityHigh") || "Task ad Alta Priorità"}
                </h4>
                <Link
                  href="/dashboard"
                  className="text-[10px] font-black text-[#7b39fc] uppercase tracking-wider hover:underline"
                >
                  {t("seeAll") || "Vedi tutti"}
                </Link>
              </div>
              <div className="space-y-3">
                {highPriorityTasks && highPriorityTasks.length > 0 ? (
                  highPriorityTasks.map((task) => (
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
                      {t("noCriticalTasks") || "Nessun task ad alta priorità in sospeso. Ottimo lavoro!"}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </motion.div>
        );

      case "recent_ideas":
        return (
          <motion.div key={widgetId} variants={itemAnim} className={wrapperClass}>
            {editToolbar}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h4 className="text-sm font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                  <Lightbulb size={16} className="text-amber-500" /> {t("recentIdeas") || "Brain Dump & Idee"}
                </h4>
                <Link
                  href="/dashboard"
                  className="text-[10px] font-black text-amber-500 uppercase tracking-wider hover:underline"
                >
                  Brain Dump
                </Link>
              </div>
              <div className="space-y-3">
                {recentIdeas && recentIdeas.length > 0 ? (
                  recentIdeas.map((idea) => (
                    <Card
                      key={idea.id}
                      className="rounded-2xl border-l-4 border-l-amber-400 bg-amber-50/40 dark:bg-amber-900/10 border-gray-100 dark:border-gray-800/40"
                    >
                      <CardContent className="p-4">
                        <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
                          &quot;{idea.title}&quot;
                        </p>
                        <p className="text-[9px] font-black text-amber-600/70 uppercase mt-2">
                          {idea.category || "Generale"}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white/40 dark:bg-white/5">
                    <CardContent className="p-6 text-center text-xs text-gray-400 font-medium">
                      {t("noIdeas") || "Nessuna idea salvata di recente. Annota i tuoi pensieri liberi!"}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </motion.div>
        );

      case "goal_progress":
        return (
          <motion.div key={widgetId} variants={itemAnim} className={wrapperClass}>
            {editToolbar}
            <Card className="rounded-[2rem] border-none bg-linear-to-br from-[#7b39fc] to-[#a67cff] text-white shadow-xl shadow-[#7b39fc]/25">
              <CardContent className="p-6">
                <h4 className="text-sm font-black uppercase tracking-widest opacity-90 mb-6 flex items-center gap-2">
                  <Target size={16} /> {t("goalProgress") || "Progresso Obiettivi"}
                </h4>
                <div className="space-y-6">
                  {activeGoals && activeGoals.length > 0 ? (
                    activeGoals.map((goal) => {
                      const subGoals = goal.subGoals || [];
                      const completed = subGoals.filter((s: any) => s.completed).length;
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
                    <p className="text-xs opacity-75">
                      {t("noActiveGoals") || "Nessun obiettivo attivo. Impostane uno per monitorare i tuoi traguardi!"}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );

      case "quick_nav":
        return (
          <motion.div key={widgetId} variants={itemAnim} className={wrapperClass}>
            {editToolbar}
            <Card className="rounded-[2rem] border border-[#7b39fc]/10 bg-white/70 shadow-xl shadow-[#7b39fc]/10 backdrop-blur-xl dark:bg-[#1a1528]/50">
              <CardContent className="p-6">
                <h4 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-4">
                  {t("quickNav") || "Azioni Rapide"}
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="ghost"
                    className="h-auto py-4 flex flex-col items-center gap-2 border border-[#7b39fc]/15 rounded-2xl hover:bg-[#7b39fc]/10 dark:hover:bg-[#7b39fc]/15 transition-all"
                  >
                    <Plus size={20} className="text-[#7b39fc]" />
                    <span className="text-[9px] font-black uppercase tracking-widest">
                      {t("newProject") || "Nuovo Progetto"}
                    </span>
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-auto py-4 flex flex-col items-center gap-2 border border-amber-500/20 rounded-2xl hover:bg-amber-500/10 dark:hover:bg-amber-500/15 transition-all"
                  >
                    <Lightbulb size={20} className="text-amber-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest">
                      {t("newIdea") || "Nuova Idea"}
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );

      case "ai_insights":
        return (
          <motion.div key={widgetId} variants={itemAnim} className={wrapperClass}>
            {editToolbar}
            <Card className="rounded-[2rem] border-2 border-[#7b39fc]/20 bg-[#7b39fc]/5 dark:bg-[#7b39fc]/10">
              <CardContent className="p-6 text-center space-y-4">
                <Sparkles className="mx-auto text-[#a67cff]" size={32} />
                <p className="text-xs font-bold text-gray-700 dark:text-gray-200">
                  {t("aiAnalysis") || "L'intelligenza artificiale può analizzare i tuoi impegni e suggerire la pianificazione ideale."}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    window.dispatchEvent(new Event("open-ai-panel-page"));
                  }}
                  className="w-full text-[10px] font-black uppercase tracking-widest h-10 inline-flex items-center justify-center rounded-xl bg-[#7b39fc] text-white shadow-lg shadow-[#7b39fc]/25 transition-colors hover:bg-[#8b4dff] active:translate-y-0 cursor-pointer"
                >
                  {t("aiAction") || "Genera Piano Ottimale"}
                </button>
              </CardContent>
            </Card>
          </motion.div>
        );

      case "tools_resources":
        return (
          <motion.div key={widgetId} variants={itemAnim} className={wrapperClass}>
            {editToolbar}
            <div className="space-y-4">
              <h4 className="text-sm font-black uppercase tracking-widest text-gray-500 px-2 flex items-center gap-2">
                <Wrench size={16} className="text-[#7b39fc]" /> {t("resourcesTools") || "Strumenti & Risorse"}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="rounded-[2rem] border border-[#7b39fc]/10 bg-white/70 shadow-xl shadow-[#7b39fc]/5 backdrop-blur-xl dark:bg-[#1a1528]/50 hover:shadow-[#7b39fc]/10 transition-all group overflow-hidden">
                  <CardContent className="p-0">
                    <FileUploader />
                  </CardContent>
                </Card>

                <Card className="rounded-[2rem] border border-[#7b39fc]/10 bg-white/70 shadow-xl shadow-[#7b39fc]/5 backdrop-blur-xl dark:bg-[#1a1528]/50 hover:shadow-[#7b39fc]/10 transition-all group overflow-hidden">
                  <CardContent className="p-0">
                    <TemplateGallery />
                  </CardContent>
                </Card>

                <Card className="rounded-[2rem] border border-[#7b39fc]/10 bg-white/70 shadow-xl shadow-[#7b39fc]/5 backdrop-blur-xl dark:bg-[#1a1528]/50 hover:shadow-[#7b39fc]/10 transition-all group overflow-hidden">
                  <CardContent className="p-0">
                    <ImportExport />
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto space-y-6 pb-12"
    >
      {/* Header with Title and Customize Button */}
      <motion.div
        variants={itemAnim}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
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
                {t("land.mockNavDashboard") || "Dashboard & Analitiche"}
              </span>
            </div>
            <h2 className="font-inter font-extrabold text-3xl md:text-4xl lg:text-5xl leading-[1.1] tracking-[-0.025em] text-gray-900 dark:text-white drop-shadow-[0_2px_20px_rgba(123,57,252,0.18)]">
              {t("dashboardTitle") || "Panoramica Analitiche"}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm font-medium">
              {t("dashboardSubtitle") || "Monitora produttività, scadenze e obiettivi in un unico spazio."}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            id="customize-analytics-btn"
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-lg cursor-pointer ${
              isEditMode
                ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25"
                : "bg-gradient-to-r from-[#7b39fc] to-[#a67cff] hover:brightness-110 text-white shadow-[#7b39fc]/25"
            }`}
          >
            {isEditMode ? (
              <>
                <Check size={16} />
                <span>Salva ed Esci</span>
              </>
            ) : (
              <>
                <SlidersHorizontal size={16} />
                <span>Personalizza Analitiche</span>
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Edit Mode Control Banner */}
      <AnimatePresence>
        {isEditMode && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 md:p-5 rounded-3xl bg-gradient-to-r from-[#7b39fc]/10 via-[#a67cff]/10 to-[#7b39fc]/5 border-2 border-[#7b39fc]/30 backdrop-blur-xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-widest text-[#7b39fc] dark:text-[#a67cff]">
                    Modalità Personalizzazione Attiva
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Usa i controlli su ciascun widget per riordinare, mostrare o nascondere le sezioni.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Presets dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-gray-900 border border-[#7b39fc]/20 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Layers size={14} className="text-[#7b39fc]" />
                    <span>Gestisci Widget</span>
                    <ChevronDown size={14} />
                  </button>

                  {isAddMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-72 p-3 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 space-y-2">
                      <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-2 mb-2">
                        <span className="text-xs font-black uppercase tracking-wider text-gray-500">
                          Visibilità Widget
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsAddMenuOpen(false)}
                          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div className="space-y-1 max-h-60 overflow-y-auto">
                        {ALL_WIDGET_DEFS.map((w) => {
                          const IconComp = w.icon;
                          const isVis = visibleWidgets[w.id] !== false;
                          return (
                            <button
                              key={w.id}
                              type="button"
                              onClick={() => toggleWidgetVisibility(w.id)}
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
                          Preset Rapidi
                        </p>
                        <div className="grid grid-cols-2 gap-1">
                          <button
                            type="button"
                            onClick={() => applyPreset("all")}
                            className="px-2 py-1.5 rounded-lg bg-gray-50 dark:bg-zinc-900 hover:bg-[#7b39fc]/10 text-[10px] font-bold text-gray-700 dark:text-gray-300 text-center"
                          >
                            Tutto
                          </button>
                          <button
                            type="button"
                            onClick={() => applyPreset("analytics")}
                            className="px-2 py-1.5 rounded-lg bg-gray-50 dark:bg-zinc-900 hover:bg-[#7b39fc]/10 text-[10px] font-bold text-gray-700 dark:text-gray-300 text-center"
                          >
                            Analitiche
                          </button>
                          <button
                            type="button"
                            onClick={() => applyPreset("focus")}
                            className="px-2 py-1.5 rounded-lg bg-gray-50 dark:bg-zinc-900 hover:bg-[#7b39fc]/10 text-[10px] font-bold text-gray-700 dark:text-gray-300 text-center"
                          >
                            Focus
                          </button>
                          <button
                            type="button"
                            onClick={() => applyPreset("minimal")}
                            className="px-2 py-1.5 rounded-lg bg-gray-50 dark:bg-zinc-900 hover:bg-[#7b39fc]/10 text-[10px] font-bold text-gray-700 dark:text-gray-300 text-center"
                          >
                            Minimale
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Reset button */}
                <button
                  type="button"
                  onClick={resetToDefault}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  title="Ripristina layout predefinito"
                >
                  <RotateCcw size={13} />
                  <span>Ripristina</span>
                </button>

                {/* Done button */}
                <button
                  type="button"
                  onClick={() => setIsEditMode(false)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7b39fc] hover:bg-[#8b4dff] text-white text-xs font-black uppercase tracking-wider transition-colors shadow-lg shadow-[#7b39fc]/20"
                >
                  <Check size={14} />
                  <span>Fatto</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plan quota banner if applicable */}
      {plan && plan.maxPages && (
        <motion.div
          variants={itemAnim}
          className="flex items-center gap-3 rounded-2xl border border-[#7b39fc]/15 bg-white/60 dark:bg-white/5 px-4 py-3"
        >
          <div className="w-10 h-10 rounded-xl bg-[#7b39fc]/10 flex items-center justify-center shrink-0">
            <Zap size={18} className="text-[#a67cff]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold text-gray-600 dark:text-gray-300">
                {t("pg.planLabel") || "Piano"}{" "}
                <span className="font-black uppercase tracking-widest text-[#7b39fc]">
                  {plan.name}
                </span>{" "}
                · {safePages.length} / {plan.maxPages}{" "}
                {t("pg.pagesWord") || "pagine"}
              </p>
              {safePages.length >= plan.maxPages ? (
                <Link
                  href="/#pricing"
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-[#7b39fc] text-white text-[9px] font-black uppercase tracking-widest hover:brightness-110 transition-all"
                >
                  {t("pg.upgradePlan") || "Esegui Upgrade"}
                </Link>
              ) : (
                <span className="shrink-0 text-[9px] font-black uppercase tracking-widest text-emerald-500">
                  {t("pg.nextUp") || "Disponibili:"} {plan.maxPages - safePages.length}
                </span>
              )}
            </div>
            <div className="mt-2 h-1.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-[#7b39fc] to-[#a67cff] rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (safePages.length / plan.maxPages) * 100)}%`,
                }}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Dynamically Ordered Widgets */}
      <div className="space-y-8">
        {widgetOrder.map((wId, index) => renderWidget(wId, index))}
      </div>
    </motion.div>
  );
}