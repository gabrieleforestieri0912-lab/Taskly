const { insertAnalyticsEvent } = require("../supabase/db");

module.exports = function auditLogger(req, res, next) {
  try {
    const evt = {
      name: "http_request",
      payload: {
        method: req.method,
        path: req.path,
        ip: req.ip,
        user: req.user ? req.user.id : null,
      },
      ts: Date.now(),
    };
    insertAnalyticsEvent(req.body?.workspaceId || null, evt).catch(() => {});
  } catch (e) {
    // never block the request for audit logging
  }
  next();
};
