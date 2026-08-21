export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE || "/api";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = getAuthToken();
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Supabase access tokens expire (default 1h). When the server answers 401 we
// try to exchange the stored refresh token for a fresh pair and retry once.
let refreshInFlight: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
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
        const data = (await res.json()) as { token: string; refreshToken?: string };
        localStorage.setItem("token", data.token);
        if (data.refreshToken)
          localStorage.setItem("refreshToken", data.refreshToken);
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

interface ApiRequestOptions extends RequestInit {
  _retried?: boolean;
}

export async function apiFetch(
  path: string,
  options: ApiRequestOptions = {},
): Promise<Response> {
  const headers = authHeaders((options.headers as Record<string, string>) || {});
  let response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  // Token expired → refresh once and retry
  if (
    response.status === 401 &&
    !options._retried &&
    !String(path).startsWith("/auth/")
  ) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: authHeaders((options.headers as Record<string, string>) || {}),
      } as RequestInit);
    }
  }

  return response;
}
