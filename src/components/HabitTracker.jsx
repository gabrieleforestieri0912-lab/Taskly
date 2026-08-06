"use client";
import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Check } from "lucide-react";
import HabitCard from "./HabitCard";

function daysInMonth(month, year) {
  return new Date(year, month + 1, 0).getDate();
}

function monthLabel(month, year) {
  return new Date(year, month, 1).toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  });
}

export default function HabitTracker({ initialMonth, initialYear }) {
  const now = new Date();
  const [month, setMonth] = useState(
    typeof initialMonth === "number" ? initialMonth : now.getMonth(),
  );
  const [year, setYear] = useState(
    typeof initialYear === "number" ? initialYear : now.getFullYear(),
  );

  const key = `habit_tracker_${year}_${month}`;
  const [days, setDays] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch {}
    const n = daysInMonth(month, year);
    return Array.from({ length: n }, (_, i) => ({
      day: i + 1,
      habits: [],
    }));
  });

  useEffect(() => {
    const n = daysInMonth(month, year);
    setDays((prev) => {
      const next = Array.from({ length: n }, (_, i) => {
        const existing = prev && prev[i] ? prev[i] : null;
        return existing
          ? { day: i + 1, habits: existing.habits || [] }
          : { day: i + 1, habits: [] };
      });
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {}
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(days));
    } catch {}
  }, [days, key]);

  const [editingDay, setEditingDay] = useState(null);
  const [newHabitText, setNewHabitText] = useState("");

  const openEditor = (dayObj) => {
    setEditingDay(JSON.parse(JSON.stringify(dayObj)));
    setNewHabitText("");
  };

  const closeEditor = () => setEditingDay(null);

  const saveEditor = () => {
    setDays((prev) =>
      prev.map((d) => (d.day === editingDay.day ? editingDay : d)),
    );
    closeEditor();
  };

  const toggleHabit = (idx) => {
    setEditingDay((prev) => {
      const h = prev.habits.map((hb, i) =>
        i === idx ? { ...hb, done: !hb.done } : hb,
      );
      return { ...prev, habits: h };
    });
  };

  const addHabit = () => {
    if (!newHabitText.trim()) return;
    setEditingDay((prev) => ({
      ...prev,
      habits: [
        ...(prev.habits || []),
        { text: newHabitText.trim(), done: false },
      ],
    }));
    setNewHabitText("");
  };

  const removeHabit = (idx) => {
    setEditingDay((prev) => ({
      ...prev,
      habits: prev.habits.filter((_, i) => i !== idx),
    }));
  };

  const completedCount = (d) =>
    d.habits ? d.habits.filter((h) => h.done).length : 0;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const prev = new Date(year, month - 1, 1);
              setMonth(prev.getMonth());
              setYear(prev.getFullYear());
            }}
            className="p-2 rounded-lg hover:bg-gray-100"
            title="Mese precedente"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="font-bold">{monthLabel(month, year)}</div>

          <button
            onClick={() => {
              const next = new Date(year, month + 1, 1);
              setMonth(next.getMonth());
              setYear(next.getFullYear());
            }}
            className="p-2 rounded-lg hover:bg-gray-100"
            title="Mese successivo"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-3">
        {days.map((d) => (
          <HabitCard key={d.day} dayObj={d} onClick={() => openEditor(d)} />
        ))}
      </div>

      {editingDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl w-[min(720px,95%)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">
                Giorno {editingDay.day} — {monthLabel(month, year)}
              </h3>
              <button
                onClick={closeEditor}
                className="p-2 rounded-md hover:bg-gray-100"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  value={newHabitText}
                  onChange={(e) => setNewHabitText(e.target.value)}
                  placeholder="Aggiungi nuova abitudine"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50"
                />
                <button
                  onClick={addHabit}
                  className="px-4 py-2 bg-cyan-600 text-white rounded-lg"
                >
                  Aggiungi
                </button>
              </div>

              <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {(editingDay.habits || []).map((h, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-3 p-2 border border-gray-100 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleHabit(i)}
                        className="p-1 rounded bg-gray-50"
                      >
                        <Check
                          size={16}
                          className={
                            h.done ? "text-emerald-500" : "text-gray-300"
                          }
                        />
                      </button>
                      <div
                        className={h.done ? "line-through text-gray-400" : ""}
                      >
                        {h.text}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => removeHabit(i)}
                        className="text-red-500 px-2 py-1 rounded hover:bg-red-50"
                      >
                        Elimina
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={closeEditor}
                  className="px-4 py-2 rounded-lg border"
                >
                  Annulla
                </button>
                <button
                  onClick={saveEditor}
                  className="px-4 py-2 bg-cyan-600 text-white rounded-lg"
                >
                  Salva
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
