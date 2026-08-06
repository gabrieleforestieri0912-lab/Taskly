// ============================================================================
// Data-access layer — replaces the Mongoose models.
// Maps Postgres rows to the exact API shape the frontend expects
// (Mongo-style `_id`, camelCase fields, `id` for pages/goals/ideas).
// ============================================================================
const { getSupabase } = require("./client");
const { randomUUID } = require("crypto");

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (v) => typeof v === "string" && UUID_RE.test(v);

// PostgREST caps a single request at `db-max-rows` (default 1000). For full
// collection reads we loop over ranges until we have everything.
const FETCH_PAGE_SIZE = 1000;

async function fetchAll(buildQuery, select, filterFn) {
  const supabase = getSupabase();
  const out = [];
  let from = 0;
  while (true) {
    let q = buildQuery(supabase).select(select).range(from, from + FETCH_PAGE_SIZE - 1);
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
function sanitizeSearchTerm(q) {
  return String(q || "")
    .replace(/[.,\(\)\*\|\"\'\`\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ---------------------------------------------------------------------------
// Row → API mappers
// ---------------------------------------------------------------------------
function mapProfile(row) {
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

function mapTask(row) {
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

function mapWorkspace(row, members = []) {
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

function mapDocument(row) {
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

function mapPage(row) {
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

function mapIdea(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    category: row.category,
    createdAt: row.created_at,
  };
}

function mapGoal(row) {
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

function mapTemplate(row) {
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

function mapNotification(row) {
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

function mapActivity(row) {
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

function mapAnalytics(row) {
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
async function ensureProfile(user) {
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

async function getProfile(userId) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return mapProfile(data);
}

async function getProfileByEmail(email) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", String(email).toLowerCase().trim())
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

async function updateProfileSubscription(userId, patch) {
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
async function listTasks({ userId, workspaceId, status, page = 1, limit = 50 }) {
  // Full read (sync endpoint): page through everything
  if (limit >= 100000) {
    const rows = await fetchAll(
      (sb) => sb.from("tasks").eq("user_id", userId).eq("workspace_id", workspaceId).order("created_at", { ascending: false }),
      "*",
      (q) => (status ? q.eq("status", status) : q),
    );
    return rows.map(mapTask);
  }
  const supabase = getSupabase();
  let query = supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(mapTask);
}

async function getTask(userId, taskId) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return mapTask(data);
}

function taskRowFromPayload(userId, body) {
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

async function createTask(userId, body) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("tasks")
    .insert(taskRowFromPayload(userId, body))
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return mapTask(data);
}

async function updateTask(userId, taskId, body) {
  const supabase = getSupabase();
  const existing = await getTask(userId, taskId);
  if (!existing) return null;
  const next = taskRowFromPayload(userId, { ...existing, ...body });
  next.updated_at = new Date().toISOString();
  delete next.created_at;
  const { data, error } = await supabase
    .from("tasks")
    .update(next)
    .eq("id", taskId)
    .eq("user_id", userId)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return mapTask(data);
}

async function deleteTask(userId, taskId) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId)
    .eq("user_id", userId);
  if (error) throw error;
  return true;
}

// Full-replace sync used by POST /user/data
async function replaceTasks(userId, tasks) {
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
async function listAllTasks(userId) {
  const rows = await fetchAll(
    (sb) => sb.from("tasks").eq("user_id", userId).order("created_at", { ascending: false }),
    "*",
  );
  return rows.map(mapTask);
}

// ---------------------------------------------------------------------------
// Workspaces + members
// ---------------------------------------------------------------------------
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
    memberByWs[m.workspace_id].push({
      userId: m.user_id,
      role: m.role,
      joinedAt: m.joined_at,
    });
  });

  return (wsRows || [])
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .map((row) => mapWorkspace(row, memberByWs[row.id] || []));
}

async function createWorkspace(userId, { name, slug }) {
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
  return mapWorkspace(data, (memberRows || []).map((m) => ({
    userId: m.user_id, role: m.role, joinedAt: m.joined_at,
  })));
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

  const { data: memberRows, error: mErr } = await supabase
    .from("workspace_members")
    .select("user_id, role, joined_at")
    .eq("workspace_id", workspaceId);
  if (mErr) throw mErr;

  const members = (memberRows || []).map((m) => ({
    userId: m.user_id, role: m.role, joinedAt: m.joined_at,
  }));
  const isMember = members.some((m) => String(m.userId) === String(userId));
  if (!isMember) return null;
  return mapWorkspace(ws, members);
}

async function getWorkspaceMembers(workspaceId) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("workspace_members")
    .select("user_id, role, joined_at")
    .eq("workspace_id", workspaceId);
  if (error) throw error;
  return (data || []).map((m) => ({
    userId: m.user_id, role: m.role, joinedAt: m.joined_at,
  }));
}

async function upsertWorkspaceMember(workspaceId, userId, role) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("workspace_members")
    .upsert({ workspace_id: workspaceId, user_id: userId, role }, { onConflict: "workspace_id,user_id" })
    .select("user_id, role, joined_at")
    .maybeSingle();
  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// Documents + versions
// ---------------------------------------------------------------------------
async function searchDocs({ userId, workspaceId, q, limit = 10 }) {
  const supabase = getSupabase();
  const needle = `%${sanitizeSearchTerm(q).replace(/%/g, "\\%").replace(/_/g, "\\_")}%`;
  const { data, error } = await supabase
    .from("documents")
    .select("id, title, slug")
    .eq("user_id", userId)
    .eq("workspace_id", workspaceId)
    .or(`title.ilike.${needle},slug.ilike.${needle}`)
    .limit(limit);
  if (error) throw error;
  return (data || []).map((d) => ({ id: d.id, title: d.title || d.slug, slug: d.slug }));
}

async function getDoc({ userId, workspaceId, slug }) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("user_id", userId)
    .eq("workspace_id", workspaceId)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return mapDocument(data);
}

async function getDocById(userId, docId) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", docId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return mapDocument(data);
}

function plainTextFromBlocks(blocks) {
  const parts = [];
  (blocks || []).forEach((b) => {
    const text = b.text || b.content || "";
    if (text) parts.push(text);
    if (b.title) parts.push(b.title);
    if (Array.isArray(b.children)) parts.push(plainTextFromBlocks(b.children));
    if (Array.isArray(b.items)) {
      b.items.forEach((i) => {
        if (i && (i.text || i.html)) parts.push(i.text || i.html);
      });
    }
  });
  return parts.join("\n");
}

function extractBacklinks(blocks) {
  const wikiRegex = /\[\[([^\]]+)\]\]/g;
  const hrefRegex = /href="[^"]*\/doc\/([^"\/?]+)"/g;
  const set = new Set();
  const scan = (b) => {
    const text = typeof b.text === "string" ? b.text : b.content || "";
    const html = typeof b.html === "string" ? b.html : "";
    let m;
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
      b.children.forEach((c) => {
        scan(c);
        if (Array.isArray(c.items)) c.items.forEach(scan);
      });
    }
  });
  return Array.from(set);
}

async function saveDoc({ userId, workspaceId, slug, title, blocks, author }) {
  const supabase = getSupabase();
  const existing = await getDoc({ userId, workspaceId, slug });
  const plainText = plainTextFromBlocks(blocks);
  const backlinks = extractBacklinks(blocks);

  // Optional: compute and store an embedding for semantic search.
  // Only used when it matches the vector(768) column to avoid insert errors.
  let embedding = null;
  if (process.env.ENABLE_VECTOR === "true") {
    try {
      const { getEmbedding } = require("../utils/embeddings");
      const raw = await getEmbedding((title || "") + "\n" + plainText);
      if (Array.isArray(raw) && raw.length === 768) embedding = raw;
      else console.error("embedding dimension mismatch, skipping vector store");
    } catch (e) {
      console.error("embedding error", e);
    }
  }

  let docId;
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

  return { docId, version: versionRow.version, blocks: blocks || [] };
}

async function listDocVersions(userId, docId) {
  const doc = await getDocById(userId, docId);
  if (!doc) return null;
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("doc_versions")
    .select("*")
    .eq("doc_id", docId)
    .order("version", { ascending: false });
  if (error) throw error;
  return (data || []).map((row) => ({
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

function pageRowFromPayload(userId, page, order) {
  const meta = {};
  PAGE_META_KEYS.forEach((k) => {
    if (page[k] !== undefined) meta[k] = page[k];
  });
  return {
    id: String(page.id),
    user_id: userId,
    type: page.type,
    label: page.label == null ? "" : String(page.label),
    icon: page.icon || "layout-dashboard",
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

async function listPages(userId) {
  const rows = await fetchAll(
    (sb) => sb.from("pages").eq("user_id", userId).order("sort_order", { ascending: true }),
    "*",
  );
  return rows.map(mapPage);
}

async function syncPages(userId, pages) {
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
      .map((r) => r.id)
      .filter((id) => !keepIds.includes(id));
    if (toDelete.length > 0) {
      await supabase.from("pages").delete().in("id", toDelete).eq("user_id", userId);
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

// ---------------------------------------------------------------------------
// Ideas / Goals — full-replace sync
// ---------------------------------------------------------------------------
async function listIdeas(userId) {
  const rows = await fetchAll(
    (sb) => sb.from("ideas").eq("user_id", userId).order("created_at", { ascending: false }),
    "*",
  );
  return rows.map(mapIdea);
}

async function replaceIdeas(userId, ideas) {
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

async function listGoals(userId) {
  const rows = await fetchAll(
    (sb) => sb.from("goals").eq("user_id", userId).order("created_at", { ascending: false }),
    "*",
  );
  return rows.map(mapGoal);
}

async function replaceGoals(userId, goals) {
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
async function listTemplates(userId, workspaceId) {
  const supabase = getSupabase();
  let query = supabase.from("templates").select("*").eq("user_id", userId);
  if (workspaceId) query = query.eq("workspace_id", workspaceId);
  query = query.order("created_at", { ascending: false });
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(mapTemplate);
}

async function createTemplate(userId, body) {
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

async function getTemplate(userId, templateId) {
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

async function deleteTemplate(userId, templateId) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("templates")
    .delete()
    .eq("id", templateId)
    .eq("user_id", userId);
  if (error) throw error;
  return true;
}

async function listNotifications(userId, workspaceId, limit = 100) {
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

async function createNotification(userId, body) {
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

async function markNotificationRead(userId, notificationId) {
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

async function listActivity(userId, limit = 50) {
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

async function createActivity(userId, body) {
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

async function markActivityRead(userId, ids) {
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

// ---------------------------------------------------------------------------
// Analytics (fire-and-forget friendly)
// ---------------------------------------------------------------------------
async function insertAnalytics(events) {
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

async function insertAnalyticsEvent(workspaceId, event) {
  const supabase = getSupabase();
  await supabase
    .from("analytics_events")
    .insert({ workspace_id: workspaceId || null, event });
}

module.exports = {
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
  // analytics
  insertAnalytics,
  recentAnalytics,
  insertAnalyticsEvent,
};
