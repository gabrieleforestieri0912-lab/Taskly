import express, { Router, Request, Response } from "express";
import {
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
} from "../supabase/db";
import { authRequired } from "../middleware/auth";

const router: Router = express.Router();

router.use(authRequired);

// Create task
router.post("/", async (req: Request, res: Response) => {
  try {
    const t = await createTask(req.userId as string, req.body);
    res.json(t);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server_error" });
  }
});

// List tasks with pagination and filters
router.get("/", async (req: Request, res: Response) => {
  try {
    const { workspace, page = 1, limit = 50, status } = req.query as {
      workspace?: string;
      page?: string;
      limit?: string;
      status?: string;
    };
    if (!workspace) return res.status(400).json({ error: "missing_workspace" });
    const tasks = await listTasks({
      userId: req.userId as string,
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
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const t = await getTask(req.userId as string, req.params.id as string);
    if (!t) return res.status(404).json({ error: "not_found" });
    res.json(t);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server_error" });
  }
});

// Update task
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const t = await updateTask(req.userId as string, req.params.id as string, req.body);
    if (!t) return res.status(404).json({ error: "not_found" });
    res.json(t);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server_error" });
  }
});

// Delete
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await deleteTask(req.userId as string, req.params.id as string);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server_error" });
  }
});

export default router;
