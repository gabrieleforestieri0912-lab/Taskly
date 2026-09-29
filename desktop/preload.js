"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// preload.ts
const electron_1 = require("electron");
// Expose protected APIs to the renderer process (Next.js frontend)
electron_1.contextBridge.exposeInMainWorld("electronAPI", {
    platform: process.platform,
    // You can expose custom IPC calls here, for example:
    // sendNotification: (msg: string) => ipcRenderer.send('notify', msg),
    // onServerReady: (callback: (...args: unknown[]) => void) => ipcRenderer.on('server-ready', callback)
});
console.log("Taskly Preload Script Loaded Successfully.");
