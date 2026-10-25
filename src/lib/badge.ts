// Stato condiviso con il badge overlay (finestra Electron always-on-top,
// in alto al centro dello schermo, fuori dalla finestra principale).

export type BadgeStatus =
  | "idle"
  | "listening"
  | "audio"
  | "transcribing"
  | "done";

export interface BadgeState {
  status: BadgeStatus;
  /** Testo breve mostrato nel badge (es. timer, anteprima trascrizione) */
  label?: string;
  /** True quando una pagina sta producendo audio */
  pageAudio?: boolean;
}

export interface ElectronBadgeAPI {
  platform: NodeJS.Platform;
  isElectron: boolean;
  sendBadgeUpdate: (state: BadgeState) => void;
  showBadge: () => void;
  hideBadge: () => void;
  onBadgeUpdate: (cb: (state: BadgeState) => void) => () => void;
  onBadgeAudio: (cb: (info: { pageAudio: boolean }) => void) => () => void;
  onAudioState: (cb: (audible: boolean) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI?: Partial<ElectronBadgeAPI> & { platform?: NodeJS.Platform };
  }
}

export function isElectron(): boolean {
  return (
    typeof window !== "undefined" &&
    window.electronAPI?.isElectron === true
  );
}

export function pushBadge(state: BadgeState): void {
  try {
    window.electronAPI?.sendBadgeUpdate?.(state);
  } catch {
    /* badge non disponibile (browser) — nessun problema */
  }
}

export function showBadge(): void {
  try {
    window.electronAPI?.showBadge?.();
  } catch {
    /* noop */
  }
}

export function hideBadge(): void {
  try {
    window.electronAPI?.hideBadge?.();
  } catch {
    /* noop */
  }
}
