
const express = require("express");
const router = express.Router();
const { getSupabase } = require("../lib/supabase");
const { authRequired } = require("../middleware/auth");

router.use(authRequired);

// Full-text search on document title + plain_text using the generated
// `search_tsv` tsvector column (replaces the old MongoDB $text index).
router.post("/vector", async (req, res) => {
  try {
    const { workspace, q, limit = 10 } = req.body;
    if (!workspace || !q) return res.status(400).json({ error: "missing" });

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("documents")
      .select("id, slug, title")
      .eq("user_id", req.userId)
      .eq("workspace_id", workspace)
      .textSearch("search_tsv", q, { type: "plain" })
      .limit(Number(limit));

    if (error) throw error;

    const out = (data || []).map((d, i) => ({
      id: d.id,
      slug: d.slug,
      title: d.title,
      score: 1 - i * 0.01,
    }));
    res.json(out);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server_error" });
  }
});

module.exports = router;

