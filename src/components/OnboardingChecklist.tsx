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
import { motion } from "framer-motion";
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
  const ob = useOnboarding();
  const state = ob.state;
  const doneCount = ob.doneCount;
  const totalCount = ob.totalCount;
  const progress = ob.progress;
  const suggestion = ob.suggestion;
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [celebrating, setCelebrating] = React.useState(false);

  useEffect(() => {
    if (liveStats.pagesCount > 0 && !state.stepsDone.create_page) ob.track("page_created");
    if (liveStats.tasksCount > 0 && !state.stepsDone.create_task) ob.track("task_created");
    if (liveStats.completedTasks > 0 && !state.stepsDone.complete_task) ob.track("task_completed");
    if (liveStats.hasNestedPage && !state.stepsDone.organize) ob.track("page_nested");
    if (liveStats.searchUsed && !state.stepsDone.search) ob.track("search_used");
    if (liveStats.dashboardCustomized && !state.stepsDone.customize) ob.track("dashboard_customized");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveStats.pagesCount, liveStats.tasksCount, liveStats.completedTasks, liveStats.hasNestedPage, liveStats.searchUsed, liveStats.dashboardCustomized, state.stepsDone.create_page, state.stepsDone.create_task, state.stepsDone.complete_task, state.stepsDone.organize, state.stepsDone.search, state.stepsDone.customize]);

  useEffect(() => {
    if (doneCount >= totalCount && totalCount > 0 && !state.dismissedChecklist) {
      setCelebrating(true);
      const t = setTimeout(() => {
        ob.update({ dismissedChecklist: true });
        setCelebrating(false);
      }, 6000);
      return () => clearTimeout(t);
    }
  }, [doneCount, totalCount, state.dismissedChecklist]);

  if (state.dismissedChecklist && !celebrating) return null;
  const done = doneCount >= totalCount;
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
    <motion.div layout className="mb-6 rounded-3xl border border-[#7b39fc]/20 p-5 shadow-sm bg-gradient-to-r from-[#7b39fc]/5 via-white/80 to-[#a67cff]/5 dark:from-[#7b39fc]/10 dark:via-gray-900/90 dark:to-transparent">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#7b39fc]/10 text-[#7b39fc] flex items-center justify-center shrink-0">
            <Sparkles size={16} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                {done ? "Tutto fatto — grande!" : `Inizia da qui${useCaseLabel ? ` · ${useCaseLabel}` : ""}`}
              </h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#7b39fc]/10 text-[#7b39fc]">
                {doneCount} di {totalCount}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5 truncate">
              {done ? "Guida completata: sparira da sola tra poco." : `Prossimo passo: ${suggestion.label} — ${suggestion.hint}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => setIsCollapsed((v) => !v)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600" title={isCollapsed ? "Espandi" : "Riduci"}>
            {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
          <button onClick={() => ob.update({ dismissedChecklist: true })} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600" title="Nascondi guida">
            <X size={16} />
          </button>
        </div>
      </div>
      <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden my-3">
        <motion.div className="h-full bg-gradient-to-r from-[#7b39fc] to-emerald-500" animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
      </div>
      {!isCollapsed && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mt-4">
          {order.map((id) => {
            const meta = META[id];
            const completed = state.stepsDone[id];
            const isNext = suggestion.step === id && !completed;
            const Icon = meta.icon;
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  if (!completed) go(id);
                }}
                className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 w-full transition-all ${
                  completed
                    ? "bg-emerald-500/5 border-emerald-500/20"
                    : isNext
                      ? "bg-[#7b39fc]/5 border-[#7b39fc]/50 ring-1 ring-[#7b39fc]/20"
                      : "bg-white/80 dark:bg-gray-800/60 border-gray-100 dark:border-gray-800 hover:border-[#7b39fc]/30"
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {completed ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Circle size={16} className={isNext ? "text-[#7b39fc]" : "text-gray-400"} />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className={`text-xs font-bold ${completed ? "line-through text-gray-400" : "text-gray-800 dark:text-gray-100"}`}>
                    {meta.label}
                    {isNext && <span className="ml-1 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-[#7b39fc] text-white">Prossimo</span>}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{meta.hint}</div>
                  {!completed && <div className="text-[11px] font-bold text-[#7b39fc] mt-1 inline-flex items-center gap-1">Vai <ArrowRight size={11} /></div>}
                </div>
                <Icon size={15} className="shrink-0 mt-0.5 text-gray-300" />
              </button>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

