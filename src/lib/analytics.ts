"use client";
// Lightweight client-side analytics helper
const QUEUE_KEY = "plannilab_analytics_queue";

interface AnalyticsEvent {
  name: string;
  payload?: Record<string, unknown>;
  url?: string;
  ts?: number;
}

async function sendBatch(batch: AnalyticsEvent[]): Promise<void> {
  try {
    await fetch("/api/analytics/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events: batch }),
    });
  } catch (e) {
    // swallow — will retry later
  }
}

export function queueEvent(event: AnalyticsEvent): void {
  try {
    const q = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]") as AnalyticsEvent[];
    q.push({ ...event, ts: Date.now() });
    localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
  } catch (e) {
    // ignore
  }
}

export function trackEvent(
  name: string,
  payload: Record<string, unknown> = {},
): void {
  const event: AnalyticsEvent = { name, payload, url: window.location.pathname };
  queueEvent(event);
}

export function captureError(
  error: unknown,
  extra: Record<string, unknown> = {},
): void {
  const payload: Record<string, unknown> = {
    message:
      error && typeof error === "object" && "message" in error
        ? String((error as { message: unknown }).message)
        : String(error),
    stack:
      error && typeof error === "object" && "stack" in error
        ? (error as { stack: unknown }).stack || null
        : null,
    extra,
  };
  queueEvent({ name: "error", payload });
}

export async function flushEvents(): Promise<void> {
  try {
    const q = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]") as AnalyticsEvent[];
    if (!q || q.length === 0) return;
    // send in chunks
    const chunkSize = 25;
    for (let i = 0; i < q.length; i += chunkSize) {
      const chunk = q.slice(i, i + chunkSize);
      await sendBatch(chunk);
    }
    localStorage.removeItem(QUEUE_KEY);
  } catch (e) {
    // ignore
  }
}

// auto flush periodically
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    try {
      const q = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]") as AnalyticsEvent[];
      if (q && q.length > 0) {
        navigator.sendBeacon &&
          navigator.sendBeacon(
            "/api/analytics/events",
            JSON.stringify({ events: q }),
          );
      }
    } catch (e) {}
  });

  setInterval(() => {
    flushEvents();
  }, 30_000);
}

const Analytics = { trackEvent, captureError, flushEvents };
export default Analytics;
