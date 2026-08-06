"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  ListTodo,
  Target,
  Calendar,
  FileText,
  X,
  Lightbulb,
  Sparkles,
  Briefcase,
  GraduationCap,
  Activity,
  Map,
  Users,
  Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./UIComponents";

const PAGE_TYPES = [
  {
    id: "tasks",
    type: "tasks",
    label: "Task Manager",
    icon: ListTodo,
    iconName: "list-todo",
    color: "text-cyan-500",
    bg: "bg-cyan-50 dark:bg-cyan-900/20",
    desc: "Gestione avanzata attività",
  },
  {
    id: "goals",
    type: "goals",
    label: "Goal Tracker",
    icon: Target,
    iconName: "target",
    color: "text-pink-500",
    bg: "bg-pink-50 dark:bg-pink-900/20",
    desc: "Tracciamento obiettivi",
  },
  {
    id: "calendar",
    type: "calendar",
    label: "Planner",
    icon: Calendar,
    iconName: "calendar",
    color: "text-orange-500",
    bg: "bg-orange-50 dark:bg-orange-900/20",
    desc: "Pianificazione temporale",
  },
  {
    id: "notes",
    type: "notes",
    label: "Smart Notes",
    icon: FileText,
    iconName: "file-text",
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    desc: "Note strutturate con sezioni pronte",
    initialData: null,
  },
  {
    id: "braindump",
    type: "braindump",
    label: "Brain Dump",
    icon: Lightbulb,
    iconName: "lightbulb",
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    desc: "Cattura rapida idee",
  },
  {
    id: "empty",
    type: "empty",
    label: "Pagina Vuota",
    icon: FileText,
    iconName: "file-text",
    color: "text-gray-500",
    bg: "bg-gray-100 dark:bg-gray-800/40",
    desc: "Pagina libera da compilare e personalizzare",
    initialData: null,
  },
];

const TEMPLATES = [
  {
    id: "project_mgmt",
    label: "Gestione Progetto",
    type: "tasks",
    purpose: "project_management",
    iconName: "briefcase-business",
    icon: Briefcase,
    color: "text-indigo-500",
    bg: "bg-indigo-50 dark:bg-indigo-900/20",
    initialData: [
      {
        id: "pm-1",
        title: "Definizione Requisiti",
        priority: "Alta",
        status: "done",
        deadline: "",
        assignee: "Admin",
      },
      {
        id: "pm-2",
        title: "Design UI/UX",
        priority: "Alta",
        status: "doing",
        deadline: "",
        assignee: "Designer",
      },
      {
        id: "pm-3",
        title: "Sviluppo MVP",
        priority: "Alta",
        status: "todo",
        deadline: "",
        assignee: "Dev Team",
      },
      {
        id: "pm-4",
        title: "Testing & QA",
        priority: "Media",
        status: "todo",
        deadline: "",
        assignee: "QA",
      },
    ],
  },
  {
    id: "study_plan",
    label: "Piano Studio",
    type: "goals",
    purpose: "study_plan",
    iconName: "book-open",
    icon: GraduationCap,
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    initialData: [
      {
        id: "sp-1",
        title: "Sessione Esami Invernale",
        level: 0,
        completed: false,
        subGoals: [
          {
            id: "sp-1-1",
            title: "Analisi Matematica",
            level: 1,
            completed: false,
            subGoals: [],
          },
          {
            id: "sp-1-2",
            title: "Programmazione I",
            level: 1,
            completed: false,
            subGoals: [],
          },
        ],
      },
    ],
  },
  {
    id: "habit_tracker",
    label: "Tracker Abitudini",
    type: "tasks",
    purpose: "habit_tracking",
    iconName: "clipboard-list",
    icon: Activity,
    color: "text-rose-500",
    bg: "bg-rose-50 dark:bg-rose-900/20",
    initialData: [
      {
        id: "ht-1",
        title: "Bere 2L d'acqua",
        priority: "Media",
        status: "todo",
      },
      {
        id: "ht-2",
        title: "Meditazione 10 min",
        priority: "Bassa",
        status: "todo",
      },
      { id: "ht-3", title: "Allenamento", priority: "Alta", status: "todo" },
    ],
  },
  {
    id: "roadmap",
    label: "Roadmap Prodotto",
    type: "goals",
    purpose: "roadmap",
    iconName: "rocket",
    icon: Map,
    color: "text-cyan-500",
    bg: "bg-cyan-50 dark:bg-cyan-900/20",
    initialData: [
      {
        id: "rd-1",
        title: "Q1: Fondamenta",
        level: 0,
        completed: false,
        subGoals: [],
      },
      {
        id: "rd-2",
        title: "Q2: Lancio Beta",
        level: 0,
        completed: false,
        subGoals: [],
      },
    ],
  },
  {
    id: "meeting_notes",
    label: "Meeting Notes",
    type: "notes",
    purpose: "meeting_notes",
    iconName: "users",
    icon: Users,
    color: "text-violet-500",
    bg: "bg-violet-50 dark:bg-violet-900/20",
    initialData: {
      text: "# Verbale Incontro\n\n**Data:** \n**Partecipanti:** \n\n## Agenda\n- \n\n## Discussione\n- \n\n## Azioni\n- [ ] Task 1",
      tags: ["meeting", "work"],
    },
  },
  {
    id: "weekly_plan",
    label: "Weekly Planning",
    type: "calendar",
    purpose: "weekly_plan",
    iconName: "layers",
    icon: Layers,
    color: "text-sky-500",
    bg: "bg-sky-50 dark:bg-sky-900/20",
    initialData: { tasks: [], dailyMeta: {} },
  },
];

export default function AddPageModal({ isOpen, onClose, onAdd }) {
  const [activeTab, setActiveTab] = useState("types");

  // Blocca lo scroll della pagina quando il modale è aperto
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleAdd = (payload) => {
    onAdd(payload);
  };

  if (!isOpen) return null;

  const modal = (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-gray-950/60 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-white/20 dark:border-gray-800 overflow-hidden"
      >
        <div className="px-5 pt-5 pb-3 flex items-center justify-between bg-white dark:bg-gray-900">
          <div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">
              Nuova Pagina
            </h3>
            <div className="flex gap-4 mt-2">
              <button
                onClick={() => setActiveTab("types")}
                className={`text-[10px] font-black uppercase tracking-[0.15em] transition-all ${activeTab === "types" ? "text-cyan-600 border-b-2 border-cyan-600 pb-0.5" : "text-gray-400 hover:text-gray-600"}`}
              >
                Blocchi Base
              </button>
              <button
                onClick={() => setActiveTab("templates")}
                className={`text-[10px] font-black uppercase tracking-[0.15em] transition-all ${activeTab === "templates" ? "text-cyan-600 border-b-2 border-cyan-600 pb-0.5" : "text-gray-400 hover:text-gray-600"}`}
              >
                Template Pronti
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all text-gray-400"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-3 max-h-[50vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <AnimatePresence mode="wait">
              {activeTab === "types" ? (
                <motion.div
                  key="types"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-3"
                >
                  {PAGE_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => handleAdd({ ...type, isTemplate: false })}
                      className="group flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-cyan-500/50 hover:bg-cyan-50/30 dark:hover:bg-cyan-900/10 transition-all text-left"
                    >
                      <div
                        className={`w-10 h-10 rounded-xl ${type.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}
                      >
                        <type.icon className={type.color} size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-gray-900 dark:text-white leading-tight">
                          {type.label}
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                          {type.desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="templates"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-3"
                >
                  {TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => handleAdd({ ...tpl, isTemplate: true })}
                      className="group flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-cyan-500/50 hover:bg-cyan-50/30 dark:hover:bg-cyan-900/10 transition-all text-left"
                    >
                      <div
                        className={`w-9 h-9 rounded-lg ${tpl.bg} flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform`}
                      >
                        <tpl.icon className={tpl.color} size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-gray-900 dark:text-white">
                          {tpl.label}
                        </p>
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 group-hover:text-cyan-500 transition-colors">
                          Usa template
                        </span>
                      </div>
                      <Sparkles
                        size={14}
                        className="text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="px-5 py-3 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="font-bold text-[10px] uppercase tracking-[0.15em] px-5 py-2 rounded-lg"
          >
            Annulla
          </Button>
        </div>
      </motion.div>
    </div>
  );

  if (typeof document !== "undefined") {
    return createPortal(modal, document.body);
  }

  return modal;
}
