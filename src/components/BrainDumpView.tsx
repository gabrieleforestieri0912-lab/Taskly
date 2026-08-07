"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  Button,
  Badge,
  EditableTitle,
  Skeleton,
} from "./UIComponents";
import {
  Plus,
  Trash2,
  Lightbulb,
  Tag,
  ArrowRight,
  MoreVertical,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  Hash,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const categories = [
  {
    id: "Generale",
    label: "Generale",
    color: "text-gray-500",
    bg: "bg-gray-100 dark:bg-gray-800",
  },
  {
    id: "Lavoro",
    label: "Lavoro",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    id: "Personale",
    label: "Personale",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
  {
    id: "Creatività",
    label: "Creatività",
    color: "text-pink-500",
    bg: "bg-pink-500/10",
  },
  {
    id: "Studio",
    label: "Studio",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
];

export default function BrainDumpView({
  title,
  data = [] as any[],
  setData,
  onRename,
  allPages = [] as any[],
  onConvertToTask,
  loading = false,
}) {
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 pb-20">
        <div className="flex items-center gap-2 px-1">
          <Hash size={12} className="text-gray-400" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }
  const [input, setInput] = useState("");
  const [category, setCategory] = useState("Personale");

  const addIdea = () => {
    if (!input.trim()) return;
    const newIdea = {
      id: Math.random().toString(36).substring(2, 9),
      title: input,
      category: category,
      createdAt: new Date().toISOString(),
    };
    setData([newIdea, ...data]);
    setInput("");
  };

  const removeIdea = (id) => {
    setData(data.filter((i) => i.id !== id));
  };

  const handleConvert = (idea, targetPageId) => {
    if (onConvertToTask) {
      onConvertToTask(idea, targetPageId);
      removeIdea(idea.id);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex justify-end">
        <Badge variant="default" className="py-1 px-3">
          {data.length} Idee
        </Badge>
      </div>

      <Card className="border-none bg-white dark:bg-gray-800/40 shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden">
        <CardContent className="p-3 flex flex-col gap-3">
          <div className="flex flex-col md:flex-row gap-3 items-center">
            <div className="flex-1 w-full flex items-center gap-2 bg-gray-50/50 dark:bg-gray-900/50 p-2 rounded-2xl border border-gray-100 dark:border-gray-800">
              <Lightbulb size={18} className="text-gray-400 ml-2" />
              <input
                type="text"
                placeholder="Qual è la tua prossima grande idea?"
                className="flex-1 text-sm font-bold bg-transparent border-none focus:outline-none focus:ring-0 placeholder-gray-400 dark:placeholder-gray-600"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addIdea()}
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                onClick={addIdea}
                className="h-10 px-6 gap-2 text-[10px] font-black uppercase tracking-widest bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200"
              >
                <Plus size={16} /> Cattura Idea
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 px-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest ${
                  category === cat.id
                    ? `${cat.bg} ${cat.color} border-current`
                    : "border-transparent text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                }`}
              >
                <Tag size={12} />
                {cat.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {data.map((idea) => {
            const catInfo =
              categories.find((c) => c.id === idea.category) || categories[0];
            return (
              <motion.div
                key={idea.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Card className="h-full border-none group hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 flex flex-col">
                  <CardContent className="p-6 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${catInfo.bg} ${catInfo.color}`}
                      >
                        {catInfo.label}
                      </span>
                      <button
                        onClick={() => removeIdea(idea.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100 leading-relaxed flex-1">
                      {idea.title}
                    </p>

                    <div className="mt-6 pt-4 border-t border-gray-50 dark:border-gray-800 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                          {new Date(idea.createdAt).toLocaleDateString(
                            "it-IT",
                            { day: "numeric", month: "short" },
                          )}
                        </span>
                        <div className="p-1 bg-cyan-50 dark:bg-cyan-900/30 rounded-lg">
                          <Sparkles size={12} className="text-cyan-500" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">
                          Converti in Task
                        </p>
                        <select
                          className="w-full text-[9px] font-black uppercase tracking-widest bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 p-2.5 rounded-xl focus:ring-2 focus:ring-cyan-500 transition-all text-gray-600 dark:text-gray-300"
                          onChange={(e) => {
                            if (e.target.value)
                              handleConvert(idea, e.target.value);
                          }}
                          value=""
                        >
                          <option value="" disabled>
                            Scegli destinazione...
                          </option>
                          {allPages
                            .filter((p) => p.type === "tasks")
                            .map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.label}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {data.length === 0 && (
        <div className="text-center py-20 bg-gray-50/50 dark:bg-gray-900/20 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
          <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-cyan-500/5">
            <Sparkles className="text-cyan-400" size={32} />
          </div>
          <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-sm">
            Libera la tua mente
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">
            Le migliori idee iniziano da qui.
          </p>
        </div>
      )}
    </div>
  );
}
