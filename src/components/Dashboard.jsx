"use client";

import React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  Badge,
  Progress,
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
} from "lucide-react";
import { motion } from "framer-motion";
import FileUploader from "./FileUploader";
import TemplateGallery from "./TemplateGallery";
import ImportExport from "./ImportExport";
import Backlinks from "./Backlinks";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
};

export default function Dashboard({
  tasks = [],
  goals = [],
  ideas = [],
  plannerMeta = {},
  pages = [],
  loading = false,
}) {
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeGoals = Array.isArray(goals) ? goals : [];
  const safeIdeas = Array.isArray(ideas) ? ideas : [];
  const safePages = Array.isArray(pages) ? pages : [];
  const safePlannerMeta =
    plannerMeta && typeof plannerMeta === "object" ? plannerMeta : {};
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="w-full md:w-1/2 flex items-center gap-3">
            <Skeleton className="h-10 flex-1 rounded-xl" />
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(Array.isArray([1, 2, 3, 4]) ? [1, 2, 3, 4] : []).map((i) => (
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
  const todayFocus =
    safePlannerMeta[todayStr]?.focus || "Nessun focus impostato per oggi";

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
      label: "Task Attivi",
      value: safeTasks.length - completedTasks,
      icon: <ListTodo className="text-cyan-500" />,
      bgClass: "bg-cyan-500/10",
      iconColor: "text-cyan-500",
      sub: "In attesa di completamento",
    },
    {
      label: "Obiettivi",
      value: safeGoals.length,
      icon: <Target className="text-pink-500" />,
      bgClass: "bg-pink-500/10",
      iconColor: "text-pink-500",
      sub: `${completedGoals} raggiunti`,
    },
    {
      label: "Idee Brainstorm",
      value: safeIdeas.length,
      icon: <Lightbulb className="text-amber-500" />,
      bgClass: "bg-amber-500/10",
      iconColor: "text-amber-500",
      sub: "In attesa di conversione",
    },
    {
      label: "Focus Oggi",
      value:
        todayFocus.length > 15
          ? todayFocus.substring(0, 15) + "..."
          : todayFocus,
      icon: <Zap className="text-blue-500" />,
      bgClass: "bg-blue-500/10",
      iconColor: "text-blue-500",
      sub: "Focus principale",
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto space-y-6 pb-10"
    >
      <motion.div
        variants={item}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-gradient-cyan animate-gradient">
            Il tuo centro di comando
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm font-medium">
            Tutto sotto controllo.
          </p>
        </div>
        <div className="w-full md:w-1/2 flex items-center justify-end gap-3" />
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {(Array.isArray(stats) ? stats : []).map((s, idx) => (
          <motion.div
            key={idx}
            variants={item}
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="border-none h-full bg-white dark:bg-gray-800/40 shadow-xl shadow-cyan-500/5">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${s.bgClass || "bg-gray-500/10"}`}>
                    {React.isValidElement(s.icon)
                      ? s.icon
                      : typeof s.icon === "function"
                        ? React.createElement(s.icon, {
                            className: s.iconColor || "text-gray-500",
                            size: 20,
                          })
                        : null}
                  </div>
                  <div>
                    <p className="text-xl font-black text-gray-800 dark:text-gray-100">
                      {s.value}
                    </p>
                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                      {s.label}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Today's Focus Hero */}
          <motion.div variants={item}>
            <Card className="border-none overflow-hidden bg-white dark:bg-gray-800 shadow-2xl border border-cyan-100 dark:border-cyan-900/20 relative">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-cyan-600" />
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
                      <Zap size={20} />
                      <span className="text-xs font-black uppercase tracking-[0.2em]">
                        Focus di Oggi
                      </span>
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white leading-tight">
                      {todayFocus}
                    </h3>
                    <div className="flex gap-4">
                      <Badge
                        variant="default"
                        className="bg-cyan-50 text-cyan-600 border-none"
                      >
                        {highPriorityTasks.length} Task critici
                      </Badge>
                      <Badge
                        variant="default"
                        className="bg-blue-50 text-blue-600 border-none"
                      >
                        {activeGoals.length} Obiettivi attivi
                      </Badge>
                    </div>
                  </div>
                  <div className="hidden md:block shrink-0">
                    <div className="relative w-24 h-24 flex items-center justify-center">
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
                            <stop offset="0%" stopColor="#9333ea" />
                            <stop offset="100%" stopColor="#ec4899" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-lg font-black text-gray-900 dark:text-white leading-none">
                          {completionRate}%
                        </span>
                        <span className="text-[7px] font-black uppercase tracking-tighter text-gray-400 mt-0.5">
                          Done
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Critical Tasks */}
            <motion.div variants={item} className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h4 className="text-sm font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                  <Flame size={16} className="text-orange-500" /> Priorità Alta
                </h4>
                <Link
                  href="/dashboard"
                  className="text-[10px] font-black text-cyan-600 uppercase"
                >
                  Vedi Tutti
                </Link>
              </div>
              <div className="space-y-3">
                {highPriorityTasks && highPriorityTasks.length > 0 ? (
                  (Array.isArray(highPriorityTasks)
                    ? highPriorityTasks
                    : []
                  ).map((t) => (
                    <Card
                      key={t.id}
                      className="border-none bg-white dark:bg-gray-800/40 hover:scale-[1.02] transition-transform"
                    >
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-500 shadow-lg shadow-red-500/40" />
                        <span className="text-sm font-bold truncate flex-1">
                          {t.title}
                        </span>
                        {t.deadline && (
                          <span className="text-[9px] font-bold text-gray-400 flex items-center gap-1">
                            <Clock size={10} /> {t.deadline}
                          </span>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-center py-8 text-xs text-gray-400 font-medium">
                    Nessun task critico. Ottimo!
                  </p>
                )}
              </div>
            </motion.div>

            {/* Recent Ideas */}
            <motion.div variants={item} className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h4 className="text-sm font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                  <Lightbulb size={16} className="text-amber-500" /> Ultime Idee
                </h4>
                <Link
                  href="/dashboard"
                  className="text-[10px] font-black text-amber-600 uppercase"
                >
                  Brain Dump
                </Link>
              </div>
              <div className="space-y-3">
                {recentIdeas && recentIdeas.length > 0 ? (
                  (Array.isArray(recentIdeas) ? recentIdeas : []).map(
                    (idea) => (
                      <Card
                        key={idea.id}
                        className="border-none bg-amber-50/30 dark:bg-amber-900/10 border-l-4 border-amber-400"
                      >
                        <CardContent className="p-4">
                          <p className="text-sm font-bold italic text-amber-900 dark:text-amber-200">
                            &quot;{idea.title}&quot;
                          </p>
                          <p className="text-[9px] font-black text-amber-600/60 uppercase mt-2">
                            {idea.category}
                          </p>
                        </CardContent>
                      </Card>
                    ),
                  )
                ) : (
                  <p className="text-center py-8 text-xs text-gray-400 font-medium">
                    Fai un brain dump delle tue idee!
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Column: Goal Progress & Quick Actions */}
        <motion.div variants={item} className="space-y-6">
          <Card className="border-none bg-linear-to-br from-cyan-600 to-purple-700 text-white shadow-xl shadow-cyan-500/20">
            <CardContent className="p-6">
              <h4 className="text-sm font-black uppercase tracking-widest opacity-80 mb-6 flex items-center gap-2">
                <Target size={16} /> Progressi Obiettivi
              </h4>
              <div className="space-y-6">
                {(Array.isArray(activeGoals) ? activeGoals : []).map((goal) => {
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
                })}
                {activeGoals.length === 0 && (
                  <p className="text-xs opacity-60 italic">
                    Nessun obiettivo attivo.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-white dark:bg-gray-800 shadow-xl">
            <CardContent className="p-6">
              <h4 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-4">
                Navigazione Rapida
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="ghost"
                  className="h-auto py-4 flex flex-col items-center gap-2 border border-gray-100 dark:border-gray-700 rounded-2xl hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
                >
                  <Plus size={20} className="text-cyan-600" />
                  <span className="text-[9px] font-black uppercase tracking-widest">
                    Nuovo Progetto
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  className="h-auto py-4 flex flex-col items-center gap-2 border border-gray-100 dark:border-gray-700 rounded-2xl hover:bg-amber-50 dark:hover:bg-amber-900/20"
                >
                  <Lightbulb size={20} className="text-amber-600" />
                  <span className="text-[9px] font-black uppercase tracking-widest">
                    Nuova Idea
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-linear-to-br from-orange-50 to-rose-50 dark:from-orange-950/30 dark:to-rose-950/30 border-2 border-orange-200 dark:border-rose-800 rounded-[2.5rem]">
            <CardContent className="p-6 text-center space-y-4">
              <Sparkles className="mx-auto text-rose-500" size={32} />
              <p className="text-xs font-bold text-gray-600 dark:text-gray-300">
                L&apos;assistente AI ha analizzato il tuo workspace. Hai 3 task
                urgenti che potrebbero bloccare i tuoi obiettivi.
              </p>
              <button className="w-full text-[10px] font-black uppercase tracking-widest h-10 inline-flex items-center justify-center rounded-xl bg-linear-to-r from-orange-500 to-rose-600 text-white shadow-lg shadow-orange-500/20 transition-all hover:from-orange-400 hover:to-rose-500 hover:shadow-xl hover:shadow-orange-500/30 active:translate-y-0">
                Analisi Completa
              </button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={item} className="space-y-4">
        <h4 className="text-sm font-black uppercase tracking-widest text-gray-500 px-2 flex items-center gap-2">
          <Wrench size={16} className="text-cyan-500" /> Risorse e Strumenti
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none bg-white dark:bg-gray-800 shadow-xl hover:shadow-cyan-500/10 transition-all group overflow-hidden">
            <CardContent className="p-0">
              <FileUploader />
            </CardContent>
          </Card>

          <Card className="border-none bg-white dark:bg-gray-800 shadow-xl hover:shadow-cyan-500/10 transition-all group overflow-hidden">
            <CardContent className="p-0">
              <TemplateGallery />
            </CardContent>
          </Card>

          <Card className="border-none bg-white dark:bg-gray-800 shadow-xl hover:shadow-cyan-500/10 transition-all group overflow-hidden">
            <CardContent className="p-0">
              <ImportExport />
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
}
