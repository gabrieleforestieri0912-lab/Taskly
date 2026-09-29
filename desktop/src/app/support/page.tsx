
"use client";
import React, { useState } from "react";

export default function SupportPage() {
  const [message, setMessage] = useState("");

  const handleSend = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent("Feedback Taskly");
    const body = encodeURIComponent(message || "");
    window.location.href = `mailto:support@taskly.example?subject=${subject}&body=${body}`;
  };

  return (
    <main className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-4">Supporto</h1>
      <p className="text-gray-700 mb-6">
        Se hai bisogno di aiuto o vuoi inviare feedback, scrivici qui sotto.
      </p>

      <form onSubmit={handleSend} className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Messaggio</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-200 p-3 text-sm bg-white dark:bg-zinc-900"
            rows={6}
            placeholder="Descrivi il problema o il feedback..."
          />
        </label>

        <div>
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg"
          >
            Invia via email
          </button>
        </div>
      </form>
    </main>
  );
}





