const express = require("express");
const router = express.Router();
const { listNotifications, createNotification, markNotificationRead } = require("../supabase/db");
const { authRequired } = require("../middleware/auth");

router.use(authRequired);

router.post("/", async (req, res) => {
  try {
    const n = await createNotification(req.userId, req.body);
    res.json(n);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server_error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const { workspace } = req.query;
    const items = await listNotifications(req.userId, workspace || null, 100);
    res.json(items);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server_error" });
  }
});

router.put("/:id/read", async (req, res) => {
  try {
    const n = await markNotificationRead(req.userId, req.params.id);
    if (!n) return res.status(404).json({ error: "not_found" });
    res.json(n);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server_error" });
  }
});

module.exports = router;
