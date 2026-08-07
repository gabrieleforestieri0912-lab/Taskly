import express, { Router, Request, Response } from "express";
import {
  listNotifications,
  createNotification,
  markNotificationRead,
} from "../supabase/db";
import { authRequired } from "../middleware/auth";

const router: Router = express.Router();

router.use(authRequired);

router.post("/", async (req: Request, res: Response) => {
  try {
    const n = await createNotification(req.userId as string, req.body);
    res.json(n);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server_error" });
  }
});

router.get("/", async (req: Request, res: Response) => {
  try {
    const workspace = req.query.workspace as string | undefined;
    const items = await listNotifications(
      req.userId as string,
      workspace || "",
      100,
    );
    res.json(items);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server_error" });
  }
});

router.put("/:id/read", async (req: Request, res: Response) => {
  try {
    const n = await markNotificationRead(
      req.userId as string,
      req.params.id as string,
    );
    if (!n) return res.status(404).json({ error: "not_found" });
    res.json(n);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server_error" });
  }
});

export default router;
