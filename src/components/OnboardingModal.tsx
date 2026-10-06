"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Sparkles,
  User,
  Briefcase,
  GraduationCap,
  ArrowRight,
  Check,
  FileText,
  Calendar,
  Rocket,
  CheckCircle2,
  ListTodo,
  Target,
  Lightbulb,
  Zap,
  BarChart3,
  Clock,
  Star,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BUILTIN_TEMPLATES, PageTemplate, loadAllTemplates } from "../lib/templates";
import { trackOnboardingEvent, type UseCase } from "../hooks/useOnboarding";

/* ─── Types ────────────────────────────────────────────────────────────────── */

interface OnboardingModalProps {
  userName?: string;
  liveStats: { pagesCount: number; tasksCount: number; completedTasks: number };
  onComplete: (data: {
    useCase: UseCase;
    name: string;
    selectedTemplate?: PageTemplate;
    firstTaskTitle?: string;
    skippedSteps: string[];
  }) => void;
}

const RECOMMENDED: Record<UseCase, string[]> = {
  personal: ["weekly-planner", "daily-journal", "meeting-notes"],
  work: ["project-roadmap", "meeting-notes", "weekly-planner"],
  study: ["reading-list", "weekly-planner", "daily-journal"],
};

/* ─── Constants ─────────────────────────────────────────────────────────────── */

/** Written immediately on first mount. Never cleared. */
const FIRST_VISIT_KEY = "taskly_first_visit_done";
const ONBOARDING_KEY  = "taskly_onboarding_state_v2";
const LEGACY_KEY      = "taskly_onboarding_completed";

function hasCompletedBefore(): boolean {
  try {
    if (localStorage.getItem(FIRST_VISIT_KEY) === "true") return true;
    const v2 = localStorage.getItem(ONBOARDING_KEY);
    if (v2) {
      const parsed = JSON.parse(v2);
      if (parsed.completed) return true;
    }
    if (localStorage.getItem(LEGACY_KEY) === "true") return true;
  } catch {}
  return false;
}

function markCompleted(useCase: UseCase, name: string) {
  try {
    localStorage.setItem(FIRST_VISIT_KEY, "true");
    const raw = localStorage.getItem(ONBOARDING_KEY);
    const cur = raw ? JSON.parse(raw) : {};
    localStorage.setItem(
      ONBOARDING_KEY,
      JSON.stringify({
        ...cur,
        useCase,
        userName: name || "Utente",
        startedAt: cur.startedAt || new Date().toISOString(),
        completed: true,
        completedAt: cur.completedAt || new Date().toISOString(),
      }),
    );
    localStorage.setItem("taskly_user_usecase", useCase);
    localStorage.setItem(LEGACY_KEY, "true");
  } catch {}
}

/* ─── Preview Panel ─────────────────────────────────────────────────────────── */

const USE_CASE_COLORS: Record<UseCase, { accent: string; bg: string; text: string }> = {
  personal: { accent: "#7b39fc", bg: "#7b39fc15", text: "#7b39fc" },
  work:     { accent: "#3b82f6", bg: "#3b82f615", text: "#3b82f6" },
  study:    { accent: "#10b981", bg: "#10b98115", text: "#10b981" },
};

const USE_CASE_STATS: Record<UseCase, { label: string; value: string; icon: React.ReactNode; color: string }[]> = {
  personal: [
    { label: "Abitudini", value: "5/7",  icon: <Star size={14} />,     color: "#f59e0b" },
    { label: "Task oggi", value: "3",    icon: <ListTodo size={14} />, color: "#7b39fc" },
    { label: "Streak",    value: "12gg", icon: <Zap size={14} />,      color: "#ec4899" },
    { label: "Obiettivi", value: "2",    icon: <Target size={14} />,   color: "#10b981" },
  ],
  work: [
    { label: "Sprint",    value: "Attivo", icon: <Rocket size={14} />,    color: "#3b82f6" },
    { label: "Task team", value: "8",      icon: <ListTodo size={14} />,  color: "#7b39fc" },
    { label: "Meeting",   value: "2 oggi", icon: <Calendar size={14} />,  color: "#f59e0b" },
    { label: "Progetto",  value: "67%",    icon: <BarChart3 size={14} />, color: "#10b981" },
  ],
  study: [
    { label: "Esami",    value: "3",     icon: <GraduationCap size={14} />, color: "#10b981" },
    { label: "Letture",  value: "12",    icon: <FileText size={14} />,     color: "#7b39fc" },
    { label: "Studio",   value: "2h",    icon: <Clock size={14} />,        color: "#f59e0b" },
    { label: "Note",     value: "47",    icon: <Lightbulb size={14} />,    color: "#ec4899" },
  ],
};

const USE_CASE_TASKS: Record<UseCase, { title: string; done: boolean; priority: string }[]> = {
  personal: [
    { title: "Revisione settimanale",      done: true,  priority: "Alta" },
    { title: "Meditazione mattina",        done: true,  priority: "Alta" },
    { title: "Lettura 30 minuti",          done: false, priority: "Media" },
    { title: "Pianifica weekend",          done: false, priority: "Bassa" },
  ],
  work: [
    { title: "Review PR #142",             done: true,  priority: "Alta" },
    { title: "Standup meeting ore 10",     done: true,  priority: "Alta" },
    { title: "Aggiornare roadmap Q4",      done: false, priority: "Alta" },
    { title: "Feedback cliente ABC",       done: false, priority: "Media" },
  ],
  study: [
    { title: "Lezione Algoritmi cap. 5",   done: true,  priority: "Alta" },
    { title: "Esercizi Analisi",           done: true,  priority: "Alta" },
    { title: "Tesina introduzione",        done: false, priority: "Alta" },
    { title: "Rivedere appunti 22/10",     done: false, priority: "Media" },
  ],
};

function LivePreviewPanel({
  useCase,
  name,
  selectedTemplateId,
  step,
}: {
  useCase: UseCase;
  name: string;
  selectedTemplateId: string;
  step: number;
}) {
  const shouldReduceMotion = useReducedMotion();
  const colors = USE_CASE_COLORS[useCase];
  const stats  = USE_CASE_STATS[useCase];
  const tasks  = USE_CASE_TASKS[useCase];
  const greeting = name.trim() ? `Ciao, ${name.trim()} 👋` : "La tua Dashboard";

  return (
    <div
      className="relative flex flex-col h-full overflow-hidden rounded-3xl select-none pointer-events-none"
      style={{ background: "linear-gradient(135deg, #0f0f1a 0%, #1a1030 100%)" }}
    >
      {/* Ambient gradient blobs */}
      <motion.div
        key={useCase + "-blob1"}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.35, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute -top-16 -left-16 w-64 h-64 rounded-full blur-3xl"
        style={{ background: colors.accent }}
      />
      <motion.div
        key={useCase + "-blob2"}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.2, scale: 1 }}
        transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 }}
        className="absolute -bottom-16 -right-8 w-48 h-48 rounded-full blur-3xl"
        style={{ background: colors.accent }}
      />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: colors.accent }}
          >
            <Sparkles size={12} className="text-white" />
          </div>
          <span className="text-white/80 text-xs font-bold tracking-wide">Taskly</span>
        </div>
        <div className="flex items-center gap-1.5">
          {["#ff5f57", "#ffbd2e", "#28ca41"].map((c) => (
            <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
          ))}
        </div>
      </div>

      {/* Greeting */}
      <div className="relative z-10 px-5 pb-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={greeting}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-white font-black text-base leading-tight">{greeting}</div>
            <div className="text-white/40 text-[10px] mt-0.5">
              {useCase === "personal" ? "Spazio personale" : useCase === "work" ? "Workspace Team" : "Studio & Esami"}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Stats mini cards */}
      <div className="relative z-10 px-4 pb-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={useCase + "-stats"}
            className="grid grid-cols-2 gap-2"
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.4, staggerChildren: 0.06 }}
          >
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
                className="rounded-2xl px-3 py-2.5 flex items-center gap-2"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div className="w-6 h-6 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.color + "22", color: s.color }}>
                  {s.icon}
                </div>
                <div>
                  <div className="text-white font-black text-xs">{s.value}</div>
                  <div className="text-white/40 text-[9px]">{s.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Task list preview */}
      <div className="relative z-10 px-4 pb-3 flex-1">
        <div
          className="rounded-2xl p-3 h-full"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-white/70 text-[10px] font-bold uppercase tracking-wider">Task di oggi</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: colors.bg, color: colors.text }}>
              {tasks.filter(t => t.done).length}/{tasks.length}
            </span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={useCase + "-tasks"}
              className="space-y-1.5"
              initial={shouldReduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0 }}
            >
              {tasks.map((task, i) => (
                <motion.div
                  key={task.title}
                  initial={shouldReduceMotion ? false : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.25 }}
                  className="flex items-center gap-2 py-1.5"
                >
                  <div
                    className="w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all"
                    style={
                      task.done
                        ? { background: colors.accent, borderColor: colors.accent }
                        : { borderColor: "rgba(255,255,255,0.2)" }
                    }
                  >
                    {task.done && <Check size={9} className="text-white" strokeWidth={3} />}
                  </div>
                  <span
                    className="text-[10px] font-medium flex-1 truncate transition-all"
                    style={{ color: task.done ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.75)", textDecoration: task.done ? "line-through" : "none" }}
                  >
                    {task.title}
                  </span>
                  <span
                    className="text-[8px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                    style={{
                      background: task.priority === "Alta" ? "#ef444415" : task.priority === "Media" ? "#f59e0b15" : "#6b728015",
                      color: task.priority === "Alta" ? "#ef4444" : task.priority === "Media" ? "#f59e0b" : "#9ca3af",
                    }}
                  >
                    {task.priority}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Progress bar at bottom */}
      <div className="relative z-10 px-4 pb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-white/40 text-[9px] font-bold uppercase tracking-wider">Produttività oggi</span>
          <span className="text-white/60 text-[9px] font-bold">
            {Math.round((tasks.filter(t => t.done).length / tasks.length) * 100)}%
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
          <motion.div
            key={useCase + "-bar"}
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${colors.accent}, ${colors.accent}aa)` }}
            initial={{ width: "0%" }}
            animate={{ width: `${Math.round((tasks.filter(t => t.done).length / tasks.length) * 100)}%` }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
          />
        </div>
      </div>

      {/* Step indicator overlay */}
      <AnimatePresence>
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-20 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          >
            <div className="text-center px-6">
              <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: colors.accent }}>
                <FileText size={22} className="text-white" />
              </div>
              <div className="text-white font-black text-sm">Scegli il template</div>
              <div className="text-white/50 text-xs mt-1">Il tuo workspace si configurerà automaticamente</div>
            </div>
          </motion.div>
        )}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0 z-20 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
          >
            <div className="text-center px-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }}
                className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #10b981, #7b39fc)" }}
              >
                <CheckCircle2 size={28} className="text-white" />
              </motion.div>
              <div className="text-white font-black text-sm">Quasi pronto!</div>
              <div className="text-white/50 text-xs mt-1">Il tuo workspace è configurato</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────────── */

export default function OnboardingModal({ userName = "", liveStats, onComplete }: OnboardingModalProps) {
  const shouldReduceMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [direction, setDirection] = useState(1);
  const hasChecked = useRef(false);

  // Form state
  const [name, setName] = useState(userName || "");
  const [useCase, setUseCase] = useState<UseCase>("personal");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("weekly-planner");
  const [firstTaskTitle, setFirstTaskTitle] = useState("Esplorare le funzionalità di Taskly");

  /* ── Show only on first ever visit ──────────────────────────────────────── */
  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;
    try {
      if (!hasCompletedBefore()) {
        setIsOpen(true);
      }
    } catch {}
  }, []);

  /* ── Recommended templates (use-case-aware) ─────────────────────────────── */
  const recommendedTemplates = useMemo(() => {
    const all = loadAllTemplates();
    const ids = RECOMMENDED[useCase];
    const picked = ids.map((id) => all.find((t) => t.id === id)).filter((t): t is PageTemplate => !!t);
    const customs = all.filter((t) => t.isCustom).slice(0, 3);
    const merged = [...customs, ...picked].filter((t, i, arr) => arr.findIndex((x) => x.id === t.id) === i);
    return merged.slice(0, 3).length > 0 ? merged.slice(0, 3) : BUILTIN_TEMPLATES.slice(0, 3);
  }, [useCase]);

  const alreadyHasPage = liveStats.pagesCount > 0;
  const alreadyHasTask = liveStats.tasksCount > 0;

  useEffect(() => {
    if (recommendedTemplates.length > 0) setSelectedTemplateId(recommendedTemplates[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useCase]);

  /* ── Navigation ──────────────────────────────────────────────────────────── */
  const navigateToStep = (nextStep: 1 | 2 | 3) => {
    setDirection(nextStep > step ? 1 : -1);
    setStep(nextStep);
  };

  /* ── Skip / Finish ───────────────────────────────────────────────────────── */
  const handleSkip = () => {
    markCompleted(useCase, name || "Utente");
    trackOnboardingEvent("wizard_skipped");
    setIsOpen(false);
  };

  const handleFinish = () => {
    const tmpl =
      loadAllTemplates().find((t) => t.id === selectedTemplateId) ||
      BUILTIN_TEMPLATES.find((t) => t.id === selectedTemplateId);
    const skippedSteps: string[] = [];
    if (alreadyHasPage) skippedSteps.push("create_page");
    if (alreadyHasTask) skippedSteps.push("create_task");
    markCompleted(useCase, name || "Utente");
    trackOnboardingEvent("wizard_completed");
    setIsOpen(false);
    onComplete({
      useCase,
      name: name || "Utente",
      selectedTemplate: tmpl,
      firstTaskTitle: alreadyHasTask ? undefined : firstTaskTitle,
      skippedSteps,
    });
  };

  /* ── Animation variants ──────────────────────────────────────────────────── */
  const slideVariants = {
    enter: (dir: number) => ({
      opacity: 0,
      x: shouldReduceMotion ? 0 : dir * 28,
    }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({
      opacity: 0,
      x: shouldReduceMotion ? 0 : dir * -28,
    }),
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="onboarding-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={handleSkip} />

        {/* Main container */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full flex overflow-hidden"
          style={{
            maxWidth: "920px",
            maxHeight: "min(90vh, 600px)",
            height: "min(90vh, 600px)",
            borderRadius: "2rem",
            boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)",
          }}
        >
          {/* ── LEFT PANEL: Wizard ───────────────────────────────────────────── */}
          <div className="relative flex flex-col w-full sm:w-[52%] bg-white dark:bg-[#111118] overflow-hidden shrink-0">
            {/* Subtle top gradient accent */}
            <div
              className="absolute top-0 left-0 right-0 h-0.5"
              style={{ background: "linear-gradient(90deg, #7b39fc, #a67cff, #7b39fc)" }}
            />

            {/* Step indicator */}
            <div className="flex items-center justify-between px-7 pt-6 pb-0">
              <div className="flex items-center gap-1.5">
                {[1, 2, 3].map((s) => (
                  <motion.div
                    key={s}
                    animate={{
                      width: s === step ? 28 : 14,
                      backgroundColor:
                        s < step
                          ? "#10b981"
                          : s === step
                          ? "#7b39fc"
                          : undefined,
                    }}
                    transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: "easeOut" }}
                    className={`h-1.5 rounded-full ${s > step ? "bg-gray-200 dark:bg-gray-700" : ""}`}
                  />
                ))}
              </div>
              <button
                onClick={handleSkip}
                className="text-[11px] font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                Salta
              </button>
            </div>

            {/* Step content */}
            <div className="flex-1 overflow-hidden relative px-7 py-5">
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                {/* ── STEP 1 ───────────────────────────────────────────────── */}
                {step === 1 && (
                  <motion.div
                    key="step-1"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: shouldReduceMotion ? 0 : 0.28, ease: "easeOut" }}
                    className="space-y-5 h-full flex flex-col"
                  >
                    <div>
                      <motion.div
                        initial={shouldReduceMotion ? false : { scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.05, duration: 0.35, type: "spring", stiffness: 300, damping: 20 }}
                        className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#7b39fc] to-[#a67cff] text-white flex items-center justify-center mb-3 shadow-lg shadow-[#7b39fc]/30"
                      >
                        <Sparkles size={20} />
                      </motion.div>
                      <motion.h2
                        initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08, duration: 0.3 }}
                        className="text-[1.35rem] font-black text-gray-900 dark:text-white leading-tight"
                      >
                        {name.trim() ? `Ciao, ${name.trim()}!` : "Benvenuto in Taskly!"}
                      </motion.h2>
                      <motion.p
                        initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.12, duration: 0.3 }}
                        className="text-xs text-gray-500 dark:text-gray-400 mt-1"
                      >
                        Personalizziamo il tuo workspace in meno di un minuto.
                      </motion.p>
                    </div>

                    <motion.div
                      initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15, duration: 0.3 }}
                      className="space-y-4 flex-1"
                    >
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                          Come ti chiami?
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Il tuo nome o nickname"
                          className="w-full px-4 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7b39fc]/40 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                          Come intendi usare Taskly?
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {([
                            { id: "personal" as const, label: "Personale", desc: "Abitudini, diario", icon: User },
                            { id: "work"     as const, label: "Lavoro",    desc: "Progetti, sprint",  icon: Briefcase },
                            { id: "study"    as const, label: "Studio",    desc: "Esami, appunti",   icon: GraduationCap },
                          ] as const).map(({ id, label, desc, icon: Icon }) => {
                            const isSelected = useCase === id;
                            return (
                              <motion.button
                                key={id}
                                type="button"
                                onClick={() => setUseCase(id)}
                                whileHover={shouldReduceMotion ? undefined : { y: -2, scale: 1.02 }}
                                whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                                className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                                  isSelected
                                    ? "bg-[#7b39fc]/10 border-[#7b39fc] shadow-sm"
                                    : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600"
                                }`}
                              >
                                <Icon size={16} className={isSelected ? "text-[#7b39fc]" : "text-gray-400 dark:text-gray-500"} />
                                <div>
                                  <div className={`font-bold text-[11px] ${isSelected ? "text-[#7b39fc]" : "text-gray-700 dark:text-gray-300"}`}>
                                    {label}
                                  </div>
                                  <div className="text-[9px] text-gray-400">{desc}</div>
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>

                    <div className="flex justify-end pt-1">
                      <motion.button
                        type="button"
                        onClick={() => navigateToStep(2)}
                        whileHover={shouldReduceMotion ? undefined : { scale: 1.03, x: 2 }}
                        whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7b39fc] text-white text-xs font-bold shadow-md shadow-[#7b39fc]/25 transition-all hover:brightness-110"
                      >
                        <span>Continua</span>
                        <ArrowRight size={14} />
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* ── STEP 2 ───────────────────────────────────────────────── */}
                {step === 2 && (
                  <motion.div
                    key="step-2"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: shouldReduceMotion ? 0 : 0.28, ease: "easeOut" }}
                    className="space-y-5 h-full flex flex-col"
                  >
                    <div>
                      <motion.div
                        initial={shouldReduceMotion ? false : { scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.05, duration: 0.35, type: "spring", stiffness: 300, damping: 20 }}
                        className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-3"
                      >
                        <FileText size={20} />
                      </motion.div>
                      <h2 className="text-[1.35rem] font-black text-gray-900 dark:text-white leading-tight">
                        Scegli il tuo punto di partenza
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Template perfetti per l&apos;uso{" "}
                        {useCase === "personal" ? "personale" : useCase === "work" ? "lavorativo" : "di studio"}.
                      </p>
                    </div>

                    <div className="space-y-2 flex-1">
                      {recommendedTemplates.map((tmpl, i) => {
                        const isSelected = selectedTemplateId === tmpl.id;
                        return (
                          <motion.button
                            key={tmpl.id}
                            type="button"
                            onClick={() => setSelectedTemplateId(tmpl.id)}
                            initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.07, duration: 0.25 }}
                            whileHover={shouldReduceMotion ? undefined : { x: 3 }}
                            whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
                            className={`w-full text-left p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                              isSelected
                                ? "bg-[#7b39fc]/5 border-[#7b39fc] shadow-sm"
                                : "bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-white dark:bg-gray-700 flex items-center justify-center text-[#7b39fc] shrink-0 shadow-sm">
                                {tmpl.type === "tasks" ? <Rocket size={15} /> : <Calendar size={15} />}
                              </div>
                              <div>
                                <div className="font-bold text-xs text-gray-900 dark:text-white">{tmpl.title}</div>
                                <div className="text-[10px] text-gray-400 line-clamp-1">{tmpl.description}</div>
                              </div>
                            </div>
                            <motion.div
                              animate={isSelected ? { scale: 1 } : { scale: 0.85 }}
                              className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                                isSelected
                                  ? "bg-[#7b39fc] border-[#7b39fc]"
                                  : "border-gray-300 dark:border-gray-600"
                              }`}
                            >
                              {isSelected && <Check size={11} strokeWidth={3} className="text-white" />}
                            </motion.div>
                          </motion.button>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => navigateToStep(1)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                      >
                        Indietro
                      </button>
                      <motion.button
                        type="button"
                        onClick={() => navigateToStep(3)}
                        whileHover={shouldReduceMotion ? undefined : { scale: 1.03, x: 2 }}
                        whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7b39fc] text-white text-xs font-bold shadow-md shadow-[#7b39fc]/25 transition-all hover:brightness-110"
                      >
                        <span>Continua</span>
                        <ArrowRight size={14} />
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* ── STEP 3 ───────────────────────────────────────────────── */}
                {step === 3 && (
                  <motion.div
                    key="step-3"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: shouldReduceMotion ? 0 : 0.28, ease: "easeOut" }}
                    className="space-y-5 h-full flex flex-col"
                  >
                    <div>
                      <motion.div
                        initial={shouldReduceMotion ? false : { scale: 0, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.05, duration: 0.4, type: "spring", stiffness: 280, damping: 18 }}
                        className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3"
                      >
                        <CheckCircle2 size={20} />
                      </motion.div>
                      <h2 className="text-[1.35rem] font-black text-gray-900 dark:text-white leading-tight">
                        {alreadyHasTask ? "Ottimo, hai già iniziato!" : "Pronto a iniziare!"}
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {alreadyHasTask
                          ? `Hai già ${liveStats.tasksCount} task (${liveStats.completedTasks} completati). Entriamo subito.`
                          : alreadyHasPage
                          ? "Hai già una pagina: aggiungiamo la prima attività chiave."
                          : "Aggiungi la tua prima attività per inaugurare il workspace."}
                      </p>
                    </div>

                    {!alreadyHasTask && (
                      <motion.div
                        initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.3 }}
                        className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700/60 space-y-3"
                      >
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                          La tua prima attività
                        </label>
                        <input
                          type="text"
                          value={firstTaskTitle}
                          onChange={(e) => setFirstTaskTitle(e.target.value)}
                          placeholder="Es. Completare la revisione del progetto venerdì"
                          className="w-full px-4 py-2 text-xs rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7b39fc]/40 transition-all"
                        />
                        <p className="text-[11px] text-gray-400">
                          💡 Taskly riconosce date naturali come &quot;domani&quot; o &quot;venerdì&quot;!
                        </p>
                      </motion.div>
                    )}

                    {/* Summary pills */}
                    <motion.div
                      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15, duration: 0.3 }}
                      className="flex flex-wrap gap-2"
                    >
                      {[
                        { icon: <User size={11} />, label: name.trim() || "Utente" },
                        {
                          icon: useCase === "personal" ? <User size={11} /> : useCase === "work" ? <Briefcase size={11} /> : <GraduationCap size={11} />,
                          label: useCase === "personal" ? "Personale" : useCase === "work" ? "Lavoro" : "Studio",
                        },
                        {
                          icon: <FileText size={11} />,
                          label: recommendedTemplates.find((t) => t.id === selectedTemplateId)?.title || "Template",
                        },
                      ].map((pill, i) => (
                        <span
                          key={i}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold"
                          style={{ background: "#7b39fc12", color: "#7b39fc" }}
                        >
                          {pill.icon}
                          {pill.label}
                        </span>
                      ))}
                    </motion.div>

                    <div className="flex items-center justify-between pt-1 mt-auto">
                      <button
                        type="button"
                        onClick={() => navigateToStep(2)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                      >
                        Indietro
                      </button>
                      <motion.button
                        type="button"
                        onClick={handleFinish}
                        whileHover={shouldReduceMotion ? undefined : { scale: 1.04 }}
                        whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-xs font-bold shadow-lg shadow-[#7b39fc]/25 transition-all hover:brightness-110"
                        style={{ background: "linear-gradient(135deg, #7b39fc 0%, #10b981 100%)" }}
                      >
                        <span>Entra in Taskly</span>
                        <Sparkles size={13} />
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── RIGHT PANEL: Live Preview ─────────────────────────────────── */}
          <div className="hidden sm:block flex-1 p-3">
            <LivePreviewPanel
              useCase={useCase}
              name={name}
              selectedTemplateId={selectedTemplateId}
              step={step}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
