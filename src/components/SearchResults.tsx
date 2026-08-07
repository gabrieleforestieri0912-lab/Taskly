"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { FileText, ArrowRight, SearchX } from "lucide-react";
import { resolvePageIcon } from "../lib/pageIcons";

export default function SearchResults({ results = [] as any[], query = "" }) {
  const router = useRouter();

  if (!query || query.trim() === "") return null;

  return (
    <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-[2rem] shadow-2xl overflow-hidden ring-1 ring-black/5">
      {results.length === 0 ? (
        <div className="p-8 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-3">
             <SearchX size={20} className="text-gray-400" />
          </div>
          <p className="text-sm font-bold text-gray-700 dark:text-gray-200">Nessun risultato trovato</p>
          <p className="text-xs text-gray-400 mt-1">Prova a cambiare i termini di ricerca.</p>
        </div>
      ) : (
        <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2">
          <div className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
            Risultati per &quot;{query}&quot;
          </div>
          <div className="space-y-1">
            {results.map((r) => {
              const PageIcon = resolvePageIcon(r);
              return (
                <button
                  key={r.id}
                  onClick={() => router.push(`/dashboard?page=${r.id}`)}
                  className="w-full group flex items-center gap-4 p-3 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-2xl transition-all text-left"
                >
                  <div className="w-10 h-10 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <PageIcon size={18} className="text-gray-500 dark:text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-black text-gray-800 dark:text-gray-100 truncate">
                      {r.title || r.id}
                    </div>
                    <div className="text-[10px] text-gray-400 truncate mt-0.5 font-medium">
                      {r.snippet}
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
