/**
 * Replaces express-mongo-sanitize.
 * PostgREST parameterized queries are not vulnerable to NoSQL operator
 * injection, but we keep a defensive sanitizer that strips `$`-prefixed keys
 * and dotted keys from request bodies.
 */
function sanitizeValue(value) {
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (value && typeof value === "object") {
    const out = {};
    for (const [key, val] of Object.entries(value)) {
      if (key.startsWith("$")) continue;
      out[key.replace(/\./g, "_")] = sanitizeValue(val);
    }
    return out;
  }
  return value;
}

module.exports = function sanitize(req, res, next) {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeValue(req.body);
  }
  if (req.query && typeof req.query === "object") {
    req.query = sanitizeValue(req.query);
  }
  next();
};
