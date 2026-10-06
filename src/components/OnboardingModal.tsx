"use client";

import React, { useState, useEffect, useMemo } from "react";
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
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BUILTIN_TEMPLATES, PageTemplate, loadAllTemplates } from "../lib/templates";
import { trackOnboardingEvent, type UseCase } from "../hooks/useOnboarding";

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

export default function OnboardingModal({ userName = "", liveStats, onComplete }: OnboardingModalProps) {
  const shouldReduceMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [direction, setDirection] = useState(1);

  // Form state
  const [name, setName] = useState(userName || "");
  const [useCase, setUseCase] = useState<UseCase>("personal");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("weekly-planner");
  const [firstTaskTitle, setFirstTaskTitle] = useState("Esplorare le funzionalità di Taskly");

  const navigateToStep = (nextStep: 1 | 2 | 3) => {
    setDirection(nextStep > step ? 1 : -1);
    setStep(nextStep);
  };

  useEffect(() => {
    try {
      const v2 = localStorage.getItem("taskly_onboarding_state_v2");
      const legacy = localStorage.getItem("taskly_onboarding_completed");
      if (!v2 && !legacy) setIsOpen(true);
      else if (v2) {
        const parsed = JSON.parse(v2);
        if (!parsed.completed) setIsOpen(true);
      }
    } catch {}
  }, []);

  // Template consigliati dinamici: in base all'uso + template custom salvati
  const recommendedTemplates = useMemo(() => {
    const all = loadAllTemplates();
    const ids = RECOMMENDED[useCase];
    const picked = ids
      .map((id) => all.find((t) => t.id === id))
      .filter((t): t is PageTemplate => !!t);
    const customs = all.filter((t) => t.isCustom).slice(0, 3);
    const merged = [...customs, ...picked].filter(
      (t, i, arr) => arr.findIndex((x) => x.id === t.id) === i,
    );
    return merged.slice(0, 3).length > 0 ? merged.slice(0, 3) : BUILTIN_TEMPLATES.slice(0, 3);
  }, [useCase]);

  // L'utente potrebbe aver gia' creato pagine/task prima del wizard: salta gli step inutili
  const alreadyHasPage = liveStats.pagesCount > 0;
  const alreadyHasTask = liveStats.tasksCount > 0;

  useEffect(() => {
    if (useCase === "personal") setSelectedTemplateId("weekly-planner");
    else if (useCase === "work") setSelectedTemplateId("project-roadmap");
    else if (useCase === "study") setSelectedTemplateId("reading-list");
  }, [useCase]);
  useEffect(() => {
    if (recommendedTemplates.length > 0) setSelectedTemplateId(recommendedTemplates[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useCase]);

  const handleSkip = () => {
    try {
      const raw = localStorage.getItem("taskly_onboarding_state_v2");
      const cur = raw ? JSON.parse(raw) : {};
      localStorage.setItem(
        "taskly_onboarding_state_v2",
        JSON.stringify({ ...cur, completed: true, completedAt: new Date().toISOString(), useCase, userName: name || "Utente" }),
      );
      localStorage.setItem("taskly_onboarding_completed", "true");
    } catch {}
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
    try {
      const raw = localStorage.getItem("taskly_onboarding_state_v2");
      const cur = raw ? JSON.parse(raw) : {};
      localStorage.setItem(
        "taskly_onboarding_state_v2",
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
      localStorage.setItem("taskly_onboarding_completed", "true");
    } catch {}
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

  return (
    <AnimatePresence>
    {isOpen && (
    <motion.div
      key="onboarding-modal"
      initial={shouldReduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={shouldReduceMotion ? undefined : { opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={shouldReduceMotion ? undefined : { opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-md"
      />

      {/* Modal Dialog */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.97, y: 10 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.25, ease: "easeOut" }}
        className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-2xl p-6 sm:p-8 z-10 flex flex-col justify-between overflow-hidden"
      >
        {/* Step indicator & Skip */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((s) => (
              <motion.div
                key={s}
                animate={{
                  width: s === step ? 32 : 16,
                  backgroundColor: s < step ? "#10b981" : s === step ? "#7b39fc" : undefined,
                }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
                className={`h-1.5 rounded-full ${
                  s > step ? "bg-gray-200 dark:bg-gray-700" : ""
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleSkip}
            className="text-xs font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            Salta introduzione
          </button>
        </div>

        {/* ── Step 1: Profilo e Caso d'uso ───────────────────────────────── */}
        <AnimatePresence mode="wait" initial={false}>
        {step === 1 && (
          <motion.div
            key="step-1"
            initial={shouldReduceMotion ? false : { opacity: 0, x: direction * 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, x: direction * -18 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.24, ease: "easeOut" }}
            className="space-y-6"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7b39fc] to-[#a67cff] text-white flex items-center justify-center mb-3 shadow-md shadow-[#7b39fc]/20">
                <Sparkles size={24} />
              </div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white">
                {name.trim() ? `Benvenuto, ${name.trim()}!` : "Benvenuto in Taskly!"}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Personalizziamo il tuo spazio di lavoro per iniziare al meglio in meno di due minuti.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Come ti chiami?
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Il tuo nome o nickname"
                  className="w-full px-4 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7b39fc]/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Come intendi usare Taskly?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: "personal" as const, label: "Personale", desc: "Abitudini, diario e task", icon: User },
                    { id: "work" as const, label: "Lavoro / Team", desc: "Progetti, sprint e note", icon: Briefcase },
                    { id: "study" as const, label: "Studio", desc: "Esami, lezioni e letture", icon: GraduationCap },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = useCase === item.id;
                    return (
                      <motion.button
                        key={item.id}
                        type="button"
                        onClick={() => setUseCase(item.id)}
                        whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                        whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                        className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                          isSelected
                            ? "bg-[#7b39fc]/10 border-[#7b39fc] text-[#7b39fc] shadow-xs"
                            : "bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700/60 text-gray-600 dark:text-gray-300 hover:border-gray-300"
                        }`}
                      >
                        <Icon size={18} className="mb-2" />
                        <div>
                          <div className="font-bold text-xs">{item.label}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">{item.desc}</div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => navigateToStep(2)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7b39fc] text-white text-xs font-bold hover:brightness-110 shadow-md shadow-[#7b39fc]/20 transition-all"
              >
                <span>Continua</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Step 2: Scelta del punto di partenza ────────────────────────── */}
        {step === 2 && (
          <motion.div
            key="step-2"
            initial={shouldReduceMotion ? false : { opacity: 0, x: direction * 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, x: direction * -18 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.24, ease: "easeOut" }}
            className="space-y-6"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-3">
                <FileText size={24} />
              </div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white">
                Scegli il tuo punto di partenza
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Abbiamo selezionato per te i modelli ideali per l&apos;uso {useCase === "personal" ? "personale" : useCase === "work" ? "lavorativo" : "di studio"}.
              </p>
            </div>

            <div className="space-y-2.5">
              {recommendedTemplates.map((tmpl) => {
                const isSelected = selectedTemplateId === tmpl.id;
                return (
                  <motion.button
                    key={tmpl.id}
                    type="button"
                    onClick={() => setSelectedTemplateId(tmpl.id)}
                    whileHover={shouldReduceMotion ? undefined : { x: 3 }}
                    whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
                    className={`w-full text-left p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                      isSelected
                        ? "bg-[#7b39fc]/5 border-[#7b39fc] shadow-xs"
                        : "bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700/60 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white dark:bg-gray-700 flex items-center justify-center text-[#7b39fc] shrink-0">
                        {tmpl.type === "tasks" ? <Rocket size={16} /> : <Calendar size={16} />}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-gray-900 dark:text-white">
                          {tmpl.title}
                        </div>
                        <div className="text-[11px] text-gray-400 line-clamp-1">
                          {tmpl.description}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "bg-[#7b39fc] border-[#7b39fc] text-white"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigateToStep(1)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Indietro
              </button>
              <button
                type="button"
                onClick={() => navigateToStep(3)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7b39fc] text-white text-xs font-bold hover:brightness-110 shadow-md shadow-[#7b39fc]/20 transition-all"
              >
                <span>Continua</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Step 3: dinamico — se ha gia' task, mostra riepilogo invece del form ── */}
        {step === 3 && (
          <motion.div
            key="step-3"
            initial={shouldReduceMotion ? false : { opacity: 0, x: direction * 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, x: direction * -18 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.24, ease: "easeOut" }}
            className="space-y-6"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
                <CheckCircle2 size={24} />
              </div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white">
                {alreadyHasTask ? "Ottimo, hai già iniziato!" : "Pronto a iniziare!"}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {alreadyHasTask
                  ? `Hai già ${liveStats.tasksCount} task (${liveStats.completedTasks} completati). Non ti facciamo ripetere il lavoro: entriamo subito.`
                  : alreadyHasPage
                    ? "Hai già una pagina: aggiungiamo solo la prima attività chiave."
                    : "Aggiungi la tua prima attività chiave per inaugurare il workspace."}
              </p>
            </div>

            {!alreadyHasTask && (
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700/60 space-y-3">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  La tua prima attività
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={firstTaskTitle}
                    onChange={(e) => setFirstTaskTitle(e.target.value)}
                    placeholder="Es. Completare la revisione del progetto venerdì"
                    className="w-full px-4 py-2 text-xs rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7b39fc]/40"
                  />
                </div>
                <p className="text-[11px] text-gray-400">
                  💡 Suggerimento: Taskly riconosce scadenze naturali come &quot;domani&quot; o &quot;venerdì&quot;!
                </p>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigateToStep(2)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Indietro
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7b39fc] to-emerald-500 text-white text-xs font-bold hover:brightness-110 shadow-lg shadow-[#7b39fc]/20 transition-all"
              >
                <span>Entra in Taskly</span>
                <Sparkles size={14} />
              </button>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
    )}
    </AnimatePresence>
  );
}
