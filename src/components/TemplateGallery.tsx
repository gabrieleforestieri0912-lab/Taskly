"use client";
import React from "react";
import { Layout, Copy, Sparkles, Plus } from "lucide-react";
import { Badge } from "./UIComponents";

const TEMPLATES = [
  {
    id: "meeting-notes",
    title: "Meeting Notes",
    tag: "Business",
    color: "gray",
    content: `# Appunti riunione\n\n- Partecipanti:\n- Data:\n\n## Azioni\n- [ ] `,
  },
  {
    id: "project-plan",
    title: "Project Plan",
    tag: "Planning",
    color: "gray",
    content: `# Piano di progetto\n\n## Obiettivi\n- \n\n## Timeline\n- `,
  },
  {
    id: "personal-journal",
    title: "Daily Journal",
    tag: "Personal",
    color: "gray",
    content: `# Diario\n\nOggi ho...\n`,
  },
  {
    id: "habit-tracker",
    title: "Habit Tracker",
    tag: "Wellness",
    color: "green",
    content: `Habit Tracker (interactive component)\n\nQuesto template aggiunge una griglia mensile di card, una per ogni giorno del mese selezionato. Clicca su una card per aprire il popup di modifica e aggiungere o segnare le abitudini.\n\nNota: è disponibile il componente React 'HabitTracker' in src/components/HabitTracker.jsx.`,
  },
];

export default function TemplateGallery({ onUse }: { onUse?: (t: any) => void }) {
  const handleUse = (t) => {
    navigator.clipboard?.writeText(t.content);
    if (onUse) onUse(t);
  };

  return (
    <div className="flex flex-col h-full min-h-80">
      <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-widest text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Layout size={16} className="text-gray-400" />
          Template
        </h3>
        <Badge
          variant="default"
          className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-none"
        >
          {TEMPLATES.length} disponibili
        </Badge>
      </div>

      <div className="flex-1 p-5 overflow-y-auto custom-scrollbar space-y-4">
        {TEMPLATES.map((t) => (
          <div
            key={t.id}
            className="group p-4 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-2xl hover:border-gray-400/30 transition-all cursor-pointer relative overflow-hidden"
            onClick={() => handleUse(t)}
          >
            <div
              className={`absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity`}
            >
              <Sparkles size={14} className="text-gray-400" />
            </div>

            <div className="flex flex-col gap-2">
              <span
                className={`text-[8px] font-black uppercase tracking-[0.2em] text-gray-500 opacity-60`}
              >
                {t.tag}
              </span>
              <div className="font-bold text-sm text-gray-800 dark:text-gray-100">
                {t.title}
              </div>
              <div className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed">
                {t.content.substring(0, 60)}...
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-400">
                <Plus size={12} />
                Usa Template
              </div>
              <div className="w-7 h-7 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                <Copy size={12} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-gray-50/50 dark:bg-gray-950/50 border-t border-gray-100 dark:border-gray-800">
        <p className="text-[9px] font-bold text-center text-gray-400 uppercase tracking-widest leading-relaxed">
          Scegli un template per iniziare
          <br />
          velocemente il tuo lavoro.
        </p>
      </div>
    </div>
  );
}
