const express = require("express");
const { authRequired } = require("../middleware/auth");
const {
  ROLES,
  slugify,
  listWorkspacesForUser,
  createWorkspace,
  getWorkspaceForUser,
  listMembers,
  getProfileByEmail,
  upsertMember,
  removeMember,
  touchWorkspace,
} = require("../lib/workspaces");

const router = express.Router();
router.use(authRequired);

const MANAGER_ROLES = ["owner", "admin"];

/** Notify every client currently inside the workspace that membership changed. */
function broadcast(req, workspaceId, members) {
  try {
    const io = req.app.get("io");
    if (!io) return;
    io.to(`ws:${workspaceId}`).emit("workspace-updated", {
      workspaceId,
      members,
      by: req.userId,
    });
  } catch {
    /* socket layer optional */
  }
}

function loadWorkspace(req, res) {
  return getWorkspaceForUser(req.userId, req.params.id).then((ws) => {
    if (!ws) {
      res.status(404).json({ error: "not_found" });
      return null;
    }
    return ws;
  });
}

function canManage(workspace, userId) {
  const member = (workspace.members || []).find(
    (m) => String(m.userId) === String(userId),
  );
  return MANAGER_ROLES.includes(member?.role || "");
}

// ── List every workspace the caller belongs to (owned + shared) ─────────────
router.get("/", async (req, res) => {
  try {
    const workspaces = await listWorkspacesForUser(req.userId);
    // hydrate members with profile data (name/email/picture) for the UI
    const hydrated = await Promise.all(
      workspaces.map(async (ws) => ({ ...ws, members: await listMembers(ws._id) })),
    );
    res.json(hydrated);
  } catch (e) {
    console.error("[workspaces] list error:", e);
    res.status(500).json({ error: "server_error" });
  }
});

// ── Create a workspace (caller becomes owner) ──────────────────────────────
router.post("/", async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    if (!name) return res.status(400).json({ error: "missing_name" });
    const workspace = await createWorkspace(req.userId, {
      name,
      slug: slugify(req.body?.slug || name),
    });
    res.status(201).json(workspace);
  } catch (e) {
    if (e && e.code === "23505") {
      return res.status(409).json({ error: "workspace_slug_exists" });
    }
    console.error("[workspaces] create error:", e);
    res.status(500).json({ error: "server_error" });
  }
});

// ── Workspace detail + members ─────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const workspace = await loadWorkspace(req, res);
    if (!workspace) return;
    res.json(workspace);
  } catch (e) {
    console.error("[workspaces] get error:", e);
    res.status(500).json({ error: "server_error" });
  }
});

// ── Invite / update a member by email ──────────────────────────────────────
router.post("/:id/members", async (req, res) => {
  try {
    const workspace = await loadWorkspace(req, res);
    if (!workspace) return;
    if (!canManage(workspace, req.userId)) {
      return res.status(403).json({ error: "forbidden" });
    }
    const email = String(req.body?.email || "").trim();
    const role = String(req.body?.role || "member");
    if (!email) return res.status(400).json({ error: "missing_email" });
    if (!["admin", "member", "viewer"].includes(role)) {
      return res.status(400).json({ error: "invalid_role" });
    }
    const profile = await getProfileByEmail(email);
    if (!profile) return res.status(404).json({ error: "user_not_found" });

    await upsertMember(workspace._id, profile.id, role);
    await touchWorkspace(workspace._id);
    const members = await listMembers(workspace._id);
    broadcast(req, workspace._id, members);
    res.json({ ...workspace, members });
  } catch (e) {
    console.error("[workspaces] invite error:", e);
    res.status(500).json({ error: "server_error" });
  }
});

// ── Change a member role ───────────────────────────────────────────────────
router.patch("/:id/members/:userId", async (req, res) => {
  try {
    const workspace = await loadWorkspace(req, res);
    if (!workspace) return;
    if (!canManage(workspace, req.userId)) {
      return res.status(403).json({ error: "forbidden" });
    }
    const target = String(req.params.userId);
    const role = String(req.body?.role || "");
    if (!ROLES.includes(role)) return res.status(400).json({ error: "invalid_role" });

    const member = (workspace.members || []).find(
      (m) => String(m.userId) === target,
    );
    if (!member) return res.status(404).json({ error: "user_not_found" });

    const actorRole = (workspace.members || []).find(
      (m) => String(m.userId) === String(req.userId),
    )?.role;

    // only the owner can touch another admin or the owner row
    if (actorRole !== "owner" && ["owner", "admin"].includes(member.role)) {
      return res.status(403).json({ error: "forbidden" });
    }
    // the owner role cannot be transferred away (avoid orphaned workspaces)
    if (member.role === "owner" && role !== "owner") {
      return res.status(400).json({ error: "cannot_change_owner" });
    }

    await upsertMember(workspace._id, target, role);
    const members = await listMembers(workspace._id);
    broadcast(req, workspace._id, members);
    res.json({ ...workspace, members });
  } catch (e) {
    console.error("[workspaces] role error:", e);
    res.status(500).json({ error: "server_error" });
  }
});

// ── Remove a member (self-leave or kicked by a manager) ────────────────────
router.delete("/:id/members/:userId", async (req, res) => {
  try {
    const workspace = await loadWorkspace(req, res);
    if (!workspace) return;
    const target = String(req.params.userId);
    const isSelf = String(req.userId) === target;
    if (!isSelf && !canManage(workspace, req.userId)) {
      return res.status(403).json({ error: "forbidden" });
    }
    const member = (workspace.members || []).find(
      (m) => String(m.userId) === target,
    );
    if (!member) return res.status(404).json({ error: "user_not_found" });
    // The owner can never be removed (not even by itself): that would leave
    // the workspace without an owner. Transfer ownership first.
    if (member.role === "owner") {
      return res.status(403).json({ error: "cannot_remove_owner" });
    }

    await removeMember(workspace._id, target);
    await touchWorkspace(workspace._id);
    const members = await listMembers(workspace._id);
    broadcast(req, workspace._id, members);
    res.json({ ...workspace, members });
  } catch (e) {
    console.error("[workspaces] remove error:", e);
    res.status(500).json({ error: "server_error" });
  }
});

module.exports = router;

