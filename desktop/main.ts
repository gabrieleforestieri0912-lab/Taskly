// main.ts
import { app, BrowserWindow, ipcMain, screen } from "electron";
import * as path from "path";
import * as http from "http";

// Determine if we are in development mode
const isDev = !app.isPackaged && process.env.NODE_ENV !== "production";

let mainWindow: BrowserWindow | null = null;
let badgeWindow: BrowserWindow | null = null;
let nextServer: http.Server | null = null;
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

  const badgeURL =
    (isDev ? "http://localhost:3333" : "http://localhost:3333") + "/badge";
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
function setupBadgeIPC(): void {
  ipcMain.on("badge:update", (_event, state) => {
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

// Function to start the Express backend server (port 5000)
function startBackendServer(): void {
  try {
    console.log("[Electron Main] Starting integrated Express backend server...");
    // By requiring the index.js, it executes and starts the HTTP + Socket.io server
    require("./server/index.ts");
    console.log("[Electron Main] Express backend server initialized.");
  } catch (error) {
    console.error("[Electron Main] Error starting Express backend:", error);
  }
}

// Function to start the Next.js production server (port 3333) programmatically
function startNextJSProductionServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      console.log("[Electron Main] Initializing Next.js production server...");
      const next = require("next");

      const nextApp = next({
        dev: false,
        dir: path.join(__dirname), // Point to the directory containing .next folder
      });
      const handle = nextApp.getRequestHandler();

      nextApp.prepare().then(() => {
        nextServer = http.createServer((req, res) => {
          handle(req, res);
        });

        const PORT = 3333;
        nextServer.listen(PORT, () => {
          console.log(`[Electron Main] Next.js production server running on http://localhost:${PORT}`);
          resolve();
        });
      }).catch((err: unknown) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
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

  const loadURL = isDev ? "http://localhost:3333" : "http://localhost:3333";

  console.log(`[Electron Main] Loading frontend URL: ${loadURL}`);

  if (isDev) {
    // In dev, the wait-on command in package.json ensures port 3333 is ready.
    mainWindow.loadURL(loadURL);
    // Open DevTools in dev mode
    mainWindow.webContents.openDevTools();
  } else {
    // In production, wait 500ms for Next.js server to be fully ready before loading
    setTimeout(() => {
      mainWindow?.loadURL(loadURL).catch((err) => {
        console.error("[Electron Main] Failed to load URL, retrying...", err);
        setTimeout(() => mainWindow?.loadURL(loadURL), 1000);
      });
    }, 500);
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
  createBadgeWindow();

  // In production, start the servers from Electron itself
  if (!isDev) {
    // 1. Start Express backend
    startBackendServer();

    // 2. Start NextJS production server
    try {
      await startNextJSProductionServer();
    } catch (error) {
      console.error("[Electron Main] Failed to start Next.js server:", error);
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

  // Close Next.js production server if running
  if (nextServer) {
    nextServer.close(() => {
      console.log("[Electron Main] Next.js server closed.");
    });
  }

  if (process.platform !== "darwin") {
    app.quit();
  }
});
