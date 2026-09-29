"use client";
import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Building2, Loader2, Plus, Shield, UserPlus, Users } from "lucide-react";
import {
  ROLE_LABELS,
  createWorkspace,
  listWorkspaces,
  myRole,
  type Workspace,
} from "../../lib/workspaces";

function initialsOf(label: string): string {
  const text = (label || "?").trim();
  const parts = text.split(/[\s@._-]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return text.slice(0, 2).toUpperCase();
}

function readUserId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("user");
    const parsed = raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
    return (parsed?.["id"] as string) ?? (parsed?.["userId"] as string) ?? null;
  } catch {
    return null;
  }
}

export default function WorkspacesPage(): React.JSX.Element {
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    setUserId(readUserId());
  }, []);

  const load = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      setWorkspaces(await listWorkspaces());
    } catch {
      setError("Impossibile caricare i workspace.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = async (): Promise<void> => {
    const value = name.trim();
    if (!value || creating) return;
    setCreating(true);
    setError(null);
    try {
      const ws = await createWorkspace(value);
      setName("");
      await load();
      router.push(`/workspace/${ws._id}`);
    } catch (err) {
      setError(
        err instanceof Error && err.message === "slug_exists"
          ? "Esiste gia un workspace con questo nome."
          : "Errore durante la creazione.",
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-6 py-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="space-y-1">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">Workspace</h1>
          <p className="text-sm text-gray-500">
            Crea un ambiente di lavoro e condividilo con il tuo team. Nei workspace condivisi piu
            utenti collaborano su task, board e documenti.
          </p>
        </header>

        <section className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            Nuovo workspace
          </label>
          <div className="mt-2 flex flex-col sm:flex-row gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleCreate();
              }}
              placeholder="Es. Progetto Alfa"
              className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            />
            <button
              onClick={() => void handleCreate()}
              disabled={creating || !name.trim()}
              className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white px-4 py-2.5 text-sm font-bold"
            >
              {creating ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
              Crea
            </button>
          </div>
        </section>

        {error && (
          <p className="rounded-xl bg-red-50 dark:bg-red-900/20 px-4 py-3 text-xs font-semibold text-red-600 dark:text-red-300">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-sm text-gray-500">Caricamento workspace...</p>
        ) : workspaces.length === 0 ? (
          <p className="text-sm text-gray-500 italic">
            Nessun workspace. Creane uno per iniziare a collaborare.
          </p>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {workspaces.map((ws) => {
              const role = myRole(ws, userId);
              return (
                <li
                  key={ws._id}
                  className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 flex flex-col gap-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-lg font-black truncate">{ws.name}</h2>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        {role ? ROLE_LABELS[role] : "Membro"}
                      </p>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-gray-500 shrink-0">
                      <Users size={13} />
                      {ws.members.length}
                    </span>
                  </div>

                  <ul className="space-y-1.5">
                    {ws.members.slice(0, 4).map((m) => (
                      <li key={m.userId} className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-purple-500/15 flex items-center justify-center text-[9px] font-black uppercase text-purple-600">
                          {initialsOf(m.name || m.email)}
                        </span>
                        <span className="text-xs text-gray-600 dark:text-gray-300 truncate">
                          {m.name || m.email}
                        </span>
                        {m.role === "owner" && <Shield size={11} className="text-emerald-500 shrink-0" />}
                      </li>
                    ))}
                    {ws.members.length > 4 && (
                      <li className="text-[10px] text-gray-400">+{ws.members.length - 4} altri</li>
                    )}
                  </ul>

                  <div className="mt-auto flex gap-2">
                    <Link
                      href={`/workspace/${ws._id}`}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-3 py-2.5 text-sm font-bold"
                    >
                      <Building2 size={15} />
                      Apri
                    </Link>
                    <Link
                      href={`/workspace/${ws._id}/board`}
                      className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-2.5 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      Board
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <p className="text-xs text-gray-400 flex items-center gap-2">
          <UserPlus size={13} />
          Per entrare in un workspace condiviso, chiedi al proprietario di invitarti via email.
        </p>
      </div>
    </div>
  );
}