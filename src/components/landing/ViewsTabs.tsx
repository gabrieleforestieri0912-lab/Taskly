"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Container } from "./Container";
import { Section } from "./Section";
import { BoardMockup } from "./BoardMockup";
import { landingContent } from "@/content/landing";

function ListMockup() {
  const tasks = [
    { title: "Brief cliente Q4", status: "In corso", assignee: "MR", due: "Oggi" },
    { title: "Wireframe homepage", status: "Da fare", assignee: "AL", due: "Domani" },
    { title: "Setup analytics", status: "Da fare", assignee: "GT", due: "Ven" },
    { title: "Review sprint — completato", status: "Fatto", assignee: "FR", due: "Ieri" },
  ];
  return (
    <div className="rounded-2xl border border-black/10 bg-white dark:border-white/10 dark:bg-[#1a1528] overflow-hidden">
      <div className="flex items-center justify-between border-b px-4 py-3 bg-[#f6f7f9] dark:bg-white/[0.04]">
        <span className="text-sm font-medium">Lista • 12 task</span>
        <span className="text-xs text-muted-foreground">Ordina: Scadenza</span>
      </div>
      <ul className="divide-y divide-black/5 dark:divide-white/5">
        {tasks.map((t) => (
          <li key={t.title} className="flex items-center gap-3 px-4 py-3">
            <span className="h-4 w-4 rounded border border-black/10 dark:border-white/20 grid place-items-center">
              {t.status === "Fatto" && <span className="h-2 w-2 rounded-full bg-emerald-500" />}
            </span>
            <span className="flex-1 text-sm font-medium truncate">{t.title}</span>
            <span className="hidden sm:inline text-xs px-2 py-0.5 rounded-full bg-[#f4f0fd] dark:bg-[#7b39fc]/20 text-[#7b39fc]">{t.status}</span>
            <span className="text-xs text-muted-foreground">{t.due}</span>
            <span className="h-6 w-6 rounded-full bg-gray-900 text-white grid place-items-center text-xs dark:bg-white dark:text-gray-900">{t.assignee}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CalendarMockup() {
  const weeks = [
    ["", "2", "3", "4", "5", "6", "7"],
    ["8", "9", "10", "11", "12", "13", "14"],
  ];
  return (
    <div className="rounded-2xl border border-black/10 bg-white dark:border-white/10 dark:bg-[#1a1528] overflow-hidden">
      <div className="flex items-center justify-between border-b px-4 py-3 bg-[#f6f7f9] dark:bg-white/[0.04]">
        <span className="text-sm font-medium">Marzo 2026</span>
        <span className="text-xs text-muted-foreground">Mese • Settimana • Giorno</span>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-7 gap-px text-xs text-center text-muted-foreground mb-2">
          {["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {weeks.flat().map((d, i) => (
            <div
              key={i}
              className={`h-16 rounded-lg border p-2 text-sm ${d === "11" ? "bg-[#7b39fc] text-white border-[#7b39fc]" : "bg-[#f6f7f9] dark:bg-white/[0.04] border-black/5 dark:border-white/5"}`}
            >
              {d}
              {d === "11" && <span className="mt-1 block text-xs opacity-90">• Review sprint</span>}
              {d === "5" && <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-[#7b39fc]" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TimelineMockup() {
  return (
    <div className="rounded-2xl border border-black/10 bg-white dark:border-white/10 dark:bg-[#1a1528] overflow-hidden">
      <div className="flex items-center justify-between border-b px-4 py-3 bg-[#f6f7f9] dark:bg-white/[0.04]">
        <span className="text-sm font-medium">Timeline • Q1</span>
        <span className="text-xs text-muted-foreground">Zoom: Settimane</span>
      </div>
      <div className="p-4 space-y-3">
        {[
          { label: "Ricerca", w: "w-[45%]", ml: "ml-0", color: "bg-[#7b39fc]" },
          { label: "Design", w: "w-[55%]", ml: "ml-8", color: "bg-[#a67cff]" },
          { label: "Sviluppo", w: "w-[70%]", ml: "ml-16", color: "bg-emerald-500" },
        ].map((bar) => (
          <div key={bar.label} className="flex items-center gap-3">
            <span className="w-20 text-xs font-medium text-muted-foreground">{bar.label}</span>
            <div className="flex-1 h-8 rounded-full bg-[#f6f7f9] dark:bg-white/[0.04] p-1">
              <div className={`h-full rounded-full ${bar.color} ${bar.w} ${bar.ml}`} />
            </div>
          </div>
        ))}
        <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t mt-4">
          <span>Gen</span>
          <span>Feb</span>
          <span>Mar</span>
        </div>
      </div>
    </div>
  );
}

export function ViewsTabs() {
  const [active, setActive] = useState("board");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const shouldReduceMotion = useReducedMotion();
  const tabs = landingContent.views.tabs;
  const { eyebrow, title, description } = landingContent.views;

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const idx = tabs.findIndex((t) => t.id === active);
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = (idx + 1) % tabs.length;
      setActive(tabs[next].id);
      tabRefs.current[next]?.focus();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = (idx - 1 + tabs.length) % tabs.length;
      setActive(tabs[prev].id);
      tabRefs.current[prev]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(tabs[0].id);
      tabRefs.current[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(tabs[tabs.length - 1].id);
      tabRefs.current[tabs.length - 1]?.focus();
    }
  };

  const renderMockup = () => {
    switch (active) {
      case "lista":
        return <ListMockup />;
      case "calendario":
        return <CalendarMockup />;
      case "timeline":
        return <TimelineMockup />;
      default:
        return <BoardMockup />;
    }
  };

  return (
    <Section variant="alt" id="funzionalita">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="landing-eyebrow">{eyebrow}</span>
          <h2 className="landing-heading-lg">{title}</h2>
          <p className="landing-body mt-4">{description}</p>
        </div>

        <div
          role="tablist"
          aria-label="Viste di Taskly"
          onKeyDown={onKeyDown}
          className="mx-auto mt-8 flex w-fit rounded-xl bg-white p-1 shadow-sm border dark:bg-white/5 dark:border-white/10"
        >
          {tabs.map((tab, i) => {
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                id={`tab-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActive(tab.id)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7b39fc] ${
                  isActive ? "bg-[#7b39fc] text-white" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div
          id={`panel-${active}`}
          role="tabpanel"
          aria-labelledby={`tab-${active}`}
          className="mt-8"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              {renderMockup()}
            </motion.div>
          </AnimatePresence>
        </div>
      </Container>
    </Section>
  );
}
