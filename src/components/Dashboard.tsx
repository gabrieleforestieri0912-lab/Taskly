"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  Badge,
  Button,
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

/**
 * Widget trascinabile (solo in modalità personalizzazione): HTML5 drag & drop
 * nativo via maniglia ⋮⋮. Sopra/sotto la card appare la linea d'inserimento;
 * il drop riordina davvero al punto voluto. Le frecce su/giù restano come
 * alternativa accessibile e touch.
 */
function SortableWidget({
  id,
  index,
  isVisible,
  label,
  hiddenLabel,
  dragTitle,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onToggle,
  onDropWidget,
  touchTarget,
  onTouchHover,
  onTouchCommit,
  children,
}: {
  id: WidgetId;
  index: number;
  isVisible: boolean;
  label: string;
  hiddenLabel: string;
  dragTitle: string;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggle: () => void;
  onDropWidget: (draggedId: WidgetId, targetIndex: number, pos: "before" | "after") => void;
  /** Target d'inserimento del trascinamento touch (stato condiviso). */
  touchTarget: { id: WidgetId; pos: "before" | "after" } | null;
  onTouchHover: (targetId: WidgetId, pos: "before" | "after") => void;
  onTouchCommit: (draggedId: WidgetId) => void;
  children: React.ReactNode;
}) {
  const [dropPos, setDropPos] = useState<"before" | "after" | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  // Trascinamento touch (il DnD nativo non esiste su mobile): pointer capture
  // sulla maniglia, target rilevato con elementFromPoint.
  const touchDragRef = React.useRef<number | null>(null);

  const posFromEvent = (e: React.DragEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return e.clientY - rect.top < rect.height / 2 ? ("before" as const) : ("after" as const);
  };

  const showBefore = dropPos === "before" || (touchTarget?.id === id && touchTarget.pos === "before");
  const showAfter = dropPos === "after" || (touchTarget?.id === id && touchTarget.pos === "after");

  return (
    <div
      data-widget-id={id}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = "move";
        setDropPos(posFromEvent(e));
      }}
      onDragLeave={(e) => {
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        setDropPos(null);
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const pos = posFromEvent(e);
        setDropPos(null);
        let draggedId = "";
        try {
          draggedId =
            e.dataTransfer.getData("application/x-taskly-widget") ||
            e.dataTransfer.getData("text/plain");
        } catch {}
        if (draggedId && draggedId !== id) {
          onDropWidget(draggedId as WidgetId, index, pos);
        }
      }}
      className={`relative transition-colors rounded-3xl ${
        isVisible
          ? "border-2 border-dashed border-(--accent)/40 bg-(--accent)/[0.02]"
          : "border-2 border-dashed border-gray-300 dark:border-gray-800 opacity-50 bg-gray-50/50 dark:bg-gray-900/20"
      } ${isDragging ? "opacity-50" : ""}`}
    >
      {showBefore && (
        <div className="h-1 rounded-full bg-(--accent) mx-4 mt-2" aria-hidden="true" />
      )}
      <WidgetEditToolbar
        label={label}
        isVisible={isVisible}
        isFirst={isFirst}
        isLast={isLast}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onToggle={onToggle}
        hiddenLabel={hiddenLabel}
        dragTitle={dragTitle}
        isDragging={isDragging}
        onDragStart={(e) => {
          try {
            e.dataTransfer.setData("application/x-taskly-widget", id);
            e.dataTransfer.setData("text/plain", id);
          } catch {}
          e.dataTransfer.effectAllowed = "move";
          setIsDragging(true);
        }}
        onDragEnd={() => {
          setIsDragging(false);
          setDropPos(null);
        }}
        onTouchPointerDown={(e) => {
          if (e.pointerType === "mouse") return;
          e.preventDefault();
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {}
          touchDragRef.current = e.pointerId;
          setIsDragging(true);
        }}
        onTouchPointerMove={(e) => {
          if (touchDragRef.current === null || e.pointerId !== touchDragRef.current) return;
          const el = typeof document !== "undefined"
            ? document.elementFromPoint(e.clientX, e.clientY)
            : null;
          const card = el && (el as HTMLElement).closest
            ? (el as HTMLElement).closest("[data-widget-id]")
            : null;
          if (!card) return;
          const targetId = card.getAttribute("data-widget-id");
          if (!targetId) return;
          const rect = card.getBoundingClientRect();
          onTouchHover(
            targetId as WidgetId,
            e.clientY - rect.top < rect.height / 2 ? "before" : "after",
          );
        }}
        onTouchPointerUp={(e) => {
          if (touchDragRef.current === null || e.pointerId !== touchDragRef.current) return;
          touchDragRef.current = null;
          setIsDragging(false);
          onTouchCommit(id);
        }}
      />
      {children}
      {showAfter && (
        <div className="h-1 rounded-full bg-(--accent) mx-4 mb-2" aria-hidden="true" />
      )}
    </div>
  );
}

export type { WidgetId };

const STORAGE_KEY = "taskly_dashboard_custom_widgets_v2";

const DEFAULT_VISIBILITY: Record<WidgetId, boolean> = {
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

function readStoredConfig(): { order?: unknown; visibility?: unknown } {
  try {
    if (typeof window === "undefined") return {};
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return {};
    const parsed = JSON.parse(saved);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function readWidgetOrder(): WidgetId[] {
  const { order } = readStoredConfig();
  if (Array.isArray(order) && order.length > 0) {
    // Ensure all known widgets are present in the order list
    return Array.from(new Set([...order, ...DEFAULT_WIDGET_ORDER])).filter(
      (id): id is WidgetId => ALL_WIDGET_DEFS.some((def) => def.id === id),
    );
  }
  return DEFAULT_WIDGET_ORDER;
}

function readWidgetVisibility(): Record<WidgetId, boolean> {
  const { visibility } = readStoredConfig();
  if (visibility && typeof visibility === "object") {
    return { ...DEFAULT_VISIBILITY, ...(visibility as Record<string, boolean>) };
  }
  return { ...DEFAULT_VISIBILITY };
}

export default function Dashboard({
  tasks = [] as any[],
  goals = [] as any[],
  ideas = [] as any[],
  plannerMeta = {},
  pages = [] as any[],
  plan = null as any,
}: {
  tasks?: any[];
  goals?: any[];
  ideas?: any[];
  plannerMeta?: Record<string, any>;
  pages?: any[];
  plan?: any;
}) {
  const { t, language: activeLang } = useLanguage();
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeGoals = Array.isArray(goals) ? goals : [];
  const safeIdeas = Array.isArray(ideas) ? ideas : [];
  const safePages = Array.isArray(pages) ? pages : [];
  const safePlannerMeta =
    plannerMeta && typeof plannerMeta === "object" ? plannerMeta : {};

  // Customization state — init lazy da localStorage (niente setState in
  // effect: un render in meno all'avvio, analitiche subito visibili).
  const [isEditMode, setIsEditMode] = useState(false);
  const [widgetOrder, setWidgetOrder] = useState<WidgetId[]>(() =>
    readWidgetOrder(),
  );
  const [visibleWidgets, setVisibleWidgets] = useState<
    Record<WidgetId, boolean>
  >(() => readWidgetVisibility());
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

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

  // Drag & drop nativo: inserisce la trascinata prima/dopo la card di
  // destinazione (coordinate già senza la trascinata), con compensazione
  // quando resta tra gli stessi fratelli e si sposta verso il basso.
  const moveWidgetTo = (
    draggedId: WidgetId,
    targetIndex: number,
    pos: "before" | "after",
  ) => {
    const from = widgetOrder.indexOf(draggedId);
    if (from === -1) return;
    let at = pos === "before" ? targetIndex : targetIndex + 1;
    if (from < at) at -= 1;
    if (from === at) return;
    const next = [...widgetOrder];
    const [moved] = next.splice(from, 1);
    next.splice(at, 0, moved);
    setWidgetOrder(next);
    persistConfig(next, visibleWidgets);
  };

  // Trascinamento touch: target condiviso (il pointer capture reindirizza
  // gli eventi alla maniglia, le card non ricevono hover diretto).
  const [touchTarget, setTouchTarget] = useState<{
    id: WidgetId;
    pos: "before" | "after";
  } | null>(null);
  const touchTargetRef = React.useRef<typeof touchTarget>(null);
  const setTouchTargetBoth = (v: typeof touchTarget) => {
    touchTargetRef.current = v;
    setTouchTarget(v);
  };
  const moveWidgetToById = (
    draggedId: WidgetId,
    targetId: WidgetId,
    pos: "before" | "after",
  ) => {
    const targetIndex = widgetOrder.indexOf(targetId);
    if (targetIndex === -1) return;
    moveWidgetTo(draggedId, targetIndex, pos);
  };
  const commitTouchDrop = (draggedId: WidgetId) => {
    const t = touchTargetRef.current;
    setTouchTargetBoth(null);
    if (t) moveWidgetToById(draggedId, t.id, t.pos);
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

  // Le analitiche si mostrano subito con i dati in memoria (anche vuoti):
  // niente stato di caricamento, i numeri si aggiornano live all'arrivo dati.

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
    .slice(0, 5);
  const recentIdeas = safeIdeas.slice(0, 4);
  const activeGoals = safeGoals.filter((g) => g && !g.completed).slice(0, 3);

  const stats = [
    {
      label: t("statActiveTasks", "Task Attivi"),
      value: safeTasks.length - completedTasks,
      icon: <ListTodo className="text-(--accent)" />,
      bgClass: "bg-(--accent)/10",
      iconColor: "text-(--accent)",
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
      icon: <Zap className="text-(--accent-300)" />,
      bgClass: "bg-(--accent-300)/10",
      iconColor: "text-(--accent-300)",
      sub: t("statFocusSub", "Priorità chiave"),
    },
  ];

  // Real weekly trend — based on actual task completedAt or createdAt in the last 7 days.
  // If there is no data at all, every bar stays at 0 and WeeklyTrendWidget shows an empty state.
  // Etichette giorni brevi nella lingua attiva (it/en).
  const DAY_LABELS =
    activeLang === "en"
      ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      : ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
  const trendData = (() => {
    const now = new Date();
    // Build an array of the last 7 days (today = index 6)
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (6 - i));
      return d;
    });
    return days.map((day) => {
      const dayStr = day.toISOString().split("T")[0];
      const dayLabel = DAY_LABELS[day.getDay()];
      const count = safeTasks.filter((task) => {
        if (!task) return false;
        // Count tasks completed on this day
        const dateStr = (task.completedAt || task.updatedAt || task.createdAt || "").slice(0, 10);
        return dateStr === dayStr && (task.status === "done" || task.completed);
      }).length;
      return {
        day: dayLabel,
        val: count,   // raw count — WeeklyTrendWidget normalises to max
        count,
      };
    });
  })();

  // Render individual widget content by ID (i wrapper dipendono dalla modalità)
  const renderWidgetContent = (widgetId: WidgetId) => {
    switch (widgetId) {
      case "quick_stats":
        return (
          <QuickStatsWidget stats={Array.isArray(stats) ? stats : []} />
        );

      case "today_focus":
        return (
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
        );

      case "weekly_trend":
        return (
          <WeeklyTrendWidget
            data={trendData}
            title={t("dash.trendTitle", "Trend & Produttività Settimanale")}
            subtitle={t("dash.trendSub", "Attività e tasso di completamento ultimi 7 giorni")}
            statusLabel={t("dash.trendActive", "Attivo")}
            totalLabel={t("dash.trendTotal", "Totale settimana")}
            bestLabel={t("dash.trendBest", "Giorno migliore")}
          />
        );

      case "critical_tasks":
        return (
          <CriticalTasksWidget
            tasks={highPriorityTasks || []}
            title={t("priorityHigh", "Task ad Alta Priorità")}
            seeAllLabel={t("seeAll", "Vedi tutti")}
            seeAllHref="/dashboard?view=mytasks"
            emptyLabel={t("noCriticalTasks", "Nessun task ad alta priorità in sospeso. Ottimo lavoro!")}
          />
        );

      case "recent_ideas":
        return (
          <RecentIdeasWidget
            ideas={recentIdeas || []}
            title={t("recentIdeas", "Brain Dump & Idee")}
            linkLabel={t("dash.brainDump", "Brain Dump")}
            linkHref="/dashboard"
            emptyLabel={t("noIdeas", "Nessuna idea salvata di recente. Annota i tuoi pensieri liberi!")}
            defaultCategory={t("dash.generalCategory", "Generale")}
          />
        );

      case "goal_progress":
        return (
          <GoalProgressWidget
            goals={activeGoals || []}
            title={t("goalProgress", "Progresso Obiettivi")}
            emptyLabel={t("noActiveGoals", "Nessun obiettivo attivo. Impostane uno per monitorare i tuoi traguardi!")}
          />
        );

      case "quick_nav":
        return (
          <QuickNavWidget
            labels={{
              title: t("quickNav", "Azioni Rapide"),
              newProject: t("newProject", "Nuovo Progetto"),
              newIdea: t("newIdea", "Nuova Idea"),
            }}
          />
        );

      case "ai_insights":
        return (
          <AiInsightsWidget
            text={t("aiAnalysis", "L'intelligenza artificiale può analizzare i tuoi impegni e suggerire la pianificazione ideale.")}
            actionLabel={t("aiAction", "Genera Piano Ottimale")}
            onAction={() => {
              window.dispatchEvent(new Event("open-ai-panel-page"));
            }}
          />
        );

      case "tools_resources":
        return (
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
        );

      default:
        return null;
    }
  };

  // Modalità vista: wrapper animato semplice, widget nascosti saltati
  const renderWidget = (widgetId: WidgetId) => {
    if (visibleWidgets[widgetId] === false) return null;
    return (
      <motion.div key={widgetId} variants={itemAnim}>
        {renderWidgetContent(widgetId)}
      </motion.div>
    );
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto space-y-4 pb-8"
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
              description={t("dash.editModeDesc", "Trascina i widget dalla maniglia per riordinarli, oppure usa i controlli su ciascuno per mostrare o nascondere le sezioni.")}
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

      {/* Widget in ordine: drag & drop nativo in personalizzazione */}
      {isEditMode ? (
        <div className="space-y-4">
          {widgetOrder.map((wId, index) => (
            <SortableWidget
              key={wId}
              id={wId}
              index={index}
              isVisible={visibleWidgets[wId] !== false}
              label={ALL_WIDGET_DEFS.find((w) => w.id === wId)?.label || wId}
              hiddenLabel="Nascosto"
              dragTitle={t("dash.dragWidget", "Trascina per riordinare")}
              isFirst={index === 0}
              isLast={index === widgetOrder.length - 1}
              onMoveUp={() => moveWidget(index, "up")}
              onMoveDown={() => moveWidget(index, "down")}
              onToggle={() => toggleWidgetVisibility(wId)}
              onDropWidget={moveWidgetTo}
              touchTarget={touchTarget}
              onTouchHover={(targetId, pos) => setTouchTargetBoth({ id: targetId, pos })}
              onTouchCommit={commitTouchDrop}
            >
              {renderWidgetContent(wId)}
            </SortableWidget>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {widgetOrder.map((wId) => renderWidget(wId))}
        </div>
      )}
    </motion.div>
  );
}