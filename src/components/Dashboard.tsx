"use client";

import React from "react";
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
} from "lucide-react";
import { motion } from "framer-motion";
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
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
};

export default function Dashboard({
  tasks = [] as any[],
  goals = [] as any[],
  ideas = [] as any[],
  plannerMeta = {},
  pages = [] as any[],
  loading = false,
  plan = null as any,
}) {
  const { t } = useLanguage();
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
  const todayFocus =
    safePlannerMeta[todayStr]?.focus || t("noFocus");

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
      label: t("statActiveTasks"),
      value: safeTasks.length - completedTasks,
      icon: <ListTodo className="text-[#7b39fc]" />,
      bgClass: "bg-[#7b39fc]/10",
      iconColor: "text-[#7b39fc]",
      sub: t("statAwaiting"),
    },
    {
      label: t("statGoals"),
      value: safeGoals.length,
      icon: <Target className="text-rose-500" />,
      bgClass: "bg-rose-500/10",
      iconColor: "text-rose-500",
      sub: `${completedGoals} ${t("statGoalsAchieved")}`,
    },
    {
      label: t("statIdeas"),
      value: safeIdeas.length,
      icon: <Lightbulb className="text-amber-500" />,
      bgClass: "bg-amber-500/10",
      iconColor: "text-amber-500",
      sub: t("statIdeasAwaiting"),
    },
    {
      label: t("statFocus"),
      value:
        todayFocus.length > 15
          ? todayFocus.substring(0, 15) + "..."
          : todayFocus,
      icon: <Zap className="text-[#a67cff]" />,
      bgClass: "bg-[#a67cff]/10",
      iconColor: "text-[#a67cff]",
      sub: t("statFocusSub"),
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
                Dashboard
              </span>
            </div>
            <h2 className="landing-heading-lg">
              {t("dashboardTitle")}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm font-medium">
              {t("dashboardSubtitle")}
            </p>
          </div>
        </div>
        <div className="w-full md:w-1/2 flex items-center justify-end gap-3" />
      </motion.div>

      {plan && plan.maxPages && (
        <motion.div
          variants={item}
          className="flex items-center gap-3 rounded-2xl border border-[#7b39fc]/15 bg-white/60 dark:bg-[#1a1528]/60 px-4 py-3"
        >
          <div className="w-10 h-10 rounded-xl bg-[#7b39fc]/10 flex items-center justify-center shrink-0">
            <Zap size={18} className="text-[#a67cff]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold text-gray-600 dark:text-gray-300">
                Piano <span className="font-black uppercase tracking-widest text-[#7b39fc]">{plan.name}</span> · {pages.length} / {plan.maxPages} pagine
              </p>
              {pages.length >= plan.maxPages ? (
                <Link
                  href="/#pricing"
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-[#7b39fc] text-white text-[9px] font-black uppercase tracking-widest hover:brightness-110 transition-all"
                >
                  Aggiorna piano
                </Link>
              ) : (
                <span className="shrink-0 text-[9px] font-black uppercase tracking-widest text-emerald-500">
                  Prossimo: {plan.maxPages - pages.length}
                </span>
              )}
            </div>
            <div className="mt-2 h-1.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-[#7b39fc] to-[#a67cff] rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (pages.length / plan.maxPages) * 100)}%`,
                }}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {(Array.isArray(stats) ? stats : []).map((s, idx) => (
          <motion.div
            key={idx}
            variants={item}
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="h-full rounded-3xl border border-[#7b39fc]/10 bg-white/70 shadow-xl shadow-[#7b39fc]/5 backdrop-blur-xl dark:bg-[#17103a]/60 dark:bg-[#1a1528]/60">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${s.bgClass || "bg-[#7b39fc]/10"}`}>
                    {React.isValidElement(s.icon)
                      ? s.icon
                      : typeof s.icon === "function"
                        ? React.createElement(s.icon, {
                            className: s.iconColor || "text-[#7b39fc]",
                            size: 20,
                          })
                        : null}
                  </div>
                  <div>
                    <p className="text-xl font-black text-gray-800 dark:text-white">
                      {s.value}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-widest">
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
            <Card className="relative overflow-hidden rounded-[2rem] border border-[#7b39fc]/15 bg-white/70 shadow-2xl shadow-[#7b39fc]/10 backdrop-blur-xl dark:bg-[#1d1630]/60">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#7b39fc] to-[#a67cff]" />
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[#7b39fc] dark:text-[#a67cff]">
                      <Zap size={20} />
                      <span className="text-xs font-bold uppercase tracking-[0.2em]">
                        Focus di Oggi
                      </span>
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white leading-tight">
                      {todayFocus}
                    </h3>
                    <div className="flex gap-4">
                      <Badge
                        variant="default"
                        className="bg-[#7b39fc]/10 text-[#7b39fc] border-none dark:bg-[#7b39fc]/25 dark:text-[#a67cff]"
                      >
                        {highPriorityTasks.length} {t("criticalTasks")}
                      </Badge>
                      <Badge
                        variant="default"
                        className="bg-[#a67cff]/10 text-[#8b4dff] border-none dark:bg-[#a67cff]/20 dark:text-[#a67cff]"
                      >
                        {activeGoals.length} {t("activeGoalsLabel")}
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
                            <stop offset="0%" stopColor="#7b39fc" />
                            <stop offset="100%" stopColor="#a67cff" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-lg font-black text-gray-900 dark:text-white leading-none">
                          {completionRate}%
                        </span>
                        <span className="text-[7px] font-black uppercase tracking-tighter text-gray-400 mt-0.5">
                          {t("done")}
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
                  <Flame size={16} className="text-orange-500" /> {t("priorityHigh")}
                </h4>
                <Link
                  href="/dashboard"
                  className="text-[10px] font-black text-[#7b39fc] uppercase"
                >
                  {t("seeAll")}
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
                      className="rounded-2xl border border-[#7b39fc]/10 bg-white/70 shadow-lg shadow-[#7b39fc]/5 backdrop-blur-xl dark:bg-[#1a1528]/40 hover:scale-[1.02] transition-transform"
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
                    {t("noCriticalTasks")}
                  </p>
                )}
              </div>
            </motion.div>

            {/* Recent Ideas */}
            <motion.div variants={item} className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h4 className="text-sm font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                  <Lightbulb size={16} className="text-amber-500" /> {t("recentIdeas")}
                </h4>
                <Link
                  href="/dashboard"
                  className="text-[10px] font-black text-amber-500 uppercase"
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
                        className="rounded-2xl border-l-4 border-l-amber-400 bg-amber-50/40 dark:bg-amber-900/10"
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
                    {t("noIdeas")}
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Column: Goal Progress & Quick Actions */}
        <motion.div variants={item} className="space-y-6">
          <Card className="rounded-[2rem] border-none bg-linear-to-br from-[#7b39fc] to-[#a67cff] text-white shadow-xl shadow-[#7b39fc]/25">
            <CardContent className="p-6">
              <h4 className="text-sm font-black uppercase tracking-widest opacity-90 mb-6 flex items-center gap-2">
                <Target size={16} /> {t("goalProgress")}
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
                  <p className="text-xs opacity-70 italic">
                    {t("noActiveGoals")}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border border-[#7b39fc]/10 bg-white/70 shadow-xl shadow-[#7b39fc]/10 backdrop-blur-xl dark:bg-[#1a1528]/50">
            <CardContent className="p-6">
              <h4 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-4">
                {t("quickNav")}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="ghost"
                  className="h-auto py-4 flex flex-col items-center gap-2 border border-[#7b39fc]/15 rounded-2xl hover:bg-[#7b39fc]/10 dark:hover:bg-[#7b39fc]/15"
                >
                  <Plus size={20} className="text-[#7b39fc]" />
                  <span className="text-[9px] font-black uppercase tracking-widest">
                    {t("newProject")}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  className="h-auto py-4 flex flex-col items-center gap-2 border border-amber-500/20 rounded-2xl hover:bg-amber-500/10 dark:hover:bg-amber-500/15"
                >
                  <Lightbulb size={20} className="text-amber-500" />
                  <span className="text-[9px] font-black uppercase tracking-widest">
                    {t("newIdea")}
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-2 border-[#7b39fc]/20 bg-linear-to-br from-[#2b2344]/15 to-[#7b39fc]/10 dark:bg-linear-to-br dark:from-[#2b2344]/40 dark:to-[#7b39fc]/15">
            <CardContent className="p-6 text-center space-y-4">
              <Sparkles className="mx-auto text-[#a67cff]" size={32} />
              <p className="text-xs font-bold text-gray-700 dark:text-gray-200">
                {t("aiAnalysis")}
              </p>
              <button className="w-full text-[10px] font-black uppercase tracking-widest h-10 inline-flex items-center justify-center rounded-xl bg-linear-to-r from-[#7b39fc] to-[#a67cff] text-white shadow-lg shadow-[#7b39fc]/25 transition-all hover:from-[#8b4dff] hover:to-[#a67cff] hover:shadow-xl hover:shadow-[#7b39fc]/40 active:translate-y-0">
                {t("aiAction")}
              </button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={item} className="space-y-4">
        <h4 className="text-sm font-black uppercase tracking-widest text-gray-500 px-2 flex items-center gap-2">
          <Wrench size={16} className="text-[#7b39fc]" /> {t("resourcesTools")}
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
      </motion.div>
    </motion.div>
  );
}