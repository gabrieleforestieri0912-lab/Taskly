const express = require("express");
const router = express.Router();
const { createActivity, listActivity, markActivityRead } = require("../supabase/db");
const { authRequired } = require("../middleware/auth");

router.use(authRequired);

// Create activity (for server-side events or admin actions)
router.post("/", async (req, res) => {
  try {
    const activity = await createActivity(req.userId, req.body || {});
    res.json({ ok: true, activity });
  } catch (e) {
    console.error("Error creating activity", e);
    res.status(500).json({ ok: false });
  }
});

// Get recent activities for the user
router.get("/recent", async (req, res) => {
  try {
    const limit = Math.min(100, parseInt(req.query.limit || "50", 10));
    const recent = await listActivity(req.userId, limit);
    res.json({ ok: true, recent });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false });
  }
});

// Mark activities read
router.post("/mark-read", async (req, res) => {
  try {
    const { ids = [] } = req.body || {};
    if (!Array.isArray(ids))
      return res.status(400).json({ ok: false, message: "ids must be array" });
    await markActivityRead(req.userId, ids);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false });
  }
});

module.exports = router;
