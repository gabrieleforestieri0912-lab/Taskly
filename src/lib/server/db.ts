// ============================================================================
// Data-access layer — replaces the Mongoose models.
// Maps Postgres rows to the exact API shape the frontend expects
// (Mongo-style `_id`, camelCase fields, `id` for pages/goals/ideas).
// ============================================================================
import { getSupabase } from "./supabase";
import { randomUUID } from "crypto";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (v: unknown): boolean =>
  typeof v === "string" && UUID_RE.test(v);

// PostgREST caps a single request at `db-max-rows` (default 1000). For full
// collection reads we loop over ranges until we have everything.
const FETCH_PAGE_SIZE = 1000;

type QueryBuilder = {
  select: (cols: string) => any;
  range: (from: number, to: number) => any;
};

async function fetchAll(
  buildQuery: (sb: any) => any,
  select: string,
  filterFn?: (q: any) => any,
): Promise<any[]> {
  const supabase = getSupabase();
  const out: any[] = [];
  let from = 0;
  while (true) {
    let q = buildQuery(supabase)
      .select(select)
      .range(from, from + FETCH_PAGE_SIZE - 1);
    if (filterFn) q = filterFn(q);
    const { data, error } = await q;
    if (error) throw error;
    out.push(...(data || []));
    if (!data || data.length < FETCH_PAGE_SIZE) break;
    from += FETCH_PAGE_SIZE;
  }
  return out;
}

// Strips characters that would break PostgREST filter/or() syntax
// (`.` is the column/value separator in PostgREST filters)
function sanitizeSearchTerm(q: unknown): string {
  return String(q || "")
    .replace(/[.,\\(\\)\\*\\|\\"\\'\\`\\\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ---------------------------------------------------------------------------
// Row → API mappers
// ---------------------------------------------------------------------------
function mapProfile(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    picture: row.picture,
    subscription: row.subscription || { status: "inactive" },
    plannerMeta: row.planner_meta || {},
    createdAt: row.created_at,
  };
}

function mapTask(row: any) {
  if (!row) return null;
  return {
    _id: row.id,
    userId: row.user_id,
    workspaceId: row.workspace_id,
    title: row.title,
    description: row.description,
    status: row.status,
    assignee: row.assignee,
    dueDate: row.due_date,
    deadline: row.due_date ? row.due_date.slice(0, 10) : undefined,
    recurrence: row.recurrence,
    subtasks: row.subtasks || [],
    dependencies: row.dependencies || [],
    customFields: row.custom_fields || {},
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapWorkspace(row: any, members: any[] = []) {
  if (!row) return null;
  return {
    _id: row.id,
    name: row.name,
    slug: row.slug,
    ownerId: row.owner_id,
    members,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapDocument(row: any) {
  if (!row) return null;
  return {
    _id: row.id,
    userId: row.user_id,
    workspaceId: row.workspace_id,
    slug: row.slug,
    title: row.title,
    blocks: row.blocks || [],
    plainText: row.plain_text,
    backlinks: row.backlinks || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapPage(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    type: row.type,
    label: row.label,
    icon: row.icon,
    iconColor: row.icon_color,
    parentId: row.parent_id,
    purpose: row.purpose,
    isTemplate: row.is_template,
    data: row.data,
    order: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ...(row.meta || {}),
  };
}

function mapIdea(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    category: row.category,
    createdAt: row.created_at,
  };
}

function mapGoal(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    completed: row.completed,
    subGoals: row.sub_goals || [],
    createdAt: row.created_at,
  };
}

function mapTemplate(row: any) {
  if (!row) return null;
  return {
    _id: row.id,
    userId: row.user_id,
    workspaceId: row.workspace_id,
    name: row.name,
    type: row.type,
    payload: row.payload,
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}

function mapNotification(row: any) {
  if (!row) return null;
  return {
    _id: row.id,
    workspaceId: row.workspace_id,
    userId: row.user_id,
    title: row.title,
    body: row.body,
    read: row.read,
    meta: row.meta,
    createdAt: row.created_at,
  };
}

function mapActivity(row: any) {
  if (!row) return null;
  return {
    _id: row.id,
    type: row.type,
    userId: row.user_id,
    title: row.title,
    body: row.body,
    payload: row.payload,
    read: row.read,
    createdAt: row.created_at,
  };
}

function mapAnalytics(row: any) {
  if (!row) return null;
  return {
    _id: row.id,
    name: row.name,
    payload: row.payload,
    url: row.url,
    ts: row.ts,
  };
}

// ---------------------------------------------------------------------------
// Profiles
// ---------------------------------------------------------------------------
async function ensureProfile(user: any): Promise<void> {
  if (!user) return;
  const meta = user.user_metadata || {};
  const supabase = getSupabase();
  await supabase.from("profiles").upsert(
    {
      id: user.id,
      name: meta.name || (user.email ? user.email.split("@")[0] : ""),
      email: user.email,
      picture: meta.picture || null,
    },
    { onConflict: "id" },
  );
}

async function getProfile(userId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return mapProfile(data);
}

async function getProfileByEmail(email: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", String(email).toLowerCase().trim())
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

async function updateProfileSubscription(userId: string, patch: any) {
  const supabase = getSupabase();
  const profile = await getProfile(userId);
  const current = profile?.subscription || {};
  const { data, error } = await supabase
    .from("profiles")
    .update({ subscription: { ...current, ...patch } })
    .eq("id", userId)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return mapProfile(data);
}

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------
async function listTasks({
  userId,
  workspaceId,
  status,
  page = 1,
  limit = 50,
}: {
  userId: string;
  workspaceId: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  // Full read (sync endpoint): page through everything
  if (limit >= 100000) {
    const rows = await fetchAll(
      (sb: any) =>
        sb
          .from("tasks")
          .eq(
            workspaceId === "personal" ? "user_id" : "workspace_id",
            workspaceId === "personal" ? userId : workspaceId,
          )
          .eq("workspace_id", workspaceId)
          .order("created_at", { ascending: false }),
      "*",
      (q: any) => (status ? q.eq("status", status) : q),
    );
    return rows.map(mapTask);
  }
  const supabase = getSupabase();
  let query = supabase
    .from("tasks")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);
  if (workspaceId === "personal") query = query.eq("user_id", userId);
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(mapTask);
}

async function getTask(userId: string, taskId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  if (data.workspace_id === "personal") {
    if (String(data.user_id) !== String(userId)) return null;
  } else if (!(await getWorkspaceRole(userId, data.workspace_id))) {
    return null;
  }
  return mapTask(data);
}

function taskRowFromPayload(userId: string, body: any) {
  const dependencies = Array.isArray(body.dependencies)
    ? body.dependencies.filter(isUuid)
    : [];
  return {
    user_id: userId,
    workspace_id: body.workspaceId || body.workspace || "personal",
    title: body.title || "",
    description: body.description || "",
    status: body.status || "todo",
    assignee: body.assignee || null,
    due_date: body.dueDate || body.deadline || null,
    recurrence: body.recurrence || null,
    subtasks: body.subtasks || [],
    dependencies,
    custom_fields: body.customFields || {},
    created_by: body.createdBy || null,
  };
}

async function createTask(userId: string, body: any) {
  const workspaceId = body.workspaceId || body.workspace || "personal";
  if (workspaceId !== "personal") {
    const role = await getWorkspaceRole(userId, workspaceId);
    if (!role) return null;
    if (role === "viewer") throw new Error("workspace_read_only");
  }
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("tasks")
    .insert(
      taskRowFromPayload(userId, {
        ...body,
        workspaceId,
        createdBy: userId,
      }),
    )
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return mapTask(data);
}

async function updateTask(userId: string, taskId: string, body: any) {
  const supabase = getSupabase();
  const existing = await getTask(userId, taskId);
  if (!existing) return null;
  if (
    existing.workspaceId !== "personal" &&
    (await getWorkspaceRole(userId, existing.workspaceId)) === "viewer"
  ) {
    throw new Error("workspace_read_only");
  }
  const next: any = taskRowFromPayload(userId, { ...existing, ...body });
  next.user_id = existing.userId;
  next.workspace_id = existing.workspaceId;
  next.created_by = existing.createdBy;
  next.updated_at = new Date().toISOString();
  delete next.created_at;
  let query = supabase.from("tasks").update(next).eq("id", taskId);
  if (existing.workspaceId === "personal") query = query.eq("user_id", userId);
  const { data, error } = await query.select("*").maybeSingle();
  if (error) throw error;
  return mapTask(data);
}

async function deleteTask(userId: string, taskId: string) {
  const supabase = getSupabase();
  const task = await getTask(userId, taskId);
  if (!task) return false;
  if (
    task.workspaceId !== "personal" &&
    (await getWorkspaceRole(userId, task.workspaceId)) === "viewer"
  ) {
    throw new Error("workspace_read_only");
  }
  if (
    task.workspaceId !== "personal" &&
    String(task.userId) !== String(userId) &&
    String(task.createdBy) !== String(userId) &&
    !(["owner", "admin"].includes(
      (await getWorkspaceRole(userId, task.workspaceId)) || "",
    ))
  ) {
    throw new Error("workspace_delete_forbidden");
  }
  let query = supabase.from("tasks").delete().eq("id", taskId);
  if (task.workspaceId === "personal") query = query.eq("user_id", userId);
  const { error } = await query;
  if (error) throw error;
  return true;
}

// Full-replace sync used by POST /user/data
async function replaceTasks(userId: string, tasks: any[]) {
  const supabase = getSupabase();
  await supabase.from("tasks").delete().eq("user_id", userId);
  if (Array.isArray(tasks) && tasks.length > 0) {
    const { error } = await supabase
      .from("tasks")
      .insert(tasks.map((t) => taskRowFromPayload(userId, t)));
    if (error) throw error;
  }
  return listAllTasks(userId);
}

// All tasks for a user, across every workspace (matches old Task.find({ userId }))
async function listAllTasks(userId: string) {
  const rows = await fetchAll(
    (sb: any) =>
      sb
        .from("tasks")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
    "*",
  );
  return rows.map(mapTask);
}

// ---------------------------------------------------------------------------
// Workspaces + members
// ---------------------------------------------------------------------------
async function listWorkspacesForUser(userId: string) {
  const supabase = getSupabase();
  const { data: memberRows, error } = await supabase
    .from("workspace_members")
    .select("workspace_id, role, joined_at")
    .eq("user_id", userId);
  if (error) throw error;
  if (!memberRows || memberRows.length === 0) return [];

  const ids = memberRows.map((m: any) => m.workspace_id);
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

  const memberByWs: Record<string, any[]> = {};
  (allMembers || []).forEach((m: any) => {
    memberByWs[m.workspace_id] = memberByWs[m.workspace_id] || [];
    memberByWs[m.workspace_id].push({
      userId: m.user_id,
      role: m.role,
      joinedAt: m.joined_at,
    });
  });

  return (wsRows || [])
    .sort(
      (a: any, b: any) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    )
    .map((row: any) => mapWorkspace(row, memberByWs[row.id] || []));
}

async function createWorkspace(userId: string, { name, slug }: { name: string; slug: string }) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("workspaces")
    .insert({
      name,
      slug,
      owner_id: userId,
    })
    .select("*")
    .maybeSingle();
  if (error) throw error;
  await supabase.from("workspace_members").insert({
    workspace_id: data.id,
    user_id: userId,
    role: "owner",
  });
  const { data: memberRows, error: mErr } = await supabase
    .from("workspace_members")
    .select("user_id, role, joined_at")
    .eq("workspace_id", data.id);
  if (mErr) throw mErr;
  return mapWorkspace(
    data,
    (memberRows || []).map((m: any) => ({
      userId: m.user_id,
      role: m.role,
      joinedAt: m.joined_at,
    })),
  );
}

async function getWorkspaceForUser(userId: string, workspaceId: string) {
  const supabase = getSupabase();
  const { data: ws, error } = await supabase
    .from("workspaces")
    .select("*")
    .eq("id", workspaceId)
    .maybeSingle();
  if (error) throw error;
  if (!ws) return null;

  const { data: memberRows, error: mErr } = await supabase
    .from("workspace_members")
    .select("user_id, role, joined_at")
    .eq("workspace_id", workspaceId);
  if (mErr) throw mErr;

  const members = (memberRows || []).map((m: any) => ({
    userId: m.user_id,
    role: m.role,
    joinedAt: m.joined_at,
  }));
  const isMember = members.some((m) => String(m.userId) === String(userId));
  if (!isMember) return null;
  return mapWorkspace(ws, members);
}

async function getWorkspaceMembers(workspaceId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("workspace_members")
    .select("user_id, role, joined_at")
    .eq("workspace_id", workspaceId);
  if (error) throw error;
  return (data || []).map((m: any) => ({
    userId: m.user_id,
    role: m.role,
    joinedAt: m.joined_at,
  }));
}

async function getWorkspaceRole(userId: string, workspaceId: string) {
  if (!isUuid(workspaceId)) return null;
  const workspace = await getWorkspaceForUser(userId, workspaceId);
  return (
    workspace?.members.find(
      (member) => String(member.userId) === String(userId),
    )?.role || null
  );
}

async function listWorkspaceMentionTargets(userId: string, workspaceId: string) {
  const workspace = await getWorkspaceForUser(userId, workspaceId);
  if (!workspace) return null;
  const supabase = getSupabase();
  const memberIds = workspace.members.map((member) => String(member.userId));
  if (memberIds.length === 0) return { role: null, members: [] };
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, email, picture")
    .in("id", memberIds);
  if (error) throw error;
  const profiles = new Map<string, any>(
    (data || []).map((profile: any): [string, any] => [
      String(profile.id),
      profile,
    ]),
  );
  return {
    role:
      workspace.members.find(
        (member) => String(member.userId) === String(userId),
      )?.role || null,
    members: workspace.members.map((member) => {
      const profile: any = profiles.get(member.userId);
      return {
        id: member.userId,
        name: profile?.name || profile?.email || "Membro",
        email: profile?.email || "",
        role: member.role,
      };
    }),
  };
}

async function listWorkspaceComments(
  userId: string,
  workspaceId: string,
  entityType: string,
  entityId: string,
) {
  if (!(await getWorkspaceRole(userId, workspaceId))) return null;
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("workspace_comments")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  const rows = data || [];
  const authorIds = Array.from(
    new Set(rows.map((row: any) => String(row.author_id))),
  );
  const { data: profiles, error: profilesError } = authorIds.length
    ? await supabase
        .from("profiles")
        .select("id, name, email, picture")
        .in("id", authorIds)
    : { data: [], error: null };
  if (profilesError) throw profilesError;
  const profileById = new Map<string, any>(
    (profiles || []).map((profile: any): [string, any] => [
      String(profile.id),
      profile,
    ]),
  );
  return rows.map((row: any) => {
    const author: any = profileById.get(String(row.author_id));
    return {
      id: row.id,
      workspaceId: row.workspace_id,
      entityType: row.entity_type,
      entityId: row.entity_id,
      authorId: row.author_id,
      authorName: author?.name || author?.email || "Membro",
      body: row.body,
      mentions: row.mention_ids || [],
      createdAt: row.created_at,
    };
  });
}

async function createWorkspaceComment(
  userId: string,
  workspaceId: string,
  entityType: string,
  entityId: string,
  body: string,
  mentions: string[],
) {
  const workspace = await getWorkspaceForUser(userId, workspaceId);
  if (!workspace) return null;
  const authorMembership = workspace.members.find(
    (member) => String(member.userId) === String(userId),
  );
  if (!authorMembership || authorMembership.role === "viewer") {
    throw new Error("workspace_read_only");
  }

  const supabase = getSupabase();
  const resourceTable = entityType === "task" ? "tasks" : "documents";
  let resourceQuery = supabase
    .from(resourceTable)
    .select("id")
    .eq("workspace_id", workspaceId);
  resourceQuery =
    entityType === "task"
      ? resourceQuery.eq("id", entityId)
      : resourceQuery.eq("slug", entityId);
  const { data: resource, error: resourceError } =
    await resourceQuery.limit(1).maybeSingle();
  if (resourceError) throw resourceError;
  if (!resource) return null;

  const memberIds = new Set(
    workspace.members.map((member) => String(member.userId)),
  );
  const mentionedUserIds = Array.from(new Set(mentions)).filter(
    (id) => id !== userId,
  );
  if (mentionedUserIds.some((id) => !memberIds.has(id))) {
    throw new Error("invalid_workspace_mention");
  }
  const profile = await getProfile(userId);
  const { data, error } = await supabase.rpc(
    "create_workspace_comment_with_mentions",
    {
      p_workspace_id: workspaceId,
      p_entity_type: entityType,
      p_entity_id: entityId,
      p_author_id: userId,
      p_author_name: profile?.name || profile?.email || "Un membro",
      p_body: body,
      p_mention_ids: mentionedUserIds,
    },
  );
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error("workspace_comment_not_created");
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    authorId: row.author_id,
    authorName: profile?.name || profile?.email || "Membro",
    body: row.body,
    mentions: row.mention_ids || [],
    createdAt: row.created_at,
  };
}

async function upsertWorkspaceMember(
  workspaceId: string,
  userId: string,
  role: string,
) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("workspace_members")
    .upsert(
      { workspace_id: workspaceId, user_id: userId, role },
      { onConflict: "workspace_id,user_id" },
    )
    .select("user_id, role, joined_at")
    .maybeSingle();
  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// Documents + versions
// ---------------------------------------------------------------------------
async function searchDocs({
  userId,
  workspaceId,
  q,
  limit = 10,
}: {
  userId: string;
  workspaceId: string;
  q: string;
  limit?: number;
}) {
  if (!(await getWorkspaceRole(userId, workspaceId))) return [];
  const supabase = getSupabase();
  const needle = `%${sanitizeSearchTerm(q)
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_")}%`;
  const { data, error } = await supabase
    .from("documents")
    .select("id, title, slug")
    .eq("workspace_id", workspaceId)
    .or(`title.ilike.${needle},slug.ilike.${needle}`)
    .limit(limit);
  if (error) throw error;
  return (data || []).map((d: any) => ({
    id: d.id,
    title: d.title || d.slug,
    slug: d.slug,
  }));
}

async function getDoc({
  userId,
  workspaceId,
  slug,
}: {
  userId: string;
  workspaceId: string;
  slug: string;
}) {
  const supabase = getSupabase();
  const role = await getWorkspaceRole(userId, workspaceId);
  if (!role) return null;
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("slug", slug)
    .order("updated_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  const rows = data || [];
  const row =
    rows.find((item: any) => String(item.user_id) === String(userId)) ||
    rows[0] ||
    null;
  const document = mapDocument(row);
  return document ? { ...document, canEdit: role !== "viewer" } : null;
}

async function getDocById(userId: string, docId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", docId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  if (data.workspace_id === "personal") {
    if (String(data.user_id) !== String(userId)) return null;
  } else if (!(await getWorkspaceRole(userId, data.workspace_id))) {
    return null;
  }
  return mapDocument(data);
}

function plainTextFromBlocks(blocks: any[]): string {
  const parts: string[] = [];
  (blocks || []).forEach((b) => {
    const text = b.text || b.content || "";
    if (text) parts.push(text);
    if (b.title) parts.push(b.title);
    if (Array.isArray(b.children)) parts.push(plainTextFromBlocks(b.children));
    if (Array.isArray(b.items)) {
      b.items.forEach((i: any) => {
        if (i && (i.text || i.html)) parts.push(i.text || i.html);
      });
    }
  });
  return parts.join("\n");
}

function extractBacklinks(blocks: any[]): string[] {
  const wikiRegex = /\[\[([^\]]+)\]\]/g;
  const hrefRegex = /href="[^"]*\/doc\/([^"\/?]+)"/g;
  const set = new Set<string>();
  const scan = (b: any) => {
    const text = typeof b.text === "string" ? b.text : b.content || "";
    const html = typeof b.html === "string" ? b.html : "";
    let m: RegExpExecArray | null;
    while ((m = wikiRegex.exec(text))) set.add(m[1]);
    while ((m = hrefRegex.exec(html))) {
      try {
        set.add(decodeURIComponent(m[1]));
      } catch (e) {
        set.add(m[1]);
      }
    }
  };
  (blocks || []).forEach((b) => {
    scan(b);
    if (Array.isArray(b.items)) b.items.forEach(scan);
    if (Array.isArray(b.children)) {
      b.children.forEach((c: any) => {
        scan(c);
        if (Array.isArray(c.items)) c.items.forEach(scan);
      });
    }
  });
  return Array.from(set);
}

function extractDocumentMentionIds(blocks: any[]): string[] {
  const ids = new Set<string>();
  const mentionTag = /<span\b[^>]*>/gi;
  const idAttribute = /\bdata-id=["']([0-9a-f-]{36})["']/i;
  const scan = (value: any): void => {
    if (typeof value === "string") {
      let match: RegExpExecArray | null;
      while ((match = mentionTag.exec(value))) {
        if (!/\bdata-type=["']mention["']/i.test(match[0])) continue;
        const id = match[0].match(idAttribute)?.[1];
        if (id && isUuid(id)) ids.add(id);
      }
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(scan);
      return;
    }
    if (value && typeof value === "object") {
      Object.values(value).forEach(scan);
    }
  };
  scan(blocks);
  return Array.from(ids);
}

async function saveDoc({
  userId,
  workspaceId,
  slug,
  title,
  blocks,
  author,
}: {
  userId: string;
  workspaceId: string;
  slug: string;
  title?: string;
  blocks?: any[];
  author?: string;
}) {
  const supabase = getSupabase();
  const role = await getWorkspaceRole(userId, workspaceId);
  if (!role) throw new Error("workspace_not_found");
  if (role === "viewer") throw new Error("workspace_read_only");
  const existing = await getDoc({ userId, workspaceId, slug });
  const plainText = plainTextFromBlocks(blocks as any[]);
  const backlinks = extractBacklinks(blocks as any[]);

  // Optional: compute and store an embedding for semantic search.
  // Only used when it matches the vector(768) column to avoid insert errors.
  let embedding: number[] | null = null;
  if (process.env.ENABLE_VECTOR === "true") {
    try {
      const { getEmbedding } = await import("./embeddings");
      const raw = await getEmbedding((title || "") + "\n" + plainText);
      if (Array.isArray(raw) && raw.length === 768) embedding = raw;
      else
        console.error("embedding dimension mismatch, skipping vector store");
    } catch (e) {
      console.error("embedding error", e);
    }
  }

  let docId: string;
  if (existing) {
    const { data, error } = await supabase
      .from("documents")
      .update({
        title: title || existing.title,
        blocks: blocks || existing.blocks,
        plain_text: plainText,
        backlinks,
        ...(embedding ? { embedding } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing._id)
      .select("*")
      .maybeSingle();
    if (error) throw error;
    docId = data.id;
  } else {
    const { data, error } = await supabase
      .from("documents")
      .insert({
        user_id: userId,
        workspace_id: workspaceId,
        slug,
        title: title || "",
        blocks: blocks || [],
        plain_text: plainText,
        backlinks,
        ...(embedding ? { embedding } : {}),
      })
      .select("*")
      .maybeSingle();
    if (error) throw error;
    docId = data.id;
  }

  // Create a version snapshot
  const { data: last } = await supabase
    .from("doc_versions")
    .select("version")
    .eq("doc_id", docId)
    .order("version", { ascending: false })
    .limit(1);
  const nextVersion = (last && last[0] && last[0].version) || 0;
  const { data: versionRow, error: vError } = await supabase
    .from("doc_versions")
    .insert({
      doc_id: docId,
      version: nextVersion + 1,
      blocks: blocks || [],
      author: author || "system",
    })
    .select("*")
    .maybeSingle();
  if (vError) throw vError;

  const workspace = await getWorkspaceForUser(userId, workspaceId);
  if (!workspace) throw new Error("workspace_not_found");
  const workspaceMemberIds = new Set(
    workspace.members.map((member) => String(member.userId)),
  );
  const mentionIds = extractDocumentMentionIds(blocks || []).filter((id) =>
    id !== userId && workspaceMemberIds.has(id),
  );
  const { error: mentionError } = await supabase.rpc(
    "sync_workspace_document_mentions",
    {
      p_document_id: docId,
      p_workspace_id: workspaceId,
      p_entity_id: slug,
      p_author_id: userId,
      p_author_name: (await getProfile(userId))?.name || "Un membro",
      p_mention_ids: mentionIds,
    },
  );
  if (mentionError) throw mentionError;

  return { docId, version: versionRow.version, blocks: blocks || [] };
}

async function listDocVersions(userId: string, docId: string) {
  const doc = await getDocById(userId, docId);
  if (!doc) return null;
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("doc_versions")
    .select("*")
    .eq("doc_id", docId)
    .order("version", { ascending: false });
  if (error) throw error;
  return (data || []).map((row: any) => ({
    _id: row.id,
    docId: row.doc_id,
    version: row.version,
    blocks: row.blocks || [],
    author: row.author,
    createdAt: row.created_at,
  }));
}

// ---------------------------------------------------------------------------
// Pages (dashboard) — client-driven, upsert + prune-missing
// ---------------------------------------------------------------------------
const PAGE_META_KEYS = ["deleted", "deletedAt", "locked", "font"];

function pageRowFromPayload(userId: string, page: any, order: number) {
  const meta: Record<string, any> = {};
  PAGE_META_KEYS.forEach((k) => {
    if (page[k] !== undefined) meta[k] = page[k];
  });
  // Icona: "" = rimossa di proposito → salva NULL (nessuna icona).
  // undefined/null = non specificata → lascia il default esistente in update,
  // "layout-dashboard" in insert. MAI forzare un fallback che resuscita l'icona.
  const iconValue =
    page.icon === "" ? null : (page.icon ?? "layout-dashboard");
  return {
    id: String(page.id),
    user_id: userId,
    type: page.type,
    label: page.label == null ? "" : String(page.label),
    icon: iconValue,
    icon_color: page.iconColor || "text-gray-400",
    parent_id: page.parentId == null ? null : String(page.parentId),
    purpose: page.purpose == null ? null : page.purpose,
    is_template: Boolean(page.isTemplate),
    data: page.data == null ? null : page.data,
    meta,
    sort_order: order,
    updated_at: new Date().toISOString(),
  };
}

async function listPages(userId: string) {
  const rows = await fetchAll(
    (sb: any) =>
      sb
        .from("pages")
        .eq("user_id", userId)
        .order("sort_order", { ascending: true }),
    "*",
  );
  return rows.map(mapPage);
}

async function syncPages(userId: string, pages: any[]) {
  const supabase = getSupabase();
  const incoming = Array.isArray(pages) ? pages : [];

  // Delete pages the client no longer has
  if (incoming.length > 0) {
    const keepIds = incoming.map((p) => String(p.id));
    const { data: existing } = await supabase
      .from("pages")
      .select("id")
      .eq("user_id", userId);
    const toDelete = (existing || [])
      .map((r: any) => r.id)
      .filter((id: string) => !keepIds.includes(id));
    if (toDelete.length > 0) {
      await supabase
        .from("pages")
        .delete()
        .in("id", toDelete)
        .eq("user_id", userId);
    }
  }

  if (incoming.length > 0) {
    const rows = incoming.map((p, idx) => pageRowFromPayload(userId, p, idx));
    const { error } = await supabase.from("pages").upsert(rows, {
      onConflict: "user_id,id",
    });
    if (error) throw error;
  }
  return listPages(userId);
}

// -------- granular page CRUD (structured persistence) --------
async function createPageRow(userId: string, page: any) {
  const supabase = getSupabase();
  const { data: maxRow } = await supabase
    .from("pages")
    .select("sort_order")
    .eq("user_id", userId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const order = (maxRow?.sort_order ?? -1) + 1;
  const { data, error } = await supabase
    .from("pages")
    .insert(pageRowFromPayload(userId, page, order))
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return mapPage(data);
}

async function updatePageRow(userId: string, id: string, patch: any) {
  const supabase = getSupabase();
  // PATCH reale: aggiorna SOLO i campi presenti in `patch`.
  // La vecchia versione ricostruiva l'intera riga da patch → label/type/data
  // diventavano undefined e il cambio icona veniva "perso" (sovrascritto).
  const updates: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };
  if (patch.type !== undefined) updates.type = patch.type;
  if (patch.label !== undefined)
    updates.label = patch.label == null ? "" : String(patch.label);
  if (patch.icon !== undefined)
    updates.icon = patch.icon === "" ? null : patch.icon;
  if (patch.iconColor !== undefined)
    updates.icon_color = patch.iconColor || "text-gray-400";
  if (patch.parentId !== undefined)
    updates.parent_id =
      patch.parentId == null ? null : String(patch.parentId);
  if (patch.purpose !== undefined)
    updates.purpose = patch.purpose == null ? null : patch.purpose;
  if (patch.isTemplate !== undefined)
    updates.is_template = Boolean(patch.isTemplate);
  if (patch.data !== undefined)
    updates.data = patch.data == null ? null : patch.data;
  const meta: Record<string, any> = {};
  PAGE_META_KEYS.forEach((k) => {
    if (patch[k] !== undefined) meta[k] = patch[k];
  });
  if (Object.keys(meta).length > 0) updates.meta = meta;
  if (patch.sortOrder !== undefined) updates.sort_order = patch.sortOrder;
  else if (patch.order !== undefined) updates.sort_order = patch.order;
  const { data, error } = await supabase
    .from("pages")
    .update(updates)
    .eq("user_id", userId)
    .eq("id", String(id))
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return mapPage(data);
}

async function deletePageRow(userId: string, id: string) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("pages")
    .delete()
    .eq("user_id", userId)
    .eq("id", String(id));
  if (error) throw error;
  return true;
}

async function createGoalRow(userId: string, goal: any) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("goals")
    .insert({
      id: String(goal.id || randomUUID()),
      user_id: userId,
      title: goal.title,
      description: goal.description ?? "",
      completed: Boolean(goal.completed),
      sub_goals: goal.subGoals || [],
    })
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return mapGoal(data);
}

async function updateGoalRow(userId: string, id: string, patch: any) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("goals")
    .update({
      title: patch.title,
      description: patch.description ?? "",
      completed: patch.completed !== undefined ? Boolean(patch.completed) : undefined,
      sub_goals: patch.subGoals,
    })
    .eq("user_id", userId)
    .eq("id", String(id))
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return mapGoal(data);
}

async function deleteGoalRow(userId: string, id: string) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("goals")
    .delete()
    .eq("user_id", userId)
    .eq("id", String(id));
  if (error) throw error;
  return true;
}

async function createIdeaRow(userId: string, idea: any) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("ideas")
    .insert({
      id: String(idea.id || randomUUID()),
      user_id: userId,
      title: idea.title,
      category: idea.category,
    })
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return mapIdea(data);
}

async function updateIdeaRow(userId: string, id: string, patch: any) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("ideas")
    .update({
      title: patch.title,
      category: patch.category,
    })
    .eq("user_id", userId)
    .eq("id", String(id))
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return mapIdea(data);
}

async function deleteIdeaRow(userId: string, id: string) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("ideas")
    .delete()
    .eq("user_id", userId)
    .eq("id", String(id));
  if (error) throw error;
  return true;
}

// ---------------------------------------------------------------------------
// Ideas / Goals — full-replace sync
// ---------------------------------------------------------------------------
async function listIdeas(userId: string) {
  const rows = await fetchAll(
    (sb: any) =>
      sb
        .from("ideas")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
    "*",
  );
  return rows.map(mapIdea);
}

async function replaceIdeas(userId: string, ideas: any[]) {
  const supabase = getSupabase();
  await supabase.from("ideas").delete().eq("user_id", userId);
  if (Array.isArray(ideas) && ideas.length > 0) {
    const { error } = await supabase.from("ideas").insert(
      ideas.map((i) => ({
        id: String(i.id || randomUUID()),
        user_id: userId,
        title: i.title,
        category: i.category,
        created_at: i.createdAt || new Date().toISOString(),
      })),
    );
    if (error) throw error;
  }
  return listIdeas(userId);
}

async function listGoals(userId: string) {
  const rows = await fetchAll(
    (sb: any) =>
      sb
        .from("goals")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
    "*",
  );
  return rows.map(mapGoal);
}

async function replaceGoals(userId: string, goals: any[]) {
  const supabase = getSupabase();
  await supabase.from("goals").delete().eq("user_id", userId);
  if (Array.isArray(goals) && goals.length > 0) {
    const { error } = await supabase.from("goals").insert(
      goals.map((g) => ({
        id: String(g.id || randomUUID()),
        user_id: userId,
        title: g.title,
        description: g.description,
        completed: Boolean(g.completed),
        sub_goals: g.subGoals || [],
        created_at: g.createdAt || new Date().toISOString(),
      })),
    );
    if (error) throw error;
  }
  return listGoals(userId);
}

// ---------------------------------------------------------------------------
// Templates / Notifications / Activity
// ---------------------------------------------------------------------------
async function listTemplates(userId: string, workspaceId?: string) {
  const supabase = getSupabase();
  let query = supabase.from("templates").select("*").eq("user_id", userId);
  if (workspaceId) query = query.eq("workspace_id", workspaceId);
  query = query.order("created_at", { ascending: false });
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(mapTemplate);
}

async function createTemplate(userId: string, body: any) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("templates")
    .insert({
      user_id: userId,
      workspace_id: body.workspaceId || body.workspace_id || null,
      name: body.name || "",
      type: body.type || "doc",
      payload: body.payload || null,
      created_by: body.createdBy || null,
    })
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return mapTemplate(data);
}

async function getTemplate(userId: string, templateId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .eq("id", templateId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return mapTemplate(data);
}

async function deleteTemplate(userId: string, templateId: string) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("templates")
    .delete()
    .eq("id", templateId)
    .eq("user_id", userId);
  if (error) throw error;
  return true;
}

async function listNotifications(
  userId: string,
  workspaceId: string | null,
  limit = 100,
) {
  const supabase = getSupabase();
  let query = supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (workspaceId) query = query.eq("workspace_id", workspaceId);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(mapNotification);
}

async function createNotification(userId: string, body: any) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("notifications")
    .insert({
      workspace_id: body.workspaceId || body.workspace_id || null,
      user_id: userId,
      title: body.title || null,
      body: body.body || null,
      read: Boolean(body.read),
      meta: body.meta || null,
    })
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return mapNotification(data);
}

async function markNotificationRead(userId: string, notificationId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId)
    .eq("user_id", userId)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return mapNotification(data);
}

async function listActivity(userId: string, limit = 50) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("activity")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []).map(mapActivity);
}

async function createActivity(userId: string, body: any) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("activity")
    .insert({
      type: body.type || "event",
      user_id: userId,
      title: body.title || null,
      body: body.body || null,
      payload: body.payload || null,
    })
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return mapActivity(data);
}

async function markActivityRead(userId: string, ids: string[]) {
  const supabase = getSupabase();
  if (!Array.isArray(ids) || ids.length === 0) return true;
  const { error } = await supabase
    .from("activity")
    .update({ read: true })
    .in("id", ids)
    .eq("user_id", userId);
  if (error) throw error;
  return true;
}

function mapMeeting(data: any) {
  if (!data) return null;
  return {
    id: data.id,
    title: data.title || "",
    transcript: data.transcript || "",
    summary: data.summary || "",
    category: data.category || "Generale",
    duration: data.duration || "",
    date: data.date || data.created_at,
    source: data.source || "manual",
    externalId: data.external_id || null,
    meetingUrl: data.meeting_url || null,
  };
}

async function createMeeting(userId: string, body: any) {
  const supabase = getSupabase();
  const allowedSources = ["manual", "zoom", "google_meet", "upload"];
  const source = allowedSources.includes(body.source) ? body.source : "manual";
  const { data, error } = await supabase
    .from("meetings")
    .insert({
      user_id: userId,
      title: body.title || "",
      transcript: body.transcript || null,
      summary: body.summary || null,
      category: body.category || "Generale",
      duration: body.duration || null,
      date: body.date ? new Date(body.date).toISOString() : undefined,
      source,
      external_id: body.externalId || body.external_id || null,
      meeting_url: body.meetingUrl || body.meeting_url || null,
    })
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return mapMeeting(data);
}

async function updateMeeting(userId: string, id: string, body: any) {
  const supabase = getSupabase();
  const patch: any = {};
  if (body.title !== undefined) patch.title = body.title;
  if (body.transcript !== undefined) patch.transcript = body.transcript;
  if (body.summary !== undefined) patch.summary = body.summary;
  if (body.category !== undefined) patch.category = body.category;
  if (body.duration !== undefined) patch.duration = body.duration;
  if (body.date !== undefined) patch.date = new Date(body.date).toISOString();
  if (body.source !== undefined) patch.source = body.source;
  if (body.externalId !== undefined) patch.external_id = body.externalId;
  if (body.meetingUrl !== undefined) patch.meeting_url = body.meetingUrl;
  const { data, error } = await supabase
    .from("meetings")
    .update(patch)
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return mapMeeting(data);
}

async function listMeetings(userId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("meetings")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data || []).map(mapMeeting);
}

async function deleteMeeting(userId: string, id: string) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("meetings")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
  return true;
}

function sanitizeIntegrationConfig(config: any) {
  return {
    ...config,
    // Never expose raw secrets to the client
    webhookUrl: config?.webhookUrl ? "***" : undefined,
    accessToken: undefined,
    refreshToken: undefined,
  };
}

async function getIntegration(userId: string, provider: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("integrations")
    .select("*")
    .eq("user_id", userId)
    .eq("provider", provider)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    id: data.id,
    provider: data.provider,
    connected: data.connected,
    config: sanitizeForClient(data.config),
    createdAt: data.created_at,
  };
}

function sanitizeForClient(config: any) {
  const clone: any = { ...(config || {}) };
  delete clone.accessToken;
  delete clone.refreshToken;
  if (clone.webhookUrl) clone.webhookUrl = "***";
  return clone;
}

async function listIntegrations(userId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("integrations")
    .select("*")
    .eq("user_id", userId);
  if (error) throw error;
  return (data || []).map((it) => ({
    id: it.id,
    provider: it.provider,
    connected: it.connected,
    config: sanitizeForClient(it.config),
    createdAt: it.created_at,
  }));
}

async function setIntegration(
  userId: string,
  provider: string,
  config: any,
  connected = true,
) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("integrations")
    .upsert(
      {
        user_id: userId,
        provider,
        config,
        connected,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,provider" },
    )
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return { id: data?.id, provider, connected, config: sanitizeForClient(data?.config) };
}

async function deleteIntegration(userId: string, provider: string) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("integrations")
    .delete()
    .eq("user_id", userId)
    .eq("provider", provider);
  if (error) throw error;
  return true;
}

// ---------------------------------------------------------------------------
// Analytics (fire-and-forget friendly)
// ---------------------------------------------------------------------------
async function insertAnalytics(events: any[]) {
  const supabase = getSupabase();
  const rows = (events || [])
    .slice(0, 1000)
    .map((e) => ({
      name: e.name,
      payload: e.payload || null,
      url: e.url || null,
      ts: e.ts ? new Date(e.ts).toISOString() : new Date().toISOString(),
    }));
  if (rows.length === 0) return { ok: true, received: 0 };
  const { data, error } = await supabase.from("analytics").insert(rows);
  if (error) throw error;
  return { ok: true, received: rows.length };
}

async function recentAnalytics(limit = 50) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("analytics")
    .select("*")
    .order("ts", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []).map(mapAnalytics);
}

export {
  // profiles
  ensureProfile,
  getProfile,
  getProfileByEmail,
  updateProfileSubscription,
  // tasks
  listTasks,
  listAllTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  replaceTasks,
  // workspaces
  listWorkspacesForUser,
  createWorkspace,
  getWorkspaceForUser,
  getWorkspaceMembers,
  getWorkspaceRole,
  listWorkspaceMentionTargets,
  listWorkspaceComments,
  createWorkspaceComment,
  upsertWorkspaceMember,
  // documents
  searchDocs,
  getDoc,
  getDocById,
  saveDoc,
  listDocVersions,
  // pages / ideas / goals
  listPages,
  syncPages,
  listIdeas,
  replaceIdeas,
  listGoals,
  replaceGoals,
  // granular CRUD (structured persistence)
  createPageRow,
  updatePageRow,
  deletePageRow,
  createGoalRow,
  updateGoalRow,
  deleteGoalRow,
  createIdeaRow,
  updateIdeaRow,
  deleteIdeaRow,
  // templates / notifications / activity
  listTemplates,
  createTemplate,
  getTemplate,
  deleteTemplate,
  listNotifications,
  createNotification,
  markNotificationRead,
  listActivity,
  createActivity,
  markActivityRead,
  // meetings
  createMeeting,
  updateMeeting,
  listMeetings,
  deleteMeeting,
  // integrations
  getIntegration,
  listIntegrations,
  setIntegration,
  deleteIntegration,
  // analytics
  insertAnalytics,
  recentAnalytics,
};
