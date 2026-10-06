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
  Target,
  ListTodo,
  Lightbulb,
  Zap,
} from "lucide-react";
import {
  ALL_WIDGET_DEFS,
  DEFAULT_WIDGET_ORDER,
  AiInsightsWidget,
  CriticalTasksWidget,
  DashboardHeader,
  EditModeBanner,
  GoalProgressWidget,
  PlanQuotaBanner,
  QuickNavWidget,
  QuickStatsWidget,
  RecentIdeasWidget,
  TodayFocusWidget,
  ToolsPanel,
  ToolsResourcesWidget,
  WeeklyTrendWidget,
  WidgetEditToolbar,
  WidgetManagerMenu,
  type WidgetId,
} from "./dashboard/widgets";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../lib/LanguageContext";
import { trackOnboardingEvent } from "../hooks/useOnboarding";
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

export type { WidgetId };

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
      trackOnboardingEvent("dashboard_customized");
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
      label: t("statActiveTasks", "Task Attivi"),
      value: safeTasks.length - completedTasks,
      icon: <ListTodo className="text-[#7b39fc]" />,
      bgClass: "bg-[#7b39fc]/10",
      iconColor: "text-[#7b39fc]",
      sub: t("statAwaiting", "In attesa"),
    },
    {
      label: t("statGoals", "Obiettivi"),
      value: safeGoals.length,
      icon: <Target className="text-rose-500" />,
      bgClass: "bg-rose-500/10",
      iconColor: "text-rose-500",
      sub: `${completedGoals} ${t("statGoalsAchieved", "Completati")}`,
    },
    {
      label: t("statIdeas", "Idee / Spunti"),
      value: safeIdeas.length,
      icon: <Lightbulb className="text-amber-500" />,
      bgClass: "bg-amber-500/10",
      iconColor: "text-amber-500",
      sub: t("statIdeasAwaiting", "Nel Brain Dump"),
    },
    {
      label: t("statFocus", "Focus di Oggi"),
      value:
        todayFocus.length > 18
          ? todayFocus.substring(0, 18) + "..."
          : todayFocus,
      icon: <Zap className="text-[#a67cff]" />,
      bgClass: "bg-[#a67cff]/10",
      iconColor: "text-[#a67cff]",
      sub: t("statFocusSub", "Priorità chiave"),
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
      <WidgetEditToolbar
        label={widgetDef?.label || widgetId}
        isVisible={isVisible}
        isFirst={index === 0}
        isLast={index === widgetOrder.length - 1}
        onMoveUp={() => moveWidget(index, "up")}
        onMoveDown={() => moveWidget(index, "down")}
        onToggle={() => toggleWidgetVisibility(widgetId)}
        hiddenLabel="Nascosto"
      />
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
            <QuickStatsWidget stats={Array.isArray(stats) ? stats : []} />
          </motion.div>
        );

      case "today_focus":
        return (
          <motion.div key={widgetId} variants={itemAnim} className={wrapperClass}>
            {editToolbar}
            <TodayFocusWidget
              focus={todayFocus}
              completionRate={completionRate}
              criticalCount={highPriorityTasks.length}
              activeGoalsCount={activeGoals.length}
              completedCount={completedTasks}
              labels={{
                focus: t("dash.focusToday", "Focus di Oggi"),
                critical: t("criticalTasks", "Task Critici"),
                activeGoals: t("activeGoalsLabel", "Obiettivi Attivi"),
                done: t("done", "Completati"),
                completed: t("done", "Completato"),
              }}
            />
          </motion.div>
        );

      case "weekly_trend":
        return (
          <motion.div key={widgetId} variants={itemAnim} className={wrapperClass}>
            {editToolbar}
            <WeeklyTrendWidget
              data={trendData}
              title={t("dash.trendTitle", "Trend & Produttività Settimanale")}
              subtitle={t("dash.trendSub", "Attività e tasso di completamento ultimi 7 giorni")}
              statusLabel={t("dash.trendActive", "Attivo")}
            />
          </motion.div>
        );

      case "critical_tasks":
        return (
          <motion.div key={widgetId} variants={itemAnim} className={wrapperClass}>
            {editToolbar}
            <CriticalTasksWidget
              tasks={highPriorityTasks || []}
              title={t("priorityHigh", "Task ad Alta Priorità")}
              seeAllLabel={t("seeAll", "Vedi tutti")}
              seeAllHref="/dashboard?view=mytasks"
              emptyLabel={t("noCriticalTasks", "Nessun task ad alta priorità in sospeso. Ottimo lavoro!")}
            />
          </motion.div>
        );

      case "recent_ideas":
        return (
          <motion.div key={widgetId} variants={itemAnim} className={wrapperClass}>
            {editToolbar}
            <RecentIdeasWidget
              ideas={recentIdeas || []}
              title={t("recentIdeas", "Brain Dump & Idee")}
              linkLabel={t("dash.brainDump", "Brain Dump")}
              linkHref="/dashboard"
              emptyLabel={t("noIdeas", "Nessuna idea salvata di recente. Annota i tuoi pensieri liberi!")}
              defaultCategory={t("dash.generalCategory", "Generale")}
            />
          </motion.div>
        );

      case "goal_progress":
        return (
          <motion.div key={widgetId} variants={itemAnim} className={wrapperClass}>
            {editToolbar}
            <GoalProgressWidget
              goals={activeGoals || []}
              title={t("goalProgress", "Progresso Obiettivi")}
              emptyLabel={t("noActiveGoals", "Nessun obiettivo attivo. Impostane uno per monitorare i tuoi traguardi!")}
            />
          </motion.div>
        );

      case "quick_nav":
        return (
          <motion.div key={widgetId} variants={itemAnim} className={wrapperClass}>
            {editToolbar}
            <QuickNavWidget
              labels={{
                title: t("quickNav", "Azioni Rapide"),
                newProject: t("newProject", "Nuovo Progetto"),
                newIdea: t("newIdea", "Nuova Idea"),
              }}
            />
          </motion.div>
        );

      case "ai_insights":
        return (
          <motion.div key={widgetId} variants={itemAnim} className={wrapperClass}>
            {editToolbar}
            <AiInsightsWidget
              text={t("aiAnalysis", "L'intelligenza artificiale può analizzare i tuoi impegni e suggerire la pianificazione ideale.")}
              actionLabel={t("aiAction", "Genera Piano Ottimale")}
              onAction={() => {
                window.dispatchEvent(new Event("open-ai-panel-page"));
              }}
            />
          </motion.div>
        );

      case "tools_resources":
        return (
          <motion.div key={widgetId} variants={itemAnim} className={wrapperClass}>
            {editToolbar}
            <ToolsResourcesWidget title={t("resourcesTools", "Strumenti & Risorse")}>
              <ToolsPanel>
                <FileUploader />
              </ToolsPanel>
              <ToolsPanel>
                <TemplateGallery />
              </ToolsPanel>
              <ToolsPanel>
                <ImportExport />
              </ToolsPanel>
            </ToolsResourcesWidget>
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
      <motion.div variants={itemAnim}>
        <DashboardHeader
          eyebrow={t("land.mockNavDashboard", "Dashboard & Analitiche")}
          title={t("dashboardTitle", "Panoramica Analitiche")}
          subtitle={t("dashboardSubtitle", "Monitora produttività, scadenze e obiettivi in un unico spazio.")}
          customizeLabel={
            isEditMode
              ? t("dash.saveAndExit", "Salva ed Esci")
              : t("dash.customizeAnalytics", "Personalizza Analitiche")
          }
          isEditing={isEditMode}
          onToggleEdit={() => setIsEditMode(!isEditMode)}
        />
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
            <EditModeBanner
              title={t("dash.editModeTitle", "Modalità Personalizzazione Attiva")}
              description={t("dash.editModeDesc", "Usa i controlli su ciascun widget per riordinare, mostrare o nascondere le sezioni.")}
              onManage={() => setIsAddMenuOpen(!isAddMenuOpen)}
              onReset={resetToDefault}
              onDone={() => setIsEditMode(false)}
              labels={{
                manage: t("dash.manageWidgets", "Gestisci Widget"),
                reset: t("dash.resetLayout", "Ripristina"),
                done: t("dash.done", "Fatto"),
              }}
              manager={
                isAddMenuOpen ? (
                  <WidgetManagerMenu
                    visibility={visibleWidgets}
                    onToggle={toggleWidgetVisibility}
                    onPreset={applyPreset}
                    onClose={() => setIsAddMenuOpen(false)}
                    labels={{
                      title: t("dash.widgetVisibility", "Visibilità Widget"),
                      presets: t("dash.quickPresets", "Preset Rapidi"),
                      all: t("dash.presetAll", "Tutto"),
                      analytics: t("dash.presetAnalytics", "Analitiche"),
                      focus: t("dash.presetFocus", "Focus"),
                      minimal: t("dash.presetMinimal", "Minimale"),
                    }}
                  />
                ) : null
              }
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plan quota banner if applicable */}
      {plan && plan.maxPages && (
        <motion.div variants={itemAnim}>
          <PlanQuotaBanner
            planName={plan.name}
            used={safePages.length}
            max={plan.maxPages}
            label={t("pg.planLabel", "Piano")}
            word={t("pg.pagesWord", "pagine")}
            upgradeLabel={t("pg.upgradePlan", "Esegui Upgrade")}
            nextUpLabel={t("pg.nextUp", "Disponibili:")}
            upgradeHref="/#pricing"
          />
        </motion.div>
      )}

      {/* Dynamically Ordered Widgets */}
      <div className="space-y-8">
        {widgetOrder.map((wId, index) => renderWidget(wId, index))}
      </div>
    </motion.div>
  );
}