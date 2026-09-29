
const express = require("express");
const router = express.Router();
const { getSupabase } = require("../lib/supabase");
const { authRequired } = require("../middleware/auth");

router.use(authRequired);

// Search endpoint used for mention autocompletion
router.get("/search", async (req, res) => {
  try {
    const { workspace, q } = req.query;
    if (!workspace || !q) return res.json([]);
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("documents")
      .select("id, title, slug")
      .eq("user_id", req.userId)
      .eq("workspace_id", workspace)
      .or(`title.ilike.%${q}%,slug.ilike.%${q}%`)
      .limit(10);
    if (error) throw error;
    const items = (data || []).map((d) => ({ id: d.id, title: d.title || d.slug, slug: d.slug }));
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

function extractBacklinks(blocks) {
  const regex = /\[\[([^\]]+)\]\]/g;
  const set = new Set();
  (blocks || []).forEach((b) => {
    const text = typeof b.text === "string" ? b.text : b.content || "";
    let m;
    while ((m = regex.exec(text))) set.add(m[1]);
  });
  return Array.from(set);
}

function plainTextOf(blocks) {
  return (blocks || []).map((b) => (typeof b.text === "string" ? b.text : b.content || "")).join("\n");
}

router.get("/:workspace/:slug", async (req, res) => {
  try {
    const { workspace, slug } = req.params;
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", req.userId)
      .eq("workspace_id", workspace)
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: "not_found" });
    return res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

router.post("/save", async (req, res) => {
  try {
    const { workspaceId, slug, title, blocks, author } = req.body;
    if (!workspaceId || !slug) return res.status(400).json({ error: "missing_fields" });

    const supabase = getSupabase();
    const plainText = plainTextOf(blocks);

    const { data: doc, error } = await supabase
      .from("documents")
      .upsert(
        {
          user_id: req.userId,
          workspace_id: workspaceId,
          slug,
          title: title || "",
          blocks: blocks || [],
          plain_text: plainText,
          backlinks: extractBacklinks(blocks),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,workspace_id,slug" },
      )
      .select()
      .single();
    if (error) throw error;

    // create version
    const { data: lastVersion } = await supabase
      .from("doc_versions")
      .select("version")
      .eq("doc_id", doc.id)
      .order("version", { ascending: false })
      .limit(1);
    const nextVersion = (lastVersion?.[0]?.version || 0) + 1;
    const { error: verr } = await supabase.from("doc_versions").insert({
      doc_id: doc.id,
      version: nextVersion,
      blocks: blocks || [],
      author: author || "system",
    });
    if (verr) throw verr;

    res.json({ ok: true, docId: doc.id, version: nextVersion });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

router.get("/:id/versions", async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = getSupabase();
    const { data: doc, error } = await supabase
      .from("documents")
      .select("id")
      .eq("id", id)
      .eq("user_id", req.userId)
      .maybeSingle();
    if (error) throw error;
    if (!doc) return res.status(404).json({ error: "not_found" });
    const { data: versions, error: verr } = await supabase
      .from("doc_versions")
      .select("*")
      .eq("doc_id", id)
      .order("version", { ascending: false });
    if (verr) throw verr;
    res.json(versions || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

module.exports = router;

