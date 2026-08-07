import express, { Router, Request, Response } from "express";
import { insertAnalytics, recentAnalytics } from "../supabase/db";

const router: Router = express.Router();

router.post("/events", async (req: Request, res: Response) => {
  const { events } = (req.body || {}) as { events?: unknown[] };
  if (!Array.isArray(events))
    return res
      .status(400)
      .json({ ok: false, message: "events must be an array" });

  try {
    const { ok, received } = await insertAnalytics(events);
    return res.json({ ok, received });
  } catch (err) {
    console.error("Failed to store analytics events", err);
    return res.status(500).json({ ok: false, error: "internal" });
  }
});

router.get("/stats/recent", async (req: Request, res: Response) => {
  try {
    const recent = await recentAnalytics(50);
    res.json({ ok: true, recent });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false });
  }
});

export default router;
