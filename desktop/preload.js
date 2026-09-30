"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// preload.ts
const electron_1 = require("electron");
// Expose protected APIs to the renderer process (Next.js frontend)
electron_1.contextBridge.exposeInMainWorld("electronAPI", {
    platform: process.platform,
    isElectron: true,
    // Badge overlay (finestra always-on-top in alto al centro)
    sendBadgeUpdate: (state) => electron_1.ipcRenderer.send("badge:update", state),
    showBadge: () => electron_1.ipcRenderer.send("badge:show"),
    hideBadge: () => electron_1.ipcRenderer.send("badge:hide"),
    onBadgeUpdate: (cb) => {
        const listener = (_event, state) => cb(state);
        electron_1.ipcRenderer.on("badge:update", listener);
        return () => electron_1.ipcRenderer.removeListener("badge:update", listener);
    },
    // Stato audio pagina inoltrato alla finestra badge
    onBadgeAudio: (cb) => {
        const listener = (_event, info) => cb(info);
        electron_1.ipcRenderer.on("badge:audio", listener);
        return () => electron_1.ipcRenderer.removeListener("badge:audio", listener);
    },
    // Rilevamento audio pagina: true quando una pagina produce audio
    onAudioState: (cb) => {
        const listener = (_event, audible) => cb(audible);
        electron_1.ipcRenderer.on("main:audio-state", listener);
        return () => electron_1.ipcRenderer.removeListener("main:audio-state", listener);
    },
});
console.log("Taskly Preload Script Loaded Successfully.");
