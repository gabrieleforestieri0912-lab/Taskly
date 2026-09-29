
import React from "react";
import { Rocket, Target, Zap, Layout } from "lucide-react";

const steps = [
  {
    icon: <Rocket className="w-8 h-8 text-purple-600 dark:text-purple-400" />,
    title: "Crea il tuo Account",
    description: "Inizia in pochi secondi con un setup rapido e intuitivo. La tua nuova vita organizzata comincia qui.",
  },
  {
    icon: <Target className="w-8 h-8 text-pink-500 dark:text-pink-400" />,
    title: "Definisci i tuoi Obiettivi",
    description: "Imposta traguardi chiari. Che siano giornalieri o a lungo termine, Taskly ti aiuta a focalizzarti.",
  },
  {
    icon: <Layout className="w-8 h-8 text-blue-500 dark:text-blue-400" />,
    title: "Organizza i Task",
    description: "Trascina, ordina e categorizza le tue attività. Una dashboard pulita per una mente sgombra dal caos.",
  },
  {
    icon: <Zap className="w-8 h-8 text-amber-500 dark:text-amber-400" />,
    title: "Massimizza la Produttività",
    description: "Monitora i tuoi progressi in tempo reale e guarda come il tuo disordine si trasforma in risultati concreti.",
  },
];

export default function HowItWorks() {
  return (
    <section id="features" className="py-16 px-6 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">
            Come funziona <span className="text-gradient-purple animate-gradient">Taskly</span>?
          </h2>
          <p className="text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Quattro semplici passaggi per riprendere il controllo del tuo tempo e della tua vita professionale.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-1/2 w-full h-0.5 bg-gray-100 dark:bg-gray-800 -z-10 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/30 transition-colors duration-500"></div>
              )}
              
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-gray-200/50 dark:shadow-none group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border border-gray-100 dark:border-gray-700">
                  {step.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


