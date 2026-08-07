/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import React, { useEffect, useState, useRef } from "react";
import {
  Bell,
  BellOff,
  Circle,
  Check,
  Trash2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getSocket } from "../lib/socket";
import { apiFetch } from "../lib/api";

export default function NotificationBell({ pollInterval = 10000 }) {
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const socket = React.useMemo(() => {
    try {
      return getSocket();
    } catch {
      return null;
    }
  }, []);

  async function fetchRecent() {
    try {
      const res = await apiFetch("/activity/recent?limit=20");
      if (!res.ok) return;
      const json = await res.json();
      setItems(json.recent || []);
    } catch (e) {
      // ignore
    }
  }

  useEffect(() => {
    fetchRecent();
    const id = setInterval(fetchRecent, pollInterval);

    if (socket) {
      try {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          const u = JSON.parse(savedUser);
          if (u && u.email) {
            socket.emit("join-room", String(u.email));
          }
        }
      } catch (err) {
        console.error("Socket notification room join error:", err);
      }

      socket.on("new-notification", (noti) => {
        setItems((prev) => [noti, ...prev]);
      });
    }

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      clearInterval(id);
      if (socket) {
        socket.off("new-notification");
      }
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [pollInterval, socket]);

  const unreadCount = items.filter((i) => !i.read).length;

  async function markRead(ids) {
    try {
      await apiFetch("/activity/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      setItems((prev) =>
        prev.map((it) =>
          ids.includes(String(it._id)) ? { ...it, read: true } : it,
        ),
      );
    } catch (e) {}
  }

  async function clearAll() {
    const ids = items.map((i) => String(i._id));
    if (ids.length) await markRead(ids);
    setOpen(false);
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setOpen((v) => !v);
          if (!open && unreadCount > 0) {
            const ids = items.filter((i) => !i.read).map((i) => String(i._id));
            if (ids.length) markRead(ids);
          }
        }}
        className={`relative p-2.5 rounded-2xl transition-all duration-300 ${
          open
            ? "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600"
            : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
        }`}
      >
        <Bell size={20} strokeWidth={2.5} />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-3.5 h-3.5 bg-red-500 border-2 border-white dark:border-gray-950 rounded-full flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-90 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-4xl shadow-2xl z-999 overflow-hidden"
          >
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">
                  Notifiche
                </h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                  Hai {unreadCount} nuovi messaggi
                </p>
              </div>
              {items.length > 0 && (
                <button
                  onClick={clearAll}
                  className="p-2 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-xl transition-all"
                  title="Segna tutto come letto"
                >
                  <Check size={16} />
                </button>
              )}
            </div>

            <div className="max-h-105 overflow-y-auto custom-scrollbar">
              {items.length === 0 ? (
                <div className="p-12 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-4xl flex items-center justify-center mb-4">
                    <BellOff size={24} className="text-gray-300" />
                  </div>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                    Tutto tranquillo
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Non hai ancora nessuna notifica.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
                  {items.map((it) => (
                    <button
                      key={it._id}
                      onClick={() => {
                        if (it.payload?.link) router.push(it.payload.link);
                        else if (it.payload?.pageId)
                          router.push(`/dashboard?page=${it.payload.pageId}`);
                        setOpen(false);
                      }}
                      className="w-full p-4 flex gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all text-left relative group"
                    >
                      <div
                        className={`mt-1 w-2 h-2 shrink-0 rounded-full ${it.read ? "bg-transparent" : "bg-cyan-600 shadow-[0_0_8px_rgba(147,51,234,0.5)]"}`}
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
                            {it.type || "Attività"}
                          </span>
                          <span className="text-[9px] font-bold text-gray-400">
                            •{" "}
                            {new Date(it.createdAt).toLocaleDateString(
                              "it-IT",
                              { day: "numeric", month: "short" },
                            )}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">
                          {it.title || "Nuovo aggiornamento"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                          {it.body ||
                            it.payload?.summary ||
                            "Dettagli non disponibili."}
                        </p>
                      </div>

                      <div className="shrink-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="p-1.5 bg-cyan-50 dark:bg-cyan-900/30 rounded-lg text-cyan-600">
                          <ArrowRight size={14} />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50">
              <button
                onClick={() => {
                  router.push("/activity");
                  setOpen(false);
                }}
                className="w-full py-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-600 dark:text-gray-300 hover:text-cyan-600 hover:border-cyan-200 transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <Sparkles size={14} />
                Centro Attività
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
