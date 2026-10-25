/**
 * Orchestrazione `npm run package` (desktop).
 *
 * Legge `appconfig.json`:
 *   - remoteApi valorizzato  → build "pubblica" (backend remoto): il build
 *     Next della root viene fatto con DESKTOP_REMOTE_API_URL (rewrite
 *     /api/* → remoto) e l'appconfig (con l'URL) viene incluso nel
 *     pacchetto: l'app funziona per un utente qualsiasi senza .env.
 *   - remoteApi vuoto        → build "self-contained": nessun rewrite, le
 *     API girano locali; l'utente finale deve avere le chiavi in
 *     %APPDATA%\Taskly\.env (solo tester fidati).
 */
const { execSync, spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function run(cmd, args, options = {}) {
  const res = spawnSync(cmd, args, { stdio: "inherit", shell: true, ...options });
  if (res.status !== 0) {
    process.exit(res.status || 1);
  }
}

const cfgPath = path.join(__dirname, "appconfig.json");
let remoteApi = "";
try {
  const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
  remoteApi = String(cfg.remoteApi || "")
    .trim()
    .replace(/\/+$/, "");
} catch {
  // appconfig assente/malformato → build self-contained
}

const env = { ...process.env };
if (remoteApi) {
  env.DESKTOP_REMOTE_API_URL = remoteApi;
  console.log(`[package] mode=public-remote  remoteApi=${remoteApi}`);
} else {
  console.log("[package] mode=self-contained");
}

run("npm", ["--prefix", "..", "run", "build"], { env });
run("npx", ["electron-builder"], { env: { ...env } });
