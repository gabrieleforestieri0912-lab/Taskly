
// Convert object keys between snake_case (Supabase/Postgres) and camelCase
// (the desktop frontend's API contract). Only top-level keys are converted so
// that jsonb payloads (subscription, customFields, blocks, etc.) are left intact.

function snakeToCamel(str) {
  return str.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
}

function camelToSnake(str) {
  return str.replace(/[A-Z]/g, (m) => "_" + m.toLowerCase());
}

function toCamelRow(obj) {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return obj;
  const out = {};
  for (const key of Object.keys(obj)) {
    out[snakeToCamel(key)] = obj[key];
  }
  return out;
}

function toSnakeRow(obj) {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return obj;
  const out = {};
  for (const key of Object.keys(obj)) {
    out[camelToSnake(key)] = obj[key];
  }
  return out;
}

function rowsToCamel(rows) {
  return (rows || []).map(toCamelRow);
}

// Same as rowsToCamel but also exposes `_id` (the old MongoDB primary key the
// frontend may still reference) as an alias of `id`, so existing client code
// keeps working after the Mongo -> Supabase migration.
function toApiRow(row) {
  const camel = toCamelRow(row);
  if (camel && typeof camel === "object" && "id" in camel) {
    camel._id = camel.id;
  }
  return camel;
}

function toApiRows(rows) {
  return (rows || []).map(toApiRow);
}

module.exports = { snakeToCamel, camelToSnake, toCamelRow, toSnakeRow, rowsToCamel, toApiRow, toApiRows };

