export const API_BASE: string = process.env.NEXT_PUBLIC_API_BASE || "/api";
export const SOCKET_URL: string = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

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

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const headers = authHeaders((options.headers as Record<string, string>) || {});
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });
}
