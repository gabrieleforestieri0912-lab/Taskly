import React from "react";
import Link from "next/link";
import { XCircle, CheckCircle, Clock, Target, Sparkles } from "lucide-react";

const blocks = [
  {
    title: "Problema",
    items: [
      "Task sparsi tra app diverse",
      "Note non collegate ai progetti",
      "Troppo tempo perso nel passaggio di contesto",
    ],
    tone: "from-rose-50 to-red-50 dark:from-rose-900/20 dark:to-red-900/10 border-rose-200/60 dark:border-rose-800/40",
    icon: XCircle,
  },
  {
    title: "Soluzione con Taskly",
    items: [
      "Un solo hub per task, note e obiettivi",
      "Dashboard chiara con pagine annidate e AI",
      "Flusso operativo continuo: idea to task to completamento",
    ],
    tone: "from-[#7b39fc]/5 to-purple-50 dark:from-[#7b39fc]/10 dark:to-purple-900/10 border-[#7b39fc]/20 dark:border-[#a484d7]/30",
    icon: CheckCircle,
  },
];

const metrics = [
  { value: "5h", label: "risparmiate a settimana" },
  { value: "2x", label: "pi\u00f9 chiarezza priorit\u00e0" },
  { value: "30s", label: "per partire con un template" },
];

export default function ProblemSolution() {
  return (
    <section className="px-6 py-20 bg-white dark:bg-[#151020]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <div className="landing-eyebrow">
            <Sparkles size={12} />
            Problem to solution
          </div>
          <h2 className="landing-heading-lg mt-3">
            Da giornata caotica{" "}
            <span className="landing-display-accent">a workflow ordinato</span>
          </h2>
          <p className="landing-body mt-3 text-sm max-w-2xl mx-auto">
            Meno caos operativo, pi&ugrave; execution. Taskly unisce tutto in un unico spazio.
          </p>
        </div>

        <div className="mt-10 grid md:grid-cols-2 gap-5">
          {blocks.map((block) => {
            const Icon = block.icon;
            return (
              <div
                key={block.title}
                className={`rounded-2xl border p-6 bg-linear-to-br ${block.tone}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Icon size={20} className={block.title === "Problema" ? "text-rose-500" : "text-[#7b39fc] dark:text-[#a67cff]"} />
                  <h3 className="text-xl font-black text-gray-900 dark:text-white">{block.title}</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  {block.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-0.5 shrink-0">-</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-4">
          {metrics.map((m) => (
            <div key={m.value} className="landing-stat-card text-center">
              <p className="text-2xl font-black bg-clip-text text-transparent bg-linear-to-r from-[#7b39fc] to-[#a67cff]">{m.value}</p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 font-medium">{m.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/register" className="landing-btn-primary">
            Inizia ora e misura i risultati
          </Link>
        </div>
      </div>
    </section>
  );
}
