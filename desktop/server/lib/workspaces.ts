const { getSupabase } = require("./supabase");

/**
 * Workspaces + members helpers for the desktop server.
 *
 * Tables (created by supabase/schema.sql, shared with the web app):
 *   workspaces(id uuid, name, slug, owner_id, created_at, updated_at)
 *   workspace_members(workspace_id, user_id, role, joined_at)
 */

const ROLES = ["viewer", "member", "admin", "owner"];
const ROLE_RANK = ROLES.reduce((acc, role, i) => ({ ...acc, [role]: i }), {});

function roleAtLeast(role, min) {
  return (ROLE_RANK[role] ?? -1) >= (ROLE_RANK[min] ?? 0);
}

function slugify(value) {
  return (
    String(value || "workspace")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 64) || "workspace"
  );
}

function mapWorkspace(row, members) {
  return {
    _id: row.id,
    id: row.id,
    name: row.name,
    slug: row.slug,
    ownerId: row.owner_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    members: members || [],
  };
}

function mapMember(row, profile) {
  return {
    userId: row.user_id,
    role: row.role,
    joinedAt: row.joined_at,
    name: profile?.name || "",
    email: profile?.email || "",
    picture: profile?.picture || null,
  };
}

/** Fetch the member rows of a workspace joined with their profile data. */
async function listMembers(workspaceId) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("workspace_members")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("joined_at", { ascending: true });
  if (error) throw error;

  const members = data || [];
  const userIds = members.map((m) => m.user_id);
  let profiles = [];
  if (userIds.length) {
    const { data: pData } = await supabase
      .from("profiles")
      .select("id, name, email, picture")
      .in("id", userIds);
    profiles = pData || [];
  }
  const byId = new Map(profiles.map((p) => [p.id, p]));
  return members.map((m) => mapMember(m, byId.get(m.user_id)));
}

async function listWorkspacesForUser(userId) {
  const supabase = getSupabase();
  const { data: memberRows, error } = await supabase
    .from("workspace_members")
    .select("workspace_id, role, joined_at")
    .eq("user_id", userId);
  if (error) throw error;
  if (!memberRows || memberRows.length === 0) return [];

  const ids = memberRows.map((m) => m.workspace_id);
  const { data: wsRows, error: wsError } = await supabase
    .from("workspaces")
    .select("*")
    .in("id", ids);
  if (wsError) throw wsError;

  const { data: allMembers, error: mError } = await supabase
    .from("workspace_members")
    .select("*")
    .in("workspace_id", ids);
  if (mError) throw mError;

  const memberByWs = {};
  (allMembers || []).forEach((m) => {
    memberByWs[m.workspace_id] = memberByWs[m.workspace_id] || [];
    memberByWs[m.workspace_id].push({ userId: m.user_id, role: m.role, joinedAt: m.joined_at });
  });

  return (wsRows || [])
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .map((row) => mapWorkspace(row, memberByWs[row.id] || []));
}

async function createWorkspace(userId, { name, slug }) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("workspaces")
    .insert({ name, slug, owner_id: userId })
    .select("*")
    .maybeSingle();
  if (error) throw error;
  await supabase.from("workspace_members").insert({
    workspace_id: data.id,
    user_id: userId,
    role: "owner",
  });
  return mapWorkspace(data, await listMembers(data.id));
}

async function getWorkspaceForUser(userId, workspaceId) {
  const supabase = getSupabase();
  const { data: ws, error } = await supabase
    .from("workspaces")
    .select("*")
    .eq("id", workspaceId)
    .maybeSingle();
  if (error) throw error;
  if (!ws) return null;
  const members = await listMembers(workspaceId);
  if (!members.some((m) => String(m.userId) === String(userId))) return null;
  return mapWorkspace(ws, members);
}

async function getProfileByEmail(email) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, email, picture")
    .ilike("email", String(email).trim())
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function upsertMember(workspaceId, userId, role) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("workspace_members")
    .upsert(
      { workspace_id: workspaceId, user_id: userId, role },
      { onConflict: "workspace_id,user_id" },
    );
  if (error) throw error;
}

async function removeMember(workspaceId, userId) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("workspace_members")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId);
  if (error) throw error;
}

async function touchWorkspace(workspaceId) {
  const supabase = getSupabase();
  await supabase
    .from("workspaces")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", workspaceId);
}

/**
 * Resolve the caller's access level on a workspace.
 * Returns null when the workspace is unknown or the user is not a member.
 */
async function resolveAccess(userId, workspaceId, minRole = "viewer") {
  if (!userId || !workspaceId) return null;
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const role = data.role;
  if (!roleAtLeast(role, minRole)) return null;
  return { role, shared: role !== "owner" };
}

/** Ids of every workspace the user belongs to (shared + owned). */
async function accessibleWorkspaceIds(userId, minRole = "viewer") {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("workspace_members")
    .select("workspace_id, role")
    .eq("user_id", userId);
  if (error) throw error;
  return (data || [])
    .filter((m) => roleAtLeast(m.role, minRole))
    .map((m) => m.workspace_id);
}

module.exports = {
  ROLES,
  roleAtLeast,
  slugify,
  mapWorkspace,
  listMembers,
  listWorkspacesForUser,
  createWorkspace,
  getWorkspaceForUser,
  getProfileByEmail,
  upsertMember,
  removeMember,
  touchWorkspace,
  resolveAccess,
  accessibleWorkspaceIds,
};