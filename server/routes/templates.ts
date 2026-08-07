import express, { Router, Request, Response } from "express";
import {
  listTemplates,
  createTemplate,
  getTemplate,
  deleteTemplate,
} from "../supabase/db";
import { authRequired } from "../middleware/auth";

const router: Router = express.Router();

router.use(authRequired);

router.post("/", async (req: Request, res: Response) => {
  try {
    const t = await createTemplate(req.userId as string, req.body);
    res.json(t);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server_error" });
  }
});

router.get("/", async (req: Request, res: Response) => {
  try {
    const { workspace } = req.query as { workspace?: string };
    const ts = await listTemplates(req.userId as string, workspace);
    res.json(ts);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server_error" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const t = await getTemplate(req.userId as string, req.params.id as string);
    if (!t) return res.status(404).json({ error: "not_found" });
    res.json(t);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server_error" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await deleteTemplate(req.userId as string, req.params.id as string);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server_error" });
  }
});

export default router;
