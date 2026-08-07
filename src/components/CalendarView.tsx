"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  Button,
  Badge,
  EditableTitle,
  Skeleton,
} from "./UIComponents";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  PieChart,
  X,
  AlertCircle,
  Flag,
  Zap,
  StickyNote,
  Calendar as CalendarIcon,
  CalendarRange,
  CalendarDays,
  ListOrdered,
  Repeat,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { isTaskOnDay } from "../lib/recurrence";

const priorities = [
  {
    id: "Bassa",
    label: "Bassa",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    icon: Circle,
  },
  {
    id: "Media",
    label: "Media",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    icon: Flag,
  },
  {
    id: "Alta",
    label: "Alta",
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    icon: AlertCircle,
  },
];

const recurrences = [
  { id: "", label: "Non ricorrente" },
  { id: "daily", label: "Ogni giorno" },
  { id: "weekly", label: "Ogni settimana" },
  { id: "monthly", label: "Ogni mese" },
];

const TaskModal = ({ isOpen, onClose, onAdd, selectedDate }) => {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("Media");
  const [recurrence, setRecurrence] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ title, priority, recurrence });
    setTitle("");
    setPriority("Media");
    setRecurrence("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-md"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-gray-800 overflow-hidden my-auto"
        >
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                  Nuovo Impegno
                </h3>
                <p className="text-xs font-bold text-cyan-600 uppercase tracking-widest mt-1">
                  {selectedDate?.toLocaleDateString("it-IT", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">
                  Cosa devi fare?
                </label>
                <input
                  autoFocus
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Es: Riunione di progetto"
                  className="w-full bg-gray-50 dark:bg-gray-800/50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-cyan-500 transition-all dark:text-white outline-none"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">
                  Priorità
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {priorities.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPriority(p.id)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                        priority === p.id
                          ? `${p.border} ${p.bg} ${p.color} scale-105 shadow-lg`
                          : "border-gray-50 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 text-gray-400 hover:border-gray-200 dark:hover:border-gray-700"
                      }`}
                    >
                      <p.icon size={18} />
                      <span className="text-[9px] font-black uppercase tracking-widest">
                        {p.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">
                  Ricorrenza
                </label>
                <select
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800/50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-cyan-500 transition-all dark:text-white outline-none"
                >
                  {recurrences.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full py-4 text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-cyan-500/20"
                >
                  Aggiungi al calendario
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};

export default function CalendarView({
  title,
  tasks = [] as any[],
  setTasks,
  onRename,
  loading = false,
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<any>(null);
  const [view, setView] = useState("week");
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  // Blocca lo scroll della pagina quando il modale è aperto
  React.useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  const calendarData = Array.isArray(tasks)
    ? { tasks: tasks, dailyMeta: {} }
    : tasks || { tasks: [], dailyMeta: {} };
  const tasksList = useMemo(
    () => calendarData.tasks || [],
    [calendarData.tasks],
  );
  const dailyMeta = calendarData.dailyMeta || {};

  const stats = useMemo(() => {
    const completed = tasksList.filter((t) => t.completed).length;
    const pending = tasksList.length - completed;
    const total = tasksList.length || 1;
    return {
      completed,
      pending,
      completedPct: (completed / total) * 100,
      total: tasksList.length,
    };
  }, [tasksList]);

  if (loading) {
    return (
      <div className="space-y-8 pb-12">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-20 w-full rounded-[2rem]" />
              <Skeleton className="h-[400px] w-full rounded-[2.5rem]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const updateCalendarData = (updates) => {
    setTasks({ ...calendarData, ...updates });
  };

  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const startOfWeek = getStartOfWeek(currentDate);
  const weekDays: Date[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const nextWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };

  const prevWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };

  const goToToday = () => setCurrentDate(new Date());

  const handleOpenModal = (day) => {
    setSelectedDay(day);
    setIsModalOpen(true);
  };

  const handleAddTask = ({ title, priority, recurrence }) => {
    const newTask = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      priority,
      recurrence: recurrence || "",
      completed: false,
      date: selectedDay.toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
    };
    updateCalendarData({ tasks: [newTask, ...tasksList] });
  };

  const toggleTask = (id) => {
    updateCalendarData({
      tasks: tasksList.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t,
      ),
    });
  };

  const deleteTask = (id) => {
    updateCalendarData({ tasks: tasksList.filter((t) => t.id !== id) });
  };

  const updateDailyMeta = (dateStr, field, value) => {
    const newMeta = { ...dailyMeta };
    if (!newMeta[dateStr]) newMeta[dateStr] = { focus: "", notes: "" };
    newMeta[dateStr][field] = value;
    updateCalendarData({ dailyMeta: newMeta });
  };

  const getTasksForDay = (day: Date) => {
    const dateStr = day.toISOString().split("T")[0];
    return tasksList.filter((t) => isTaskOnDay(t, dateStr));
  };

  const moveTaskToDate = (taskId, dateStr) => {
    updateCalendarData({
      tasks: tasksList.map((t) =>
        t.id === taskId ? { ...t, date: dateStr, recurrence: "" } : t,
      ),
    });
  };

  const nav = (dir) => {
    const d = new Date(currentDate);
    if (view === "week") d.setDate(d.getDate() + 7 * dir);
    else if (view === "month") d.setMonth(d.getMonth() + dir);
    else d.setDate(d.getDate() + dir);
    setCurrentDate(d);
  };

  const rangeLabel = () => {
    if (view === "month") {
      return currentDate.toLocaleDateString("it-IT", {
        month: "long",
        year: "numeric",
      });
    }
    if (view === "agenda") {
      return startOfWeek.toLocaleDateString("it-IT", { month: "long", year: "numeric" });
    }
    return `${startOfWeek.toLocaleDateString("it-IT", { month: "short", day: "numeric" })} - ${weekDays[6].toLocaleDateString("it-IT", { month: "short", day: "numeric", year: "numeric" })}`;
  };

  const monthDays = (() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const first = new Date(year, month, 1);
    const startOffset = (first.getDay() + 6) % 7; // lun=0
    const startDate = new Date(first);
    startDate.setDate(first.getDate() - startOffset);
    const cells: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      cells.push(d);
    }
    return cells;
  })();

  const agendaItems = tasksList
    .map((t) => ({
      task: t,
      date: t.date || "",
      occursToday: isTaskOnDay(t, currentDate.toISOString().split("T")[0]),
    }))
    .sort((a, b) => (a.task.date || "").localeCompare(b.task.date || ""));

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-end mb-4">
        <div className="flex items-center gap-3 bg-white/50 dark:bg-gray-800/50 p-2 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex-wrap">
          <Button variant="ghost" size="icon" onClick={() => nav(-1)}>
            <ChevronLeft size={20} />
          </Button>
          <span className="font-bold px-4 min-w-[150px] text-center text-xs uppercase tracking-widest">
            {rangeLabel()}
          </span>
          <Button variant="ghost" size="icon" onClick={() => nav(1)}>
            <ChevronRight size={20} />
          </Button>
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
          <Button
            variant="ghost"
            onClick={goToToday}
            className="text-[10px] font-black uppercase tracking-widest"
          >
            Oggi
          </Button>
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800/50 p-1 rounded-xl">
            {[
              { id: "week", icon: CalendarDays, label: "Settimana" },
              { id: "month", icon: CalendarRange, label: "Mese" },
              { id: "agenda", icon: ListOrdered, label: "Agenda" },
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                  view === v.id
                    ? "bg-white dark:bg-gray-700 text-cyan-600 shadow-md"
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                }`}
              >
                <v.icon size={13} />
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {view === "month" && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {monthDays.map((day) => {
            const dateStr = day.toISOString().split("T")[0];
            const dayTasks = getTasksForDay(day);
            const isToday = day.toDateString() === new Date().toDateString();
            const inMonth = day.getMonth() === currentDate.getMonth();
            return (
              <div
                key={dateStr}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedTaskId) moveTaskToDate(draggedTaskId, dateStr);
                  setDraggedTaskId(null);
                }}
                className={`min-h-[110px] rounded-2xl border p-2 flex flex-col gap-1 transition-all ${
                  inMonth
                    ? "bg-white/70 dark:bg-gray-800/60 border-gray-100 dark:border-gray-700"
                    : "bg-gray-50/60 dark:bg-gray-900/30 border-dashed border-gray-200 dark:border-gray-800 opacity-60"
                } ${isToday ? "ring-2 ring-cyan-500/40" : ""}`}
              >
                <div
                  className={`text-[9px] font-black uppercase text-gray-400 ${isToday ? "text-cyan-600 dark:text-cyan-400" : ""}`}
                >
                  {day.getDate()} {day.toLocaleDateString("it-IT", { weekday: "short" })}
                </div>
                <div className="flex flex-col gap-1 overflow-hidden">
                  {dayTasks.slice(0, 3).map((t) => (
                    <div
                      key={t.id}
                      className={`px-1.5 py-0.5 rounded text-[8px] font-bold truncate cursor-pointer ${
                        t.completed
                          ? "line-through text-gray-400 bg-gray-100/50 dark:bg-gray-800"
                          : "bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300"
                      }`}
                      onClick={() => {
                        setSelectedDay(day);
                        setIsModalOpen(true);
                      }}
                    >
                      {t.title}
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <span className="text-[8px] font-black text-gray-400 px-1">
                      +{dayTasks.length - 3}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleOpenModal(day)}
                  className="mt-auto text-[8px] font-black text-gray-300 hover:text-cyan-500 text-left"
                >
                  + Aggiungi
                </button>
              </div>
            );
          })}
        </div>
      )}

      {view === "agenda" && (
        <div className="space-y-2">
          {agendaItems.map(({ task, date }) => (
            <div
              key={task.id}
              className="flex items-center gap-3 bg-white/70 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 rounded-2xl p-3"
            >
              <button onClick={() => toggleTask(task.id)} className="shrink-0">
                {task.completed ? (
                  <CheckCircle2 size={18} className="text-emerald-500" />
                ) : (
                  <Circle size={18} className="text-gray-400" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-bold truncate ${task.completed ? "line-through text-gray-400" : "text-gray-800 dark:text-gray-100"}`}
                >
                  {task.title}
                </p>
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                  {date
                    ? new Date(date + "T00:00:00").toLocaleDateString("it-IT", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })
                    : "Senza data"}
                </p>
              </div>
              {task.recurrence && (
                <span className="flex items-center gap-1 text-[9px] font-black text-cyan-500 uppercase shrink-0">
                  <Repeat size={11} /> {task.recurrence}
                </span>
              )}
              <button
                onClick={() => deleteTask(task.id)}
                className="text-gray-300 hover:text-red-500 transition-colors shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {agendaItems.length === 0 && (
            <div className="text-center py-16 text-gray-400 font-bold uppercase tracking-widest text-xs">
              Nessun impegno in agenda
            </div>
          )}
        </div>
      )}

      {view === "week" && (
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map((day, idx) => {
          const dateStr = day.toISOString().split("T")[0];
          const dayTasks = getTasksForDay(day);
          const isToday = day.toDateString() === new Date().toDateString();
          const meta = dailyMeta[dateStr] || { focus: "", notes: "" };

          return (
            <div key={idx} className="flex flex-col gap-4">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const taskId = e.dataTransfer.getData("text/task-id");
                  if (taskId) moveTaskToDate(taskId, dateStr);
                }}
                className={`text-center p-4 rounded-[2rem] border transition-all ${isToday ? "bg-cyan-600 border-cyan-600 text-white shadow-xl shadow-cyan-500/30" : "bg-white/80 dark:bg-gray-800/80 border-gray-100 dark:border-gray-700 text-gray-900 dark:text-gray-100"}`}
              >
                <p className="text-[10px] uppercase font-black tracking-[0.2em] opacity-70 mb-1">
                  {day.toLocaleDateString("it-IT", { weekday: "short" })}
                </p>
                <p className="text-3xl font-black">{day.getDate()}</p>
              </div>

              <div className="flex-1 flex flex-col gap-3 min-h-[400px] bg-gray-50/50 dark:bg-gray-900/30 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-gray-800/50 p-3">
                {/* Daily Focus */}
                <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-2xl border border-white dark:border-gray-700 shadow-sm">
                  <div className="flex items-center gap-2 mb-2 text-cyan-600 dark:text-cyan-400">
                    <Zap size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest">
                      Focus Principale
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="Il tuo focus..."
                    value={meta.focus}
                    onChange={(e) =>
                      updateDailyMeta(dateStr, "focus", e.target.value)
                    }
                    className="w-full bg-transparent border-none p-0 text-[11px] font-bold dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600 focus:ring-0 outline-none"
                  />
                </div>

                {/* Tasks List */}
                <div className="flex-1 space-y-2">
                  <AnimatePresence>
                    {dayTasks.map((task) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-3 rounded-xl border group relative ${task.completed ? "bg-gray-100/30 dark:bg-gray-800/10 border-transparent" : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-sm"}`}
                      >
                        <div
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData("text/task-id", task.id);
                            setDraggedTaskId(task.id);
                          }}
                          className="flex flex-col gap-2 cursor-grab active:cursor-grabbing"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <button
                              onClick={() => toggleTask(task.id)}
                              className="mt-0.5 shrink-0"
                            >
                              {task.completed ? (
                                <CheckCircle2
                                  size={16}
                                  className="text-emerald-500"
                                />
                              ) : (
                                <Circle size={16} className="text-gray-400" />
                              )}
                            </button>
                            <p
                              className={`text-[11px] font-bold leading-tight flex-1 ${task.completed ? "line-through text-gray-400" : "text-gray-700 dark:text-gray-200"}`}
                            >
                              {task.title}
                            </p>
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-opacity shrink-0"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  <button
                    onClick={() => handleOpenModal(day)}
                    className="w-full py-2 flex items-center justify-center gap-2 text-gray-400 hover:text-cyan-600 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all border border-transparent hover:border-cyan-100 dark:hover:border-cyan-900/30"
                  >
                    <Plus size={16} />
                    <span className="text-[9px] font-black uppercase tracking-widest">
                      Aggiungi
                    </span>
                  </button>
                </div>

                {/* Daily Notes */}
                <div className="mt-auto pt-2 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2 mb-1.5 text-gray-400 px-1">
                    <StickyNote size={12} />
                    <span className="text-[8px] font-black uppercase tracking-[0.15em]">
                      Note Libere
                    </span>
                  </div>
                  <textarea
                    placeholder="Appunti..."
                    value={meta.notes}
                    onChange={(e) =>
                      updateDailyMeta(dateStr, "notes", e.target.value)
                    }
                    className="w-full bg-transparent border-none p-1 text-[10px] font-medium dark:text-gray-300 placeholder:text-gray-300 dark:placeholder:text-gray-700 focus:ring-0 outline-none resize-none h-16"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddTask}
        selectedDate={selectedDay}
      />

      <Card className="border-none bg-white dark:bg-gray-800/40 overflow-hidden shadow-2xl shadow-cyan-500/5">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full transform -rotate-90"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-gray-100 dark:text-gray-700"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="transparent"
                  stroke="url(#calendarGradient)"
                  strokeWidth="10"
                  strokeDasharray="263.9"
                  strokeDashoffset={263.9 - (263.9 * stats.completedPct) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient
                    id="calendarGradient"
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
                <p className="text-4xl font-black text-gray-800 dark:text-gray-100">
                  {Math.round(stats.completedPct)}%
                </p>
                <p className="text-[10px] uppercase font-black tracking-widest text-gray-400">
                  Completati
                </p>
              </div>
            </div>

            <div className="flex-1 space-y-6">
              <div>
                <h3 className="text-2xl font-bold flex items-center gap-3">
                  <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl">
                    <PieChart
                      className="text-cyan-600 dark:text-cyan-400"
                      size={20}
                    />
                  </div>
                  Analisi Produttività
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
                  Stai mantenendo un ritmo eccellente questa settimana!
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30">
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">
                    Completati
                  </p>
                  <p className="text-3xl font-black text-emerald-700 dark:text-emerald-300">
                    {stats.completed}
                  </p>
                </div>
                <div className="p-5 rounded-3xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30">
                  <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-1">
                    In Attesa
                  </p>
                  <p className="text-3xl font-black text-amber-700 dark:text-amber-300">
                    {stats.pending}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
