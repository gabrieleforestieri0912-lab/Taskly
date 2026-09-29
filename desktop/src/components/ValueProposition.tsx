
import React from "react";
import Link from "next/link";
import { Layers, ListChecks, NotebookPen } from "lucide-react";

const items = [
  {
    icon: Layers,
    title: "Unico workspace",
    text: "Tutto in un solo posto: progetti, task e note connessi tra loro.",
  },
  {
    icon: ListChecks,
    title: "Flusso operativo chiaro",
    text: "Riduci il tempo perso tra strumenti diversi e mantieni il focus sul lavoro vero.",
  },
  {
    icon: NotebookPen,
    title: "Pensato per execution",
    text: "Dalle idee ai task in pochi click, senza setup complessi.",
  },
];

export default function ValueProposition() {
  return (
    <section className="px-6 py-16 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-purple-600 dark:text-purple-400">
            Per chi lavora e studia ogni giorno
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
            Gestisci progetti, note e task in un unico spazio senza cambiare app
          </h2>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            Quando tutto e nello stesso workspace, smetti di rincorrere strumenti e torni a chiudere attivita.
          </p>
        </div>

        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {items.map((item) => (
            <div key={item.title} className="rounded-2xl border border-gray-200/70 dark:border-gray-700/60 bg-gray-50/60 dark:bg-gray-800/40 p-5">
              <item.icon className="text-purple-600 dark:text-purple-400" size={20} />
              <h3 className="mt-3 text-lg font-bold text-gray-900 dark:text-white">{item.title}</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/register" className="inline-flex px-6 py-3 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-500 transition-colors">
            Inizia gratis adesso
          </Link>
        </div>
      </div>
    </section>
  );
}


