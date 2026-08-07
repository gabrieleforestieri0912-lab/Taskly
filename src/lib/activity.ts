import { apiFetch } from "./api";

export interface TrackPayload {
  type?: string;
  title?: string;
  body?: string;
  payload?: Record<string, unknown>;
}

let lastEmit: Record<string, number> = {};

/**
 * Records a real activity/notification event on the server.
 * The NotificationBell polls /activity/recent, so tracked events surface there.
 * Silently no-ops for guests (no token) so it is safe anywhere.
 */
export function track(a: TrackPayload): void {
  if (typeof window === "undefined") return;
  const token = localStorage.getItem("token");
  if (!token) return;

  // Debounce identical bursts to avoid spamming the feed.
  const signature = `${a.type}|${a.title}`;
  const now = Date.now();
  if (lastEmit[signature] && now - lastEmit[signature] < 3000) return;
  lastEmit[signature] = now;

  apiFetch("/activity", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(a),
  }).catch(() => {
    /* ignore offline/guest */
  });
}