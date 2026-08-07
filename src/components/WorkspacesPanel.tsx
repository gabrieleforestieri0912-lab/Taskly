"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Building2,
  Users,
  Shield,
  UserPlus,
  Trash2,
  ArrowLeft,
  ChevronDown,
} from "lucide-react";
import { apiFetch } from "../lib/api";

const ROLES = ["owner", "admin", "member", "viewer"];

export default function WorkspacesPanel() {
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // create
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");

  // members / invite
  const [openWs, setOpenWs] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [memberRole, setMemberRole] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/workspaces");
      if (!res.ok) {
        if (res.status === 401) {
          setError("Accedi per gestire i team.");
          setLoading(false);
          return;
        }
        throw new Error("load");
      }
      const json = await res.json();
      setWorkspaces(Array.isArray(json) ? json : []);
    } catch {
      setError("Impossibile caricare i workspace.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createWorkspace() {
    if (!newName.trim()) return;
    try {
      const res = await apiFetch("/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (res.ok) {
        setNewName("");
        setShowCreate(false);
        await load();
      } else {
        setNotice("Errore durante la creazione.");
      }
    } catch {
      setNotice("Errore di rete.");
    }
  }

  async function inviteMember(wsId: string) {
    if (!inviteEmail.trim()) return;
    try {
      const res = await apiFetch(`/workspaces/${wsId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });
      if (res.ok) {
        setInviteEmail("");
        setNotice("Membro aggiunto.");
        await load();
      } else if (res.status === 403) {
        setNotice("Non hai i permessi per gestire i membri.");
      } else if (res.status === 404) {
        setNotice("Utente non trovato.");
      } else {
        setNotice("Errore durante l'invito.");
      }
    } catch {
      setNotice("Errore di rete.");
    }
  }

  async function changeRole(wsId: string, userId: string, role: string) {
    const member = (workspaces.find((w) => w._id === wsId)?.members || []).find(
      (m: any) => String(m.userId) === String(userId),
    );
    const email = member?.email || member?.userId;
    if (!email) return;
    try {
      const res = await apiFetch(`/workspaces/${wsId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      if (res.ok) {
        setNotice("Ruolo aggiornato.");
        await load();
      } else {
        setNotice("Impossibile aggiornare il ruolo.");
      }
    } catch {
      setNotice("Errore di rete.");
    }
  }

  const currentUserEmail =
    typeof window !== "undefined"
      ? (JSON.parse(localStorage.getItem("user") || "null") as any)?.email
      : null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-bold"
            >
              <ArrowLeft size={16} /> Dashboard
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreate((v) => !v)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-[#7b39fc] to-[#a67cff] text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-[#7b39fc]/25 hover:brightness-110 transition-all"
            >
              <Plus size={14} /> Nuovo Workspace
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="landing-heading-lg mb-1">Team &amp; Workspaces</h1>
        <p className="text-gray-400 text-sm font-medium mb-8">
          Gestisci i workspace condivisi, i membri e i loro ruoli.
        </p>

        {showCreate && (
          <div className="mb-8 p-5 rounded-3xl border border-[#7b39fc]/20 bg-white/5 dark:bg-white/5 backdrop-blur-xl flex flex-col sm:flex-row gap-3 items-center">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createWorkspace()}
              placeholder="Nome del workspace..."
              className="flex-1 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-[#7b39fc]/40 outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={createWorkspace}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-500/25 hover:brightness-110 transition-all"
              >
                Crea
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2.5 rounded-xl bg-white/5 text-gray-400 text-xs font-black uppercase tracking-widest hover:text-white transition-all"
              >
                Annulla
              </button>
            </div>
          </div>
        )}

        {notice && (
          <div className="mb-6 px-4 py-3 rounded-2xl bg-[#a67cff]/10 border border-[#a67cff]/20 text-xs font-bold text-[#a67cff]">
            {notice}
            <button
              onClick={() => setNotice(null)}
              className="ml-2 float-right"
            >
              ×
            </button>
          </div>
        )}

        {loading && (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 rounded-3xl border border-white/10 bg-white/5 animate-pulse"
              />
            ))}
          </div>
        )}

        {error && (
          <div className="py-16 text-center">
            <p className="text-sm font-bold text-gray-400">{error}</p>
          </div>
        )}

        {!loading && !error && workspaces.length === 0 && (
          <div className="py-20 text-center rounded-[2rem] border-2 border-dashed border-white/10">
            <Building2 size={40} className="mx-auto mb-4 text-[#7b39fc]" />
            <p className="text-sm font-black uppercase tracking-widest text-gray-400">
              Nessun workspace
            </p>
            <p className="text-xs text-gray-500 mt-2 font-medium">
              Crea il primo e invita i tuoi collaboratori.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {workspaces.map((ws) => {
            const members = ws.members || [];
            const isOpen = openWs === ws._id;
            return (
              <div
                key={ws._id}
                className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenWs(isOpen ? null : ws._id)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#7b39fc]/15 flex items-center justify-center">
                      <Building2 size={18} className="text-[#a67cff]" />
                    </div>
                    <div>
                      <p className="font-black text-gray-100">{ws.name || ws.slug}</p>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                        <Users size={12} /> {members.length} membri
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 border-t border-white/10">
                    {/* Invite */}
                    <div className="py-4 flex flex-col sm:flex-row gap-3 items-center">
                      <input
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && inviteMember(ws._id)}
                        placeholder="email@collaboratore.com"
                        className="flex-1 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-[#7b39fc]/40 outline-none"
                      />
                      <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-300 focus:ring-2 focus:ring-[#7b39fc]/40 outline-none"
                      >
                        <option value="member">Membro</option>
                        <option value="admin">Admin</option>
                        <option value="viewer">Visualizzatore</option>
                      </select>
                      <button
                        onClick={() => inviteMember(ws._id)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#7b39fc] text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-[#7b39fc]/25 hover:brightness-110 transition-all"
                      >
                        <UserPlus size={14} /> Invita
                      </button>
                    </div>

                    {/* Members list */}
                    <div className="space-y-2">
                      {members.length === 0 && (
                        <p className="text-xs text-gray-500 italic">
                          Nessun membro. Invita qualcuno per iniziare a collaborare.
                        </p>
                      )}
                      {members.map((m: any) => {
                        const isSelf =
                          currentUserEmail &&
                          String(m.email).toLowerCase() ===
                            String(currentUserEmail).toLowerCase();
                        return (
                          <div
                            key={String(m.userId)}
                            className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-full bg-[#a67cff]/20 flex items-center justify-center shrink-0">
                                <span className="text-[9px] font-black uppercase text-[#a67cff]">
                                  {String(m.email || "?").charAt(0)}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-gray-100 truncate">
                                  {m.email || "Membro"}
                                </p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">
                                  {m.role || "member"}
                                  {isSelf ? " · tu" : ""}
                                </p>
                              </div>
                            </div>
                            {m.role === "owner" ? (
                              <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                                <Shield size={12} /> Proprietario
                              </span>
                            ) : (
                              <select
                                value={memberRole[String(m.userId)] || m.role || "member"}
                                onChange={(e) => {
                                  setMemberRole((prev) => ({
                                    ...prev,
                                    [String(m.userId)]: e.target.value,
                                  }));
                                  changeRole(ws._id, m.userId, e.target.value);
                                }}
                                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs font-bold text-gray-300 focus:ring-2 focus:ring-[#7b39fc]/40 outline-none"
                              >
                                {ROLES.filter((r) => r !== "owner").map((r) => (
                                  <option key={r} value={r}>
                                    {r}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}