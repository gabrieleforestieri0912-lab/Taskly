import React from "react";
import { Layers, ListChecks, NotebookPen, Brain, Workflow, Sparkles } from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Layers,
    title: "Workspace unico",
    text: "Progetti, task e note convivono in un unico spazio. Niente pi\u00f9 salti tra app diverse.",
  },
  {
    icon: ListChecks,
    title: "Task avanzati",
    text: "Checklist, sottopagine, priorit\u00e0 e calendario integrato. Ogni attivit\u00e0 ha il suo posto.",
  },
  {
    icon: NotebookPen,
    title: "Note collegate",
    text: "Scrivi note ricche con slash commands, blocchi e link diretti ai task.",
  },
  {
    icon: Brain,
    title: "AI integrata",
    text: "Completamento automatico, suggerimenti e assistenza intelligente mentre lavori.",
  },
  {
    icon: Workflow,
    title: "Flusso continuo",
    text: "Dall'idea al task al completamento senza perdere il filo. Zero cambi di contesto.",
  },
  {
    icon: Sparkles,
    title: "Temi e personalizzazione",
    text: "Dashboard adattabile al tuo stile con temi chiari/scuri e layout flessibili.",
  },
];

export default function HowItWorks() {
  return (
    <section id="features" className="py-20 px-6 bg-[#f6f7f9] dark:bg-[#1a1528]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="landing-eyebrow">
            Caratteristiche
          </div>
          <h2 className="landing-heading-lg text-gray-900 dark:text-white mb-4">
            Tutto ci&ograve; che ti serve{" "}
            <span className="landing-display-accent">in un unico posto</span>
          </h2>
          <p className="landing-body text-base max-w-2xl mx-auto">
            Non un tool in pi&ugrave;, ma il tool giusto. Taskly unisce produttivit&agrave; e semplicit&agrave;.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="landing-card hover:-translate-y-1"
              >
                <div className="landing-icon-wrap mb-4">
                  <Icon size={18} />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{f.text}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Link href="/register" className="landing-btn-primary">
            Esplora tutte le funzionalit&agrave;
          </Link>
        </div>
      </div>
    </section>
  );
}
