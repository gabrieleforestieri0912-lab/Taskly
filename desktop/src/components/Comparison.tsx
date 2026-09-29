
import React from "react";
import Link from "next/link";

const rows = [
  { label: "Curva di apprendimento", taskly: "Rapida", other: "Spesso lunga" },
  { label: "Setup iniziale", taskly: "Pronto in pochi minuti", other: "Richiede configurazione" },
  { label: "Organizzazione quotidiana", taskly: "Lineare e focalizzata", other: "Puo diventare dispersiva" },
  { label: "Esperienza visiva", taskly: "Pulita e minimal", other: "Dipende dal setup" },
];

export default function Comparison() {
  return (
    <section className="px-6 py-20 bg-white dark:bg-gray-900">
      <div className="max-w-5xl mx-auto">
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-purple-600 dark:text-purple-400">Perche scegliere Taskly</p>
          <h2 className="mt-3 text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
            Piu semplice di Notion, piu flessibile di Trello, meno caotico di ClickUp
          </h2>
        </div>

        <div className="mt-9 rounded-2xl border border-gray-200/70 dark:border-gray-700/60 overflow-hidden">
          <div className="grid grid-cols-3 bg-gray-50 dark:bg-gray-800/70 text-xs font-black uppercase tracking-[0.12em] text-gray-500 dark:text-gray-300">
            <div className="p-4">Criterio</div>
            <div className="p-4 text-purple-600 dark:text-purple-400">Taskly</div>
            <div className="p-4">Altre suite</div>
          </div>
          {rows.map((row) => (
            <div key={row.label} className="grid grid-cols-3 border-t border-gray-100 dark:border-gray-800 text-sm">
              <div className="p-4 font-semibold text-gray-800 dark:text-gray-200">{row.label}</div>
              <div className="p-4 text-purple-700 dark:text-purple-300 font-bold">{row.taskly}</div>
              <div className="p-4 text-gray-600 dark:text-gray-400">{row.other}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/register" className="inline-flex px-6 py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold hover:opacity-90 transition-opacity">
            Provalo gratis e confronta tu stesso
          </Link>
        </div>
      </div>
    </section>
  );
}


