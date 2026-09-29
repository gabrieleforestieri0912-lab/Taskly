"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// main.ts
const electron_1 = require("electron");
const path = __importStar(require("path"));
const http = __importStar(require("http"));
// Determine if we are in development mode
const isDev = !electron_1.app.isPackaged && process.env.NODE_ENV !== "production";
let mainWindow = null;
let nextServer = null;
// Function to start the Express backend server (port 5000)
function startBackendServer() {
    try {
        console.log("[Electron Main] Starting integrated Express backend server...");
        // By requiring the index.js, it executes and starts the HTTP + Socket.io server
        require("./server/index.ts");
        console.log("[Electron Main] Express backend server initialized.");
    }
    catch (error) {
        console.error("[Electron Main] Error starting Express backend:", error);
    }
}
// Function to start the Next.js production server (port 3333) programmatically
function startNextJSProductionServer() {
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
            }).catch((err) => {
                reject(err);
            });
        }
        catch (error) {
            reject(error);
        }
    });
}
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
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
    }
    else {
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
electron_1.app.whenReady().then(async () => {
    console.log(`[Electron Main] App ready. Running in ${isDev ? "DEVELOPMENT" : "PRODUCTION"} mode.`);
    // In production, start the servers from Electron itself
    if (!isDev) {
        // 1. Start Express backend
        startBackendServer();
        // 2. Start NextJS production server
        try {
            await startNextJSProductionServer();
        }
        catch (error) {
            console.error("[Electron Main] Failed to start Next.js server:", error);
            electron_1.app.quit();
            return;
        }
    }
    createWindow();
    electron_1.app.on("activate", () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
// Clean up servers on exit
electron_1.app.on("window-all-closed", () => {
    console.log("[Electron Main] All windows closed. Cleaning up servers and exiting...");
    // Close Next.js production server if running
    if (nextServer) {
        nextServer.close(() => {
            console.log("[Electron Main] Next.js server closed.");
        });
    }
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
