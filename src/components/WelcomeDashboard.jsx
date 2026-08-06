/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";
import { Card, CardContent, Button } from "./UIComponents";
import { FileText, Plus, Sparkles } from "lucide-react";

export default function WelcomeDashboard({ onAddPage }) {
  return (
    <div className="min-h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center px-6 py-4">
      <img src="/taskly.png" alt="Taskly" className="w-16 h-16 rounded-2xl object-cover shadow-xl shadow-cyan-500/20 mb-6 animate-bounce" />

      <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white leading-tight">
        Il tuo spazio è <br />
        <span className="text-gradient-cyan animate-gradient">pronto per decollare</span>.
      </h2>

      <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-md">
        Taskly è una tela bianca pronta per essere riempita. Inizia aggiungendo la tua prima pagina.
      </p>

      <div className="mt-8">
        <Button
          onClick={onAddPage}
          className="px-8 py-4 rounded-xl text-lg font-black shadow-xl shadow-cyan-500/20 gap-2"
        >
          <Plus size={20} /> Crea pagina
        </Button>
      </div>

      <div className="mt-10 grid grid-cols-4 gap-3 w-full max-w-sm opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
        <div className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <FileText size={16} className="mx-auto mb-1 text-blue-500" />
          <span className="text-[8px] font-bold uppercase tracking-widest">Note</span>
        </div>
        <div className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <Sparkles size={16} className="mx-auto mb-1 text-cyan-500" />
          <span className="text-[8px] font-bold uppercase tracking-widest">Task</span>
        </div>
        <div className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <Sparkles size={16} className="mx-auto mb-1 text-pink-500" />
          <span className="text-[8px] font-bold uppercase tracking-widest">Goals</span>
        </div>
        <div className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <Sparkles size={16} className="mx-auto mb-1 text-orange-500" />
          <span className="text-[8px] font-bold uppercase tracking-widest">Eventi</span>
        </div>
      </div>
    </div>
  );
}
