
// Lightweight request sanitizer: recursively removes keys that start with "$"
// or contain ".", which were the injection vectors targeted by the old
// express-mongo-sanitize middleware. No external dependency required now that
// the backend is backed by Supabase (Postgres) instead of MongoDB.
function sanitizeValue(value) {
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value && typeof value === "object") {
    const out = {};
    for (const key of Object.keys(value)) {
      if (key.startsWith("$") || key.includes(".")) continue;
      out[key] = sanitizeValue(value[key]);
    }
    return out;
  }
  return value;
}

module.exports = function sanitize(req, res, next) {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeValue(req.body);
  }
  next();
};

