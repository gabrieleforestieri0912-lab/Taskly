"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import MiniChat from "../../../../components/MiniChat";
import TaskBoard from "../../../../components/TaskBoard";
import {
  canEditWorkspace,
  getWorkspace,
  myRole,
  type Workspace,
} from "../../../../lib/workspaces";

export default function BoardPage(): React.JSX.Element {
  const params = useParams<{ id?: string | string[] }>();
  const raw = params?.id;
  const workspaceId = Array.isArray(raw) ? (raw[0] ?? "") : (raw ?? "");
  const [userId, setUserId] = useState<string | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const rawUser = localStorage.getItem("user");
      const parsed = rawUser ? (JSON.parse(rawUser) as Record<string, unknown>) : null;
      setUserId((parsed?.["id"] as string) ?? (parsed?.["userId"] as string) ?? null);
    } catch {
      setUserId(null);
    }
  }, []);

  useEffect(() => {
    if (!workspaceId) return;
    let cancelled = false;
    getWorkspace(workspaceId)
      .then((ws) => {
        if (!cancelled) setWorkspace(ws);
      })
      .catch(() => {
        if (!cancelled) setWorkspace(null);
      });
    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  const role = myRole(workspace, userId);
  // Unknown role (still loading, or legacy "personal" board) keeps edit rights.
  const canEdit = role === null ? true : canEditWorkspace(role);

  return (
    <>
      <TaskBoard workspace={workspaceId} canEdit={canEdit} />
      <MiniChat workspaceId={workspaceId} enabled />
    </>
  );
}
