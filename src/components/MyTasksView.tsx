"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Check,
  Plus,
  Calendar,
  Clock,
  Flag,
  Tag,
  Folder,
  User,
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronRight,
  Trash2,
  X,
  RotateCcw,
  CheckCircle2,
  Circle,
  AlertTriangle,
  ArrowUpDown,
  ListTodo,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Task,
  TaskStatus,
  TaskPriority,
  Subtask,
  GroupBy,
  SortBy,
  FilterStatus,
  TaskPreferences,
  DEFAULT_TASK_PREFERENCES,
  STATUS_LABELS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  formatDeadlineItalian,
  parseNaturalDate,
  loadTasksFromStorage,
  saveTasksToStorage,
  loadTaskPreferences,
  saveTaskPreferences,
  softDeleteTaskLocal,
} from "../lib/taskModel";
import { track } from "../lib/activity";
import { trackOnboardingEvent } from "../hooks/useOnboarding";

interface MyTasksViewProps {
  allPages?: any[];
  onNavigateToPage?: (pageId: string) => void;
}

export default function MyTasksView({ allPages = [], onNavigateToPage }: MyTasksViewProps) {
  // Tasks state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Preferences & Filters state
  const [prefs, setPrefs] = useState<TaskPreferences>(DEFAULT_TASK_PREFERENCES);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  // Selection & Detail drawer
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [activeTaskIndex, setActiveTaskIndex] = useState<number>(0);

  // Quick create inline state
  const [quickTitle, setQuickTitle] = useState("");
  const [groupQuickTitles, setGroupQuickTitles] = useState<Record<string, string>>({});
  const quickInputRef = useRef<HTMLInputElement | null>(null);

  // Undo Toast state
  const [undoToast, setUndoToast] = useState<{
    visible: boolean;
    taskId: string;
    prevStatus: TaskStatus;
    taskTitle: string;
  } | null>(null);
  const undoTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Detail panel subtask quick input
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [newTagInput, setNewTagInput] = useState("");

  // Filter dropdown toggle
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement | null>(null);

  // Load tasks and prefs on mount
  useEffect(() => {
    const loaded = loadTasksFromStorage();
    setTasks(loaded);
    setPrefs(loadTaskPreferences());
    setHasLoaded(true);

    const handleTasksUpdated = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setTasks(e.detail);
      }
    };
    window.addEventListener("taskly-tasks-updated", handleTasksUpdated);
    return () => window.removeEventListener("taskly-tasks-updated", handleTasksUpdated);
  }, []);

  // Sync to storage when tasks change
  const updateTasks = useCallback((nextTasks: Task[] | ((prev: Task[]) => Task[])) => {
    setTasks((prev) => {
      const updated = typeof nextTasks === "function" ? nextTasks(prev) : nextTasks;
      saveTasksToStorage(updated);
      return updated;
    });
  }, []);

  // Update preferences & persist
  const updatePrefs = useCallback((next: Partial<TaskPreferences>) => {
    setPrefs((prev) => {
      const updated = { ...prev, ...next };
      saveTaskPreferences(updated);
      return updated;
    });
  }, []);

  // Close filter menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(e.target as Node)) {
        setShowFilterMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Available projects from allPages
  const availableProjects = useMemo(() => {
    return (allPages || [])
      .filter((p) => p && !p.deleted && (p.type === "tasks" || p.type === "empty" || !p.type))
      .map((p) => ({ id: p.id, label: p.label || "Senza titolo" }));
  }, [allPages]);

  // Selected Task for side panel
  const activeDetailTask = useMemo(() => {
    return tasks.find((t) => t.id === selectedTaskId) || null;
  }, [tasks, selectedTaskId]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (task.deleted) return false;

      // Status filter
      if (prefs.filterStatus === "active" && task.status === "done") return false;
      if (prefs.filterStatus === "completed" && task.status !== "done") return false;

      // Priority filter
      if (prefs.filterPriority !== "all" && task.priority !== prefs.filterPriority) return false;

      // Project filter
      if (prefs.filterProject !== "all" && task.project !== prefs.filterProject) return false;

      // Search query
      if (prefs.searchQuery.trim()) {
        const q = prefs.searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesDesc = (task.description || "").toLowerCase().includes(q);
        const matchesTag = (task.tags || []).some((t) => t.toLowerCase().includes(q));
        const matchesProject = (task.projectName || "").toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesTag && !matchesProject) return false;
      }

      return true;
    });
  }, [tasks, prefs]);

  // Sort tasks helper
  const sortTasks = useCallback(
    (list: Task[]): Task[] => {
      return [...list].sort((a, b) => {
        let diff = 0;
        if (prefs.sortBy === "deadline") {
          const da = a.deadline ? new Date(a.deadline).getTime() : Infinity;
          const db = b.deadline ? new Date(b.deadline).getTime() : Infinity;
          diff = da - db;
        } else if (prefs.sortBy === "priority") {
          const pOrder: Record<TaskPriority, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
          diff = pOrder[a.priority] - pOrder[b.priority];
        } else if (prefs.sortBy === "title") {
          diff = a.title.localeCompare(b.title, "it");
        } else if (prefs.sortBy === "createdAt") {
          const ca = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const cb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          diff = cb - ca;
        } else if (prefs.sortBy === "position") {
          diff = (a.position ?? 0) - (b.position ?? 0);
        }
        return prefs.sortDirection === "asc" ? diff : -diff;
      });
    },
    [prefs.sortBy, prefs.sortDirection],
  );

  // Grouped tasks
  const groupedTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(today);
    const dayOfWeek = today.getDay();
    const daysUntilSunday = (7 - dayOfWeek) % 7;
    endOfWeek.setDate(today.getDate() + (daysUntilSunday === 0 ? 7 : daysUntilSunday));
    endOfWeek.setHours(23, 59, 59, 999);

    const groups: { id: string; label: string; count: number; tasks: Task[]; badgeClass?: string }[] = [];

    if (prefs.groupBy === "deadline") {
      const overdue: Task[] = [];
      const todayList: Task[] = [];
      const thisWeek: Task[] = [];
      const later: Task[] = [];
      const noDate: Task[] = [];

      filteredTasks.forEach((t) => {
        if (!t.deadline) {
          noDate.push(t);
          return;
        }
        const d = new Date(t.deadline);
        d.setHours(0, 0, 0, 0);
        if (d.getTime() < today.getTime() && t.status !== "done") {
          overdue.push(t);
        } else if (d.getTime() === today.getTime()) {
          todayList.push(t);
        } else if (d.getTime() <= endOfWeek.getTime() && d.getTime() > today.getTime()) {
          thisWeek.push(t);
        } else {
          later.push(t);
        }
      });

      if (overdue.length > 0) {
        groups.push({
          id: "overdue",
          label: "Scaduti",
          count: overdue.length,
          tasks: sortTasks(overdue),
          badgeClass: "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20",
        });
      }
      groups.push({
        id: "today",
        label: "Oggi",
        count: todayList.length,
        tasks: sortTasks(todayList),
        badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
      });
      groups.push({
        id: "this_week",
        label: "Questa settimana",
        count: thisWeek.length,
        tasks: sortTasks(thisWeek),
        badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
      });
      groups.push({
        id: "later",
        label: "Più avanti",
        count: later.length,
        tasks: sortTasks(later),
        badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20",
      });
      groups.push({
        id: "no_date",
        label: "Senza data",
        count: noDate.length,
        tasks: sortTasks(noDate),
        badgeClass: "bg-gray-500/10 text-gray-500 dark:text-gray-400 border border-gray-500/20",
      });
    } else if (prefs.groupBy === "priority") {
      const urgent: Task[] = [];
      const high: Task[] = [];
      const medium: Task[] = [];
      const low: Task[] = [];

      filteredTasks.forEach((t) => {
        if (t.priority === "urgent") urgent.push(t);
        else if (t.priority === "high") high.push(t);
        else if (t.priority === "medium") medium.push(t);
        else low.push(t);
      });

      groups.push({ id: "urgent", label: "Urgente", count: urgent.length, tasks: sortTasks(urgent), badgeClass: "bg-red-500/10 text-red-600 border border-red-500/20" });
      groups.push({ id: "high", label: "Alta", count: high.length, tasks: sortTasks(high), badgeClass: "bg-orange-500/10 text-orange-600 border border-orange-500/20" });
      groups.push({ id: "medium", label: "Media", count: medium.length, tasks: sortTasks(medium), badgeClass: "bg-amber-500/10 text-amber-600 border border-amber-500/20" });
      groups.push({ id: "low", label: "Bassa", count: low.length, tasks: sortTasks(low), badgeClass: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" });
    } else if (prefs.groupBy === "status") {
      const todo: Task[] = [];
      const inProgress: Task[] = [];
      const done: Task[] = [];

      filteredTasks.forEach((t) => {
        if (t.status === "done") done.push(t);
        else if (t.status === "in_progress") inProgress.push(t);
        else todo.push(t);
      });

      groups.push({ id: "todo", label: "Da fare", count: todo.length, tasks: sortTasks(todo), badgeClass: "bg-gray-500/10 text-gray-600 border border-gray-500/20" });
      groups.push({ id: "in_progress", label: "In corso", count: inProgress.length, tasks: sortTasks(inProgress), badgeClass: "bg-cyan-500/10 text-cyan-600 border border-cyan-500/20" });
      groups.push({ id: "done", label: "Completati", count: done.length, tasks: sortTasks(done), badgeClass: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" });
    } else if (prefs.groupBy === "project") {
      const projectMap: Record<string, { label: string; tasks: Task[] }> = {};
      const noProject: Task[] = [];

      filteredTasks.forEach((t) => {
        if (t.project || t.projectName) {
          const key = t.project || t.projectName || "other";
          if (!projectMap[key]) {
            projectMap[key] = { label: t.projectName || "Progetto", tasks: [] };
          }
          projectMap[key].tasks.push(t);
        } else {
          noProject.push(t);
        }
      });

      Object.entries(projectMap).forEach(([id, info]) => {
        groups.push({
          id,
          label: info.label,
          count: info.tasks.length,
          tasks: sortTasks(info.tasks),
          badgeClass: "bg-[#7b39fc]/10 text-[#7b39fc] border border-[#7b39fc]/20",
        });
      });

      groups.push({
        id: "no_project",
        label: "Senza progetto",
        count: noProject.length,
        tasks: sortTasks(noProject),
        badgeClass: "bg-gray-500/10 text-gray-500 border border-gray-500/20",
      });
    }

    return groups;
  }, [filteredTasks, prefs.groupBy, sortTasks]);

  // Flattened tasks in display order for keyboard navigation
  const flatDisplayTasks = useMemo(() => {
    return groupedTasks.flatMap((g) => (collapsedGroups[g.id] ? [] : g.tasks));
  }, [groupedTasks, collapsedGroups]);

  // Quick create handler
  const handleCreateTask = useCallback(
    (rawInput: string, defaultOverrides: Partial<Task> = {}) => {
      const trimmed = rawInput.trim();
      if (!trimmed) return;

      const { title, deadline } = parseNaturalDate(trimmed);
      const todayYMD = new Date().toISOString().split("T")[0];

      let initialDeadline = deadline || defaultOverrides.deadline;
      if (!initialDeadline && defaultOverrides.deadline === undefined) {
        if (prefs.groupBy === "deadline") {
          // If created in "today" group
          if (defaultOverrides.project === "today") initialDeadline = todayYMD;
        }
      }

      const newTask: Task = {
        id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        title: title || trimmed,
        status: defaultOverrides.status || "todo",
        priority: defaultOverrides.priority || "medium",
        deadline: initialDeadline || "",
        project: defaultOverrides.project || (prefs.filterProject !== "all" ? prefs.filterProject : ""),
        projectName: defaultOverrides.projectName || "",
        subtasks: [],
        tags: [],
        createdAt: new Date().toISOString(),
        ...defaultOverrides,
      };

      // Match projectName if project ID was given
      if (newTask.project && !newTask.projectName) {
        const found = availableProjects.find((p) => p.id === newTask.project);
        if (found) newTask.projectName = found.label;
      }

      updateTasks((prev) => [newTask, ...prev]);
      trackOnboardingEvent("task_created");

      track({
        type: "task_created",
        title: "Nuovo task",
        body: `"${newTask.title}" aggiunto a I miei task.`,
      });

      setQuickTitle("");
    },
    [availableProjects, prefs.filterProject, prefs.groupBy, updateTasks],
  );

  // Toggle task completion with animated undo toast
  const toggleTaskStatus = useCallback(
    (task: Task, e?: React.MouseEvent) => {
      if (e) e.stopPropagation();

      const prevStatus = task.status;
      const nextStatus: TaskStatus = prevStatus === "done" ? "todo" : "done";

      updateTasks((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? {
                ...t,
                status: nextStatus,
                completedAt: nextStatus === "done" ? new Date().toISOString() : undefined,
                updatedAt: new Date().toISOString(),
              }
            : t,
        ),
      );

      if (nextStatus === "done") {
        trackOnboardingEvent("task_completed");
        track({
          type: "task_completed",
          title: "Task completato",
          body: `"${task.title}" completato.`,
        });

        // Trigger undo toast
        if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
        setUndoToast({
          visible: true,
          taskId: task.id,
          prevStatus,
          taskTitle: task.title,
        });

        undoTimerRef.current = setTimeout(() => {
          setUndoToast(null);
        }, 4500);
      } else {
        setUndoToast(null);
      }
    },
    [updateTasks],
  );

  // Undo task completion
  const handleUndo = useCallback(() => {
    if (!undoToast) return;
    const { taskId, prevStatus } = undoToast;
    updateTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: prevStatus,
              completedAt: undefined,
              updatedAt: new Date().toISOString(),
            }
          : t,
      ),
    );
    setUndoToast(null);
  }, [undoToast, updateTasks]);

  // Update specific task in detail panel
  const updateDetailTask = useCallback(
    (fields: Partial<Task>) => {
      if (!selectedTaskId) return;
      updateTasks((prev) =>
        prev.map((t) => (t.id === selectedTaskId ? { ...t, ...fields, updatedAt: new Date().toISOString() } : t)),
      );
    },
    [selectedTaskId, updateTasks],
  );

  // Delete task -> soft delete nel Cestino (recuperabile per 30 giorni)
  const deleteTask = useCallback(
    (taskId: string) => {
      updateTasks((prev) =>
        prev.map((t) => (t.id === taskId ? softDeleteTaskLocal(t) : t)),
      );
      if (selectedTaskId === taskId) setSelectedTaskId(null);
    },
    [selectedTaskId, updateTasks],
  );

  // Subtask management
  const addSubtask = useCallback(() => {
    if (!newSubtaskTitle.trim() || !selectedTaskId) return;
    const newSub: Subtask = {
      id: `sub_${Date.now()}`,
      title: newSubtaskTitle.trim(),
      done: false,
    };
    updateTasks((prev) =>
      prev.map((t) =>
        t.id === selectedTaskId
          ? { ...t, subtasks: [...(t.subtasks || []), newSub], updatedAt: new Date().toISOString() }
          : t,
      ),
    );
    setNewSubtaskTitle("");
  }, [newSubtaskTitle, selectedTaskId, updateTasks]);

  const toggleSubtask = useCallback(
    (subtaskId: string) => {
      if (!selectedTaskId) return;
      updateTasks((prev) =>
        prev.map((t) => {
          if (t.id !== selectedTaskId) return t;
          const nextSubs = (t.subtasks || []).map((s) =>
            s.id === subtaskId ? { ...s, done: !s.done } : s,
          );
          return { ...t, subtasks: nextSubs, updatedAt: new Date().toISOString() };
        }),
      );
    },
    [selectedTaskId, updateTasks],
  );

  const deleteSubtask = useCallback(
    (subtaskId: string) => {
      if (!selectedTaskId) return;
      updateTasks((prev) =>
        prev.map((t) => {
          if (t.id !== selectedTaskId) return t;
          return {
            ...t,
            subtasks: (t.subtasks || []).filter((s) => s.id !== subtaskId),
            updatedAt: new Date().toISOString(),
          };
        }),
      );
    },
    [selectedTaskId, updateTasks],
  );

  // Tags management
  const addTag = useCallback(() => {
    if (!newTagInput.trim() || !selectedTaskId) return;
    const tag = newTagInput.trim();
    updateTasks((prev) =>
      prev.map((t) => {
        if (t.id !== selectedTaskId) return t;
        const cur = t.tags || [];
        if (cur.includes(tag)) return t;
        return { ...t, tags: [...cur, tag], updatedAt: new Date().toISOString() };
      }),
    );
    setNewTagInput("");
  }, [newTagInput, selectedTaskId, updateTasks]);

  const removeTag = useCallback(
    (tagToRemove: string) => {
      if (!selectedTaskId) return;
      updateTasks((prev) =>
        prev.map((t) => {
          if (t.id !== selectedTaskId) return t;
          return {
            ...t,
            tags: (t.tags || []).filter((tg) => tg !== tagToRemove),
            updatedAt: new Date().toISOString(),
          };
        }),
      );
    },
    [selectedTaskId, updateTasks],
  );

  // Toggle group collapse
  const toggleGroupCollapse = (groupId: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  // Keyboard navigation & shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input, textarea, or contentEditable
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      // Escape always closes the side panel or clears input
      if (e.key === "Escape") {
        if (selectedTaskId) {
          e.preventDefault();
          setSelectedTaskId(null);
          return;
        }
      }

      if (isInput) return;

      // N: Focus quick create input
      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        quickInputRef.current?.focus();
        return;
      }

      // Arrow navigation across tasks
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveTaskIndex((prev) => Math.min(prev + 1, Math.max(0, flatDisplayTasks.length - 1)));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveTaskIndex((prev) => Math.max(prev - 1, 0));
      }

      // Space: Toggle complete for active task
      if (e.key === " " && flatDisplayTasks[activeTaskIndex]) {
        e.preventDefault();
        toggleTaskStatus(flatDisplayTasks[activeTaskIndex]);
      }

      // Enter: Open detail drawer for active task
      if (e.key === "Enter" && flatDisplayTasks[activeTaskIndex]) {
        e.preventDefault();
        setSelectedTaskId(flatDisplayTasks[activeTaskIndex].id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTaskIndex, flatDisplayTasks, selectedTaskId, toggleTaskStatus]);

  // Total and active counters
  const totalTasksCount = tasks.filter((t) => !t.deleted).length;
  const completedTasksCount = tasks.filter((t) => !t.deleted && t.status === "done").length;
  const activeTasksCount = totalTasksCount - completedTasksCount;

  return (
    <div className="relative min-h-[calc(100vh-5rem)] flex flex-col font-sans">
      {/* ── Top Header & Controls ────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800/80 px-4 md:px-8 py-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Title & Stats */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7b39fc] to-[#a67cff] flex items-center justify-center text-white shadow-md shadow-[#7b39fc]/20 shrink-0">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                  I miei task
                </h1>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#7b39fc]/10 text-[#7b39fc]">
                  {activeTasksCount} attivi
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {completedTasksCount} di {totalTasksCount} completati • Premi{" "}
                <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-[10px] font-mono border border-gray-200 dark:border-gray-700">
                  N
                </kbd>{" "}
                per nuovo task
              </p>
            </div>
          </div>

          {/* Controls Bar: Group By, Sort, Filters, Search */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-48 md:w-56">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Cerca task o tag..."
                value={prefs.searchQuery}
                onChange={(e) => updatePrefs({ searchQuery: e.target.value })}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-[#7b39fc]/40 text-gray-800 dark:text-gray-200 placeholder-gray-400 transition-all"
              />
              {prefs.searchQuery && (
                <button
                  onClick={() => updatePrefs({ searchQuery: "" })}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Group By selector */}
            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-900 p-1 rounded-xl border border-gray-200 dark:border-gray-800 text-xs">
              <span className="text-[11px] font-bold text-gray-400 px-2">Raggruppa:</span>
              {(
                [
                  { id: "deadline", label: "Scadenza" },
                  { id: "project", label: "Progetto" },
                  { id: "priority", label: "Priorità" },
                  { id: "status", label: "Stato" },
                ] as const
              ).map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => updatePrefs({ groupBy: mode.id })}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    prefs.groupBy === mode.id
                      ? "bg-white dark:bg-gray-800 text-[#7b39fc] shadow-sm"
                      : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {/* Filter & Sort Dropdown Menu */}
            <div className="relative" ref={filterMenuRef}>
              <button
                onClick={() => setShowFilterMenu((v) => !v)}
                className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  showFilterMenu || prefs.filterStatus !== "active" || prefs.filterPriority !== "all" || prefs.filterProject !== "all"
                    ? "bg-[#7b39fc]/10 border-[#7b39fc]/30 text-[#7b39fc]"
                    : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50"
                }`}
                title="Filtri e Ordinamento"
              >
                <SlidersHorizontal size={14} />
                <span className="hidden sm:inline">Filtri</span>
              </button>

              {/* Popup Dropdown */}
              {showFilterMenu && (
                <div className="absolute right-0 mt-2 w-72 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl z-30 space-y-4 text-xs">
                  {/* Stato */}
                  <div>
                    <label className="font-bold text-gray-500 dark:text-gray-400 block mb-1.5">
                      Stato
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {(
                        [
                          { id: "all", label: "Tutti" },
                          { id: "active", label: "Attivi" },
                          { id: "completed", label: "Fatti" },
                        ] as const
                      ).map((st) => (
                        <button
                          key={st.id}
                          onClick={() => updatePrefs({ filterStatus: st.id })}
                          className={`py-1 rounded-lg text-center font-medium ${
                            prefs.filterStatus === st.id
                              ? "bg-[#7b39fc] text-white"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Priorità */}
                  <div>
                    <label className="font-bold text-gray-500 dark:text-gray-400 block mb-1.5">
                      Priorità
                    </label>
                    <select
                      value={prefs.filterPriority}
                      onChange={(e) => updatePrefs({ filterPriority: e.target.value as any })}
                      className="w-full p-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200"
                    >
                      <option value="all">Tutte le priorità</option>
                      <option value="urgent">Urgente</option>
                      <option value="high">Alta</option>
                      <option value="medium">Media</option>
                      <option value="low">Bassa</option>
                    </select>
                  </div>

                  {/* Progetto */}
                  <div>
                    <label className="font-bold text-gray-500 dark:text-gray-400 block mb-1.5">
                      Progetto
                    </label>
                    <select
                      value={prefs.filterProject}
                      onChange={(e) => updatePrefs({ filterProject: e.target.value })}
                      className="w-full p-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200"
                    >
                      <option value="all">Tutti i progetti</option>
                      {availableProjects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Ordinamento */}
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                    <label className="font-bold text-gray-500 dark:text-gray-400 block mb-1.5">
                      Ordina per
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={prefs.sortBy}
                        onChange={(e) => updatePrefs({ sortBy: e.target.value as any })}
                        className="flex-1 p-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200"
                      >
                        <option value="deadline">Scadenza</option>
                        <option value="priority">Priorità</option>
                        <option value="title">Titolo (A-Z)</option>
                        <option value="createdAt">Data creazione</option>
                      </select>
                      <button
                        onClick={() =>
                          updatePrefs({
                            sortDirection: prefs.sortDirection === "asc" ? "desc" : "asc",
                          })
                        }
                        className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100"
                        title="Inverti ordine"
                      >
                        <ArrowUpDown size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content Area ────────────────────────────────────────────── */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-8 py-6">
        {/* Quick Add Global Bar */}
        <div className="mb-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateTask(quickTitle);
            }}
            className="flex items-center gap-2 p-2 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-sm focus-within:ring-2 focus-within:ring-[#7b39fc]/30 focus-within:border-[#7b39fc] transition-all"
          >
            <div className="pl-3 text-gray-400">
              <Plus size={18} />
            </div>
            <input
              ref={quickInputRef}
              type="text"
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              placeholder='Aggiungi un nuovo task... (es. "Revisione report domani", premi Invio)'
              className="flex-1 bg-transparent border-none text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none py-1.5"
            />
            {quickTitle.trim() && (
              <div className="flex items-center gap-2 pr-1">
                {(() => {
                  const { deadline } = parseNaturalDate(quickTitle);
                  if (deadline) {
                    const parsed = formatDeadlineItalian(deadline);
                    return (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#7b39fc]/10 text-[#7b39fc] border border-[#7b39fc]/20 animate-fade-in">
                        <Sparkles size={11} /> {parsed.formatted}
                      </span>
                    );
                  }
                  return null;
                })()}
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#7b39fc] text-white text-xs font-bold hover:brightness-110 shadow-sm transition-all"
                >
                  Crea
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Groups List */}
        {groupedTasks.length === 0 || (groupedTasks.every((g) => g.tasks.length === 0) && !quickTitle) ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-900 text-gray-400 flex items-center justify-center mx-auto mb-4">
              <ListTodo size={28} />
            </div>
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-1">
              Nessun task trovato
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Non ci sono task corrispondenti ai filtri correnti. Prova a modificare i filtri o premi{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-[10px] font-mono border">
                N
              </kbd>{" "}
              per crearne uno nuovo.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedTasks.map((group) => {
              const isCollapsed = collapsedGroups[group.id];

              return (
                <div
                  key={group.id}
                  className="rounded-2xl bg-white/50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800/80 p-4 transition-all"
                >
                  {/* Group Header */}
                  <div className="flex items-center justify-between mb-3">
                    <button
                      onClick={() => toggleGroupCollapse(group.id)}
                      className="flex items-center gap-2 text-left group"
                    >
                      <div className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-colors">
                        {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                      </div>
                      <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                        {group.label}
                      </h3>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          group.badgeClass || "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {group.count}
                      </span>
                    </button>
                  </div>

                  {/* Tasks in Group */}
                  {!isCollapsed && (
                    <div className="space-y-2">
                      <AnimatePresence initial={false}>
                        {group.tasks.map((task) => {
                          const isSelected = selectedTaskId === task.id;
                          const deadlineInfo = formatDeadlineItalian(task.deadline);
                          const priorityStyle = PRIORITY_COLORS[task.priority];

                          const totalSubs = task.subtasks?.length || 0;
                          const completedSubs = task.subtasks?.filter((s) => s.done).length || 0;

                          return (
                            <motion.div
                              key={task.id}
                              layout
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.96 }}
                              transition={{ duration: 0.15 }}
                              onClick={() => setSelectedTaskId(task.id)}
                              className={`group relative flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-[#7b39fc]/5 border-[#7b39fc]/40 shadow-sm"
                                  : "bg-white dark:bg-gray-900/90 border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-sm"
                              }`}
                            >
                              {/* Animated Checkbox */}
                              <button
                                type="button"
                                onClick={(e) => toggleTaskStatus(task, e)}
                                className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all shrink-0 ${
                                  task.status === "done"
                                    ? "bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/30"
                                    : "border-gray-300 dark:border-gray-600 hover:border-[#7b39fc] bg-transparent"
                                }`}
                                title={task.status === "done" ? "Segna come da fare" : "Completa task"}
                              >
                                {task.status === "done" && (
                                  <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                  >
                                    <Check size={12} strokeWidth={3} />
                                  </motion.div>
                                )}
                              </button>

                              {/* Task Title & Project */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-sm font-medium truncate transition-all ${
                                      task.status === "done"
                                        ? "line-through text-gray-400 dark:text-gray-500"
                                        : "text-gray-800 dark:text-gray-100"
                                    }`}
                                  >
                                    {task.title}
                                  </span>

                                  {/* Subtasks progress badge */}
                                  {totalSubs > 0 && (
                                    <span
                                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                        completedSubs === totalSubs
                                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                          : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                                      }`}
                                      title={`${completedSubs} di ${totalSubs} sottotask completati`}
                                    >
                                      <CheckCircle2 size={10} />
                                      {completedSubs}/{totalSubs}
                                    </span>
                                  )}
                                </div>

                                {task.projectName && (
                                  <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                                    <Folder size={10} />
                                    <span>{task.projectName}</span>
                                  </div>
                                )}
                              </div>

                              {/* Tags */}
                              {task.tags && task.tags.length > 0 && (
                                <div className="hidden sm:flex items-center gap-1 shrink-0">
                                  {task.tags.slice(0, 2).map((tg) => (
                                    <span
                                      key={tg}
                                      className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                                    >
                                      #{tg}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Priority badge */}
                              <span
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border shrink-0 flex items-center gap-1 ${priorityStyle.bg} ${priorityStyle.text} ${priorityStyle.border}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${priorityStyle.dot}`} />
                                {PRIORITY_LABELS[task.priority]}
                              </span>

                              {/* Deadline pill */}
                              {task.deadline && (
                                <span
                                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 shrink-0 ${
                                    deadlineInfo.isOverdue && task.status !== "done"
                                      ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                                      : deadlineInfo.isToday
                                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                      : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                                  }`}
                                >
                                  <Calendar size={10} />
                                  {deadlineInfo.formatted}
                                </span>
                              )}

                              {/* Hover arrow to open detail */}
                              <div className="opacity-0 group-hover:opacity-100 text-gray-400 transition-opacity">
                                <ChevronRight size={14} />
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>

                      {/* Inline quick add inside group */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const val = groupQuickTitles[group.id] || "";
                          if (!val.trim()) return;

                          let override: Partial<Task> = {};
                          if (prefs.groupBy === "deadline") {
                            if (group.id === "today") {
                              override.deadline = new Date().toISOString().split("T")[0];
                            }
                          } else if (prefs.groupBy === "priority") {
                            override.priority = group.id as TaskPriority;
                          } else if (prefs.groupBy === "status") {
                            override.status = group.id as TaskStatus;
                          } else if (prefs.groupBy === "project" && group.id !== "no_project") {
                            override.project = group.id;
                            override.projectName = group.label;
                          }

                          handleCreateTask(val, override);
                          setGroupQuickTitles((prev) => ({ ...prev, [group.id]: "" }));
                        }}
                        className="flex items-center gap-2 pt-2 px-3 text-xs text-gray-400 focus-within:text-gray-600"
                      >
                        <Plus size={14} className="shrink-0" />
                        <input
                          type="text"
                          value={groupQuickTitles[group.id] || ""}
                          onChange={(e) =>
                            setGroupQuickTitles((prev) => ({
                              ...prev,
                              [group.id]: e.target.value,
                            }))
                          }
                          placeholder={`Aggiungi a "${group.label}"...`}
                          className="w-full bg-transparent border-none text-xs text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none py-1"
                        />
                      </form>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Slide-in Task Detail Drawer ──────────────────────────────────── */}
      <AnimatePresence>
        {activeDetailTask && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTaskId(null)}
              className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-xs z-40"
            />

            {/* Side Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed top-0 right-0 h-full w-full max-w-lg bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-2xl z-50 flex flex-col overflow-hidden"
            >
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleTaskStatus(activeDetailTask)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      activeDetailTask.status === "done"
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200"
                    }`}
                  >
                    <Check size={14} />
                    <span>{STATUS_LABELS[activeDetailTask.status]}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => deleteTask(activeDetailTask.id)}
                    className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Elimina task"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    onClick={() => setSelectedTaskId(null)}
                    className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title="Chiudi pannello (Esc)"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Drawer Body Scrollable */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Title Editable */}
                <div>
                  <input
                    type="text"
                    value={activeDetailTask.title}
                    onChange={(e) => updateDetailTask({ title: e.target.value })}
                    placeholder="Titolo del task..."
                    className="w-full text-xl font-black text-gray-900 dark:text-white bg-transparent border-none focus:outline-none focus:ring-0 placeholder-gray-300"
                  />
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 text-xs">
                  {/* Stato */}
                  <div>
                    <span className="text-[11px] font-bold text-gray-400 block mb-1">
                      Stato
                    </span>
                    <select
                      value={activeDetailTask.status}
                      onChange={(e) =>
                        updateDetailTask({ status: e.target.value as TaskStatus })
                      }
                      className="w-full p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-medium"
                    >
                      <option value="todo">Da fare</option>
                      <option value="in_progress">In corso</option>
                      <option value="done">Completato</option>
                    </select>
                  </div>

                  {/* Priorità */}
                  <div>
                    <span className="text-[11px] font-bold text-gray-400 block mb-1">
                      Priorità
                    </span>
                    <select
                      value={activeDetailTask.priority}
                      onChange={(e) =>
                        updateDetailTask({ priority: e.target.value as TaskPriority })
                      }
                      className="w-full p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-medium"
                    >
                      <option value="urgent">🔴 Urgente</option>
                      <option value="high">🟠 Alta</option>
                      <option value="medium">🟡 Media</option>
                      <option value="low">🟢 Bassa</option>
                    </select>
                  </div>

                  {/* Scadenza */}
                  <div>
                    <span className="text-[11px] font-bold text-gray-400 block mb-1">
                      Scadenza
                    </span>
                    <input
                      type="date"
                      value={activeDetailTask.deadline || ""}
                      onChange={(e) => updateDetailTask({ deadline: e.target.value })}
                      className="w-full p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-medium"
                    />
                  </div>

                  {/* Progetto */}
                  <div>
                    <span className="text-[11px] font-bold text-gray-400 block mb-1">
                      Progetto
                    </span>
                    <select
                      value={activeDetailTask.project || ""}
                      onChange={(e) => {
                        const projId = e.target.value;
                        const found = availableProjects.find((p) => p.id === projId);
                        updateDetailTask({
                          project: projId,
                          projectName: found ? found.label : "",
                        });
                      }}
                      className="w-full p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-medium"
                    >
                      <option value="">Nessun progetto</option>
                      {availableProjects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-2">
                    <Tag size={14} /> Tag
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(activeDetailTask.tags || []).map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#7b39fc]/10 text-[#7b39fc] border border-[#7b39fc]/20"
                      >
                        #{t}
                        <button
                          onClick={() => removeTag(t)}
                          className="hover:text-red-500 ml-0.5"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        placeholder="Aggiungi tag..."
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                        className="px-2.5 py-1 text-xs rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none w-28"
                      />
                      {newTagInput && (
                        <button
                          onClick={addTag}
                          className="p-1 rounded-md bg-[#7b39fc] text-white text-xs"
                        >
                          <Plus size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sottotask */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                      <CheckCircle2 size={14} /> Sottotask
                    </label>
                    {activeDetailTask.subtasks && activeDetailTask.subtasks.length > 0 && (
                      <span className="text-[11px] font-bold text-gray-400">
                        {activeDetailTask.subtasks.filter((s) => s.done).length} di{" "}
                        {activeDetailTask.subtasks.length} fatti
                      </span>
                    )}
                  </div>

                  {/* Subtasks Progress Bar */}
                  {activeDetailTask.subtasks && activeDetailTask.subtasks.length > 0 && (
                    <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden mb-3">
                      <div
                        className="h-full bg-gradient-to-r from-[#7b39fc] to-emerald-500 transition-all duration-300"
                        style={{
                          width: `${
                            (activeDetailTask.subtasks.filter((s) => s.done).length /
                              activeDetailTask.subtasks.length) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  )}

                  {/* Subtask list */}
                  <div className="space-y-1.5 mb-2">
                    {(activeDetailTask.subtasks || []).map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 text-xs group"
                      >
                        <button
                          type="button"
                          onClick={() => toggleSubtask(sub.id)}
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                            sub.done
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                          }`}
                        >
                          {sub.done && <Check size={10} strokeWidth={3} />}
                        </button>
                        <span
                          className={`flex-1 truncate ${
                            sub.done ? "line-through text-gray-400" : "text-gray-700 dark:text-gray-200"
                          }`}
                        >
                          {sub.title}
                        </span>
                        <button
                          onClick={() => deleteSubtask(sub.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity p-0.5"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add subtask input */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Aggiungi una sottotask..."
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSubtask();
                        }
                      }}
                      className="flex-1 p-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={addSubtask}
                      className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-bold hover:bg-gray-200"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Descrizione */}
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-2">
                    Descrizione
                  </label>
                  <textarea
                    rows={4}
                    value={activeDetailTask.description || ""}
                    onChange={(e) => updateDetailTask({ description: e.target.value })}
                    placeholder="Aggiungi una descrizione dettagliata per questo task..."
                    className="w-full p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7b39fc]/30 resize-y"
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Undo Toast ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {undoToast && undoToast.visible && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-2xl border border-gray-700 dark:border-gray-200"
          >
            <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <Check size={12} strokeWidth={3} />
            </div>
            <span className="text-xs font-bold truncate max-w-xs">
              Task completato: "{undoToast.taskTitle}"
            </span>
            <button
              onClick={handleUndo}
              className="px-3 py-1 rounded-xl bg-white/20 dark:bg-black/10 hover:bg-white/30 text-xs font-black text-emerald-400 dark:text-emerald-700 flex items-center gap-1 transition-all"
            >
              <RotateCcw size={12} />
              Annulla
            </button>
            <button
              onClick={() => setUndoToast(null)}
              className="text-gray-400 hover:text-white dark:hover:text-gray-900"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
