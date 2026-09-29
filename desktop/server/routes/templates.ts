
const express = require("express");
const router = express.Router();
const { getSupabase } = require("../lib/supabase");
const { toApiRows, toSnakeRow } = require("../lib/transform");
const { authRequired } = require("../middleware/auth");

router.use(authRequired);

router.post("/", async (req, res) => {
  try {
    const supabase = getSupabase();
    const row = toSnakeRow(req.body);
    delete row.id;
    delete row._id;
    delete row.created_at;
    row.user_id = req.userId;
    const { data, error } = await supabase.from("templates").insert(row).select().single();
    if (error) throw error;
    res.json(toApiRows([data])[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server_error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const { workspace } = req.query;
    const supabase = getSupabase();
    let query = supabase.from("templates").select("*").eq("user_id", req.userId).order("created_at", { ascending: false });
    if (workspace) query = query.eq("workspace_id", workspace);
    const { data, error } = await query;
    if (error) throw error;
    res.json(toApiRows(data));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server_error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("templates")
      .select("*")
      .eq("id", req.params.id)
      .eq("user_id", req.userId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: "not_found" });
    res.json(toApiRows([data])[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server_error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("templates")
      .delete()
      .eq("id", req.params.id)
      .eq("user_id", req.userId);
    if (error) throw error;
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server_error" });
  }
});

module.exports = router;

