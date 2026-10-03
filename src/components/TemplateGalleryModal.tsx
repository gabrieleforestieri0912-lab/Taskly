"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  X,
  Sparkles,
  Calendar,
  FileText,
  Target,
  Rocket,
  BookOpen,
  ArrowRight,
  Search,
  Check,
  CheckSquare,
  List,
  ChevronLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageTemplate, loadAllTemplates } from "../lib/templates";

interface TemplateGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: PageTemplate) => void;
}

const CATEGORIES = [
  "Tutti",
  "Pianificazione",
  "Lavoro",
  "Personale",
  "Studio",
  "Progetti",
] as const;

export default function TemplateGalleryModal({
  isOpen,
  onClose,
  onSelectTemplate,
}: TemplateGalleryModalProps) {
  const [templates, setTemplates] = useState<PageTemplate[]>(() => loadAllTemplates());
  const [selectedCategory, setSelectedCategory] = useState<string>("Tutti");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewingTemplate, setPreviewingTemplate] = useState<PageTemplate | null>(null);

  useEffect(() => {
    if (isOpen) {
      try {
        // Ricarica anche i template personalizzati salvati con "Salva come template"
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTemplates(loadAllTemplates());
      } catch {}
    }
  }, [isOpen]);

  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      if (selectedCategory !== "Tutti" && t.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [templates, selectedCategory, searchQuery]);

  if (!isOpen) return null;

  const renderIcon = (iconName: string, className = "w-5 h-5") => {
    switch (iconName) {
      case "calendar":
        return <Calendar className={className} />;
      case "file-text":
        return <FileText className={className} />;
      case "target":
        return <Target className={className} />;
      case "rocket":
        return <Rocket className={className} />;
      case "book-open":
        return <BookOpen className={className} />;
      default:
        return <Sparkles className={className} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="relative w-full max-w-4xl max-h-[85vh] bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-2xl flex flex-col overflow-hidden z-10"
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#7b39fc]/10 text-[#7b39fc] flex items-center justify-center shrink-0">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-base font-black text-gray-900 dark:text-white">
                {previewingTemplate ? "Anteprima Template" : "Galleria Template"}
              </h2>
              <p className="text-xs text-gray-400">
                {previewingTemplate
                  ? previewingTemplate.title
                  : "Scegli un modello pronto per iniziare a organizzare le tue idee"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {previewingTemplate && (
              <button
                onClick={() => setPreviewingTemplate(null)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition-colors"
              >
                <ChevronLeft size={14} />
                Indietro
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Chiudi (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {previewingTemplate ? (
          // ── Preview View ──────────────────────────────────────────────
          <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-between">
            <div className="max-w-2xl mx-auto w-full space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
                <div
                  className={`w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center ${previewingTemplate.iconColor}`}
                >
                  {renderIcon(previewingTemplate.icon, "w-6 h-6")}
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-500">
                    {previewingTemplate.category}
                  </span>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mt-1">
                    {previewingTemplate.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {previewingTemplate.description}
                  </p>
                </div>
              </div>

              {/* Sample Content Preview Box */}
              <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 space-y-3">
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Contenuto del template:
                </div>
                {previewingTemplate.type === "notes" &&
                previewingTemplate.data?.blocks ? (
                  <div className="space-y-2">
                    {previewingTemplate.data.blocks.map((b: any) => (
                      <div key={b.id} className="text-xs text-gray-700 dark:text-gray-200">
                        {b.type === "h1" && (
                          <div className="text-base font-bold text-gray-900 dark:text-white pt-1">
                            {b.content}
                          </div>
                        )}
                        {b.type === "h2" && (
                          <div className="text-sm font-bold text-gray-800 dark:text-gray-100 pt-1">
                            {b.content}
                          </div>
                        )}
                        {b.type === "h3" && (
                          <div className="text-xs font-bold text-gray-600 dark:text-gray-300">
                            {b.content}
                          </div>
                        )}
                        {b.type === "checkbox" && (
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 pl-1">
                            <span className="w-3.5 h-3.5 rounded border border-gray-300 flex items-center justify-center">
                              {b.checked && <Check size={10} />}
                            </span>
                            <span>{b.content}</span>
                          </div>
                        )}
                        {b.type === "bullet" && (
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 pl-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                            <span>{b.content}</span>
                          </div>
                        )}
                        {b.type === "numbered" && (
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 pl-2">
                            <span>• {b.content}</span>
                          </div>
                        )}
                        {b.type === "text" && (
                          <div className="text-gray-500">{b.content}</div>
                        )}
                        {b.type === "divider" && (
                          <div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : Array.isArray(previewingTemplate.data) ? (
                  <div className="space-y-2">
                    {previewingTemplate.data.map((t: any) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-xs"
                      >
                        <span className="font-semibold text-gray-800 dark:text-gray-100">
                          {t.title}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 font-bold uppercase">
                          {t.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-400">Contenuto pronto per l'uso.</div>
                )}
              </div>
            </div>

            {/* Bottom action bar */}
            <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setPreviewingTemplate(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={() => {
                  onSelectTemplate(previewingTemplate);
                  onClose();
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7b39fc] text-white text-xs font-bold hover:brightness-110 shadow-md shadow-[#7b39fc]/20 transition-all"
              >
                <span>Usa questo template</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ) : (
          // ── Gallery Grid View ──────────────────────────────────────────
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Search & Categories Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Category pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      selectedCategory === cat
                        ? "bg-[#7b39fc] text-white shadow-sm"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Cerca tra i template..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7b39fc]/40"
                />
              </div>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="group flex flex-col justify-between p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-[#7b39fc]/40 hover:shadow-lg hover:shadow-[#7b39fc]/5 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div
                        className={`w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center ${template.iconColor} group-hover:scale-105 transition-transform`}
                      >
                        {renderIcon(template.icon)}
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500">
                        {template.category}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-[#7b39fc] transition-colors">
                        {template.title}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                        {template.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 mt-2 border-t border-gray-50 dark:border-gray-800/80">
                    <button
                      onClick={() => setPreviewingTemplate(template)}
                      className="flex-1 py-1.5 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 transition-colors"
                    >
                      Anteprima
                    </button>
                    <button
                      onClick={() => {
                        onSelectTemplate(template);
                        onClose();
                      }}
                      className="flex-1 py-1.5 rounded-xl text-xs font-bold text-white bg-[#7b39fc] hover:brightness-110 shadow-sm transition-all"
                    >
                      Usa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
