const express = require("express");
const router = express.Router();
const { listTemplates, createTemplate, getTemplate, deleteTemplate } = require("../supabase/db");
const { authRequired } = require("../middleware/auth");

router.use(authRequired);

router.post("/", async (req, res) => {
  try {
    const t = await createTemplate(req.userId, req.body);
    res.json(t);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server_error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const { workspace } = req.query;
    const ts = await listTemplates(req.userId, workspace);
    res.json(ts);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server_error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const t = await getTemplate(req.userId, req.params.id);
    if (!t) return res.status(404).json({ error: "not_found" });
    res.json(t);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server_error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await deleteTemplate(req.userId, req.params.id);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server_error" });
  }
});

module.exports = router;
