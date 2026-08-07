"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mic,
  Search,
  Calendar,
  Clock,
  FileText,
  Sparkles,
  Trash2,
  Play,
  Pause,
  ChevronRight,
  ChevronDown,
  Plus,
  Volume2,
  BrainCircuit,
  MessageSquare,
  ArrowLeft,
  Filter,
  BarChart2,
  Languages,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../../components/Sidebar";
import AIPanel from "../../components/AIPanel";
import { useUserData } from "../../hooks/useUserData";
import { useLanguage } from "../../lib/LanguageContext";
import { Skeleton } from "../../components/UIComponents";

function MeetingsContent() {
  const { t } = useLanguage();
  const router = useRouter();

  // Load user data using custom hook
  const { user, pages, loading } = useUserData();

  // Theme state
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "dark";
    return localStorage.getItem("theme") || "dark";
  });

  // Layout states
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [meetings, setMeetings] = useState(() => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem("meetings_data");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedMeetingId, setExpandedMeetingId] = useState(null);
  const [playingId, setPlayingId] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // 'all' or 'summaries'

  // Update theme class on HTML element
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  // Sync server-persisted meetings (logged-in users) into the local list
  useEffect(() => {
    let active = true;
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;
    (async () => {
      try {
        const res = await fetch("/api/meetings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        const serverMeetings = (data?.meetings || []);
        setMeetings((prev) => {
          const known = new Set(prev.map((m) => String(m.id)));
          const added = serverMeetings
            .filter((sm) => !known.has(String(sm.id)))
            .map((sm) => ({
              id: sm.id,
              title: sm.title,
              date: sm.date,
              duration: sm.duration || "00:00",
              category: sm.category || "Generale",
              preview: (sm.transcript || "").slice(0, 120),
              text: sm.transcript,
              summary: sm.summary,
            }));
          if (!added.length || !active) return prev;
          return [...added, ...prev];
        });
      } catch (e) {
        console.error("Error fetching server meetings:", e);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  // Delete a meeting
  const handleDeleteMeeting = (id, e) => {
    e.stopPropagation();
    const filtered = meetings.filter((m) => m.id !== id);
    setMeetings(filtered);
    localStorage.setItem("meetings_data", JSON.stringify(filtered));
    if (expandedMeetingId === id) setExpandedMeetingId(null);
    if (playingId === id) setPlayingId(null);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      fetch(`/api/meetings/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
  };

  // Filter meetings
  const filteredMeetings = meetings.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.preview.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate statistics
  const totalDurationMinutes = meetings.reduce((acc, curr) => {
    const parts = curr.duration.split(":");
    const min = parseInt(parts[0]) || 0;
    const sec = parseInt(parts[1]) || 0;
    return acc + min + sec / 60;
  }, 0);

  const categories = ["All", "Sviluppo", "Marketing", "Design", "Generale"];

  const handleAIAction = (action) => {
    console.log("AI Action received in Meetings page:", action);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex text-gray-800 dark:text-gray-200">
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 bottom-0 w-64 z-40 transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar
          user={user}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          theme={theme}
          toggleTheme={toggleTheme}
          pages={pages}
          loading={loading}
        />
      </div>

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarOpen ? "pl-64" : "pl-0"}`}
      >
        {/* Sticky Header Navbar */}
        <header className="sticky top-0 z-30 h-14 border-b border-gray-200/60 dark:border-gray-800/60 bg-white/80 dark:bg-gray-950/60 backdrop-blur-xl px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-gray-500 hover:text-cyan-600 dark:text-gray-400 dark:hover:text-cyan-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-850 transition-colors"
              aria-label="Toggle sidebar"
            >
              <Mic
                size={18}
                className="text-cyan-600 dark:text-cyan-400 animate-pulse"
              />
            </button>
            <div className="flex items-center gap-1 text-sm font-bold">
              <span className="text-gray-400 dark:text-gray-500">
                {t("dashboard")}
              </span>
              <ChevronRight
                size={14}
                className="text-gray-300 dark:text-gray-600"
              />
              <span className="text-cyan-600 dark:text-cyan-400">
                {t("meetingRecording")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Record New button */}
            <Link
              href="/transcription"
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-cyan-600/10 hover:shadow-lg"
            >
              <Plus size={14} />
              <span>{t("newTranscription")}</span>
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* Top Title Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                <Mic className="text-cyan-600 dark:text-cyan-400 w-8 h-8" />
                {t("meetingRecording")}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {t("meetingRecordingDesc")}
              </p>
            </div>
          </div>

          {/* Quick Statistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/50 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-900/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0">
                <Mic size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Totale Riunioni
                </p>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">
                  {meetings.length}
                </h3>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/50 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <Clock size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Minuti Registrati
                </p>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">
                  {Math.round(totalDurationMinutes * 10) / 10} m
                </h3>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/50 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/20 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0">
                <Sparkles size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Riassunti Generati
                </p>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">
                  {meetings.filter((m) => m.summary).length}
                </h3>
              </div>
            </div>
          </div>

          {/* Search, Tabs, and Filter Bar */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/50 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Cerca tra le trascrizioni..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-850 border border-gray-100 dark:border-gray-800 rounded-xl pl-10 pr-4 py-2 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
              />
            </div>

            {/* Category selection */}
            <div className="flex flex-wrap items-center gap-1.5">
              <Filter
                size={14}
                className="text-gray-400 mr-1 hidden sm:inline"
              />
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedCategory === cat
                      ? "bg-cyan-100 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400"
                      : "bg-gray-50 dark:bg-gray-850 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Meetings List */}
          <div className="space-y-4">
            {filteredMeetings.length > 0 ? (
              filteredMeetings.map((meet) => {
                const isExpanded = expandedMeetingId === meet.id;
                const isPlaying = playingId === meet.id;
                const formattedDate = new Date(meet.date).toLocaleDateString(
                  "it-IT",
                  {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  },
                );

                return (
                  <motion.div
                    key={meet.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/50 rounded-2xl shadow-sm hover:shadow-md hover:border-cyan-500/20 dark:hover:border-cyan-400/20 transition-all overflow-hidden"
                  >
                    {/* Header Summary Row */}
                    <div
                      onClick={() =>
                        setExpandedMeetingId(isExpanded ? null : meet.id)
                      }
                      className="p-5 flex items-center justify-between gap-4 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        {/* Audio play/pause button (stop propagation) */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPlayingId(isPlaying ? null : meet.id);
                          }}
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all shadow-sm ${
                            isPlaying
                              ? "bg-red-500 text-white animate-pulse"
                              : "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 hover:scale-105 hover:bg-cyan-100"
                          }`}
                        >
                          {isPlaying ? (
                            <Pause size={16} />
                          ) : (
                            <Play size={16} className="ml-0.5" />
                          )}
                        </button>

                        <div className="min-w-0">
                          <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">
                            {meet.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-gray-400 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {formattedDate}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {meet.duration}
                            </span>
                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-md text-[10px] font-bold text-gray-500 dark:text-gray-400">
                              {meet.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Delete button (stop propagation) */}
                        <button
                          onClick={(e) => handleDeleteMeeting(meet.id, e)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100 md:opacity-100"
                          title="Elimina"
                        >
                          <Trash2 size={15} />
                        </button>
                        <div className="p-2 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">
                          {isExpanded ? (
                            <ChevronDown size={18} />
                          ) : (
                            <ChevronRight size={18} />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Audio wave effect if playing */}
                    {isPlaying && (
                      <div className="px-5 pb-3 flex items-center gap-1.5 h-6 bg-cyan-50/20 dark:bg-cyan-900/5 border-t border-b border-cyan-100/30">
                        <Volume2
                          size={12}
                          className="text-cyan-500 shrink-0 mr-1"
                        />
                        <span className="text-[10px] font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest animate-pulse mr-2">
                          Riproduzione in corso
                        </span>
                        {Array.from({ length: 30 }).map((_, i) => (
                          <div
                            key={i}
                            className="w-0.5 bg-cyan-500 rounded-full"
                            style={{
                              height: `${30 + Math.random() * 70}%`,
                              animation: `pulse 0.6s ease-in-out infinite alternate`,
                              animationDelay: `${i * 0.03}s`,
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {/* Detailed View */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20"
                        >
                          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 text-sm">
                            {/* Transcription text */}
                            <div className="space-y-3">
                              <h4 className="font-extrabold text-xs text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                <FileText size={13} className="text-gray-400" />
                                Trascrizione
                              </h4>
                              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 h-60 overflow-y-auto leading-relaxed text-gray-600 dark:text-gray-300 custom-scrollbar text-xs">
                                {meet.text}
                              </div>
                            </div>

                            {/* AI Summary and key insights */}
                            <div className="space-y-3">
                              <h4 className="font-extrabold text-xs text-cyan-500 dark:text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Sparkles size={13} />
                                Riassunto ed Insight AI
                              </h4>
                              <div className="bg-cyan-50/30 dark:bg-cyan-950/15 border border-cyan-100/50 dark:border-cyan-900/30 rounded-2xl p-4 h-60 overflow-y-auto custom-scrollbar text-xs leading-relaxed text-gray-700 dark:text-gray-300">
                                {meet.summary ? (
                                  <div
                                    className="prose dark:prose-invert max-w-none text-xs space-y-2"
                                    dangerouslySetInnerHTML={{
                                      __html: meet.summary
                                        .replace(/\n/g, "<br/>")
                                        .replace(
                                          /\*\*(.*?)\*\*/g,
                                          "<strong>$1</strong>",
                                        ),
                                    }}
                                  />
                                ) : (
                                  <div className="h-full flex flex-col items-center justify-center text-center">
                                    <BrainCircuit className="text-cyan-300 dark:text-cyan-800 w-10 h-10 mb-2" />
                                    <p className="font-bold text-gray-500">
                                      Nessun riassunto disponibile
                                    </p>
                                    <button className="mt-2 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline">
                                      Genera con AI ora
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            ) : (
              // Empty state left intentionally blank for user-provided data
              <div className="max-w-7xl mx-auto p-12">
                <div className="h-48" />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Floating AI Panel Chat */}
      <AIPanel
        pages={pages}
        onAction={handleAIAction}
        isSidebarOpen={isSidebarOpen}
      />
    </div>
  );
}

function MeetingsLoading() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex">
      {/* Sidebar Skeleton */}
      <div className="w-64 border-r border-gray-200 dark:border-gray-800 p-4 space-y-8">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" />
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 animate-pulse rounded" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-10 w-full bg-gray-200 dark:bg-gray-800 animate-pulse rounded-xl"
            />
          ))}
        </div>
      </div>
      {/* Main Content Skeleton */}
      <div className="flex-1 p-8 space-y-8">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-800 animate-pulse rounded" />
            <div className="h-4 w-48 bg-gray-200 dark:bg-gray-800 animate-pulse rounded" />
          </div>
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-3xl"
            />
          ))}
        </div>
        <div className="h-12 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-xl w-full" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-2xl w-full"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MeetingsPage() {
  return (
    <Suspense fallback={<MeetingsLoading />}>
      <MeetingsContent />
    </Suspense>
  );
}
