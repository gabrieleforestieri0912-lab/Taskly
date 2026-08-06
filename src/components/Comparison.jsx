import React from "react";
import Link from "next/link";

const rows = [
  { label: "Curva di apprendimento", taskly: "Rapida", other: "Spesso lunga" },
  { label: "Setup iniziale", taskly: "Pronto in pochi minuti", other: "Richiede configurazione" },
  { label: "Organizzazione quotidiana", taskly: "Lineare e focalizzata", other: "Pu\u00f2 diventare dispersiva" },
  { label: "Esperienza visiva", taskly: "Pulita e minimal", other: "Dipende dal setup" },
  { label: "AI integrata", taskly: "S\u00ec, nativa", other: "Solo a pagamento" },
  { label: "App mobile", taskly: "In arrivo (PWA gi\u00e0 attiva)", other: "Spesso separata" },
  { label: "Template pronti", taskly: "Libreria inclusa", other: "Da creare o acquistare" },
  { label: "Export dati", taskly: "PDF / CSV nativo", other: "Limitato o assente" },
  { label: "Collaborazione in tempo reale", taskly: "Workspace condivisi", other: "Piani superiori" },
  { label: "Modalit\u00e0 offline", taskly: "Supporto base", other: "Raramente disponibile" },
];

export default function Comparison() {
  return (
    <section className="landing-section px-4 py-20 bg-white dark:bg-[#151020] sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center">
          <div className="landing-eyebrow">
            Perch\u00e9 scegliere Taskly
          </div>
          <h2 className="landing-heading-lg mt-3">
            Pi&ugrave; semplice di Notion,{" "}
            <span className="landing-display-accent">pi&ugrave; flessibile di Trello</span>, meno caotico di ClickUp
          </h2>
        </div>

        <div className="mt-9 overflow-hidden rounded-2xl border border-[#7b39fc]/10 dark:border-[#a484d7]/20">
          <div className="grid grid-cols-[1.1fr_0.95fr_0.95fr] bg-[#f6f7f9] dark:bg-[#2b2344]/40 text-[10px] font-black uppercase tracking-[0.08em] text-gray-500 dark:text-gray-300 sm:text-xs sm:tracking-[0.12em]">
            <div className="p-4">Criterio</div>
            <div className="p-4 text-[#7b39fc] dark:text-[#a67cff]">Taskly</div>
            <div className="p-4">Altre suite</div>
          </div>
          {rows.map((row) => (
            <div key={row.label} className="grid grid-cols-[1.1fr_0.95fr_0.95fr] border-t border-[#7b39fc]/10 dark:border-[#a484d7]/15 text-xs sm:text-sm">
              <div className="min-w-0 p-3 font-bold text-gray-900 dark:text-gray-100 sm:p-4">{row.label}</div>
              <div className="min-w-0 p-3 text-gray-700 dark:text-gray-200 sm:p-4">{row.taskly}</div>
              <div className="min-w-0 p-3 text-gray-500 dark:text-gray-400 sm:p-4">{row.other}</div>
            </div>
          ))}
          <div className="p-4 text-center text-xs text-gray-400 dark:text-gray-500 border-t border-[#7b39fc]/10 dark:border-[#a484d7]/15 bg-[#f6f7f9]/50 dark:bg-[#2b2344]/20">
            Confronto indicativo basato sull&apos;esperienza d&apos;uso media
          </div>
        </div>
      </div>
    </section>
  );
}
