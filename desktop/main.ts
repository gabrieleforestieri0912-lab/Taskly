// main.ts
import { app, BrowserWindow, ipcMain, screen, shell } from "electron";
import { spawn, type ChildProcess } from "child_process";
import * as path from "path";
import * as fs from "fs";
import * as http from "http";

// Determine if we are in development mode
const isDev = !app.isPackaged && process.env.NODE_ENV !== "production";

// Il frontend è il progetto WEB (src/), non un fork parallelo. In dev è il
// server di sviluppo Next della root; in prod Electron serve il build della
// root (`startNextJSProductionServer`). Stessa porta in entrambi i casi così
// l'URL di caricamento è unico.
const FRONTEND_PORT = 3000;
const FRONTEND_URL = `http://localhost:${FRONTEND_PORT}`;

let mainWindow: BrowserWindow | null = null;
let badgeWindow: BrowserWindow | null = null;
let webServerProc: ChildProcess | null = null;
let lastAudible = false;

// ---------------------------------------------------------------------------
// Floating badge: finestra overlay sempre in primo piano, in alto al centro
// dello schermo, fuori dalla finestra principale. Mostra lo stato della
// trascrizione (in ascolto / audio rilevato / trascrizione live).
// ---------------------------------------------------------------------------
function createBadgeWindow(): void {
  if (badgeWindow) return;
  const primary = screen.getPrimaryDisplay();
  const { width: screenW } = primary.workAreaSize;
  const BADGE_W = 460;
  const BADGE_H = 76;

  badgeWindow = new BrowserWindow({
    width: BADGE_W,
    height: BADGE_H,
    x: Math.round(primary.workArea.x + (primary.workAreaSize.width - BADGE_W) / 2),
    y: primary.workArea.y + 12,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    focusable: false,
    show: false,
    title: "Taskly — Stato trascrizione",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    backgroundColor: "#00000000",
  });
  // Non rubare mai il focus alla riunione / al video
  badgeWindow.setAlwaysOnTop(true, "screen-saver");
  badgeWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  const badgeURL = `${FRONTEND_URL}/badge`;
  badgeWindow.loadURL(badgeURL).catch((err) => {
    console.error("[Electron Main] Failed to load badge URL:", err);
  });

  badgeWindow.on("closed", () => {
    badgeWindow = null;
  });

  // Riposiziona in alto al centro se il display cambia
  screen.on("display-metrics-changed", () => {
    if (!badgeWindow) return;
    const p = screen.getPrimaryDisplay();
    badgeWindow.setPosition(
      Math.round(p.workArea.x + (p.workAreaSize.width - BADGE_W) / 2),
      p.workArea.y + 12,
    );
  });

  // screenW evita warning unused in alcune config
  void screenW;
}

function sendToBadge(channel: string, payload: unknown): void {
  try {
    badgeWindow?.webContents.send(channel, payload);
  } catch (e) {
    console.error("[Electron Main] sendToBadge failed:", e);
  }
}

// Rileva se una pagina sta producendo audio e notifica badge + renderer.
// Electron emette media-started-playing / media-paused-playing sul webContents;
// isCurrentlyAudible() copre i casi limite (poll ogni 2s).
function setupAudioDetection(): void {
  if (!mainWindow) return;
  const wc = mainWindow.webContents;

  const notify = (audible: boolean) => {
    if (audible === lastAudible) return;
    lastAudible = audible;
    console.log(`[Electron Main] Page audio state: ${audible ? "PLAYING" : "STOPPED"}`);
    sendToBadge("badge:audio", { pageAudio: audible });
    try {
      mainWindow?.webContents.send("main:audio-state", audible);
    } catch {}
    // Quando parte dell'audio in una pagina, mostra il badge come segnale
    if (audible) badgeWindow?.showInactive();
  };

  wc.on("media-started-playing", () => notify(true));
  // "media-paused-playing" non è nei tipi di Electron 30: cast a EventEmitter
  (wc as unknown as NodeJS.EventEmitter).on("media-paused-playing", () => {
    // Piccolo debounce: lo stato audible potrebbe aggiornarsi in ritardo
    setTimeout(() => notify(wc.isCurrentlyAudible()), 400);
  });

  setInterval(() => {
    try {
      if (mainWindow && !mainWindow.isDestroyed()) {
        notify(mainWindow.webContents.isCurrentlyAudible());
      }
    } catch {}
  }, 2000);
}

// IPC renderer <-> badge
function setupBadgeIPC(): void {  ipcMain.on("badge:update", (_event, state) => {
    if (!badgeWindow || badgeWindow.isDestroyed()) createBadgeWindow();
    sendToBadge("badge:update", state || {});
    // Mostra il badge per ogni stato attivo, nascondilo solo su idle esplicito
    const status = (state as { status?: string })?.status;
    if (status && status !== "idle") {
      try {
        badgeWindow?.showInactive();
      } catch {}
    } else if (status === "idle") {
      try {
        badgeWindow?.hide();
      } catch {}
    }
  });
  ipcMain.on("badge:show", () => {
    if (!badgeWindow || badgeWindow.isDestroyed()) createBadgeWindow();
    try {
      badgeWindow?.showInactive();
    } catch {}
  });
  ipcMain.on("badge:hide", () => {
    try {
      badgeWindow?.hide();
    } catch {}
  });
}

// Apre URL nel browser di sistema (usato per il login Google via web:
// Google blocca i webview embedded di Electron con 403 disallowed_useragent).
function setupAuthIPC(): void {
  ipcMain.handle("auth:open-external", async (_event, url: unknown) => {
    if (typeof url !== "string" || !/^https:\/\//.test(url)) {
      throw new Error("URL esterno non valido");
    }
    await shell.openExternal(url);
  });
}

// Function to start the Express backend server (port 5000)
function startBackendServer(): void {
  try {
    console.log("[Electron Main] Starting integrated Express backend server...");
    // Requiring index.ts executes it and starts the minimal Express server
    require("./server/index.ts");
    console.log("[Electron Main] Express backend server initialized.");
  } catch (error) {
    console.error("[Electron Main] Error starting Express backend:", error);
  }
}

// Prod: il frontend web è il build Next "standalone" in resources/web
// (extraResources di electron-builder), avviato come child process Node via
// `ELECTRON_RUN_AS_NODE`. In dev non si usa: il dev server Next della root
// già gira via `npm run dev` in desktop (wait-on :3000).
function webRoot(): string {
  if (app.isPackaged) return path.join(process.resourcesPath, "web");
  return path.join(__dirname, "..");
}

// Le variabili d'ambiente NON vengono pacchettizzate (il filtro extraResources
// esclude .env*: niente segreti nel pacchetto distribuito). Caricamento a
// runtime, in ordine: 1) %APPDATA%/Taskly/.env (modificabile dopo
// l'installazione), 2) resources/web/.env. Il process.env di sistema resta
// comunque ereditato dal child process.
function loadRuntimeEnv(): void {
  const dotenv = require("dotenv") as { config(options: { path: string }): void };
  for (const p of [
    path.join(app.getPath("userData"), ".env"),
    path.join(webRoot(), ".env"),
  ]) {
    try {
      if (fs.existsSync(p)) dotenv.config({ path: p });
    } catch (e) {
      console.error("[Electron Main] Env load failed:", p, e);
    }
  }
}

// Attende che il frontend risponda qualunque cosa (anche 404/500 la socket è viva).
function waitForHttp(url: string, timeoutMs = 30000): Promise<void> {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const tryOnce = () => {
      const req = http.get(url, (res) => {
        res.resume();
        resolve();
      });
      req.on("error", () => {
        if (Date.now() - started > timeoutMs) {
          reject(new Error(`Frontend non raggiungibile entro ${timeoutMs}ms: ${url}`));
          return;
        }
        setTimeout(tryOnce, 500);
      });
    };
    tryOnce();
  });
}

async function startWebServer(): Promise<void> {
  const root = webRoot();
  const serverJs = path.join(root, "server.js");
  if (!fs.existsSync(serverJs)) {
    throw new Error(
      `server.js non trovato in ${root} — manca il build standalone: esegui` +
        " `npm run build` alla root (produce .next/standalone, dalla" +
        " next.config output: \"standalone\")",
    );
  }

  console.log("[Electron Main] Starting Next standalone web server...");
  webServerProc = spawn(process.execPath, [serverJs], {
    cwd: root,
    env: {
      ...process.env,
      NODE_OPTIONS: "",
      NODE_ENV: "production",
      PORT: String(FRONTEND_PORT),
      HOSTNAME: "127.0.0.1",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  webServerProc.stdout?.on("data", (chunk: Buffer) => process.stdout.write(`[web] ${chunk}`));
  webServerProc.stderr?.on("data", (chunk: Buffer) => process.stderr.write(`[web] ${chunk}`));
  webServerProc.on("exit", (code) => {
    console.log(`[Electron Main] Web server exited (code=${code}).`);
    webServerProc = null;
  });

  await waitForHttp(FRONTEND_URL);
  console.log(`[Electron Main] Web server ready on ${FRONTEND_URL}`);
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "Taskly - Desktop App",
    icon: path.join(__dirname, "public", "taskly.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    // Premium desktop window feel
    show: false,
    autoHideMenuBar: true,
    backgroundColor: "#fafafa",
  });

  // Fade-in effect once content is loaded
  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  const loadURL = FRONTEND_URL;

  console.log(`[Electron Main] Loading frontend URL: ${loadURL}`);

  if (isDev) {
    // In dev, the wait-on command in package.json ensures port 3333 is ready.
    mainWindow.loadURL(loadURL);
    // Open DevTools in dev mode
    mainWindow.webContents.openDevTools();
  } else {
    // In produzione startWebServer() è già awaitato nel whenReady prima di
    // createWindow: il frontend su FRONTEND_URL è pronto a rispondere.
    mainWindow.loadURL(loadURL).catch((err) => {
      console.error("[Electron Main] Failed to load URL, retrying...", err);
      setTimeout(() => mainWindow?.loadURL(loadURL), 1000);
    });
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  setupAudioDetection();
}

// App Lifecycle
app.whenReady().then(async () => {
  console.log(`[Electron Main] App ready. Running in ${isDev ? "DEVELOPMENT" : "PRODUCTION"} mode.`);

  setupBadgeIPC();
  setupAuthIPC();
  createBadgeWindow();

  // In production, start the servers from Electron itself
  if (!isDev) {
    // 1. Env runtime (prima di qualsiasi server)
    loadRuntimeEnv();

    // 2. Express backend (flusso login Google esterno)
    startBackendServer();

    // 3. Web server Next standalone
    try {
      await startWebServer();
    } catch (error) {
      console.error("[Electron Main] Failed to start web server:", error);
      app.quit();
      return;
    }
  }

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Clean up servers on exit
app.on("window-all-closed", () => {
  console.log("[Electron Main] All windows closed. Cleaning up servers and exiting...");

  // Termina il child process del web server standalone
  if (webServerProc) {
    try {
      webServerProc.kill();
      console.log("[Electron Main] Web server process terminated.");
    } catch {}
  }

  if (process.platform !== "darwin") {
    app.quit();
  }
});
