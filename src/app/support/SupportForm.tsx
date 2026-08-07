"use client";
import React, { useState } from "react";

export default function SupportForm() {
  const [message, setMessage] = useState("");

  const handleSend = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent("Feedback Taskly");
    const body = encodeURIComponent(message || "");
    window.location.href = `mailto:support@taskly.example?subject=${subject}&body=${body}`;
  };

  return (
    <form onSubmit={handleSend} className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Messaggio</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100"
          rows={6}
          placeholder="Descrivi il problema o il feedback..."
        />
      </label>

      <div>
        <button
          type="submit"
          className="px-4 py-2 bg-cyan-600 text-white rounded-lg"
        >
          Invia via email
        </button>
      </div>
    </form>
  );
}
