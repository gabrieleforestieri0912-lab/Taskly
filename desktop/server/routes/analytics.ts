
const express = require("express");
const router = express.Router();
const { getSupabase } = require("../lib/supabase");
const { toApiRows } = require("../lib/transform");

router.post("/events", async (req, res) => {
  const { events } = req.body || {};
  if (!Array.isArray(events))
    return res.status(400).json({ ok: false, message: "events must be an array" });

  try {
    const supabase = getSupabase();
    const rows = events.slice(0, 1000).map((e) => ({
      name: e.name,
      payload: e.payload ?? null,
      url: e.url,
      ts: e.ts ? new Date(e.ts).toISOString() : new Date().toISOString(),
    }));
    const { error } = await supabase.from("analytics").insert(rows);
    if (error) throw error;
    return res.json({ ok: true, received: rows.length });
  } catch (err) {
    console.error("Failed to store analytics events", err);
    return res.status(500).json({ ok: false, error: "internal" });
  }
});

router.get("/stats/recent", async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("analytics")
      .select("*")
      .order("ts", { ascending: false })
      .limit(50);
    if (error) throw error;
    res.json({ ok: true, recent: toApiRows(data) });
  } catch (e) {
    res.status(500).json({ ok: false });
  }
});

module.exports = router;

