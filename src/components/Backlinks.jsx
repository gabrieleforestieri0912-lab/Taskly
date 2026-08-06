"use client";
import React, { useEffect, useState } from "react";
import { resolvePageIcon } from "../lib/pageIcons";
import { Link2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Backlinks({ slug }) {
  const [backlinks, setBacklinks] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (!slug) {
      setTimeout(() => setBacklinks([]), 0);
      return;
    }

    let cancel = false;

    async function fetchBacklinks() {
      try {
        const pages = JSON.parse(localStorage.getItem("plannilab_pages") || "[]");
        const found = pages.filter((p) => {
          if (!p.content) return false;
          // Check for backlinks in block content if blocks exist
          if (p.data?.blocks) {
            const hasLink = p.data.blocks.some(b => b.content?.includes(`[[${slug}]]`) || b.content?.includes(`/${slug}`));
            if (hasLink) return true;
          }
          return (
            p.content.includes(`[[${slug}]]`) || p.content.includes(`/${slug}`)
          );
        });
        if (!cancel) {
          setBacklinks(found);
        }
      } catch (e) {
        if (!cancel) {
          setBacklinks([]);
        }
      }
    }

    fetchBacklinks();

    return () => {
      cancel = true;
    };
  }, [slug]);

  if (!slug) return null;

  return (
    <div className="p-6 bg-white/50 dark:bg-gray-800/40 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-[2.5rem] shadow-xl shadow-gray-200/50 dark:shadow-none">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl">
           <Link2 size={16} className="text-gray-600 dark:text-gray-400" />
        </div>
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Backlinks</h3>
      </div>
      
      {backlinks.length === 0 ? (
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center py-4 italic">
          Nessun riferimento trovato
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {backlinks.map((b) => {
            const PageIcon = resolvePageIcon(b);
            return (
              <button
                key={b.id}
                onClick={() => router.push(`/dashboard?page=${b.id}`)}
                className="flex items-center gap-3 p-2.5 hover:bg-white dark:hover:bg-gray-800 rounded-2xl transition-all text-left border border-transparent hover:border-gray-100 dark:hover:border-gray-700 group"
              >
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                  <PageIcon size={14} className="text-gray-500 dark:text-gray-400" />
                </div>
                <span className="text-sm font-bold text-gray-700 dark:text-gray-200 truncate flex-1">
                  {b.label || b.title || b.slug}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
