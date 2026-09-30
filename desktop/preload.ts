// preload.ts
import { contextBridge, ipcRenderer } from "electron";

export interface BadgeState {
  status: "idle" | "listening" | "audio" | "transcribing" | "done";
  label?: string;
  pageAudio?: boolean;
}

declare global {
  interface Window {
    electronAPI: {
      platform: NodeJS.Platform;
      isElectron: boolean;
      sendBadgeUpdate: (state: BadgeState) => void;
      showBadge: () => void;
      hideBadge: () => void;
      onBadgeUpdate: (cb: (state: BadgeState) => void) => () => void;
      onBadgeAudio: (cb: (info: { pageAudio: boolean }) => void) => () => void;
      onAudioState: (cb: (audible: boolean) => void) => () => void;
    };
  }
}

// Expose protected APIs to the renderer process (Next.js frontend)
contextBridge.exposeInMainWorld("electronAPI", {
  platform: process.platform,
  isElectron: true,
  // Badge overlay (finestra always-on-top in alto al centro)
  sendBadgeUpdate: (state: BadgeState) =>
    ipcRenderer.send("badge:update", state),
  showBadge: () => ipcRenderer.send("badge:show"),
  hideBadge: () => ipcRenderer.send("badge:hide"),
  onBadgeUpdate: (cb: (state: BadgeState) => void) => {
    const listener = (_event: unknown, state: BadgeState) => cb(state);
    ipcRenderer.on("badge:update", listener as (...args: unknown[]) => void);
    return () =>
      ipcRenderer.removeListener(
        "badge:update",
        listener as (...args: unknown[]) => void,
      );
  },
  // Stato audio pagina inoltrato alla finestra badge
  onBadgeAudio: (cb: (info: { pageAudio: boolean }) => void) => {
    const listener = (_event: unknown, info: { pageAudio: boolean }) =>
      cb(info);
    ipcRenderer.on("badge:audio", listener as (...args: unknown[]) => void);
    return () =>
      ipcRenderer.removeListener(
        "badge:audio",
        listener as (...args: unknown[]) => void,
      );
  },
  // Rilevamento audio pagina: true quando una pagina produce audio
  onAudioState: (cb: (audible: boolean) => void) => {
    const listener = (_event: unknown, audible: boolean) => cb(audible);
    ipcRenderer.on(
      "main:audio-state",
      listener as (...args: unknown[]) => void,
    );
    return () =>
      ipcRenderer.removeListener(
        "main:audio-state",
        listener as (...args: unknown[]) => void,
      );
  },
});

console.log("Taskly Preload Script Loaded Successfully.");
