import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CtaBanner() {
  return (
    <section className="px-6 py-24 bg-white dark:bg-[#151020]">
      <div className="max-w-5xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#7b39fc] via-[#6d28d9] to-[#2b2344] p-10 md:p-16 text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 text-white text-xs font-black uppercase tracking-widest mb-6 backdrop-blur-sm">
              <Sparkles size={12} />
              Pronto a cambiare?
            </div>

            <h2 className="font-instrument-serif text-4xl md:text-6xl text-white leading-[1.1] mb-4">
              Inizia oggi, <br className="md:hidden" />
              <em className="font-instrument-serif italic text-white/90">gratis per sempre.</em>
            </h2>

            <p className="text-white/80 text-base max-w-xl mx-auto mb-8 font-medium">
              Nessuna carta di credito. Nessun periodo di prova. Solo produttivit&agrave; reale.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="font-cabin inline-flex h-[52px] items-center justify-center gap-2 rounded-[10px] bg-white px-8 text-base font-medium text-gray-900 hover:opacity-90 transition-all shadow-lg shadow-black/10"
              >
                Crea il tuo workspace
                <ArrowRight size={16} />
              </Link>
              <button
                onClick={() => {
                  const el = document.getElementById("pricing");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="font-cabin inline-flex h-[52px] items-center justify-center rounded-[10px] border border-white/20 bg-white/10 backdrop-blur-sm px-8 text-base font-medium text-white hover:bg-white/20 transition-all"
              >
                Vedi piani
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
