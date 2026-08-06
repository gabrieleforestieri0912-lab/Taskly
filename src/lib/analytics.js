"use client";
// Lightweight client-side analytics helper
const QUEUE_KEY = "plannilab_analytics_queue";

async function sendBatch(batch) {
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

export function queueEvent(event) {
  try {
    const q = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
    q.push({ ...event, ts: Date.now() });
    localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
  } catch (e) {
    // ignore
  }
}

export function trackEvent(name, payload = {}) {
  const event = { name, payload, url: window.location.pathname };
  queueEvent(event);
}

export function captureError(error, extra = {}) {
  const payload = {
    message: error?.message || String(error),
    stack: error?.stack || null,
    extra,
  };
  queueEvent({ name: "error", payload });
}

export async function flushEvents() {
  try {
    const q = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
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
      const q = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
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
