"use client";

import { Calendar, CheckSquare, Clock, User } from "lucide-react";
import { landingContent } from "@/content/landing";

export function BoardMockup() {
  const { workspace, columns, cards } = landingContent.hero.mockup;

  // Dati fittizi plausibili per colonne
  const boardData = [
    {
      title: columns[0],
      count: 3,
      cards: [
        { title: cards[0].title, assignee: cards[0].assignee, tag: cards[0].tag, due: cards[0].due, color: "bg-red-500" },
        { title: "Ricerca keywords SEO", assignee: "FR", tag: "Ricerca", due: "Lun", color: "bg-emerald-500" },
        { title: "Draft proposta", assignee: "MR", tag: "Scrittura", due: "Mar", color: "bg-amber-500" },
      ],
    },
    {
      title: columns[1],
      count: 2,
      cards: [
        { title: cards[1].title, assignee: cards[1].assignee, tag: cards[1].tag, due: cards[1].due, color: "bg-violet-500" },
        { title: "Setup analytics", assignee: "GT", tag: "Dev", due: "Oggi", color: "bg-blue-500" },
      ],
    },
    {
      title: columns[2],
      count: 2,
      cards: [
        { title: cards[2].title, assignee: cards[2].assignee, tag: cards[2].tag, due: cards[2].due, color: "bg-emerald-500" },
        { title: "Onboarding template", assignee: "AL", tag: "Completato", due: "Ieri", color: "bg-gray-400" },
      ],
    },
  ];

  return (
    <div className="relative mx-auto w-full max-w-[1100px] overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl shadow-[#7b39fc]/10 dark:border-white/10 dark:bg-[#1a1528] dark:shadow-black/20">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-black/5 bg-[#f6f7f9] px-4 py-3 dark:border-white/10 dark:bg-[#0a0716]">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-yellow-400" />
            <span className="h-3 w-3 rounded-full bg-green-400" />
          </div>
          <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">{workspace}</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
          <span className="hidden md:inline">Vista: Board</span>
          <span className="h-4 w-px bg-border" />
          <span>Condiviso • 4 membri</span>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar - hidden on mobile, reduced */}
        <aside className="hidden w-56 shrink-0 border-r border-black/5 bg-[#f6f7f9]/60 p-4 dark:border-white/10 dark:bg-white/[0.02] md:block">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Workspace</p>
              <ul className="mt-2 space-y-1 text-sm">
                <li className="flex items-center gap-2 rounded-lg bg-white px-2 py-1.5 font-medium shadow-sm dark:bg-white/10">
                  <span className="h-6 w-6 rounded bg-[#7b39fc] grid place-items-center text-xs text-white">T</span> Marketing Q4
                </li>
                <li className="px-2 py-1.5 text-muted-foreground">Prodotto</li>
                <li className="px-2 py-1.5 text-muted-foreground">Design System</li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Viste</p>
              <ul className="mt-2 space-y-1 text-sm">
                <li className="px-2 py-1 text-[#7b39fc] font-medium">▦ Board</li>
                <li className="px-2 py-1 text-muted-foreground">≡ Lista</li>
                <li className="px-2 py-1 text-muted-foreground flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Calendario</li>
              </ul>
            </div>
          </div>
        </aside>

        {/* Board */}
        <div className="flex-1 overflow-x-auto bg-white dark:bg-[#1a1528]">
          <div className="flex gap-4 p-4 min-w-[640px] md:min-w-0">
            {boardData.map((col) => (
              <div key={col.title} className="flex-1 min-w-[200px] rounded-xl bg-[#f6f7f9] p-3 dark:bg-white/[0.04]">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">{col.title}</h3>
                  <span className="text-xs bg-white dark:bg-white/10 rounded-full px-2 py-0.5 text-muted-foreground">{col.count}</span>
                </div>
                <div className="space-y-3">
                  {col.cards.map((card) => (
                    <div
                      key={card.title}
                      className="rounded-xl border border-black/5 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-[#0a0716]"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-tight text-gray-900 dark:text-white">{card.title}</p>
                        <span className={`h-2 w-2 rounded-full ${card.color} shrink-0 mt-1`} />
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#f4f0fd] dark:bg-[#7b39fc]/20 px-2 py-0.5 text-xs font-medium text-[#7b39fc] dark:text-[#a67cff]">
                          {card.tag}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" /> {card.due}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span className="grid h-6 w-6 place-items-center rounded-full bg-gray-900 text-xs font-medium text-white dark:bg-white dark:text-gray-900">
                            {card.assignee}
                          </span>
                          <User className="h-3 w-3" /> Assegnato
                        </span>
                        <CheckSquare className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
