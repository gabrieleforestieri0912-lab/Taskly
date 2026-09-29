// main.ts
import { app, BrowserWindow } from "electron";
import * as path from "path";
import * as http from "http";

// Determine if we are in development mode
const isDev = !app.isPackaged && process.env.NODE_ENV !== "production";

let mainWindow: BrowserWindow | null = null;
let nextServer: http.Server | null = null;

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
}

// App Lifecycle
app.whenReady().then(async () => {
  console.log(`[Electron Main] App ready. Running in ${isDev ? "DEVELOPMENT" : "PRODUCTION"} mode.`);

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


