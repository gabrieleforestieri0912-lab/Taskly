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
    <section className="px-6 py-20 bg-white dark:bg-[#151020]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <div className="landing-eyebrow">
            Getting started
          </div>
          <h2 className="landing-heading-lg mt-3">
            Parti subito{" "}
            <span className="landing-display-accent">senza attrito</span>
          </h2>
          <p className="landing-body mt-3">
            Meno tempo a capire lo strumento, più tempo a portare risultati.
          </p>
        </div>

        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {steps.map((step) => (
            <div key={step.title} className="landing-card">
              <div className="landing-icon-wrap">
                <step.icon size={20} />
              </div>
              <h3 className="mt-3 text-lg font-bold text-gray-900 dark:text-white">{step.title}</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{step.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/register" className="landing-btn-primary">
            Crea account e prova i template
          </Link>
        </div>
      </div>
    </section>
  );
}
