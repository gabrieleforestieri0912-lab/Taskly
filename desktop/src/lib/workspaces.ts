import { apiFetch } from "./api";

export type WorkspaceRole = "owner" | "admin" | "member" | "viewer";

export const ASSIGNABLE_ROLES: WorkspaceRole[] = ["admin", "member", "viewer"];

export type WorkspaceMember = {
  userId: string;
  role: WorkspaceRole;
  joinedAt?: string;
  name?: string;
  email?: string;
  picture?: string | null;
};

export type Workspace = {
  _id: string;
  id?: string;
  name: string;
  slug?: string;
  ownerId?: string;
  createdAt?: string;
  updatedAt?: string;
  members: WorkspaceMember[];
};

export type WorkspacePresenceUser = {
  userId: string;
  name: string;
  email: string;
  picture?: string | null;
};

export const ROLE_LABELS: Record<WorkspaceRole, string> = {
  owner: "Proprietario",
  admin: "Amministratore",
  member: "Membro",
  viewer: "Osservatore",
};

export const ROLE_RANK: Record<WorkspaceRole, number> = {
  owner: 3,
  admin: 2,
  member: 1,
  viewer: 0,
};

export function canManageMembers(role?: WorkspaceRole | null): boolean {
  return role === "owner" || role === "admin";
}

export function canEditWorkspace(role?: WorkspaceRole | null): boolean {
  return role === "owner" || role === "admin" || role === "member";
}

function isMemberRole(value: unknown): value is WorkspaceRole {
  return value === "owner" || value === "admin" || value === "member" || value === "viewer";
}

function normalizeMember(raw: unknown): WorkspaceMember {
  const m = (raw || {}) as Record<string, unknown>;
  return {
    userId: String(m["userId"] ?? m["user_id"] ?? ""),
    role: isMemberRole(m["role"]) ? (m["role"] as WorkspaceRole) : "member",
    joinedAt: (m["joinedAt"] as string) ?? undefined,
    name: (m["name"] as string) ?? "",
    email: (m["email"] as string) ?? "",
    picture: (m["picture"] as string | null) ?? null,
  };
}

function normalizeWorkspace(raw: unknown): Workspace {
  const w = (raw || {}) as Record<string, unknown>;
  const members = Array.isArray(w["members"]) ? (w["members"] as unknown[]) : [];
  return {
    _id: String(w["_id"] ?? w["id"] ?? ""),
    id: w["id"] as string | undefined,
    name: String(w["name"] ?? "Workspace"),
    slug: w["slug"] as string | undefined,
    ownerId: w["ownerId"] as string | undefined,
    createdAt: w["createdAt"] as string | undefined,
    updatedAt: w["updatedAt"] as string | undefined,
    members: members.map(normalizeMember),
  };
}

export async function listWorkspaces(): Promise<Workspace[]> {
  const res = await apiFetch("/workspaces");
  if (!res.ok) throw new Error("load_failed");
  const json: unknown = await res.json();
  return Array.isArray(json) ? json.map(normalizeWorkspace) : [];
}

export async function getWorkspace(id: string): Promise<Workspace> {
  const res = await apiFetch(`/workspaces/${id}`);
  if (res.status === 404) throw new Error("not_found");
  if (res.status === 403) throw new Error("forbidden");
  if (!res.ok) throw new Error("load_failed");
  return normalizeWorkspace(await res.json());
}

export async function createWorkspace(name: string): Promise<Workspace> {
  const res = await apiFetch("/workspaces", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: name.trim() }),
  });
  if (res.status === 409) throw new Error("slug_exists");
  if (!res.ok) throw new Error("create_failed");
  return normalizeWorkspace(await res.json());
}

export async function inviteMember(
  workspaceId: string,
  email: string,
  role: WorkspaceRole,
): Promise<Workspace> {
  const res = await apiFetch(`/workspaces/${workspaceId}/members`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim(), role }),
  });
  if (res.status === 403) throw new Error("forbidden");
  if (res.status === 404) throw new Error("user_not_found");
  if (!res.ok) throw new Error("invite_failed");
  return normalizeWorkspace(await res.json());
}

export async function updateMemberRole(
  workspaceId: string,
  userId: string,
  role: WorkspaceRole,
): Promise<Workspace> {
  const res = await apiFetch(`/workspaces/${workspaceId}/members/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
  if (res.status === 403) throw new Error("forbidden");
  if (res.status === 404) throw new Error("user_not_found");
  if (res.status === 400) throw new Error("cannot_change_owner");
  if (!res.ok) throw new Error("update_failed");
  return normalizeWorkspace(await res.json());
}

export async function removeMember(workspaceId: string, userId: string): Promise<Workspace> {
  const res = await apiFetch(`/workspaces/${workspaceId}/members/${userId}`, {
    method: "DELETE",
  });
  if (res.status === 403) throw new Error("forbidden");
  if (res.status === 404) throw new Error("user_not_found");
  if (!res.ok) throw new Error("remove_failed");
  return normalizeWorkspace(await res.json());
}

/** The caller's own role inside a workspace (null when not a member). */
export function myRole(workspace: Workspace | null, userId?: string | null): WorkspaceRole | null {
  if (!workspace || !userId) return null;
  const me = workspace.members.find((m) => String(m.userId) === String(userId));
  return me ? me.role : null;
}