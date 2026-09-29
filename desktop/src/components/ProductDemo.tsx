
import React from "react";
import Link from "next/link";
import { PlayCircle, CheckCircle2, ExternalLink } from "lucide-react";

export default function ProductDemo() {
  return (
    <section className="px-6 py-18 bg-[#fcfaff] dark:bg-gray-950">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-purple-600 dark:text-purple-400">Demo prodotto</p>
          <h2 className="mt-3 text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
            Guarda il prodotto reale in azione
          </h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Una vista concreta di dashboard, planning e note collegate per capire subito il valore.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-purple-500" /> Workflow task e obiettivi nello stesso spazio</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-purple-500" /> Organizzazione per pagine annidate</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-purple-500" /> Supporto AI contestuale nella dashboard</li>
          </ul>
          <div className="mt-7 flex gap-3">
            <Link href="/register" className="inline-flex px-6 py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold hover:opacity-90 transition-opacity">
              Prova la demo nel tuo account
            </Link>
            <a 
              href="https://www.youtube.com/watch?v=demo" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-medium hover:border-purple-500 hover:text-purple-600 transition-all"
            >
              <ExternalLink size={16} className="mr-2" />
              Guarda su YouTube
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200/70 dark:border-gray-700/60 bg-white dark:bg-gray-900 p-5 shadow-xl">
          <div className="rounded-xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800">
            <div className="relative aspect-video bg-gradient-to-br from-purple-600/20 to-pink-500/20 flex items-center justify-center">
              <button 
                onClick={() => window.open("https://www.youtube.com/watch?v=demo", "_blank")}
                className="flex items-center justify-center w-20 h-20 rounded-full bg-purple-600 hover:bg-purple-700 text-white transition-transform hover:scale-105 shadow-2xl shadow-purple-500/30"
              >
                <PlayCircle size={32} fill="white" />
              </button>
              <div className="absolute inset-0 bg-[url('https://img.youtube.com/vi/demo/0.jpg')] bg-cover bg-center opacity-40"></div>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-center text-gray-500 dark:text-gray-400 font-medium">
            Video dimostrativo di 60 secondi - Apriamo il tutto con un click
          </p>
        </div>
      </div>
    </section>
  );
}

