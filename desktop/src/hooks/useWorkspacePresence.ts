"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { getSocket } from "../lib/socket";
import type { WorkspaceMember, WorkspacePresenceUser } from "../lib/workspaces";

export type UseWorkspacePresenceOptions = {
  workspaceId: string | null | undefined;
  user?: { id?: string; name?: string; email?: string; picture?: string | null } | null;
  onMembersChanged?: (members: WorkspaceMember[]) => void;
  onTasksChanged?: () => void;
};

export type UseWorkspacePresenceResult = {
  online: WorkspacePresenceUser[];
  onlineIds: string[];
  isOnline: (userId?: string | null) => boolean;
};

function currentUserId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return (parsed["id"] as string) ?? (parsed["userId"] as string) ?? null;
  } catch {
    return null;
  }
}

/**
 * Real-time collaboration channel for a workspace.
 *
 * Joins the `ws:<workspaceId>` room so the server can:
 *  - broadcast who is online (`workspace-presence`)
 *  - notify about member changes (`workspace-updated`)
 *  - notify about task mutations made by other members
 *    (`workspace-tasks-changed`)
 */
export function useWorkspacePresence({
  workspaceId,
  user,
  onMembersChanged,
  onTasksChanged,
}: UseWorkspacePresenceOptions): UseWorkspacePresenceResult {
  const [online, setOnline] = useState<WorkspacePresenceUser[]>([]);
  const joinedRef = useRef<string | null>(null);

  // keep callbacks fresh without re-joining the room
  const membersCb = useRef(onMembersChanged);
  const tasksCb = useRef(onTasksChanged);
  membersCb.current = onMembersChanged;
  tasksCb.current = onTasksChanged;

  useEffect(() => {
    if (!workspaceId) {
      setOnline([]);
      joinedRef.current = null;
      return;
    }
    let socket: ReturnType<typeof getSocket> | null = null;
    try {
      socket = getSocket();
    } catch {
      socket = null;
    }
    if (!socket) return;

    const selfId = user?.id ?? currentUserId() ?? undefined;
    socket.emit("workspace-join", {
      workspaceId,
      user: {
        id: selfId,
        name: user?.name ?? "Collaboratore",
        email: user?.email ?? "",
        picture: user?.picture ?? null,
      },
    });
    joinedRef.current = workspaceId;

    const onPresence = (payload: { workspaceId?: string; online?: WorkspacePresenceUser[] }) => {
      if (payload?.workspaceId && payload.workspaceId !== workspaceId) return;
      setOnline(Array.isArray(payload?.online) ? payload.online : []);
    };
    const onUpdated = (payload: { workspaceId?: string; members?: WorkspaceMember[] }) => {
      if (payload?.workspaceId && payload.workspaceId !== workspaceId) return;
      if (Array.isArray(payload?.members)) membersCb.current?.(payload.members);
    };
    const onTasks = (payload: { workspaceId?: string }) => {
      if (payload?.workspaceId && payload.workspaceId !== workspaceId) return;
      tasksCb.current?.();
    };

    socket.on("workspace-presence", onPresence);
    socket.on("workspace-updated", onUpdated);
    socket.on("workspace-tasks-changed", onTasks);

    return () => {
      socket?.emit("workspace-leave", { workspaceId });
      socket?.off("workspace-presence", onPresence);
      socket?.off("workspace-updated", onUpdated);
      socket?.off("workspace-tasks-changed", onTasks);
      joinedRef.current = null;
    };
  }, [workspaceId, user?.id, user?.name, user?.email, user?.picture]);

  const onlineIds = online.map((u) => String(u.userId));
  const isOnline = useCallback(
    (userId?: string | null) => (userId ? onlineIds.includes(String(userId)) : false),
    [onlineIds],
  );

  return { online, onlineIds, isOnline };
}