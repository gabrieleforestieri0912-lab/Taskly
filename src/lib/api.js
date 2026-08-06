export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE || "/api";

// The frontend (Next.js) and the API (Express) run as separate processes.
// Socket.IO lives on the API server, so the client connects to
// NEXT_PUBLIC_SOCKET_URL; it falls back to the current origin for setups that
// serve both from one process.
const DEFAULT_SOCKET_URL =
  typeof window !== "undefined" ? window.location.origin : "";
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || DEFAULT_SOCKET_URL;

export function getAuthToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function authHeaders(extra = {}) {
  const token = getAuthToken();
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Supabase access tokens expire (default 1h). When the server answers 401 we
// try to exchange the stored refresh token for a fresh pair and retry once.
let refreshInFlight = null;

async function refreshAccessToken() {
  if (typeof window === "undefined") return false;
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return false;

  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        if (!res.ok) return false;
        const data = await res.json();
        localStorage.setItem("token", data.token);
        if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
        return true;
      } catch {
        return false;
      } finally {
        refreshInFlight = null;
      }
    })();
  }
  return refreshInFlight;
}

export async function apiFetch(path, options = {}) {
  const headers = authHeaders(options.headers || {});
  let response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  // Token expired → refresh once and retry
  if (response.status === 401 && !options._retried && !String(path).startsWith("/auth/")) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      response = await fetch(`${API_BASE}${path}`, {
        ...options,
        _retried: true,
        headers: authHeaders(options.headers || {}),
      });
    }
  }

  return response;
}
