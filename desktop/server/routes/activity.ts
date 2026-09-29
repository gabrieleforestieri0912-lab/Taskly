
const express = require("express");
const router = express.Router();
const { getSupabase } = require("../lib/supabase");
const { toApiRows, toSnakeRow } = require("../lib/transform");
const { authRequired } = require("../middleware/auth");

router.use(authRequired);

// Create activity (for server-side events or admin actions)
router.post("/", async (req, res) => {
  try {
    const { type, title, body, payload } = req.body || {};
    const supabase = getSupabase();
    const row = { type, user_id: req.userId, title, body, payload: payload ?? null };
    const { data, error } = await supabase.from("activity").insert(row).select().single();
    if (error) throw error;
    res.json({ ok: true, activity: toApiRows([data])[0] });
  } catch (e) {
    console.error("Error creating activity", e);
    res.status(500).json({ ok: false });
  }
});

// Get recent activities (optionally for a user)
router.get("/recent", async (req, res) => {
  try {
    const limit = Math.min(100, parseInt(req.query.limit || "50", 10));
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("activity")
      .select("*")
      .eq("user_id", req.userId)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    res.json({ ok: true, recent: toApiRows(data) });
  } catch (e) {
    res.status(500).json({ ok: false });
  }
});

// Mark activities read
router.post("/mark-read", async (req, res) => {
  try {
    const { ids = [] } = req.body || {};
    if (!Array.isArray(ids)) return res.status(400).json({ ok: false, message: "ids must be array" });
    const supabase = getSupabase();
    const { error } = await supabase
      .from("activity")
      .update({ read: true })
      .in("id", ids)
      .eq("user_id", req.userId);
    if (error) throw error;
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false });
  }
});

module.exports = router;

