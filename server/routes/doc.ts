import express, { Router, Request, Response } from "express";
import { searchDocs, getDoc, saveDoc, listDocVersions } from "../supabase/db";
import { authRequired } from "../middleware/auth";

const router: Router = express.Router();

router.use(authRequired);

// Search endpoint used for mention autocompletion (GET /api/doc/search?workspace=...&q=...)
router.get("/search", async (req: Request, res: Response) => {
  try {
    const { workspace, q } = req.query as { workspace?: string; q?: string };
    if (!workspace || !q) return res.json([]);
    const items = await searchDocs({
      userId: req.userId as string,
      workspaceId: workspace,
      q,
      limit: 10,
    });
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

router.get("/:workspace/:slug", async (req: Request, res: Response) => {
  try {
    const { workspace, slug } = req.params as {
      workspace: string;
      slug: string;
    };
    const doc = await getDoc({
      userId: req.userId as string,
      workspaceId: workspace,
      slug,
    });
    if (!doc) return res.status(404).json({ error: "not_found" });
    return res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

router.post("/save", async (req: Request, res: Response) => {
  try {
    const { workspaceId, slug, title, blocks, author } = req.body as {
      workspaceId?: string;
      slug?: string;
      title?: string;
      blocks?: unknown;
      author?: string;
    };
    const blocksArray = blocks as any[] | undefined;
    if (!workspaceId || !slug)
      return res.status(400).json({ error: "missing_fields" });

    const { docId, version } = await saveDoc({
      userId: req.userId as string,
      workspaceId,
      slug,
      title,
      blocks: blocksArray,
      author,
    });

    res.json({ ok: true, docId, version });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

router.get("/:id/versions", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const versions = await listDocVersions(req.userId as string, id);
    if (versions === null) return res.status(404).json({ error: "not_found" });
    res.json(versions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

export default router;
