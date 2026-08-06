const express = require("express");
const router = express.Router();
const { insertAnalytics, recentAnalytics } = require("../supabase/db");

router.post("/events", async (req, res) => {
  const { events } = req.body || {};
  if (!Array.isArray(events))
    return res.status(400).json({ ok: false, message: "events must be an array" });

  try {
    const { ok, received } = await insertAnalytics(events);
    return res.json({ ok, received });
  } catch (err) {
    console.error("Failed to store analytics events", err);
    return res.status(500).json({ ok: false, error: "internal" });
  }
});

router.get("/stats/recent", async (req, res) => {
  try {
    const recent = await recentAnalytics(50);
    res.json({ ok: true, recent });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false });
  }
});

module.exports = router;
