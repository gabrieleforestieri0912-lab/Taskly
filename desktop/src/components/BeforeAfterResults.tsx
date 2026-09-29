
import React from "react";
import Link from "next/link";

export default function BeforeAfterResults() {
  return (
    <section className="px-6 py-20 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-purple-600 dark:text-purple-400">
            Before / after
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
            Da giornata caotica a workflow ordinato
          </h2>
        </div>

        <div className="mt-10 grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-gray-200/70 dark:border-gray-700/60 bg-gray-50/70 dark:bg-gray-800/40 p-6">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Prima</p>
            <h3 className="mt-2 text-xl font-black text-gray-900 dark:text-white">Strumenti disconnessi</h3>
            <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>- Task in una app, note in un’altra, calendario altrove</li>
              <li>- Priorita poco chiare, lavoro frammentato</li>
              <li>- Troppo tempo perso nel capire cosa fare adesso</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-purple-200/70 dark:border-purple-800/50 bg-purple-50/60 dark:bg-purple-900/20 p-6">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-purple-600 dark:text-purple-400">Dopo</p>
            <h3 className="mt-2 text-xl font-black text-gray-900 dark:text-white">Sistema operativo personale</h3>
            <ul className="mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-200">
              <li>- Tutto in uno spazio unico: task, note, obiettivi</li>
              <li>- Pianificazione chiara per giornata e settimana</li>
              <li>- Fino a 5 ore/settimana risparmiate in gestione operativa</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 p-4 text-center">
            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">5h</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">risparmiate a settimana</p>
          </div>
          <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 p-4 text-center">
            <p className="text-2xl font-black text-blue-700 dark:text-blue-300">2x</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">piu chiarezza sulle priorita</p>
          </div>
          <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 p-4 text-center">
            <p className="text-2xl font-black text-amber-700 dark:text-amber-300">30s</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">per iniziare con template pronti</p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/register" className="inline-flex px-6 py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold hover:opacity-90 transition-opacity">
            Inizia ora e misura i risultati
          </Link>
        </div>
      </div>
    </section>
  );
}


