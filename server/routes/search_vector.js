const express = require("express");
const router = express.Router();
const { getSupabase } = require("../supabase/client");
const { getEmbedding } = require("../utils/embeddings");
const { searchVectors } = require("../utils/pgVector");
const { authRequired } = require("../middleware/auth");

router.use(authRequired);

router.post("/vector", async (req, res) => {
  try {
    const { workspace, q, limit = 10 } = req.body;
    if (!workspace || !q) return res.status(400).json({ error: "missing" });

    // Semantic search via pgvector (only when explicitly enabled)
    if (process.env.ENABLE_VECTOR === "true") {
      const embedding = await getEmbedding(q);
      const vectorResults = await searchVectors({
        userId: req.userId,
        workspace,
        embedding,
        limit: Number(limit),
      });
      if (vectorResults.length > 0) {
        return res.json(vectorResults);
      }
    }

    // Fallback: Postgres full-text search with relevance ranking
    const needle = `%${String(q)
      .replace(/[,\(\)\*\|\"\'\`\\]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/%/g, "\\%")
      .replace(/_/g, "\\_")}%`;
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("documents")
      .select("id, slug, title")
      .eq("user_id", req.userId)
      .eq("workspace_id", workspace)
      .or(`title.ilike.${needle},plain_text.ilike.${needle}`)
      .order("updated_at", { ascending: false })
      .limit(Number(limit));
    if (error) throw error;

    const out = (data || []).map((d) => ({ id: d.id, slug: d.slug, title: d.title, score: 1 }));
    res.json(out);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server_error" });
  }
});

module.exports = router;
