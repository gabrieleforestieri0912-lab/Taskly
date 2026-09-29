"use client";
import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { Loader2, Share2, Sparkles, Users } from "lucide-react";
import { EVT_TOGGLE } from "../../../lib/aiChatBus";
import ShareWorkspaceModal from "../../../components/ShareWorkspaceModal";
import { useWorkspacePresence } from "../../../hooks/useWorkspacePresence";
import {
  getWorkspace,
  type Workspace,
  type WorkspaceMember,
} from "../../../lib/workspaces";

function isDashboardRoute(pathname: string | null): boolean {
  if (!pathname) return true;
  const parts = pathname.split("/").filter(Boolean);
  // /workspace/[id] -> ["workspace", id] => dashboard (overview)
  // /workspace/[id]/board|doc/... => work pages with minichat
  if (parts.length < 2 || parts[0] !== "workspace") return false;
  return parts.length === 2;
}

type LocalUser = { id?: string; name?: string; email?: string; picture?: string | null } | null;

function readLocalUser(): LocalUser {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("user");
    return raw ? (JSON.parse(raw) as LocalUser) : null;
  } catch {
    return null;
  }
}

function initialsOf(label: string): string {
  const text = (label || "?").trim();
  const parts = text.split(/[\s@._-]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return text.slice(0, 2).toUpperCase();
}

/** Stacked avatars of the collaborators currently online in the workspace. */
function PresenceAvatars({
  online,
  total,
}: {
  online: { userId: string; name: string; email: string }[];
  total: number;
}): React.JSX.Element | null {
  if (online.length === 0) return null;
  const shown = online.slice(0, 4);
  return (
    <div className="flex items-center gap-1" title={`${online.length} online`}>
      <div className="flex -space-x-2">
        {shown.map((u) => (
          <span
            key={u.userId}
            className="w-7 h-7 rounded-full border-2 border-white dark:border-gray-900 bg-emerald-500/20 flex items-center justify-center"
            title={u.name || u.email || "Collaboratore"}
          >
            <span className="text-[9px] font-black uppercase text-emerald-700 dark:text-emerald-300">
              {initialsOf(u.name || u.email)}
            </span>
          </span>
        ))}
      </div>
      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
        {online.length} online{total > online.length ? ` · ${total} membri` : ""}
      </span>
    </div>
  );
}

function WorkspaceChrome({ children }: { children: React.ReactNode }): React.JSX.Element {
  const params = useParams<{ id?: string | string[] }>();
  const pathname = usePathname();
  const rawId = params?.id;
  const workspaceId = Array.isArray(rawId) ? rawId[0] ?? "" : (rawId ?? "");
  const showMiniChat = !isDashboardRoute(pathname);

  const [isShareOpen, setIsShareOpen] = useState(false);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [currentUser, setCurrentUser] = useState<LocalUser>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setCurrentUser(readLocalUser());
  }, []);

  const loadWorkspace = useCallback(async (): Promise<void> => {
    if (!workspaceId) return;
    setLoading(true);
    setNotFound(false);
    try {
      const ws = await getWorkspace(workspaceId);
      setWorkspace(ws);
    } catch {
      setWorkspace(null);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  // Live collaboration: presence + member/task change notifications.
  const handleMembersChanged = useCallback((members: WorkspaceMember[]) => {
    setWorkspace((prev) => (prev ? { ...prev, members } : prev));
  }, []);
  const { online: presenceOnline, onlineIds } = useWorkspacePresence({
    workspaceId: workspaceId || null,
    user: currentUser,
    onMembersChanged: handleMembersChanged,
  });

  const toggleMiniChat = (): void => {
    window.dispatchEvent(new Event(EVT_TOGGLE));
  };

  return (
    <div className="relative min-h-screen">
      <header className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between max-w-7xl mx-auto gap-3">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">
              {workspace?.name ?? `Workspace ${workspaceId}`}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {notFound
                ? "Workspace non trovato: chiedi un invito al proprietario."
                : showMiniChat
                  ? "Minichat AI disponibile in questa pagina"
                  : "Dashboard overview: trascina i widget, niente minichat qui"}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <PresenceAvatars
              online={presenceOnline}
              total={workspace?.members.length ?? 0}
            />
            <Link
              href={`/workspace/${workspaceId}`}
              className="px-3 py-2 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Dashboard
            </Link>
            <Link
              href={`/workspace/${workspaceId}/board`}
              className="px-3 py-2 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Board
            </Link>
            <button
              onClick={() => setIsShareOpen(true)}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 disabled:opacity-50"
              title="Gestisci i membri del workspace"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Share2 size={16} />
              )}
              <span className="font-semibold text-sm">Condividi</span>
              {workspace && workspace.members.length > 0 && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Users size={12} />
                  {workspace.members.length}
                </span>
              )}
            </button>
            {showMiniChat && (
              <button
                onClick={toggleMiniChat}
                aria-label="Toggle minichat AI workspace"
                title="Toggle minichat AI (solo board/doc)"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-colors"
              >
                <Sparkles size={18} />
                <span className="font-semibold">AI Chat</span>
              </button>
            )}
          </div>
        </div>
      </header>
      <main className="p-6">{children}</main>

      <ShareWorkspaceModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        workspaceId={workspaceId}
        workspace={workspace}
        currentUserId={currentUser?.id ?? null}
        onlineIds={onlineIds}
        onWorkspaceUpdate={(ws) => setWorkspace(ws)}
      />
    </div>
  );
}

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return <WorkspaceChrome>{children}</WorkspaceChrome>;
}


