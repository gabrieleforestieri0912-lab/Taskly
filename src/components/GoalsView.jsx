/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  Button,
  Badge,
  EditableTitle,
  Progress,
  Skeleton,
} from "./UIComponents";
import {
  Plus,
  Trash2,
  ChevronDown,
  Target,
  Calendar,
  Flag,
  Layers,
  Layout,
  Hash,
  CheckCircle2,
  X,
  Clock,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const GoalRow = ({
  item,
  level = 0,
  onDelete,
  onAddSub,
  onComplete,
  onUpdate,
}) => {
  const [isOpen, setIsOpen] = useState(level < 1);
  const [isAddingSub, setIsAddingSub] = useState(false);
  const [subInput, setSubInput] = useState("");
  const hasChildren = item.subGoals && item.subGoals.length > 0;

  const levelStyles = [
    "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-sm",
    "bg-gray-50/50 dark:bg-gray-900/20 border-transparent",
    "bg-transparent border-transparent",
    "bg-transparent border-transparent",
  ];

  const levelLabels = ["Annuale", "Trimestre", "Mese", "Settimana"];
  const levelIcons = [Target, Layout, Calendar, Flag];
  const Icon = levelIcons[level] || Flag;

  const handleAddSub = () => {
    if (!subInput.trim()) return;
    onAddSub(item.id, level + 1, subInput);
    setSubInput("");
    setIsAddingSub(false);
    setIsOpen(true);
  };

  // Calcolo progresso basato sui sotto-obiettivi o sullo stato completato
  const calculateProgress = () => {
    if (item.completed) return 100;
    if (!hasChildren) return 0;
    const completed = item.subGoals.filter((sg) => sg.completed).length;
    return Math.round((completed / item.subGoals.length) * 100);
  };

  const progress = calculateProgress();

  return (
    <div className="flex flex-col w-full">
      <div
        className={`group flex flex-col p-4 rounded-2xl border transition-all ${levelStyles[level] || ""} ${item.completed ? "opacity-60" : ""}`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => onComplete(item.id)}
            className={`shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${item.completed ? "bg-gray-600 border-gray-600 text-white" : "border-gray-200 dark:border-gray-700 hover:border-gray-400"}`}
          >
            {item.completed && <CheckCircle2 size={14} />}
          </button>

          <div
            className="flex-1 flex items-center gap-2 cursor-pointer min-w-0"
            onClick={() => hasChildren && setIsOpen(!isOpen)}
          >
            {hasChildren ? (
              <div
                className={`transition-transform duration-200 ${isOpen ? "rotate-0" : "-rotate-90"}`}
              >
                <ChevronDown size={14} className="text-gray-400" />
              </div>
            ) : (
              <div className="w-3.5" />
            )}

            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`p-2 rounded-xl shrink-0 ${item.completed ? "bg-gray-100 dark:bg-gray-800 text-gray-400" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"}`}
              >
                <Icon size={16} />
              </div>
              <div className="flex flex-col min-w-0">
                <span
                  className={`text-[9px] font-black uppercase tracking-[0.15em] text-gray-400 leading-none mb-1`}
                >
                  {levelLabels[level]}
                </span>
                <p
                  className={`text-sm font-bold truncate ${item.completed ? "line-through text-gray-400" : "text-gray-800 dark:text-gray-100"}`}
                >
                  {item.title}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {level === 0 && (
              <div className="hidden md:flex flex-col items-end gap-1 mr-2">
                <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-700 dark:text-gray-200 uppercase tracking-widest">
                  <TrendingUp size={12} />
                  {progress}%
                </div>
                <Progress value={progress} className="w-24 h-1.5" />
              </div>
            )}

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-2xl px-3 py-2 border border-gray-100 dark:border-gray-800 shadow-sm">
                <Calendar size={14} className="text-gray-400" />
                <input
                  type="date"
                  value={item.deadline || ""}
                  onChange={(e) =>
                    onUpdate(item.id, { deadline: e.target.value })
                  }
                  className="bg-transparent border-none p-0 text-[11px] font-bold focus:ring-0 w-32 text-gray-700 dark:text-gray-200 outline-none"
                />
              </div>

              {level < 3 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAddingSub(!isAddingSub);
                  }}
                  className="h-8 w-8"
                >
                  <Plus size={16} className={isAddingSub ? "rotate-45" : ""} />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
                className="h-8 w-8 text-red-400 hover:text-red-500"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        </div>

        {/* Inline Sub-goal Input */}
        <AnimatePresence>
          {isAddingSub && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="ml-12 mt-3 p-1.5 bg-gray-50/50 dark:bg-gray-900/10 rounded-xl flex items-center gap-2 border border-gray-100 dark:border-gray-800 shadow-inner"
            >
              <div className="p-1.5 text-gray-500">
                {levelIcons[level + 1] &&
                  React.createElement(levelIcons[level + 1], { size: 14 })}
              </div>
              <input
                autoFocus
                type="text"
                placeholder={`Definisci ${levelLabels[level + 1]}...`}
                value={subInput}
                onChange={(e) => setSubInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddSub()}
                className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-xs font-bold dark:text-white"
              />
              <button
                onClick={handleAddSub}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Plus size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="popLayout">
        {isOpen && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden ml-8 border-l-2 border-gray-100 dark:border-gray-800 pl-6 mt-2 flex flex-col gap-2"
          >
            {item.subGoals.map((sub) => (
              <GoalRow
                key={sub.id}
                item={sub}
                level={level + 1}
                onDelete={onDelete}
                onAddSub={onAddSub}
                onComplete={onComplete}
                onUpdate={onUpdate}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function GoalsView({
  title,
  data = [],
  setData,
  onRename,
  loading = false,
}) {
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 pb-20">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }
  const [input, setInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const addAnnualGoal = () => {
    if (!input.trim()) return;
    const newGoal = {
      id: Math.random().toString(36).substring(2, 9),
      title: input,
      category: selectedCategory || "generale",
      completed: false,
      deadline: "",
      level: 0,
      subGoals: [],
      createdAt: new Date().toISOString(),
    };
    setData([newGoal, ...data]);
    setInput("");
  };

  const addSubGoal = (parentId, level, title) => {
    const findAndAdd = (list) => {
      return list.map((goal) => {
        if (goal.id === parentId) {
          return {
            ...goal,
            subGoals: [
              ...(goal.subGoals || []),
              {
                id: Math.random().toString(36).substring(2, 9),
                title,
                category: goal.category,
                completed: false,
                deadline: "",
                level,
                subGoals: [],
                createdAt: new Date().toISOString(),
              },
            ],
          };
        }
        if (goal.subGoals) {
          return { ...goal, subGoals: findAndAdd(goal.subGoals) };
        }
        return goal;
      });
    };
    setData(findAndAdd(data));
  };

  const updateGoal = (id, updates) => {
    const findAndUpdate = (list) => {
      return list.map((goal) => {
        if (goal.id === id) {
          return { ...goal, ...updates };
        }
        if (goal.subGoals) {
          return { ...goal, subGoals: findAndUpdate(goal.subGoals) };
        }
        return goal;
      });
    };
    setData(findAndUpdate(data));
  };

  const deleteGoal = (id) => {
    const findAndDelete = (list) => {
      return list
        .filter((goal) => goal.id !== id)
        .map((goal) => ({
          ...goal,
          subGoals: goal.subGoals ? findAndDelete(goal.subGoals) : [],
        }));
    };
    setData(findAndDelete(data));
  };

  const completeGoal = (id) => {
    const findAndToggle = (list) => {
      return list.map((goal) => {
        if (goal.id === id) {
          return { ...goal, completed: !goal.completed };
        }
        if (goal.subGoals) {
          return { ...goal, subGoals: findAndToggle(goal.subGoals) };
        }
        return goal;
      });
    };
    setData(findAndToggle(data));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex justify-end">
        <Badge variant="default" className="py-1 px-3">
          Visione Annuale
        </Badge>
      </div>

      <Card className="border-none bg-white dark:bg-gray-800/40 shadow-xl shadow-gray-200/50 dark:shadow-none overflow-visible">
        <CardContent className="p-3 flex flex-col gap-3">
          <div className="flex flex-col md:flex-row gap-3 items-center">
            <div className="flex-1 w-full flex items-center gap-2 bg-gray-50/50 dark:bg-gray-900/50 p-2 rounded-2xl border border-gray-100 dark:border-gray-800">
              <Target size={18} className="text-gray-400 ml-2" />
              <input
                type="text"
                placeholder="Qual è il tuo grande obiettivo annuale?"
                className="flex-1 text-sm font-bold bg-transparent border-none focus:outline-none focus:ring-0 placeholder-gray-400 dark:placeholder-gray-600"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addAnnualGoal()}
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                onClick={addAnnualGoal}
                className="h-10 px-6 gap-2 text-[10px] font-black uppercase tracking-widest bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200"
              >
                <Plus size={16} /> Crea Visione
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 px-1">
            <Hash size={12} className="text-gray-400" />
            <input
              type="text"
              placeholder="Tag (es: Carriera, Salute)..."
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-[10px] font-bold bg-transparent border-none focus:outline-none focus:ring-0 p-0 placeholder-gray-400 w-full"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        {data.length === 0 ? (
          <div className="text-center py-20 bg-gray-50/50 dark:bg-gray-900/20 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
            <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-sm">
              Nessun obiettivo strategico
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-2 font-medium">
              Scomponi i tuoi sogni in azioni concrete.
            </p>
          </div>
        ) : (
          data.map((goal) => (
            <GoalRow
              key={goal.id}
              item={goal}
              onDelete={deleteGoal}
              onAddSub={addSubGoal}
              onComplete={completeGoal}
              onUpdate={updateGoal}
            />
          ))
        )}
      </div>
    </div>
  );
}
