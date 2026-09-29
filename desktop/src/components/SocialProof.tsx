
import React from "react";

const logos = ["Studio Nova", "BrightOps", "Creative Lab", "Focus Team", "Nord Agency"];

export default function SocialProof() {
  return (
    <section className="px-6 py-14 bg-white dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800">
      <div className="max-w-6xl mx-auto text-center">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
          Gia scelto da professionisti e team
        </p>
        <div className="mt-5 grid md:grid-cols-3 gap-4">
          <div className="rounded-xl bg-purple-50 dark:bg-purple-900/20 p-5">
            <p className="text-2xl font-black text-purple-700 dark:text-purple-300">10.000+</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">utenti attivi mensili</p>
          </div>
          <div className="rounded-xl bg-pink-50 dark:bg-pink-900/20 p-5">
            <p className="text-2xl font-black text-pink-700 dark:text-pink-300">4.8/5</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">media recensioni utenti</p>
          </div>
          <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 p-5">
            <p className="text-2xl font-black text-blue-700 dark:text-blue-300">+120k</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">task completati ogni settimana</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {logos.map((logo) => (
            <span key={logo} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800">
              {logo}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}


