import {
  LayoutDashboard,
  ListTodo,
  Target,
  Calendar,
  FileText,
  Lightbulb,
  Mic,
  Settings,
  Bell,
  Search,
  Star,
  CheckCircle2,
  Clock,
  TrendingUp,
  Sparkles,
  Lock,
} from "lucide-react";
import AIPanel from "./AIPanel";

const NAV = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: ListTodo, label: "Task", active: false },
  { icon: Target, label: "Obiettivi", active: false },
  { icon: Calendar, label: "Calendario", active: false },
  { icon: FileText, label: "Note", active: false },
  { icon: Lightbulb, label: "Idee", active: false },
  { icon: Mic, label: "Trascrizioni", active: false },
  { icon: Settings, label: "Impostazioni", active: false },
];

const STATS = [
  { label: "Task Attivi", value: "12", sub: "In attesa di completamento", icon: ListTodo, tint: "text-cyan-500 bg-cyan-500/10" },
  { label: "Obiettivi", value: "5", sub: "2 raggiunti", icon: Target, tint: "text-emerald-500 bg-emerald-500/10" },
  { label: "Idee Brainstorm", value: "18", sub: "In attesa di conversione", icon: Lightbulb, tint: "text-amber-500 bg-amber-500/10" },
  { label: "Focus Oggi", value: "3", sub: "Focus principale", icon: Sparkles, tint: "text-rose-500 bg-rose-500/10" },
];

const GOALS = [
  { title: "Lancia il MVP di Taskly", progress: 70, color: "bg-cyan-500" },
  { title: "Raggiungi 100 utenti attivi", progress: 42, color: "bg-emerald-500" },
  { title: "Leggere 12 libri quest'anno", progress: 25, color: "bg-amber-500" },
];

const CRITICAL = [
  { title: "Fundraising deck finale", priority: "Alta", date: "Oggi" },
  { title: "Fixing crash iOS", priority: "Alta", date: "Domani" },
  { title: "Sprint review", priority: "Media", date: "Venerdì" },
];

const SAMPLE_TASKS = [
  { title: "Setup Supabase schema", status: "Fatto", done: true },
  { title: "Refactor auth middleware", status: "In corso", done: false },
  { title: "Test Vitest core", status: "In corso", done: false },
  { title: "Design marketing page", status: "In cors", done: false },
  { title: "Miglioria on-boarding", status: "Da fare", done: false },
];

export default function DemoDashboard() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-gray-900 dark:text-gray-100">
      {/* Top bar */}
      <header className="sticky top-0 z-20 h-14 border-b border-gray-200/60 dark:border-gray-800/60 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl px-4 flex items-center gap-3">
        <div className="flex items-center gap-2 font-bold">
          <Star className="w-5 h-5 text-cyan-500" fill="currentColor" />
          <span className="text-[15px] tracking-tight">Taskly</span>
        </div>
        <nav className="flex-1 flex items-center gap-1 overflow-hidden">
          {["Dashboard", "Task", "Obiettivi", "Note"].map((t, i) => (
            <span
              key={t}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
                i === 0
                  ? "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {t}
            </span>
          ))}
        </nav>
        <div className="shrink-0 flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-800 px-2.5 py-1.5 text-xs text-gray-400">
            <Search size={13} /> Cerca...
          </span>
          <span className="relative p-2 text-gray-400">
            <Bell size={17} />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
          </span>
          <span className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center text-white text-xs font-black">
            GF
          </span>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex w-60 shrink-0 flex-col gap-1 p-3 border-r border-gray-200/60 dark:border-gray-800/60">
          <div className="flex items-center gap-2 px-2 pb-2 text-[10px] font-black uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">
            Menu
          </div>
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                disabled
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold ${
                  item.active
                    ? "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-300"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
          <div className="mt-4 flex items-center gap-2 px-2 text-[10px] font-black uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">
            Le tue pagine
          </div>
          {["Backlog", "Spedizioni", "Hobby"].map((p) => (
            <div
              key={p}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-gray-500 dark:text-gray-400"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              {p}
            </div>
          ))}
        </aside>

        {/* Main */}
        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-5xl">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7b39fc] to-[#a67cff] flex items-center justify-center shrink-0 shadow-lg shadow-[#7b39fc]/25">
                <Sparkles size={22} className="text-white/90" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="h-px w-6 bg-gradient-to-r from-[#7b39fc]/0 to-[#7b39fc]" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7b39fc] dark:text-[#a67cff]">
                    Dashboard
                  </span>
                </div>
                <h1 className="text-2xl font-bold">Il tuo centro di comando</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Tutto sotto controllo. Demo dimostrativa.
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-200 dark:border-cyan-800 text-cyan-600 dark:text-cyan-300 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest">
              <Lock size={11} /> Read-only
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className="rounded-2xl border border-gray-200/70 dark:border-gray-800 bg-white dark:bg-gray-950/60 p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center justify-center h-9 w-9 rounded-xl ${s.tint}`}>
                      <Icon size={18} />
                    </span>
                    <TrendingUp size={16} className="text-emerald-500/70" />
                  </div>
                  <div className="mt-3 text-3xl font-bold">{s.value}</div>
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">{s.label}</div>
                  <div className="text-xs text-gray-400">{s.sub}</div>
                </div>
              );
            })}
          </div>

          {/* Goals + Critical */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-gray-200/70 dark:border-gray-800 bg-white dark:bg-gray-950/60 p-5">
              <div className="flex items-center gap-2 font-bold mb-4">
                <Target size={16} className="text-emerald-500" /> Progressi Obiettivi
              </div>
              <div className="space-y-4">
                {GOALS.map((g) => (
                  <div key={g.title}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-semibold">{g.title}</span>
                      <span className="text-gray-400">{g.progress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${g.color}`}
                        style={{ width: `${g.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200/70 dark:border-gray-800 bg-white dark:bg-gray-950/60 p-5">
              <div className="flex items-center gap-2 font-bold mb-4">
                <Clock size={16} className="text-rose-500" /> Task critici
              </div>
              <div className="space-y-2">
                {CRITICAL.map((t) => (
                  <div
                    key={t.title}
                    className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-gray-800 px-3 py-2.5"
                  >
                    <span className="text-sm font-semibold">{t.title}</span>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-300 px-2 py-0.5 font-semibold">
                        {t.priority}
                      </span>
                      <span className="text-gray-400">{t.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sample task table */}
          <div className="rounded-2xl border border-gray-200/70 dark:border-gray-800 bg-white dark:bg-gray-950/60 p-5">
            <div className="flex items-center gap-2 font-bold mb-4">
              <ListTodo size={16} className="text-cyan-500" /> Task del progetto
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {SAMPLE_TASKS.map((t) => (
                <div key={t.title} className="flex items-center gap-3 py-2.5">
                  <CheckCircle2
                    size={18}
                    className={`shrink-0 ${t.done ? "text-emerald-500" : "text-gray-300 dark:text-gray-700"}`}
                  />
                  <span className={`flex-1 text-sm ${t.done ? "line-through text-gray-400" : "font-medium"}`}>
                    {t.title}
                  </span>
                  <span className="text-xs text-gray-400">{t.status}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 dark:text-gray-600">
            Dashboard dimostrativa e statica: nessuna modifica sarà salvata.
          </p>
        </main>
      </div>

      {/* Floating minichat AI */}
      <AIPanel />
    </div>
  );
}