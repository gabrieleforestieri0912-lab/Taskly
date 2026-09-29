"use client";
import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Copy,
  Link2,
  Loader2,
  LogOut,
  Shield,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import {
  ASSIGNABLE_ROLES,
  ROLE_LABELS,
  canManageMembers,
  inviteMember,
  removeMember,
  updateMemberRole,
  type Workspace,
  type WorkspaceRole,
} from "../lib/workspaces";

export type ShareWorkspaceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  workspace: Workspace | null;
  currentUserId?: string | null;
  onlineIds?: string[];
  onWorkspaceUpdate: (workspace: Workspace) => void;
};

type Notice = { kind: "ok" | "error"; text: string } | null;

const ERROR_MESSAGES: Record<string, string> = {
  forbidden: "Non hai i permessi per gestire i membri.",
  user_not_found: "Nessun utente registrato con questa email.",
  cannot_change_owner: "Il ruolo proprietario non puo essere modificato.",
  cannot_remove_owner: "Il proprietario non puo essere rimosso.",
  slug_exists: "Esiste gia un workspace con questo nome.",
  load_failed: "Impossibile caricare i dati del workspace.",
  create_failed: "Errore durante la creazione.",
  invite_failed: "Errore durante l'invito.",
  update_failed: "Errore durante l'aggiornamento del ruolo.",
  remove_failed: "Errore durante la rimozione.",
  network: "Errore di rete.",
};

function messageOf(err: unknown): string {
  const key = err instanceof Error ? err.message : "network";
  return ERROR_MESSAGES[key] ?? "Si e verificato un errore.";
}

function initials(label: string): string {
  const text = (label || "?").trim();
  const parts = text.split(/[\s@._-]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return text.slice(0, 2).toUpperCase();
}

function displayName(member: { name?: string; email?: string }): string {
  return member.name?.trim() || member.email || "Utente";
}

export default function ShareWorkspaceModal({
  isOpen,
  onClose,
  workspaceId,
  workspace,
  currentUserId,
  onlineIds = [],
  onWorkspaceUpdate,
}: ShareWorkspaceModalProps): React.JSX.Element | null {
  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>("member");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [copied, setCopied] = useState(false);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setNotice(null);
      setEmail("");
      setCopied(false);
    }
  }, [isOpen, workspaceId]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  const myRole = useMemo(() => {
    if (!workspace || !currentUserId) return null;
    return workspace.members.find((m) => String(m.userId) === String(currentUserId))?.role ?? null;
  }, [workspace, currentUserId]);

  const mayManage = canManageMembers(myRole);
  const isSelfOwner = myRole === "owner";
  const shareUrl =
    typeof window !== "undefined" && workspaceId
      ? `${window.location.origin}/workspace/${workspaceId}`
      : "";

  const handleInvite = async (): Promise<void> => {
    const target = email.trim();
    if (!target || busy) return;
    setBusy(true);
    setNotice(null);
    try {
      const updated = await inviteMember(workspaceId, target, inviteRole);
      onWorkspaceUpdate(updated);
      setEmail("");
      setNotice({ kind: "ok", text: `${target} invitato come ${ROLE_LABELS[inviteRole]}.` });
    } catch (err) {
      setNotice({ kind: "error", text: messageOf(err) });
    } finally {
      setBusy(false);
    }
  };

  const handleRoleChange = async (userId: string, role: WorkspaceRole): Promise<void> => {
    if (busy) return;
    setBusy(true);
    setPendingUserId(userId);
    setNotice(null);
    try {
      const updated = await updateMemberRole(workspaceId, userId, role);
      onWorkspaceUpdate(updated);
      setNotice({ kind: "ok", text: "Ruolo aggiornato." });
    } catch (err) {
      setNotice({ kind: "error", text: messageOf(err) });
    } finally {
      setPendingUserId(null);
      setBusy(false);
    }
  };

  const handleRemove = async (userId: string, name: string): Promise<void> => {
    if (busy) return;
    setBusy(true);
    setPendingUserId(userId);
    setNotice(null);
    try {
      const updated = await removeMember(workspaceId, userId);
      onWorkspaceUpdate(updated);
      setNotice({ kind: "ok", text: `${name} non fa piu parte del workspace.` });
    } catch (err) {
      setNotice({ kind: "error", text: messageOf(err) });
    } finally {
      setPendingUserId(null);
      setBusy(false);
    }
  };

  const handleCopy = async (): Promise<void> => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setNotice({ kind: "error", text: "Impossibile copiare il link." });
    }
  };

  const members = workspace?.members ?? [];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[130] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Condividi workspace"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden"
          >
            <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-600/10 flex items-center justify-center">
                  <Users size={17} className="text-purple-600" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-gray-900 dark:text-white leading-none">
                    Condividi workspace
                  </h2>
                  <p className="text-[11px] text-gray-500 mt-1">
                    {workspace?.name ?? "Workspace"} · {members.length}{" "}
                    {members.length === 1 ? "membro" : "membri"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Chiudi"
              >
                <X size={16} />
              </button>
            </header>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {mayManage ? (
                <section className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Invita per email
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") void handleInvite();
                      }}
                      placeholder="collega@esempio.it"
                      className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                    />
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as WorkspaceRole)}
                      className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2.5 text-sm font-semibold"
                      aria-label="Ruolo"
                    >
                      {ASSIGNABLE_ROLES.map((r) => (
                        <option key={r} value={r}>
                          {ROLE_LABELS[r]}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => void handleInvite()}
                      disabled={busy || !email.trim()}
                      className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white px-4 py-2.5 text-sm font-bold"
                    >
                      {busy ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <UserPlus size={15} />
                      )}
                      Invita
                    </button>
                  </div>
                </section>
              ) : (
                <p className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2.5">
                  Solo i proprietari e gli amministratori possono invitare nuovi membri.
                </p>
              )}

              <section className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Link del workspace
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2.5">
                  <Link2 size={15} className="text-gray-400 shrink-0" />
                  <span className="flex-1 text-xs text-gray-600 dark:text-gray-300 truncate">
                    {shareUrl}
                  </span>
                  <button
                    onClick={() => void handleCopy()}
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest text-purple-600 hover:bg-purple-500/10"
                  >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    {copied ? "Copiato" : "Copia"}
                  </button>
                </div>
              </section>

              <section className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Membri del team
                </label>
                <ul className="space-y-2">
                  {members.length === 0 && (
                    <li className="text-xs text-gray-500 italic">
                      Nessun membro. Invita qualcuno per iniziare a collaborare.
                    </li>
                  )}
                  {members.map((m) => {
                    const isSelf = String(m.userId) === String(currentUserId);
                    const isOnline = onlineIds.includes(String(m.userId));
                    const label = displayName(m);
                    return (
                      <li
                        key={m.userId}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 dark:border-gray-800 px-4 py-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative w-9 h-9 rounded-full bg-purple-500/15 flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-black uppercase text-purple-600">
                              {initials(label)}
                            </span>
                            <span
                              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${
                                isOnline ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"
                              }`}
                              title={isOnline ? "Online" : "Offline"}
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">
                              {label}
                              {isSelf ? " (tu)" : ""}
                            </p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                              {m.email || "-"} · {isOnline ? "online" : "offline"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {m.role === "owner" ? (
                            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-600">
                              <Shield size={12} />
                              {ROLE_LABELS.owner}
                            </span>
                          ) : mayManage && !isSelfOwner ? (
                            <span className="text-[10px] text-gray-400 uppercase tracking-widest">
                              {ROLE_LABELS[m.role]}
                            </span>
                          ) : (
                            <select
                              value={m.role}
                              disabled={busy || !mayManage}
                              onChange={(e) =>
                                void handleRoleChange(m.userId, e.target.value as WorkspaceRole)
                              }
                              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-2 py-1.5 text-xs font-bold disabled:opacity-60"
                              aria-label={`Ruolo di ${label}`}
                            >
                              {ASSIGNABLE_ROLES.map((r) => (
                                <option key={r} value={r}>
                                  {ROLE_LABELS[r]}
                                </option>
                              ))}
                            </select>
                          )}

                          {m.role !== "owner" && (mayManage || isSelf) && (
                            <button
                              onClick={() => void handleRemove(m.userId, label)}
                              disabled={busy}
                              className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                              aria-label={isSelf ? "Esci dal workspace" : `Rimuovi ${label}`}
                              title={isSelf ? "Esci dal workspace" : "Rimuovi dal workspace"}
                            >
                              {isSelf ? <LogOut size={14} /> : <Trash2 size={14} />}
                            </button>
                          )}
                          {pendingUserId === m.userId && (
                            <Loader2 size={13} className="animate-spin text-gray-400" />
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>

              {notice && (
                <p
                  className={`rounded-xl px-3.5 py-2.5 text-xs font-semibold ${
                    notice.kind === "ok"
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                      : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                  }`}
                  role="status"
                >
                  {notice.text}
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}