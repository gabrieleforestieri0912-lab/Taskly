import express, { Router, Request, Response } from "express";
import {
  createPageRow,
  updatePageRow,
  deletePageRow,
  createGoalRow,
  updateGoalRow,
  deleteGoalRow,
  createIdeaRow,
  updateIdeaRow,
  deleteIdeaRow,
} from "../supabase/db";
import { authRequired } from "../middleware/auth";

const router: Router = express.Router();

router.use(authRequired);

const handle =
  (fn: () => Promise<any>) => async (_req: Request, res: Response) => {
    try {
      const result = await fn();
      if (result === null) {
        return res.status(404).json({ ok: false, error: "not_found" });
      }
      res.json({ ok: true, data: result });
    } catch (e) {
      console.error(e);
      res.status(500).json({ ok: false, error: "server_error" });
    }
  };

// ---------- pages ----------
router.post("/pages", async (req: Request, res: Response) =>
  handle(() => createPageRow(req.userId as string, req.body))(req, res));

router.put("/pages/:id", (req, res) =>
  handle(() => updatePageRow(req.userId as string, String(req.params.id), req.body))(req, res));

router.delete("/pages/:id", (req, res) =>
  handle(async () => {
    await deletePageRow(req.userId as string, String(req.params.id));
    return true;
  })(req, res));

// ---------- goals ----------
router.post("/goals", async (req: Request, res: Response) =>
  handle(() => createGoalRow(req.userId as string, req.body))(req, res));

router.put("/goals/:id", (req, res) =>
  handle(() => updateGoalRow(req.userId as string, String(req.params.id), req.body))(req, res));

router.delete("/goals/:id", (req, res) =>
  handle(async () => {
    await deleteGoalRow(req.userId as string, String(req.params.id));
    return true;
  })(req, res));

// ---------- ideas ----------
router.post("/ideas", async (req: Request, res: Response) =>
  handle(() => createIdeaRow(req.userId as string, req.body))(req, res));

router.put("/ideas/:id", (req, res) =>
  handle(() => updateIdeaRow(req.userId as string, String(req.params.id), req.body))(req, res));

router.delete("/ideas/:id", (req, res) =>
  handle(async () => {
    await deleteIdeaRow(req.userId as string, String(req.params.id));
    return true;
  })(req, res));

export default router;