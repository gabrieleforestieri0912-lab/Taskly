/** Elenca i nomi delle variabili d'ambiente usate nel codice (mai i valori). */
const fs = require("fs");
const path = require("path");

const ROOTS = ["src", "mcp", "next.config.mjs", "package.json"];
const found = new Map(); // name -> [files]

function walk(p) {
  const st = fs.statSync(p);
  if (st.isDirectory()) {
    if (["node_modules", ".next", ".git"].includes(path.basename(p))) return;
    for (const f of fs.readdirSync(p)) walk(path.join(p, f));
    return;
  }
  if (!/\.(ts|tsx|js|mjs)$/.test(p)) return;
  const src = fs.readFileSync(p, "utf8");
  const re = /process\.env\.([A-Z0-9_]+)/g;
  let m;
  while ((m = re.exec(src))) {
    const name = m[1];
    if (!found.has(name)) found.set(name, []);
    if (found.get(name).length < 3) found.get(name).push(p.replace(/\\/g, "/"));
  }
}

for (const r of ROOTS) if (fs.existsSync(r)) walk(r);

const names = [...found.keys()].sort();
console.log("variabili d'ambiente usate nel codice:", names.length);
console.log("");

const PUBLIC = names.filter((n) => n.startsWith("NEXT_PUBLIC_"));
const SERVER = names.filter((n) => !n.startsWith("NEXT_PUBLIC_"));

console.log("--- NEXT_PUBLIC_* (servono anche in fase di build!) ---");
PUBLIC.forEach((n) => console.log("  " + n + "   <- " + found.get(n).join(", ")));

console.log("");
console.log("--- server-side / segrete ---");
SERVER.forEach((n) => console.log("  " + n + "   <- " + found.get(n).join(", ")));
