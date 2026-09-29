
const express = require("express");
const router = express.Router();
const { getSupabase } = require("../lib/supabase");
const { toApiRows, toSnakeRow } = require("../lib/transform");
const { authRequired } = require("../middleware/auth");

router.use(authRequired);

// List the user's meetings
router.get("/", async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("meetings")
      .select("*")
      .eq("user_id", req.userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json({ ok: true, meetings: toApiRows(data) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false });
  }
});

// Create a meeting (transcript + summary transcribed on the client)
router.post("/", async (req, res) => {
  try {
    const supabase = getSupabase();
    const row = toSnakeRow(req.body || {});
    delete row.id;
    delete row._id;
    delete row.created_at;
    row.user_id = req.userId;
    const { data, error } = await supabase.from("meetings").insert(row).select().single();
    if (error) throw error;
    res.json({ ok: true, meeting: toApiRows([data])[0] });
  } catch (e) {
    console.error("Error saving meeting", e);
    res.status(500).json({ ok: false });
  }
});

// Get a single meeting
router.get("/:id", async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("meetings")
      .select("*")
      .eq("id", req.params.id)
      .eq("user_id", req.userId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ ok: false, error: "not_found" });
    res.json({ ok: true, meeting: toApiRows([data])[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false });
  }
});

// Update a meeting
router.put("/:id", async (req, res) => {
  try {
    const supabase = getSupabase();
    const row = toSnakeRow(req.body || {});
    delete row.id;
    delete row._id;
    delete row.user_id;
    delete row.created_at;
    const { data, error } = await supabase
      .from("meetings")
      .update(row)
      .eq("id", req.params.id)
      .eq("user_id", req.userId)
      .select()
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ ok: false, error: "not_found" });
    res.json({ ok: true, meeting: toApiRows([data])[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false });
  }
});

// Delete a meeting
router.delete("/:id", async (req, res) => {
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("meetings")
      .delete()
      .eq("id", req.params.id)
      .eq("user_id", req.userId);
    if (error) throw error;
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false });
  }
});

module.exports = router;

