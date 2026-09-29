
import React from "react";
import Link from "next/link";
import { GraduationCap, BriefcaseBusiness, Users } from "lucide-react";

const cases = [
  {
    title: "Per studenti",
    icon: GraduationCap,
    points: ["Piano esami e obiettivi settimanali", "Note collegate alle attivita", "Focus giornaliero semplice"],
  },
  {
    title: "Per freelance",
    icon: BriefcaseBusiness,
    points: ["Clienti, task e deadline nello stesso posto", "Dashboard leggera e operativa", "Meno tab aperti, piu consegne"],
  },
  {
    title: "Per team",
    icon: Users,
    points: ["Workspace condiviso", "Assegnazioni chiare e reporting", "Collaborazione senza caos"],
  },
];

export default function UseCases() {
  return (
    <section className="px-6 py-20 bg-[#fcfaff] dark:bg-gray-950">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-purple-600 dark:text-purple-400">Use cases</p>
          <h2 className="mt-3 text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
            Trova il modo giusto per il tuo lavoro
          </h2>
        </div>

        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {cases.map((item) => (
            <div key={item.title} className="rounded-2xl border border-gray-200/70 dark:border-gray-700/60 bg-white dark:bg-gray-900 p-5">
              <item.icon size={20} className="text-purple-600 dark:text-purple-400" />
              <h3 className="mt-3 text-lg font-bold text-gray-900 dark:text-white">{item.title}</h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                {item.points.map((point) => (
                  <li key={point}>- {point}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/register" className="inline-flex px-6 py-3 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-500 transition-colors">
            Crea workspace in 2 minuti
          </Link>
        </div>
      </div>
    </section>
  );
}


