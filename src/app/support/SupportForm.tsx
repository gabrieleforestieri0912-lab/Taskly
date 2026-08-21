"use client";
import React, { useState } from "react";

export default function SupportForm() {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, email, name }),
      });

      if (res.ok) {
        setStatus("success");
        setMessage("");
        setEmail("");
        setName("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Messaggio inviato!
        </h3>
        <p className="text-gray-500 mb-6">
          Grazie per averci contattato. Risponderemo entro 24 ore.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="text-sm font-semibold text-cyan-600 hover:text-cyan-700"
        >
          Invia un altro messaggio
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSend} className="space-y-4">
      <div>
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Nome (opzionale)</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100"
            placeholder="Il tuo nome"
          />
        </label>
      </div>

      <div>
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email (opzionale)</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100"
            placeholder="tua@email.it"
          />
        </label>
      </div>

      <div>
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Messaggio</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100"
            rows={6}
            placeholder="Descrivi il problema o il feedback..."
            required
          />
        </label>
      </div>

      {status === "error" && (
        <p className="text-sm text-red-500">
          Errore nell&apos;invio. Riprova più tardi.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending" || !message.trim()}
        className="w-full py-3 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:hover:bg-cyan-600 flex items-center justify-center gap-2"
      >
        {status === "sending" ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Invio in corso...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Invia messaggio
          </>
        )}
      </button>
    </form>
  );
}
