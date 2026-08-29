/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  Button,
  Input,
  Badge,
  EditableTitle,
  Skeleton,
} from "./UIComponents";
import {
  Plus,
  Trash2,
  Calendar as CalendarIcon,
  Search,
  AlertCircle,
  Tag,
  ChevronDown,
  Flag,
  Circle,
  User,
  Clock,
  CheckSquare,
  List,
  Layout as KanbanIcon,
  Trello,
  BarChart2,
  Link as LinkIcon,
  MoreVertical,
  X,
  MessageSquare,
  Send,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { resolvePageIcon } from "../lib/pageIcons";
import { track } from "../lib/activity";
import { nextDeadline } from "../lib/recurrence";

// --- Sotto-Componenti per le Viste ---

const KanbanView = ({ items, updateTask, priorities, statuses, onAddTask }) => {
  const [dragCol, setDragCol] = useState(statuses[0].id);
  const [overCol, setOverCol] = useState(null);
  const [draft, setDraft] = useState({});

  return (
    <div className="flex gap-6 overflow-x-auto pb-6 custom-scrollbar min-h-[500px]">
      {statuses.map((status) => {
        const statusItems = items.filter((i) => i.status === status.id);
        return (
          <div
            key={status.id}
            onDragOver={(e) => {
              e.preventDefault();
              setOverCol(status.id);
            }}
            onDragLeave={() => setOverCol((c) => (c === status.id ? null : c))}
            onDrop={(e) => {
              e.preventDefault();
              const id = e.dataTransfer.getData("text/task-id");
              if (id && dragCol !== status.id) updateTask(id, { status: status.id });
              setOverCol(null);
            }}
            className={`flex-1 min-w-[300px] max-w-[350px] rounded-3xl transition-all ${
              overCol === status.id
                ? "bg-cyan-50/70 dark:bg-cyan-500/5 ring-2 ring-cyan-400/30"
                : ""
            }`}
          >
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${status.color.replace("text-", "bg-")}`}
                />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
                  {status.label}
                </h3>
                <Badge
                  variant="default"
                  className="text-[10px] py-0 px-1.5 opacity-50"
                >
                  {statusItems.length}
                </Badge>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {statusItems.map((item) => {
                const itemPriority =
                  priorities.find((p) => p.id === item.priority) ||
                  priorities[1];
                const subsDone = (item.subtasks || []).filter(
                  (s) => s.done,
                ).length;
                const hasSubs = (item.subtasks || []).length > 0;
                return (
                  <motion.div key={item.id} layout layoutId={item.id}>
                    <div
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/task-id", item.id);
                        e.dataTransfer.effectAllowed = "move";
                        setDragCol(item.status);
                        setOverCol(item.status);
                      }}
                    >
                    <Card className="border-none hover:shadow-xl transition-all cursor-grab active:cursor-grabbing group">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <span
                            className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${itemPriority.bg} ${itemPriority.color}`}
                          >
                            {item.priority}
                          </span>
                          <button className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300">
                            <MoreVertical size={14} />
                          </button>
                        </div>
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3">
                          {item.title}
                        </p>
                        {hasSubs && (
                          <div className="flex items-center gap-2 mb-3">
                            <div className="h-1.5 flex-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                                style={{
                                  width: `${Math.round((subsDone / (item.subtasks || []).length) * 100)}%`,
                                }}
                              />
                            </div>
                            <span className="text-[9px] font-black text-gray-400">
                              {subsDone}/{item.subtasks.length}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex -space-x-2">
                            {item.assignee && (
                              <div
                                className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 text-white flex items-center justify-center border-2 border-white dark:border-gray-800"
                                title={item.assignee}
                              >
                                <span className="text-[7px] font-black uppercase">
                                  {String(item.assignee)
                                    .split(/[\s.]+/)
                                    .filter(Boolean)
                                    .slice(0, 2)
                                    .map((p) => p[0])
                                    .join("")}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {item.recurrence && (
                              <span className="text-[9px] font-black text-cyan-500 uppercase">
                                ↻ {item.recurrence}
                              </span>
                            )}
                            {item.deadline && (
                              <div className="flex items-center gap-1 text-[9px] font-bold text-gray-400">
                                <Clock size={10} />
                                {item.deadline}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    </div>
                  </motion.div>
                );
              })}
              <div className="flex gap-2">
                <input
                  value={draft[status.id] || ""}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, [status.id]: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      onAddTask(status.id, e.currentTarget.value);
                      setDraft((d) => ({ ...d, [status.id]: "" }));
                    }
                  }}
                  placeholder="Aggiungi task..."
                  className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-xl px-3 py-2 text-xs font-bold focus:ring-cyan-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    onAddTask(status.id, draft[status.id] || "");
                    setDraft((d) => ({ ...d, [status.id]: "" }));
                  }}
                  className="px-3 py-2 rounded-xl bg-cyan-600 text-white text-xs font-bold hover:bg-cyan-500 transition-all shrink-0"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const TimelineView = ({ items }) => {
  return (
    <div className="bg-white dark:bg-gray-800/40 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-2xl shadow-cyan-500/5">
      <div className="flex flex-col gap-6">
        {items
          .filter((i) => i.deadline)
          .sort(
            (a, b) =>
              new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
          )
          .map((item, idx) => (
            <div key={item.id} className="flex items-center gap-6">
              <div className="w-24 shrink-0 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {item.deadline}
              </div>
              <div className="relative flex-1">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-50 dark:bg-gray-800 rounded-full" />
                <div
                  className="relative z-10 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 p-3 rounded-2xl text-xs font-bold shadow-lg max-w-fit"
                  style={{ marginLeft: `${idx * 10}%` }}
                >
                  {item.title}
                </div>
              </div>
            </div>
          ))}
        {items.filter((i) => i.deadline).length === 0 && (
          <div className="text-center py-12 text-gray-400 font-bold uppercase tracking-widest text-xs">
            Nessuna scadenza impostata per la timeline
          </div>
        )}
      </div>
    </div>
  );
};

// --- Componente Principale ItemList (Task Manager) ---

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

const statuses = [
  { id: "todo", label: "Da Fare", color: "text-gray-500", bg: "bg-gray-100" },
  { id: "doing", label: "In Corso", color: "text-blue-500", bg: "bg-blue-100" },
  {
    id: "done",
    label: "Completato",
    color: "text-emerald-500",
    bg: "bg-emerald-100",
  },
];

const recurrences = [
  { id: "", label: "Non ricorrente" },
  { id: "giornaliero", label: "Giornaliero" },
  { id: "settimanale", label: "Settimanale" },
  { id: "mensile", label: "Mensile" },
  { id: "annuale", label: "Annuale" },
];

export default function ItemList({
  title,
  items = [] as any[],
  setItems,
  onRename,
  allPages = [] as any[],
  defaultView,
  loading = false,
}) {
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
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-4xl" />
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Skeleton className="h-48 w-full rounded-[2.5rem]" />
            <div className="grid md:grid-cols-2 gap-6">
              <Skeleton className="w-full h-32" />
              <Skeleton className="w-full h-32" />
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

  const [view, setView] = useState(defaultView || "list");
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState("Media");
  const [recurrence, setRecurrence] = useState("");
  const [assignee, setAssignee] = useState("");
  const [search, setSearch] = useState("");
  const [isPriorityMenuOpen, setIsPriorityMenuOpen] = useState(false);
  const [isRecurrenceMenuOpen, setIsRecurrenceMenuOpen] = useState(false);
  const priorityRef = useRef<HTMLDivElement | null>(null);
  const recurrenceRef = useRef<HTMLDivElement | null>(null);
  const [subInput, setSubInput] = useState({});
  const [commentsOpen, setCommentsOpen] = useState({});
  const [commentInput, setCommentInput] = useState({});

  // Dynamic Custom Columns State
  const [customColumns, setCustomColumns] = useState(() => {
    try {
      const saved = localStorage.getItem(`customCols_${title}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(`customCols_${title}`, JSON.stringify(customColumns));
  }, [customColumns, title]);

  const [newColName, setNewColName] = useState("");
  const [newColType, setNewColType] = useState("text");
  const [showAddColPopup, setShowAddColPopup] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState({});

  const addCustomColumn = () => {
    if (!newColName.trim()) return;
    if (
      customColumns.some(
        (c) => c.name.toLowerCase() === newColName.trim().toLowerCase(),
      )
    )
      return;
    setCustomColumns((prev) => [
      ...prev,
      { name: newColName.trim(), type: newColType },
    ]);
    setNewColName("");
    setShowAddColPopup(false);
  };

  const removeCustomColumn = (colName) => {
    setCustomColumns((prev) => prev.filter((c) => c.name !== colName));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (priorityRef.current && !priorityRef.current.contains(event.target)) {
        setIsPriorityMenuOpen(false);
      }
      if (
        recurrenceRef.current &&
        !recurrenceRef.current.contains(event.target)
      ) {
        setIsRecurrenceMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const createTask = (title, status = "todo") => {
    const newItem = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      priority: priority,
      status,
      deadline: "",
      assignee: assignee,
      recurrence: recurrence,
      subtasks: [], // Array di sottotask {id,title,done}
      links: [], // Array di ID pagine collegate
      createdAt: new Date().toISOString(),
    };
    setItems([newItem, ...items]);
    track({
      type: "task_created",
      title: "Nuovo task",
      body: `"${newItem.title}" aggiunto alla lista.`,
      payload: { event: "task" },
    });
  };

  const addItem = () => {
    if (!input.trim()) return;
    createTask(input, "todo");
    setInput("");
  };

  // Quick add used by the Kanban board (one input per column).
  const quickAddTask = (status, title) => {
    createTask((title || "").trim() || "Nuovo task", status);
  };

  const updateTask = (id, updates) => {
    let nextItems = items.map((i) => (i.id === id ? { ...i, ...updates } : i));

    // WORKFLOW AUTOMATION ENGINE:
    // Automation Rule: When Status updates to 'done' -> Set Priority to 'Bassa'
    if (updates.status === "done") {
      nextItems = nextItems.map((i) => {
        if (i.id === id && i.priority !== "Bassa") {
          console.log(
            "Automation triggered: Status set to done -> Priority auto-set to Bassa.",
          );
          return { ...i, priority: "Bassa" };
        }
        return i;
      });
      // Recursive tasks: roll to the next occurrence and reopen
      const t = items.find((i) => i.id === id);
      if (t && t.recurrence) {
        nextItems = nextItems.map((i) => {
          if (i.id === id) {
            return {
              ...i,
              status: "todo",
              deadline: nextDeadline(i.deadline, i.recurrence),
              subtasks: (i.subtasks || []).map((s) => ({ ...s, done: false })),
            };
          }
          return i;
        });
      }
    }

    setItems(nextItems);
    if (updates.status === "done") {
      track({
        type: "task_completed",
        title: "Task completato",
        body: `"${items.find((i) => i.id === id)?.title}" contrassegnato come completato.`,
        payload: { event: "task" },
      });
    }
  };

  const addSubtask = (taskId) => {
    const title = (subInput[taskId] || "").trim();
    if (!title) return;
    const subtasks = [...(items.find((i) => i.id === taskId)?.subtasks || [])];
    subtasks.push({
      id: Math.random().toString(36).substring(2, 9),
      title,
      done: false,
    });
    updateTask(taskId, { subtasks });
    setSubInput((prev) => ({ ...prev, [taskId]: "" }));
  };

  const toggleSubtask = (taskId, subId) => {
    const t = items.find((i) => i.id === taskId);
    const subtasks = (t?.subtasks || []).map((s) =>
      s.id === subId ? { ...s, done: !s.done } : s,
    );
    updateTask(taskId, { subtasks });
  };

  const removeSubtask = (taskId, subId) => {
    const t = items.find((i) => i.id === taskId);
    updateTask(taskId, {
      subtasks: (t?.subtasks || []).filter((s) => s.id !== subId),
    });
  };

  const addComment = (taskId) => {
    const text = (commentInput[taskId] || "").trim();
    if (!text) return;
    const t = items.find((i) => i.id === taskId);
    updateTask(taskId, {
      comments: [
        ...(t?.comments || []),
        {
          id: Math.random().toString(36).substring(2, 9),
          author: "Utente",
          text,
          createdAt: new Date().toISOString(),
        },
      ],
    });
    setCommentInput((prev) => ({ ...prev, [taskId]: "" }));
  };

  const remove = (id) => setItems(items.filter((i) => i.id !== id));

  const addLink = (taskId, pageId) => {
    const task = items.find((i) => i.id === taskId);
    if (task && !(task.links || []).includes(pageId)) {
      updateTask(taskId, { links: [...(task.links || []), pageId] });
    }
  };

  const removeLink = (taskId, pageId) => {
    const task = items.find((i) => i.id === taskId);
    if (task) {
      updateTask(taskId, { links: task.links.filter((id) => id !== pageId) });
    }
  };

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase()),
  );

  const selectedPriority =
    priorities.find((p) => p.id === priority) || priorities[1];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      {/* View Switcher moved below */}
      <div className="flex items-center justify-between mb-4 gap-4">
        {/* Dynamic Column Creator Popover */}
        <div className="relative">
          <Button
            onClick={() => setShowAddColPopup(!showAddColPopup)}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest px-4 py-2.5 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 border border-cyan-200 dark:border-cyan-800 rounded-xl transition-all shadow-md shadow-cyan-500/5"
          >
            <Plus size={14} /> + Colonna Custom
          </Button>

          <AnimatePresence>
            {showAddColPopup && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute left-0 mt-2 z-[110] w-64 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xl p-4 space-y-4"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Aggiungi Colonna
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddColPopup(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Nome colonna (es. Budget)"
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-3 py-2 text-xs font-bold focus:ring-cyan-500 outline-none"
                />
                <Button
                  onClick={addCustomColumn}
                  className="w-full text-[10px] font-black uppercase tracking-widest h-9"
                >
                  Crea Colonna
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800/50 p-1.5 rounded-2xl border border-gray-200 dark:border-gray-700">
          {[
            { id: "list", icon: List, label: "Lista" },
            { id: "kanban", icon: KanbanIcon, label: "Kanban" },
            { id: "timeline", icon: BarChart2, label: "Timeline" },
          ].map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                view === v.id
                  ? "bg-white dark:bg-gray-700 text-cyan-600 shadow-md"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              }`}
            >
              <v.icon size={14} />
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input (Solo vista lista) */}
      {view === "list" && (
        <Card className="border-none bg-white dark:bg-gray-800/40 shadow-xl shadow-gray-200/50 dark:shadow-none overflow-visible">
          <CardContent className="p-2 flex flex-col md:flex-row gap-2 items-center">
            <div className="flex-1 w-full relative">
              <input
                type="text"
                placeholder={`Cosa devi fare oggi?`}
                className="w-full text-base font-bold bg-transparent border-none focus:ring-0 placeholder-gray-300 dark:placeholder-gray-600 pl-4"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addItem()}
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
              <div className="relative" ref={priorityRef}>
                <button
                  onClick={() => setIsPriorityMenuOpen(!isPriorityMenuOpen)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-300 ${selectedPriority.bg} ${selectedPriority.border} ${selectedPriority.color} min-w-[110px] justify-between group`}
                >
                  <div className="flex items-center gap-1.5">
                    <selectedPriority.icon size={12} strokeWidth={3} />
                    <span className="text-[9px] font-black uppercase tracking-widest">
                      {selectedPriority.label}
                    </span>
                  </div>
                  <ChevronDown
                    size={12}
                    className={`transition-transform duration-300 ${isPriorityMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                <AnimatePresence>
                  {isPriorityMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full mt-2 left-0 md:left-auto md:right-0 w-full md:w-48 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-[100] p-1.5"
                    >
                      {priorities.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            setPriority(p.id);
                            setIsPriorityMenuOpen(false);
                          }}
                          className={`flex items-center gap-3 w-full px-3 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                            priority === p.id
                              ? `${p.bg} ${p.color}`
                              : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          }`}
                        >
                          <p.icon
                            size={14}
                            strokeWidth={3}
                            className={
                              priority === p.id ? p.color : "text-gray-400"
                            }
                          />
                          {p.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative" ref={recurrenceRef}>
                <button
                  type="button"
                  onClick={() =>
                    setIsRecurrenceMenuOpen(!isRecurrenceMenuOpen)
                  }
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-300 min-w-[120px] justify-between group transition-all ${isRecurrenceMenuOpen ? "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600" : ""}`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-black uppercase tracking-widest">
                      {recurrence
                        ? recurrences.find((r) => r.id === recurrence)?.label
                        : "Ricorrenza"}
                    </span>
                  </div>
                  <ChevronDown
                    size={12}
                    className={`transition-transform duration-300 ${isRecurrenceMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                <AnimatePresence>
                  {isRecurrenceMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full mt-2 left-0 md:left-auto md:right-0 w-44 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-[100] p-1.5"
                    >
                      {recurrences.map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => {
                            setRecurrence(r.id);
                            setIsRecurrenceMenuOpen(false);
                          }}
                          className={`flex items-center gap-3 w-full px-3 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                            recurrence === r.id
                              ? "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600"
                              : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <input
                type="text"
                list="taskly-assignees"
                placeholder="Assegnatario"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-28 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-[10px] font-bold focus:ring-cyan-500 outline-none"
              />
              <datalist id="taskly-assignees">
                <option value="Utente" />
                <option value="Team" />
              </datalist>

              <Button
                onClick={addItem}
                className="h-11 px-8 gap-2 text-xs font-black uppercase tracking-widest shadow-xl shadow-cyan-500/20 whitespace-nowrap"
              >
                <Plus size={16} /> Aggiungi
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rendering Vista Dinamica */}
      <div className="mt-6">
        {view === "list" && (
          <div className="grid gap-3">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item) => {
                const itemPriority =
                  priorities.find((p) => p.id === item.priority) ||
                  priorities[1];
                const itemStatus =
                  statuses.find((s) => s.id === item.status) || statuses[0];

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Card className="border-none group hover:shadow-2xl transition-all duration-300 overflow-visible">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <button
                            onClick={() =>
                              updateTask(item.id, {
                                status:
                                  item.status === "done" ? "todo" : "done",
                              })
                            }
                            className={`mt-1 shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${item.status === "done" ? "bg-cyan-600 border-cyan-600 text-white" : "border-gray-200 dark:border-gray-700 hover:border-cyan-500"}`}
                          >
                            {item.status === "done" && (
                              <CheckSquare size={14} />
                            )}
                          </button>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <p
                                className={`text-base font-bold truncate transition-all ${item.status === "done" ? "line-through text-gray-400" : "text-gray-800 dark:text-gray-100"}`}
                              >
                                {item.title}
                              </p>
                              <span
                                className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${itemPriority.bg} ${itemPriority.color}`}
                              >
                                {item.priority}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-gray-400">
                              <div className="relative">
                                <button
                                  onClick={() =>
                                    setStatusMenuOpen((prev) => ({
                                      ...prev,
                                      [item.id]: !prev[item.id],
                                    }))
                                  }
                                  className={`flex items-center gap-2 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${itemStatus.bg} ${itemStatus.color}`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${itemStatus.color.replace("text-", "bg-")}`}
                                  />
                                  <span>{itemStatus.label}</span>
                                </button>

                                <AnimatePresence>
                                  {statusMenuOpen[item.id] && (
                                    <motion.div
                                      initial={{
                                        opacity: 0,
                                        y: 6,
                                        scale: 0.98,
                                      }}
                                      animate={{ opacity: 1, y: 0, scale: 1 }}
                                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                                      className="absolute left-0 mt-2 w-44 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden p-1.5"
                                    >
                                      {statuses.map((s) => (
                                        <button
                                          key={s.id}
                                          onClick={() => {
                                            updateTask(item.id, {
                                              status: s.id,
                                            });
                                            setStatusMenuOpen((prev) => ({
                                              ...prev,
                                              [item.id]: false,
                                            }));
                                          }}
                                          className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors ${item.status === s.id ? `${s.bg} ${s.color}` : "text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50"}`}
                                        >
                                          <span
                                            className={`inline-block w-2 h-2 mr-2 rounded-full ${s.color.replace("text-", "bg-")}`}
                                          />
                                          {s.label}
                                        </button>
                                      ))}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>

                              <div className="flex items-center gap-1.5 group/meta cursor-pointer hover:text-cyan-500 transition-colors">
                                <Clock size={12} />
                                <input
                                  type="date"
                                  value={item.deadline}
                                  onChange={(e) =>
                                    updateTask(item.id, {
                                      deadline: e.target.value,
                                    })
                                  }
                                  className="bg-transparent border-none p-0 text-[10px] font-black uppercase tracking-widest focus:ring-0 w-20"
                                />
                              </div>

                              {/* Collegamenti (Links) */}
                              <div className="flex items-center gap-2">
                                <LinkIcon size={12} />
                                <div className="flex gap-1">
                                  {item.links?.map((linkId) => {
                                    const page = allPages.find(
                                      (p) => p.id === linkId,
                                    );
                                    if (!page) return null;
                                    const PageIcon = resolvePageIcon(page);
                                    return (
                                      <Badge
                                        key={linkId}
                                        variant="default"
                                        className="text-[7px] lowercase py-0.5 px-2 flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 text-gray-500 border border-gray-100 dark:border-gray-700"
                                      >
                                        <PageIcon
                                          size={10}
                                          className="text-cyan-500"
                                        />
                                        {page.label}
                                        <X
                                          size={8}
                                          className="ml-1 cursor-pointer hover:text-red-500 transition-colors"
                                          onClick={() =>
                                            removeLink(item.id, linkId)
                                          }
                                        />
                                      </Badge>
                                    );
                                  })}
                                  <select
                                    className="bg-transparent border-none p-0 text-[8px] font-black uppercase tracking-widest focus:ring-0 w-16 text-cyan-500"
                                    onChange={(e) => {
                                      if (e.target.value)
                                        addLink(item.id, e.target.value);
                                      e.target.value = "";
                                    }}
                                  >
                                    <option value="">+ Collega</option>
                                    {allPages
                                      .filter(
                                        (p) => !item.links?.includes(p.id),
                                      )
                                      .map((p) => (
                                        <option key={p.id} value={p.id}>
                                          {p.label}
                                        </option>
                                      ))}
                                  </select>
                                </div>
                              </div>

                              {/* Custom Columns Properties Render */}
                              {customColumns.map((col) => {
                                const customValue =
                                  item.customProperties?.[col.name] || "";
                                return (
                                  <div
                                    key={col.name}
                                    className="flex items-center gap-2 border-l border-gray-200 dark:border-gray-700 pl-3 group/col"
                                  >
                                    <span className="text-[9px] font-black uppercase tracking-widest text-cyan-500 shrink-0">
                                      {col.name}:
                                    </span>
                                    <input
                                      type="text"
                                      value={customValue}
                                      onChange={(e) => {
                                        const nextProps = {
                                          ...(item.customProperties || {}),
                                          [col.name]: e.target.value,
                                        };
                                        updateTask(item.id, {
                                          customProperties: nextProps,
                                        });
                                      }}
                                      placeholder="..."
                                      className="bg-transparent border-none p-0 text-[10px] font-bold focus:ring-0 w-24 text-gray-700 dark:text-gray-300 outline-none"
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeCustomColumn(col.name)
                                      }
                                      className="opacity-0 group-hover/col:opacity-100 p-0.5 text-gray-400 hover:text-red-500 transition-opacity"
                                      title="Rimuovi colonna"
                                    >
                                      <X size={10} />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>

                          <div className="flex flex-wrap items-center gap-4 mt-3 text-[10px] font-bold text-gray-400">
                            {item.assignee && (
                              <div className="flex items-center gap-1.5">
                                <span className="w-4 h-4 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 text-white flex items-center justify-center">
                                  <span className="text-[6px] font-black uppercase">
                                    {String(item.assignee)
                                      .split(/[\s.]+/)
                                      .filter(Boolean)
                                      .slice(0, 2)
                                      .map((p) => p[0])
                                      .join("")}
                                  </span>
                                </span>
                                {item.assignee}
                              </div>
                            )}
                            <div className="relative">
                              <select
                                value={item.recurrence || ""}
                                onChange={(e) =>
                                  updateTask(item.id, {
                                    recurrence: e.target.value,
                                  })
                                }
                                className="bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-[9px] font-black uppercase tracking-widest focus:ring-0 text-cyan-500 outline-none"
                                title="Ricorrenza"
                              >
                                {recurrences.map((r) => (
                                  <option key={r.id} value={r.id}>
                                    {r.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <button
                              onClick={() =>
                                setCommentsOpen((prev) => ({
                                  ...prev,
                                  [item.id]: !prev[item.id],
                                }))
                              }
                              className="flex items-center gap-1 text-gray-400 hover:text-cyan-500 transition-colors"
                              title="Commenti"
                            >
                              <MessageSquare size={12} />
                              <span>{(item.comments || []).length}</span>
                            </button>
                          </div>

                          <div className="mt-3 space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                                Subtask
                              </span>
                              {(item.subtasks || []).length > 0 && (
                                <span className="text-[9px] font-black text-cyan-500">
                                  {item.subtasks.filter((s) => s.done).length}/
                                  {item.subtasks.length}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-col gap-1.5">
                              {(item.subtasks || []).map((s) => (
                                <div
                                  key={s.id}
                                  className="flex items-center gap-2 group/sub"
                                >
                                  <button
                                    onClick={() =>
                                      toggleSubtask(item.id, s.id)
                                    }
                                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0 ${s.done ? "bg-cyan-600 border-cyan-600 text-white" : "border-gray-300 dark:border-gray-600 hover:border-cyan-500"}`}
                                  >
                                    {s.done && <CheckSquare size={10} />}
                                  </button>
                                  <span
                                    className={`text-xs font-semibold ${s.done ? "line-through text-gray-400" : "text-gray-700 dark:text-gray-200"}`}
                                  >
                                    {s.title}
                                  </span>
                                  <button
                                    onClick={() =>
                                      removeSubtask(item.id, s.id)
                                    }
                                    className="opacity-0 group-hover/sub:opacity-100 text-gray-300 hover:text-red-500 transition-opacity"
                                  >
                                    <X size={10} />
                                  </button>
                                </div>
                              ))}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={subInput[item.id] || ""}
                                onChange={(e) =>
                                  setSubInput((prev) => ({
                                    ...prev,
                                    [item.id]: e.target.value,
                                  }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter")
                                    addSubtask(item.id);
                                }}
                                placeholder="Aggiungi un subtask..."
                                className="bg-transparent border-b border-dashed border-gray-300 dark:border-gray-600 focus:border-cyan-500 pb-0.5 text-xs font-semibold focus:ring-0 w-48 outline-none"
                              />
                              <button
                                onClick={() => addSubtask(item.id)}
                                className="p-1 text-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg transition-colors"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                          </div>

                          {commentsOpen[item.id] && (
                            <div className="mt-3 space-y-2 border-t border-gray-100 dark:border-gray-800 pt-3">
                              <div className="flex items-center gap-2">
                                <MessageSquare size={12} className="text-cyan-500" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                                  Commenti
                                </span>
                              </div>
                              <div className="flex flex-col gap-2 max-h-40 overflow-y-auto custom-scrollbar">
                                {(item.comments || []).map((c) => (
                                  <div
                                    key={c.id}
                                    className="flex items-start gap-2 bg-gray-50 dark:bg-gray-800/60 rounded-xl p-2.5"
                                  >
                                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 text-white flex items-center justify-center shrink-0">
                                      <span className="text-[6px] font-black uppercase">
                                        {String(c.author).charAt(0)}
                                      </span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-black text-gray-600 dark:text-gray-300">
                                          {c.author}
                                        </span>
                                        {c.createdAt && (
                                          <span className="text-[8px] text-gray-400">
                                            {new Date(c.createdAt).toLocaleDateString(
                                              "it-IT",
                                            )}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-xs font-medium text-gray-700 dark:text-gray-200 break-words">
                                        {c.text}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                                {(item.comments || []).length === 0 && (
                                  <p className="text-[10px] text-gray-400 italic">
                                    Nessun commento.
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  value={commentInput[item.id] || ""}
                                  onChange={(e) =>
                                    setCommentInput((prev) => ({
                                      ...prev,
                                      [item.id]: e.target.value,
                                    }))
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter")
                                      addComment(item.id);
                                  }}
                                  placeholder="Scrivi un commento..."
                                  className="flex-1 bg-transparent border-b border-dashed border-gray-300 dark:border-gray-600 focus:border-cyan-500 pb-0.5 text-xs font-semibold focus:ring-0 outline-none"
                                />
                                <button
                                  onClick={() => addComment(item.id)}
                                  className="p-1.5 text-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg transition-colors"
                                >
                                  <Send size={12} />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <button
                              onClick={() => remove(item.id)}
                              className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {view === "kanban" && (
          <KanbanView
            items={filteredItems}
            updateTask={updateTask}
            priorities={priorities}
            statuses={statuses}
            onAddTask={quickAddTask}
          />
        )}

        {view === "timeline" && <TimelineView items={filteredItems} />}
      </div>

      {items.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[3rem]">
          <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-sm">
            Nessun task in elenco
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-2 font-medium">
            Scegli una vista e inizia a popolare il tuo workspace.
          </p>
        </div>
      )}
    </div>
  );
}
