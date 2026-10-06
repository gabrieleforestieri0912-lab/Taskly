"use client";

import React, { useEffect } from "react";
import {
  CheckCircle2,
  Circle,
  FilePlus,
  PlusCircle,
  Sparkles,
  CheckSquare,
  Search,
  LayoutDashboard,
  FolderKanban,
  X,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useOnboarding, type OnboardingStepId } from "../hooks/useOnboarding";

interface Props {
  liveStats: {
    pagesCount: number;
    tasksCount: number;
    completedTasks: number;
    hasNestedPage: boolean;
    searchUsed: boolean;
    dashboardCustomized: boolean;
  };
  useCaseLabel: string;
  onOpenTemplates: () => void;
  onVisitMyTasks: () => void;
  onCreatePage: () => void;
  onCreateTask: () => void;
  onUseSearch: () => void;
  onCustomizeDashboard: () => void;
}

const META: Record<OnboardingStepId, { label: string; hint: string; icon: any }> = {
  create_page: { label: "Crea la tua prima pagina", hint: "Note, idee, tutto tuo", icon: FilePlus },
  create_task: { label: "Aggiungi il primo task", hint: "Prova a scrivere domani", icon: PlusCircle },
  complete_task: { label: "Completa un task", hint: "Spunta e senti il progresso", icon: CheckSquare },
  use_template: { label: "Usa un template", hint: "Parti da un modello pronto", icon: Sparkles },
  organize: { label: "Organizza lo spazio", hint: "Crea una sottopagina", icon: FolderKanban },
  search: { label: "Prova Ctrl+K", hint: "Cerca pagine e task", icon: Search },
  customize: { label: "Personalizza la Home", hint: "Scegli i widget utili", icon: LayoutDashboard },
};

export default function OnboardingChecklist(props: Props) {
  const { liveStats, useCaseLabel } = props;
  const { state, doneCount, totalCount, progress, suggestion, track, update } = useOnboarding();
  const shouldReduceMotion = useReducedMotion();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  useEffect(() => {
    if (liveStats.pagesCount > 0 && !state.stepsDone.create_page) track("page_created");
    if (liveStats.tasksCount > 0 && !state.stepsDone.create_task) track("task_created");
    if (liveStats.completedTasks > 0 && !state.stepsDone.complete_task) track("task_completed");
    if (liveStats.hasNestedPage && !state.stepsDone.organize) track("page_nested");
    if (liveStats.searchUsed && !state.stepsDone.search) track("search_used");
    if (liveStats.dashboardCustomized && !state.stepsDone.customize) track("dashboard_customized");
  }, [liveStats.pagesCount, liveStats.tasksCount, liveStats.completedTasks, liveStats.hasNestedPage, liveStats.searchUsed, liveStats.dashboardCustomized, state.stepsDone.create_page, state.stepsDone.create_task, state.stepsDone.complete_task, state.stepsDone.organize, state.stepsDone.search, state.stepsDone.customize, track]);

  const done = doneCount >= totalCount;
  const celebrating = done && !state.dismissedChecklist;
  useEffect(() => {
    if (!celebrating || totalCount === 0) return;
    const t = setTimeout(() => update({ dismissedChecklist: true }), 6000);
    return () => clearTimeout(t);
  }, [celebrating, totalCount, update]);

  const order: OnboardingStepId[] =
    state.useCase === "work"
      ? ["create_task", "complete_task", "create_page", "use_template", "organize", "search", "customize"]
      : state.useCase === "study"
        ? ["create_page", "use_template", "create_task", "complete_task", "search", "organize", "customize"]
        : ["create_page", "create_task", "complete_task", "use_template", "search", "customize", "organize"];

  const go = (id: OnboardingStepId) => {
    if (id === "create_page" || id === "organize") props.onCreatePage();
    else if (id === "create_task") props.onCreateTask();
    else if (id === "complete_task") props.onVisitMyTasks();
    else if (id === "use_template") props.onOpenTemplates();
    else if (id === "search") props.onUseSearch();
    else props.onCustomizeDashboard();
  };

  return (
    <AnimatePresence>
    {!(state.dismissedChecklist && !celebrating) && (
    <motion.div
      key="onboarding-checklist"
      layout
      initial={shouldReduceMotion ? false : { opacity: 0, y: 16, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8, scale: 0.99 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.35, ease: "easeOut" }}
      className="mb-6 rounded-3xl border border-[#7b39fc]/20 p-5 shadow-sm bg-gradient-to-r from-[#7b39fc]/5 via-white/80 to-[#a67cff]/5 dark:from-[#7b39fc]/10 dark:via-gray-900/90 dark:to-transparent"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <motion.div
            animate={shouldReduceMotion || done ? undefined : { rotate: [0, -8, 8, 0], scale: [1, 1.08, 1] }}
            transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 2 }}
            className="w-8 h-8 rounded-xl bg-[#7b39fc]/10 text-[#7b39fc] flex items-center justify-center shrink-0"
          >
            <Sparkles size={16} />
          </motion.div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                {done ? "Tutto fatto — grande!" : `Inizia da qui${useCaseLabel ? ` · ${useCaseLabel}` : ""}`}
              </h3>
              <motion.span
                key={doneCount}
                initial={shouldReduceMotion ? false : { scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#7b39fc]/10 text-[#7b39fc]"
              >
                {doneCount} di {totalCount}
              </motion.span>
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={done ? "complete" : suggestion.step}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="text-xs text-gray-400 mt-0.5 truncate"
              >
                {done ? "Guida completata: sparirà da sola tra poco." : `Prossimo passo: ${suggestion.label} — ${suggestion.hint}`}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setIsCollapsed((v) => !v)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600"
            title={isCollapsed ? "Espandi" : "Riduci"}
            aria-expanded={!isCollapsed}
            aria-label={isCollapsed ? "Espandi guida" : "Riduci guida"}
          >
            {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
          <button
            onClick={() => update({ dismissedChecklist: true })}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600"
            title="Nascondi guida"
            aria-label="Nascondi guida"
          >
            <X size={16} />
          </button>
        </div>
      </div>
      <div
        className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden my-3"
        role="progressbar"
        aria-label="Progresso dell'onboarding"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <motion.div
          className="h-full bg-gradient-to-r from-[#7b39fc] to-emerald-500"
          animate={{ width: `${progress}%` }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.65, ease: "easeOut" }}
        />
      </div>
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            key="steps"
            initial={shouldReduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={shouldReduceMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-4">
              {order.map((id, index) => {
            const meta = META[id];
            const completed = state.stepsDone[id];
            const isNext = suggestion.step === id && !completed;
            const Icon = meta.icon;
            return (
              <motion.button
                key={id}
                type="button"
                onClick={() => {
                  if (!completed) go(id);
                }}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{
                  opacity: 1,
                  y: isNext && !shouldReduceMotion ? [0, -2, 0] : 0,
                  boxShadow: isNext
                    ? ["0 0 0 0 rgba(123,57,252,0)", "0 0 0 3px rgba(123,57,252,0.08)", "0 0 0 0 rgba(123,57,252,0)"]
                    : "0 0 0 0 rgba(123,57,252,0)",
                }}
                transition={{
                  opacity: { duration: 0.25, delay: shouldReduceMotion ? 0 : index * 0.045 },
                  y: isNext && !shouldReduceMotion ? { duration: 2.4, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 },
                  boxShadow: isNext && !shouldReduceMotion ? { duration: 2.4, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 },
                }}
                whileHover={completed || shouldReduceMotion ? undefined : { y: -2 }}
                whileTap={completed ? undefined : { scale: 0.98 }}
                aria-current={isNext ? "step" : undefined}
                aria-disabled={completed}
                className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 w-full transition-all ${
                  completed
                    ? "bg-emerald-500/5 border-emerald-500/20"
                    : isNext
                      ? "bg-[#7b39fc]/5 border-[#7b39fc]/50 ring-1 ring-[#7b39fc]/20"
                      : "bg-white/80 dark:bg-gray-800/60 border-gray-100 dark:border-gray-800 hover:border-[#7b39fc]/30"
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  <AnimatePresence mode="wait" initial={false}>
                    {completed ? (
                      <motion.span key="done" initial={shouldReduceMotion ? false : { scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}>
                        <CheckCircle2 size={16} className="text-emerald-500" />
                      </motion.span>
                    ) : (
                      <motion.span key="pending" initial={shouldReduceMotion ? false : { scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }}>
                        <Circle size={16} className={isNext ? "text-[#7b39fc]" : "text-gray-400"} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <div className="min-w-0 flex-1">
                  <div className={`text-xs font-bold ${completed ? "line-through text-gray-400" : "text-gray-800 dark:text-gray-100"}`}>
                    {meta.label}
                    <AnimatePresence>
                      {isNext && (
                        <motion.span
                          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.8 }}
                          className="ml-1 inline-block text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-[#7b39fc] text-white"
                        >
                          Prossimo
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{meta.hint}</div>
                  {!completed && <div className="text-[11px] font-bold text-[#7b39fc] mt-1 inline-flex items-center gap-1">Vai <ArrowRight size={11} /></div>}
                </div>
                <Icon size={15} className="shrink-0 mt-0.5 text-gray-300" />
              </motion.button>
            );
          })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
    )}
    </AnimatePresence>
  );
}
