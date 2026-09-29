
import React from "react";
import Link from "next/link";
import { TimerReset, Wrench, LayoutTemplate } from "lucide-react";

const steps = [
  {
    icon: TimerReset,
    title: "Start in 30 secondi",
    text: "Registrati e crea il primo workspace in meno di un minuto.",
  },
  {
    icon: Wrench,
    title: "Nessun setup tecnico",
    text: "Niente configurazioni complesse: apri e inizia a lavorare subito.",
  },
  {
    icon: LayoutTemplate,
    title: "Template pronti",
    text: "Usa modelli gia pronti per task, obiettivi, note e planning settimanale.",
  },
];

export default function GettingStarted() {
  return (
    <section className="px-6 py-16 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-purple-600 dark:text-purple-400">
            Getting started
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
            Parti subito senza attrito
          </h2>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            Meno tempo a capire lo strumento, piu tempo a portare risultati.
          </p>
        </div>

        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {steps.map((step) => (
            <div key={step.title} className="rounded-2xl border border-gray-200/70 dark:border-gray-700/60 bg-gray-50/70 dark:bg-gray-800/40 p-5">
              <step.icon className="text-purple-600 dark:text-purple-400" size={20} />
              <h3 className="mt-3 text-lg font-bold text-gray-900 dark:text-white">{step.title}</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{step.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/register" className="inline-flex px-6 py-3 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-500 transition-colors">
            Crea account e prova i template
          </Link>
        </div>
      </div>
    </section>
  );
}


