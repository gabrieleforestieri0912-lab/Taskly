
const express = require("express");
const crypto = require("crypto");
const { getSupabase } = require("../lib/supabase");
const { toApiRows, toSnakeRow } = require("../lib/transform");
const { authRequired } = require("../middleware/auth");

function makeResourceRouter(table, fields) {
  const router = express.Router();
  router.use(authRequired);

  function rowFrom(body) {
    const row = toSnakeRow(body || {});
    delete row.id;
    delete row._id;
    delete row.created_at;
    delete row.updated_at;
    const out = {};
    for (const f of fields) {
      if (f in row) out[f] = row[f];
    }
    return out;
  }

  // List
  router.get("/", async (req, res) => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq("user_id", req.userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      res.json({ ok: true, data: toApiRows(data) });
    } catch (e) {
      console.error(e);
      res.status(500).json({ ok: false, error: "server_error" });
    }
  });

  // Create (upsert by user_id + client id)
  router.post("/", async (req, res) => {
    try {
      const supabase = getSupabase();
      const id = req.body?.id || crypto.randomUUID();
      const row = rowFrom(req.body);
      row.id = String(id);
      row.user_id = req.userId;
      const { data, error } = await supabase
        .from(table)
        .upsert(row, { onConflict: "user_id,id" })
        .select()
        .single();
      if (error) throw error;
      res.json({ ok: true, data: toApiRows([data])[0] });
    } catch (e) {
      console.error(e);
      res.status(500).json({ ok: false, error: "server_error" });
    }
  });

  // Get one
  router.get("/:id", async (req, res) => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq("id", req.params.id)
        .eq("user_id", req.userId)
        .maybeSingle();
      if (error) throw error;
      if (!data) return res.status(404).json({ ok: false, error: "not_found" });
      res.json({ ok: true, data: toApiRows([data])[0] });
    } catch (e) {
      console.error(e);
      res.status(500).json({ ok: false, error: "server_error" });
    }
  });

  // Update
  router.put("/:id", async (req, res) => {
    try {
      const supabase = getSupabase();
      const row = rowFrom(req.body);
      row.user_id = req.userId;
      const { data, error } = await supabase
        .from(table)
        .update(row)
        .eq("id", req.params.id)
        .eq("user_id", req.userId)
        .select()
        .single();
      if (error) throw error;
      if (!data) return res.status(404).json({ ok: false, error: "not_found" });
      res.json({ ok: true, data: toApiRows([data])[0] });
    } catch (e) {
      console.error(e);
      res.status(500).json({ ok: false, error: "server_error" });
    }
  });

  // Delete
  router.delete("/:id", async (req, res) => {
    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from(table)
        .delete()
        .eq("id", req.params.id)
        .eq("user_id", req.userId);
      if (error) throw error;
      res.json({ ok: true, data: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ ok: false, error: "server_error" });
    }
  });

  return router;
}

const goalsFields = ["title", "description", "completed", "sub_goals"];
const ideasFields = ["title", "category"];
const pagesFields = ["type", "label", "icon", "icon_color", "parent_id", "purpose", "is_template", "data", "meta", "sort_order"];

const router = express.Router();
router.use("/goals", makeResourceRouter("goals", goalsFields));
router.use("/ideas", makeResourceRouter("ideas", ideasFields));
router.use("/pages", makeResourceRouter("pages", pagesFields));

module.exports = router;

