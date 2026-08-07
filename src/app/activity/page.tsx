"use client";
import React, { useEffect, useState, useCallback } from "react";
import { apiFetch } from "../../lib/api";

export default function ActivityPage() {
  const [items, setItems] = useState<any[]>([]);

  const load = useCallback(async () => {
    try {
      const res = await apiFetch("/activity/recent?limit=200");
      const json = await res.json();
      setItems(json.recent || []);
    } catch (e) {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => load(), 0);
    return () => clearTimeout(timer);
  }, [load]);

  return (
    <main className="max-w-4xl mx-auto py-16 px-4">
      <h1 className="text-2xl font-bold mb-4">Attività recenti</h1>
      <div className="space-y-3">
        {items.map((it) => (
          <div
            key={it._id}
            className="p-3 border border-gray-200 dark:border-gray-800 rounded bg-white dark:bg-gray-900"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-bold">{it.title || it.type}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{it.body}</div>
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">
                {new Date(it.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-sm text-gray-500 dark:text-gray-400">Nessuna attività.</div>
        )}
      </div>
    </main>
  );
}
