const express = require("express");
const router = express.Router();
const { searchDocs, getDoc, saveDoc, listDocVersions } = require("../supabase/db");
const { authRequired } = require("../middleware/auth");

router.use(authRequired);

// Search endpoint used for mention autocompletion (GET /api/doc/search?workspace=...&q=...)
router.get("/search", async (req, res) => {
  try {
    const { workspace, q } = req.query;
    if (!workspace || !q) return res.json([]);
    const items = await searchDocs({ userId: req.userId, workspaceId: workspace, q, limit: 10 });
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

router.get("/:workspace/:slug", async (req, res) => {
  try {
    const { workspace, slug } = req.params;
    const doc = await getDoc({ userId: req.userId, workspaceId: workspace, slug });
    if (!doc) return res.status(404).json({ error: "not_found" });
    return res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

router.post("/save", async (req, res) => {
  try {
    const { workspaceId, slug, title, blocks, author } = req.body;
    if (!workspaceId || !slug) return res.status(400).json({ error: "missing_fields" });

    const { docId, version } = await saveDoc({
      userId: req.userId,
      workspaceId,
      slug,
      title,
      blocks,
      author,
    });

    res.json({ ok: true, docId, version });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

router.get("/:id/versions", async (req, res) => {
  try {
    const { id } = req.params;
    const versions = await listDocVersions(req.userId, id);
    if (versions === null) return res.status(404).json({ error: "not_found" });
    res.json(versions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

module.exports = router;
