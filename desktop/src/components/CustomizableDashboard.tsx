
"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  X,
  GripVertical,
  Maximize2,
  Minimize2,
  LayoutDashboard,
  ListTodo,
  Target,
  Calendar,
  FileText,
  Lightbulb,
  Flame,
  Sparkles,
  Wrench,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent, Badge, Progress, Button } from "./UIComponents";
import FileUploader from "./FileUploader";
import TemplateGallery from "./TemplateGallery";
import ImportExport from "./ImportExport";

interface Panel {
  id: string;
  title: string;
  type: "focus" | "tasks" | "ideas" | "goals" | "actions" | "resources" | "ai";
  x: number;
  y: number;
  width: number;
  height: number;
  minimized: boolean;
  opacity: number;
  zIndex: number;
}

const DEFAULT_PANELS: Panel[] = [
  {
    id: "focus",
    title: "Focus di Oggi",
    type: "focus",
    x: 0,
    y: 0,
    width: 6,
    height: 4,
    minimized: false,
    opacity: 0.95,
    zIndex: 1,
  },
  {
    id: "tasks",
    title: "Task Priorità Alta",
    type: "tasks",
    x: 6,
    y: 0,
    width: 6,
    height: 4,
    minimized: false,
    opacity: 0.95,
    zIndex: 1,
  },
  {
    id: "ideas",
    title: "Ultime Idee",
    type: "ideas",
    x: 0,
    y: 4,
    width: 6,
    height: 4,
    minimized: false,
    opacity: 0.95,
    zIndex: 1,
  },
  {
    id: "goals",
    title: "Progressi Obiettivi",
    type: "goals",
    x: 6,
    y: 4,
    width: 6,
    height: 4,
    minimized: false,
    opacity: 0.95,
    zIndex: 1,
  },
  {
    id: "actions",
    title: "Navigazione Rapida",
    type: "actions",
    x: 0,
    y: 8,
    width: 6,
    height: 3,
    minimized: false,
    opacity: 0.95,
    zIndex: 1,
  },
  {
    id: "resources",
    title: "Risorse e Strumenti",
    type: "resources",
    x: 6,
    y: 8,
    width: 6,
    height: 3,
    minimized: false,
    opacity: 0.95,
    zIndex: 1,
  },
];

export default function CustomizableDashboard({
  tasks = [],
  goals = [],
  ideas = [],
  plannerMeta = {},
  pages = [],
  loading = false,
}) {
  const [panels, setPanels] = useState<Panel[]>(DEFAULT_PANELS);
  const [draggingPanel, setDraggingPanel] = useState<string | null>(null);
  const [resizingPanel, setResizingPanel] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Load saved panel configuration
  useEffect(() => {
    const saved = localStorage.getItem("dashboardPanels");
    if (saved) {
      try {
        setPanels(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load dashboard panels:", e);
      }
    }
  }, []);

  // Save panel configuration
  useEffect(() => {
    localStorage.setItem("dashboardPanels", JSON.stringify(panels));
  }, [panels]);

  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeGoals = Array.isArray(goals) ? goals : [];
  const safeIdeas = Array.isArray(ideas) ? ideas : [];
  const safePages = Array.isArray(pages) ? pages : [];
  const safePlannerMeta = plannerMeta && typeof plannerMeta === "object" ? plannerMeta : {};

  const todayStr = new Date().toISOString().split("T")[0];
  const todayFocus = safePlannerMeta[todayStr]?.focus || "Nessun focus impostato per oggi";

  const completedTasks = safeTasks.filter((t) => t && (t.status === "done" || t.completed)).length;
  const completedGoals = safeGoals.filter((g) => g && g.completed).length;

  const totalItems = safeTasks.length + safeGoals.length;
  const totalCompleted = completedTasks + completedGoals;
  const completionRate = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;

  const highPriorityTasks = safeTasks.filter((t) => t && t.priority === "Alta" && t.status !== "done").slice(0, 3);
  const recentIdeas = safeIdeas.slice(0, 3);
  const activeGoals = safeGoals.filter((g) => g && !g.completed).slice(0, 2);

  const handlePanelMouseDown = (e: React.MouseEvent, panelId: string) => {
    const target = e.target as HTMLElement;
    if (target.closest(".resize-handle") || target.closest(".panel-actions")) return;
    
    const panel = panels.find(p => p.id === panelId);
    if (!panel) return;

    setDraggingPanel(panelId);
    setDragOffset({
      x: e.clientX - panel.x * 100,
      y: e.clientY - panel.y * 100,
    });

    // Bring to front
    setPanels(prev => prev.map(p => ({
      ...p,
      zIndex: p.id === panelId ? Math.max(...prev.map(p => p.zIndex)) + 1 : p.zIndex
    })));
  };

  const handleResizeMouseDown = (e: React.MouseEvent, panelId: string) => {
    e.stopPropagation();
    setResizingPanel(panelId);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (draggingPanel && dashboardRef.current) {
      const rect = dashboardRef.current.getBoundingClientRect();
      const newX = Math.max(0, Math.min((e.clientX - dragOffset.x) / 100, 12 - panels.find(p => p.id === draggingPanel)?.width || 6));
      const newY = Math.max(0, Math.min((e.clientY - dragOffset.y) / 100, 12 - panels.find(p => p.id === draggingPanel)?.height || 4));

      setPanels(prev => prev.map(p => 
        p.id === draggingPanel ? { ...p, x: newX, y: newY } : p
      ));
    }

    if (resizingPanel && dashboardRef.current) {
      const panel = panels.find(p => p.id === resizingPanel);
      if (!panel) return;

      const rect = dashboardRef.current.getBoundingClientRect();
      const newWidth = Math.max(3, Math.min((e.clientX - rect.left - panel.x * 100) / 100, 12 - panel.x));
      const newHeight = Math.max(2, Math.min((e.clientY - rect.top - panel.y * 100) / 100, 12 - panel.y));

      setPanels(prev => prev.map(p => 
        p.id === resizingPanel ? { ...p, width: newWidth, height: newHeight } : p
      ));
    }
  };

  const handleMouseUp = () => {
    setDraggingPanel(null);
    setResizingPanel(null);
  };

  useEffect(() => {
    if (draggingPanel || resizingPanel) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [draggingPanel, resizingPanel, dragOffset, panels]);

  const toggleMinimize = (panelId: string) => {
    setPanels(prev => prev.map(p => 
      p.id === panelId ? { ...p, minimized: !p.minimized } : p
    ));
  };

  const updateOpacity = (panelId: string, opacity: number) => {
    setPanels(prev => prev.map(p => 
      p.id === panelId ? { ...p, opacity } : p
    ));
  };

  const resetLayout = () => {
    setPanels(DEFAULT_PANELS);
  };

  const renderPanelContent = (panel: Panel) => {
    if (panel.minimized) return null;

    switch (panel.type) {
      case "focus":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
              <Sparkles size={20} />
              <span className="text-xs font-black uppercase tracking-[0.2em]">
                Focus di Oggi
              </span>
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
              {todayFocus}
            </h3>
            <div className="flex gap-4">
              <Badge variant="default" className="bg-purple-50 text-purple-600 border-none">
                {highPriorityTasks.length} Task critici
              </Badge>
              <Badge variant="default" className="bg-blue-50 text-blue-600 border-none">
                {activeGoals.length} Obiettivi attivi
              </Badge>
            </div>
            <div className="flex items-center justify-center py-4">
              <div className="relative w-20 h-20">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-gray-100 dark:text-gray-700/50" />
                  <circle cx="50" cy="50" r="42" fill="transparent" stroke="url(#dashProgressGradient)" strokeWidth="10" strokeDasharray="263.9" strokeDashoffset={263.9 - (263.9 * completionRate) / 100} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                  <defs>
                    <linearGradient id="dashProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#9333ea" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-black text-gray-900 dark:text-white leading-none">{completionRate}%</span>
                  <span className="text-[7px] font-black uppercase tracking-tighter text-gray-400 mt-0.5">Done</span>
                </div>
              </div>
            </div>
          </div>
        );

      case "tasks":
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-orange-500">
              <Flame size={16} />
              <span className="text-xs font-black uppercase tracking-widest">Priorità Alta</span>
            </div>
            {highPriorityTasks.length > 0 ? (
              highPriorityTasks.map((t) => (
                <div key={t.id} className="p-3 bg-white dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 shadow-lg shadow-red-500/40" />
                  <span className="text-sm font-bold truncate flex-1">{t.title}</span>
                  {t.deadline && (
                    <span className="text-[9px] font-bold text-gray-400">{t.deadline}</span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center py-4 text-xs text-gray-400 font-medium">Nessun task critico. Ottimo!</p>
            )}
          </div>
        );

      case "ideas":
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-amber-500">
              <Lightbulb size={16} />
              <span className="text-xs font-black uppercase tracking-widest">Ultime Idee</span>
            </div>
            {recentIdeas.length > 0 ? (
              recentIdeas.map((idea) => (
                <div key={idea.id} className="p-3 bg-amber-50/30 dark:bg-amber-900/10 rounded-xl border-l-4 border-amber-400">
                  <p className="text-sm font-bold italic text-amber-900 dark:text-amber-200">&quot;{idea.title}&quot;</p>
                  <p className="text-[9px] font-black text-amber-600/60 uppercase mt-2">{idea.category}</p>
                </div>
              ))
            ) : (
              <p className="text-center py-4 text-xs text-gray-400 font-medium">Fai un brain dump delle tue idee!</p>
            )}
          </div>
        );

      case "goals":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-500">
              <Target size={16} />
              <span className="text-xs font-black uppercase tracking-widest">Progressi Obiettivi</span>
            </div>
            {activeGoals.length > 0 ? (
              activeGoals.map((goal) => {
                const subGoals = goal.subGoals || [];
                const completed = subGoals.filter((s) => s.completed).length;
                const pct = subGoals.length > 0 ? Math.round((completed / subGoals.length) * 100) : (goal.completed ? 100 : 0);

                return (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex justify-between items-center text-[11px] font-bold">
                      <span className="truncate pr-4">{goal.title}</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs opacity-60 italic">Nessun obiettivo attivo.</p>
            )}
          </div>
        );

      case "actions":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-purple-500">
              <Wrench size={16} />
              <span className="text-xs font-black uppercase tracking-widest">Navigazione Rapida</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="ghost" className="h-auto py-4 flex flex-col items-center gap-2 border border-gray-100 dark:border-gray-700 rounded-2xl hover:bg-purple-50 dark:hover:bg-purple-900/20">
                <LayoutDashboard size={20} className="text-purple-600" />
                <span className="text-[9px] font-black uppercase tracking-widest">Nuovo Progetto</span>
              </Button>
              <Button variant="ghost" className="h-auto py-4 flex flex-col items-center gap-2 border border-gray-100 dark:border-gray-700 rounded-2xl hover:bg-amber-50 dark:hover:bg-amber-900/20">
                <Lightbulb size={20} className="text-amber-600" />
                <span className="text-[9px] font-black uppercase tracking-widest">Nuova Idea</span>
              </Button>
            </div>
          </div>
        );

      case "resources":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-purple-500">
              <Wrench size={16} />
              <span className="text-xs font-black uppercase tracking-widest">Risorse e Strumenti</span>
            </div>
            <div className="space-y-2">
              <FileUploader />
              <TemplateGallery />
              <ImportExport />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded-4xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-inter text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white drop-shadow-[0_2px_20px_rgba(123,57,252,0.18)]">
            Il tuo centro di comando
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm font-medium">
            Tutto sotto controllo. Personalizza la tua dashboard trascinando i pannelli.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={resetLayout} variant="outline" size="sm">
            Reset Layout
          </Button>
        </div>
      </div>

      <div 
        ref={dashboardRef}
        className="relative bg-gray-50 dark:bg-gray-900/50 rounded-3xl p-4 min-h-[800px]"
        style={{ 
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(123,57,252,0.1) 1px, transparent 0)',
          backgroundSize: '20px 20px'
        }}
      >
        {panels.map((panel) => (
          <motion.div
            key={panel.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: panel.opacity, scale: 1 }}
            className="absolute bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            style={{
              left: `${panel.x * 100}px`,
              top: `${panel.y * 100}px`,
              width: `${panel.width * 100}px`,
              height: panel.minimized ? 'auto' : `${panel.height * 100}px`,
              zIndex: panel.zIndex,
              opacity: panel.opacity,
            }}
            onMouseDown={(e) => handlePanelMouseDown(e, panel.id)}
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 cursor-move panel-header">
              <div className="flex items-center gap-2">
                <GripVertical size={16} className="text-gray-400" />
                <span className="text-sm font-bold text-gray-900 dark:text-white">{panel.title}</span>
              </div>
              <div className="flex items-center gap-1 panel-actions">
                <button
                  onClick={() => toggleMinimize(panel.id)}
                  className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {panel.minimized ? <ChevronDown size={16} /> : <Minimize2 size={16} />}
                </button>
                <button
                  onClick={() => updateOpacity(panel.id, panel.opacity === 1 ? 0.7 : 1)}
                  className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title={panel.opacity === 1 ? "Rendi trasparente" : "Rendi opaco"}
                >
                  <LayoutDashboard size={16} />
                </button>
              </div>
            </div>

            {/* Panel Content */}
            <div className="p-4 h-full overflow-auto" style={{ display: panel.minimized ? 'none' : 'block' }}>
              {renderPanelContent(panel)}
            </div>

            {/* Resize Handle */}
            {!panel.minimized && (
              <div
                className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex items-center justify-center"
                onMouseDown={(e) => handleResizeMouseDown(e, panel.id)}
              >
                <div className="w-2 h-2 border-r-2 border-b-2 border-gray-400 rounded-br" />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
