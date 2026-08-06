const express = require("express");
const {
  listWorkspacesForUser,
  createWorkspace,
  getWorkspaceForUser,
  getWorkspaceMembers,
  upsertWorkspaceMember,
  getProfileByEmail,
} = require("../supabase/db");
const { authRequired } = require("../middleware/auth");

const router = express.Router();

router.use(authRequired);

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

function canManage(members, userId) {
  const member = members.find((m) => String(m.userId) === String(userId));
  return ["owner", "admin"].includes(member?.role);
}

router.get("/", async (req, res) => {
  try {
    const workspaces = await listWorkspacesForUser(req.userId);
    res.json(workspaces);
  } catch (error) {
    console.error("Workspace list error:", error);
    res.status(500).json({ error: "server_error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    if (!name) return res.status(400).json({ error: "missing_name" });

    const workspace = await createWorkspace(req.userId, {
      name,
      slug: slugify(req.body?.slug || name),
    });

    res.status(201).json(workspace);
  } catch (error) {
    if (error && error.code === "23505") {
      return res.status(409).json({ error: "workspace_slug_exists" });
    }
    console.error("Workspace create error:", error);
    res.status(500).json({ error: "server_error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const workspace = await getWorkspaceForUser(req.userId, req.params.id);
    if (!workspace) return res.status(404).json({ error: "not_found" });
    res.json(workspace);
  } catch (error) {
    console.error("Workspace get error:", error);
    res.status(500).json({ error: "server_error" });
  }
});

router.post("/:id/members", async (req, res) => {
  try {
    const { email, role = "member" } = req.body || {};
    if (!email) return res.status(400).json({ error: "missing_email" });
    if (!["admin", "member", "viewer"].includes(role)) {
      return res.status(400).json({ error: "invalid_role" });
    }

    const workspace = await getWorkspaceForUser(req.userId, req.params.id);
    if (!workspace) return res.status(404).json({ error: "not_found" });
    if (!canManage(workspace.members, req.userId)) {
      return res.status(403).json({ error: "forbidden" });
    }

    const user = await getProfileByEmail(email);
    if (!user) return res.status(404).json({ error: "user_not_found" });

    await upsertWorkspaceMember(workspace._id, user.id, role);

    const members = await getWorkspaceMembers(workspace._id);
    res.json({ ...workspace, members });
  } catch (error) {
    console.error("Workspace member error:", error);
    res.status(500).json({ error: "server_error" });
  }
});

module.exports = router;
