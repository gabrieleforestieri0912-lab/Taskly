"use client";

import React from "react";

export default function HabitCard({ dayObj, onClick }) {
  const d = dayObj || { day: 1, habits: [] };
  const total = d.habits ? d.habits.length : 0;
  const done = d.habits ? d.habits.filter((h) => h.done).length : 0;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <button
      onClick={onClick}
      className="p-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-left hover:shadow-md transition-all"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="font-bold text-sm">{d.day}</div>
        <div className="text-[11px] text-gray-400">{pct}%</div>
      </div>

      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
        <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
      </div>

      <ul className="text-[12px] text-gray-500 leading-relaxed min-h-8">
        {d.habits && d.habits.length > 0 ? (
          d.habits.slice(0, 3).map((h, i) => (
            <li key={i} className="flex items-center gap-2">
              <input type="checkbox" checked={h.done} readOnly />
              <span className={h.done ? "line-through text-gray-400" : ""}>
                {h.text}
              </span>
            </li>
          ))
        ) : (
          <li className="text-gray-300 italic">Nessuna abitudine</li>
        )}
      </ul>
    </button>
  );
}
