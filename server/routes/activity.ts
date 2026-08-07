import express, { Router, Request, Response } from "express";
import {
  createActivity,
  listActivity,
  markActivityRead,
} from "../supabase/db";
import { authRequired } from "../middleware/auth";

const router: Router = express.Router();

router.use(authRequired);

// Create activity (for server-side events or admin actions)
router.post("/", async (req: Request, res: Response) => {
  try {
    const activity = await createActivity(
      req.userId as string,
      req.body || {},
    );
    res.json({ ok: true, activity });
  } catch (e) {
    console.error("Error creating activity", e);
    res.status(500).json({ ok: false });
  }
});

// Get recent activities for the user
router.get("/recent", async (req: Request, res: Response) => {
  try {
    const limit = Math.min(100, parseInt(String(req.query.limit || "50"), 10));
    const recent = await listActivity(req.userId as string, limit);
    res.json({ ok: true, recent });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false });
  }
});

// Mark activities read
router.post("/mark-read", async (req: Request, res: Response) => {
  try {
    const { ids = [] } = (req.body || {}) as { ids?: string[] };
    if (!Array.isArray(ids))
      return res.status(400).json({ ok: false, message: "ids must be array" });
    await markActivityRead(req.userId as string, ids);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false });
  }
});

export default router;
