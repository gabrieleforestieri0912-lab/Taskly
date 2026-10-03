"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type UseCase = "personal" | "work" | "study";
export type OnboardingStepId =
  | "create_page"
  | "create_task"
  | "complete_task"
  | "use_template"
  | "organize"
  | "search"
  | "customize";

export interface OnboardingState {
  completed: boolean;
  useCase: UseCase | null;
  userName: string;
  events: { type: string; at: string }[];
  stepsDone: Record<OnboardingStepId, boolean>;
  dismissedChecklist: boolean;
  templatesOpened: boolean;
  myTasksVisited: boolean;
  searchUsed: boolean;
  startedAt: string | null;
  completedAt: string | null;
}

const KEY = "taskly_onboarding_state_v2";

const DEFAULT_STATE: OnboardingState = {
  completed: false,
  useCase: null,
  userName: "",
  events: [],
  stepsDone: {
    create_page: false,
    create_task: false,
    complete_task: false,
    use_template: false,
    organize: false,
    search: false,
    customize: false,
  },
  dismissedChecklist: false,
  templatesOpened: false,
  myTasksVisited: false,
  searchUsed: false,
  startedAt: null,
  completedAt: null,
};

function read(): OnboardingState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STATE,
      ...parsed,
      stepsDone: { ...DEFAULT_STATE.stepsDone, ...(parsed.stepsDone || {}) },
      events: Array.isArray(parsed.events) ? parsed.events.slice(-120) : [],
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function write(s: OnboardingState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {}
}

export function getOnboardingState(): OnboardingState {
  return read();
}

export function nextSuggestedAction(s: OnboardingState) {
  const order: OnboardingStepId[] =
    s.useCase === "work"
      ? ["create_task", "complete_task", "create_page", "use_template", "organize", "search", "customize"]
      : s.useCase === "study"
        ? ["create_page", "use_template", "create_task", "complete_task", "search", "organize", "customize"]
        : ["create_page", "create_task", "complete_task", "use_template", "search", "customize", "organize"];
  const labels: Record<OnboardingStepId, { label: string; hint: string }> = {
    create_page: { label: "Crea la tua prima pagina", hint: "Un posto per note e idee, tutto tuo." },
    create_task: { label: "Aggiungi il primo task", hint: "Scrivi pure domani o venerdi: Taskly capisce le date." },
    complete_task: { label: "Completa un task", hint: "Spunta un task per sentire il progresso." },
    use_template: { label: "Prova un template", hint: "Parti da un modello pronto invece che dal foglio bianco." },
    organize: { label: "Organizza la sidebar", hint: "Crea una sottopagina per dare struttura." },
    search: { label: "Prova la ricerca Ctrl+K", hint: "Trova pagine e task in un secondo." },
    customize: { label: "Personalizza la Home", hint: "Attiva solo i widget che ti servono." },
  };
  for (const step of order) {
    if (!s.stepsDone[step]) return { step, ...labels[step] };
  }
  return { step: "customize" as OnboardingStepId, ...labels.customize };
}
function applyEvent(s: OnboardingState, type: string): OnboardingState {
  const events = [...s.events, { type, at: new Date().toISOString() }].slice(-120);
  const stepsDone = { ...s.stepsDone };
  if (type === "page_created") stepsDone.create_page = true;
  if (type === "task_created") stepsDone.create_task = true;
  if (type === "task_completed") stepsDone.complete_task = true;
  if (type === "template_used" || type === "template_saved") stepsDone.use_template = true;
  if (type === "page_nested" || type === "page_moved") stepsDone.organize = true;
  if (type === "search_used") stepsDone.search = true;
  if (type === "dashboard_customized") stepsDone.customize = true;
  const next: OnboardingState = {
    ...s,
    events,
    stepsDone,
    templatesOpened: type === "template_opened" ? true : s.templatesOpened,
    myTasksVisited: type === "mytasks_visited" ? true : s.myTasksVisited,
    searchUsed: type === "search_used" ? true : s.searchUsed,
    startedAt: s.startedAt || new Date().toISOString(),
  };
  const core: OnboardingStepId[] = ["create_page", "create_task", "complete_task", "use_template"];
  if (!next.completed && core.every((k) => next.stepsDone[k])) {
    next.completed = true;
    next.completedAt = new Date().toISOString();
  }
  return next;
}

export function trackOnboardingEvent(type: string) {
  try {
    const next = applyEvent(read(), type);
    write(next);
    window.dispatchEvent(new CustomEvent("taskly-onboarding-updated"));
  } catch {}
}

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const legacyDone = localStorage.getItem("taskly_onboarding_completed") === "true";
      const legacyUse = localStorage.getItem("taskly_user_usecase");
      const base = read();
      if (!localStorage.getItem(KEY) && (legacyDone || legacyUse)) {
        base.completed = legacyDone || base.completed;
        if (legacyUse === "work" || legacyUse === "study" || legacyUse === "personal") base.useCase = legacyUse;
        base.dismissedChecklist = localStorage.getItem("taskly_hide_checklist") === "true";
        base.templatesOpened = localStorage.getItem("taskly_templates_opened") === "true";
        base.myTasksVisited = localStorage.getItem("taskly_mytasks_visited") === "true";
        write(base);
      }
      setState(read());
    } catch {}
    setHydrated(true);
    const sync = () => {
      try {
        setState(read());
      } catch {}
    };
    window.addEventListener("storage", sync);
    window.addEventListener("taskly-onboarding-updated", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("taskly-onboarding-updated", sync);
    };
  }, []);

  const update = useCallback((patch: Partial<OnboardingState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      write(next);
      try {
        window.dispatchEvent(new CustomEvent("taskly-onboarding-updated"));
      } catch {}
      return next;
    });
  }, []);

  const track = useCallback((type: string) => {
    setState((prev) => {
      const next = applyEvent(prev, type);
      write(next);
      try {
        window.dispatchEvent(new CustomEvent("taskly-onboarding-updated"));
      } catch {}
      return next;
    });
  }, []);

  const suggestion = useMemo(() => nextSuggestedAction(state), [state]);
  const doneCount = useMemo(() => Object.values(state.stepsDone).filter(Boolean).length, [state]);
  const totalCount = useMemo(() => Object.keys(state.stepsDone).length, [state]);
  const progress = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);

  return { state, hydrated, update, track, suggestion, doneCount, totalCount, progress };
}
