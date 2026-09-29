
import React from "react";

const blocks = [
  {
    title: "Problema",
    items: [
      "Task sparsi tra app diverse",
      "Note non collegate ai progetti",
      "Troppo tempo perso nel passaggio di contesto",
    ],
    tone: "from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/10 border-red-200/60 dark:border-red-800/40",
  },
  {
    title: "Soluzione con Taskly",
    items: [
      "Un solo hub per task, note e obiettivi",
      "Dashboard chiara con pagine annidate e AI",
      "Flusso operativo continuo: idea to task to completamento",
    ],
    tone: "from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/10 border-emerald-200/60 dark:border-emerald-800/40",
  },
];

export default function ProblemSolution() {
  return (
    <section className="px-6 py-20 bg-[#fcfaff] dark:bg-gray-950">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-purple-600 dark:text-purple-400">
            Problem to solution
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
            Meno caos operativo, piu execution
          </h2>
        </div>

        <div className="mt-10 grid md:grid-cols-2 gap-5">
          {blocks.map((block) => (
            <div
              key={block.title}
              className={`rounded-2xl border p-6 bg-linear-to-br ${block.tone}`}
            >
              <h3 className="text-xl font-black text-gray-900 dark:text-white">{block.title}</h3>
              <ul className="mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                {block.items.map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


