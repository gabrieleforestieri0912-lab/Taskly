
const express = require("express");
const router = express.Router();
const { getSupabase } = require("../lib/supabase");
const { toApiRows, toSnakeRow } = require("../lib/transform");
const { authRequired } = require("../middleware/auth");
const { resolveAccess, roleAtLeast } = require("../lib/workspaces");

router.use(authRequired);

// ── Workspace-aware access ────────────────────────────────────────────────
// A task is visible/editable when the caller owns it (personal spaces) or is
// a member of the workspace it belongs to. Viewers get read-only access.

/**
 * Resolve the workspace the request targets and the caller's role.
 * Returns { workspace, role, scope } where scope is "own" (tasks created by
 * the caller) or "workspace" (all tasks of a shared workspace).
 */
async function resolveTaskAccess(req, res, minRole = 'viewer') {
  const workspace = String(
    req.query.workspace || req.body?.workspace || req.body?.workspaceId || '',
  ).trim();
  if (!workspace) {
    res.status(400).json({ error: "missing_workspace" });
    return null;
  }
  const access = await resolveAccess(req.userId, workspace, minRole);
  if (!access) {
    if (workspace === "personal") {
      return { workspace, role: "owner", scope: "own" };
    }
    res.status(403).json({ error: "workspace_forbidden" });
    return null;
  }
  return {
    workspace,
    role: access.role,
    scope: workspace === "personal" ? "own" : "workspace",
  };
}

/** Apply the ownership scope to a supabase query on the tasks table. */
function scopeQuery(query, access, userId) {
  return access.scope === "own" ? query.eq("user_id", userId) : query;
}

function canEdit(access) {
  return access.scope === "own" || roleAtLeast(access.role, "member");
}

function broadcastTasks(req, workspaceId) {
  try {
    const io = req.app.get("io");
    if (!io) return;
    io.to(`ws:${workspaceId}`).emit("workspace-tasks-changed", { workspaceId });
  } catch {
    /* socket layer optional */
  }
}

function taskInsertBody(body, userId) {
  const row = toSnakeRow(body);
  delete row.id;
  delete row._id;
  delete row.created_at;
  delete row.updated_at;
  row.user_id = userId;
  row.workspace_id = body.workspaceId || body.workspace || "personal";
  return row;
}

// Create task
router.post("/", async (req, res) => {
  try {
    const access = await resolveTaskAccess(req, res, 'member');
    if (!access) return;
    if (!canEdit(access)) {
      return res.status(403).json({ error: "read_only" });
    }
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("tasks")
      .insert(taskInsertBody(req.body, req.userId))
      .select()
      .single();
    if (error) throw error;
    broadcastTasks(req, access.workspace);
    res.json(toApiRows([data])[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server_error" });
  }
});

// List tasks with pagination and filters
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 50, status } = req.query;
    const access = await resolveTaskAccess(req, res);
    if (!access) return;
    const supabase = getSupabase();
    let query = supabase
      .from("tasks")
      .select("*")
      .eq("workspace_id", access.workspace)
      .order("created_at", { ascending: false });
    query = scopeQuery(query, access, req.userId);
    if (status) query = query.eq("status", status);
    const from = (Number(page) - 1) * Number(limit);
    query = query.range(from, from + Number(limit) - 1);
    const { data, error } = await query;
    if (error) throw error;
    res.json(toApiRows(data));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server_error" });
  }
});

// Get task
router.get("/:id", async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", req.params.id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: "not_found" });
    const access = await resolveAccess(req.userId, data.workspace_id);
    const owns = String(data.user_id) === String(req.userId);
    if (!access && !(owns && data.workspace_id === 'personal')) {
      return res.status(403).json({ error: "forbidden" });
    }
    res.json(toApiRows([data])[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server_error" });
  }
});

// Update task
router.put("/:id", async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data: existing, error: exErr } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", req.params.id)
      .maybeSingle();
    if (exErr) throw exErr;
    if (!existing) return res.status(404).json({ error: "not_found" });

    const owns = String(existing.user_id) === String(req.userId);
    const access = owns
      ? { role: "owner" }
      : await resolveAccess(req.userId, existing.workspace_id, 'member');
    if (!access) {
      return res.status(403).json({ error: "forbidden" });
    }

    const row = toSnakeRow(req.body);
    delete row.id;
    delete row._id;
    delete row.user_id;
    delete row.created_at;
    delete row.workspace_id;
    row.updated_at = new Date().toISOString();
    const { data, error } = await supabase
      .from("tasks")
      .update(row)
      .eq("id", req.params.id)
      .select()
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: "not_found" });
    broadcastTasks(req, existing.workspace_id);
    res.json(toApiRows([data])[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server_error" });
  }
});

// Delete
router.delete("/:id", async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data: existing, error: exErr } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", req.params.id)
      .maybeSingle();
    if (exErr) throw exErr;
    if (!existing) return res.status(404).json({ error: "not_found" });

    const owns = String(existing.user_id) === String(req.userId);
    const access = owns
      ? { role: "owner" }
      : await resolveAccess(req.userId, existing.workspace_id, 'admin');
    if (!access) {
      return res.status(403).json({ error: "forbidden" });
    }

    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", req.params.id);
    if (error) throw error;
    broadcastTasks(req, existing.workspace_id);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server_error" });
  }
});

module.exports = router;

