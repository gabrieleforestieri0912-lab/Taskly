const express = require("express");
const router = express.Router();
const { listTasks, getTask, createTask, updateTask, deleteTask } = require("../supabase/db");
const { authRequired } = require("../middleware/auth");

router.use(authRequired);

// Create task
router.post("/", async (req, res) => {
  try {
    const t = await createTask(req.userId, req.body);
    res.json(t);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server_error" });
  }
});

// List tasks with pagination and filters
router.get("/", async (req, res) => {
  try {
    const { workspace, page = 1, limit = 50, status } = req.query;
    if (!workspace) return res.status(400).json({ error: "missing_workspace" });
    const tasks = await listTasks({
      userId: req.userId,
      workspaceId: workspace,
      status,
      page: Number(page),
      limit: Number(limit),
    });
    res.json(tasks);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server_error" });
  }
});

// Get task
router.get("/:id", async (req, res) => {
  try {
    const t = await getTask(req.userId, req.params.id);
    if (!t) return res.status(404).json({ error: "not_found" });
    res.json(t);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server_error" });
  }
});

// Update task
router.put("/:id", async (req, res) => {
  try {
    const t = await updateTask(req.userId, req.params.id, req.body);
    if (!t) return res.status(404).json({ error: "not_found" });
    res.json(t);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server_error" });
  }
});

// Delete
router.delete("/:id", async (req, res) => {
  try {
    await deleteTask(req.userId, req.params.id);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server_error" });
  }
});

module.exports = router;
