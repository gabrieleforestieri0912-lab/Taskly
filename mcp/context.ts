// ============================================================================
// Taskly MCP — runtime context
//
// The MCP server operates as a single, pre-configured Taskly account (the
// "connected user"). Identity is resolved once at startup from the environment:
//
//   TASKLY_USER_ID          – directly scope to a Supabase auth user id
//   TASKLY_USER_EMAIL       – resolve the profile by email (fallback)
//   TASKLY_WORKSPACE        – slug | name | id of the *active* workspace
//
// `taskly_set_workspace` lets the AI switch the active workspace at runtime.
// ============================================================================
import "dotenv/config";
import { randomUUID } from "crypto";
import {
  getProfileByEmail,
  listWorkspacesForUser,
} from "../src/lib/server/db";

export interface TasklyContext {
  userId: string;
  email: string | null;
  workspaceId: string | null;
  workspaceName: string | null;
}

let ctx: TasklyContext | null = null;

export async function initContext(): Promise<TasklyContext> {
  const userId = process.env.TASKLY_USER_ID?.trim();
  const email = process.env.TASKLY_USER_EMAIL?.trim();
  const workspaceHint = process.env.TASKLY_WORKSPACE?.trim();

  if (!userId && !email) {
    throw new Error(
      "MCP: configura TASKLY_USER_ID oppure TASKLY_USER_EMAIL nel file .env " +
        "(es. TASKLY_USER_EMAIL=you@example.com)",
    );
  }

  let resolvedUserId = userId;
  let resolvedEmail = email ?? null;

  if (!resolvedUserId && resolvedEmail) {
    const profile = await getProfileByEmail(resolvedEmail);
    if (!profile) {
      throw new Error(`MCP: nessun profilo Taskly per l'email "${resolvedEmail}"`);
    }
    resolvedUserId = profile.id;
    resolvedEmail = profile.email ?? resolvedEmail;
  }

  // Workspace resolution is best-effort: if Supabase is unreachable at startup
  // the server still boots and the workspace-scoped tools fail gracefully.
  let workspaces: Awaited<ReturnType<typeof listWorkspacesForUser>> = [];
  try {
    workspaces = await listWorkspacesForUser(resolvedUserId!);
  } catch (err) {
    console.error(
      "[taskly-mcp] avviso: impossibile caricare i workspace al boot:",
      err instanceof Error ? err.message : err,
    );
  }
  let workspaceId: string | null = null;
  let workspaceName: string | null = null;

  if (workspaces.length > 0) {
    const match = workspaceHint
      ? workspaces.find(
          (w) =>
            !!w &&
            (w._id === workspaceHint ||
              w.slug === workspaceHint ||
              w.name.toLowerCase() === workspaceHint.toLowerCase()),
        )
      : null;
    const active = match ?? workspaces[0];
    if (active) {
      workspaceId = active._id;
      workspaceName = active.name;
    }
  }

  ctx = {
    userId: resolvedUserId!,
    email: resolvedEmail,
    workspaceId,
    workspaceName,
  };
  return ctx;
}

export function getContext(): TasklyContext {
  if (!ctx) throw new Error("MCP context non ancora inizializzato");
  return ctx;
}

export function setWorkspace(workspaceId: string, name?: string): void {
  if (!ctx) throw new Error("MCP context non ancora inizializzato");
  ctx.workspaceId = workspaceId;
  if (name) ctx.workspaceName = name;
}

export function newId(): string {
  return randomUUID();
}
