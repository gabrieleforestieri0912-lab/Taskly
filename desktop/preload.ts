// preload.ts
import { contextBridge } from "electron";

declare global {
  interface Window {
    electronAPI: { platform: NodeJS.Platform };
  }
}

// Expose protected APIs to the renderer process (Next.js frontend)
contextBridge.exposeInMainWorld("electronAPI", {
  platform: process.platform,
  // You can expose custom IPC calls here, for example:
  // sendNotification: (msg: string) => ipcRenderer.send('notify', msg),
  // onServerReady: (callback: (...args: unknown[]) => void) => ipcRenderer.on('server-ready', callback)
});

console.log("Taskly Preload Script Loaded Successfully.");

