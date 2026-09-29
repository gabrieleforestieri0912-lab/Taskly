
const { getSupabase } = require("../lib/supabase");

module.exports = async function auditLogger(req, res, next) {
  try {
    const evt = {
      name: "http_request",
      payload: { method: req.method, path: req.path, ip: req.ip, user: req.user ? req.user.id : null },
      ts: Date.now(),
    };
    const supabase = getSupabase();
    supabase
      .from("analytics_events")
      .insert({ workspace_id: req.body?.workspaceId || null, event: evt })
      .catch(() => {});
  } catch (e) {
    /* best-effort logging */
  }
  next();
};

