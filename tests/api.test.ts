import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { getAuthToken, authHeaders, apiFetch } from "../src/lib/api";

function setToken(value: string | null) {
  if (value == null) localStorage.removeItem("token");
  else localStorage.setItem("token", value);
}

describe("token helpers", () => {
  afterEach(() => setToken(null));

  it("reads the token from localStorage", () => {
    setToken("abc");
    expect(getAuthToken()).toBe("abc");
    setToken(null);
    expect(getAuthToken()).toBeNull();
  });

  it("builds auth headers only when a token is present", () => {
    setToken("tok-123");
    expect(authHeaders()).toEqual({ Authorization: "Bearer tok-123" });
    expect(authHeaders({ "Content-Type": "application/json" })).toEqual({
      Authorization: "Bearer tok-123",
      "Content-Type": "application/json",
    });
    setToken(null);
    expect(authHeaders()).toEqual({});
  });
});

describe("apiFetch", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    setToken(null);
    localStorage.removeItem("refreshToken");
    vi.restoreAllMocks();
  });

  it("attaches Bearer token and prefixes /api", async () => {
    setToken("t");
    fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));
    await apiFetch("/user/data");
    expect(fetchMock).toHaveBeenCalled();
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("/api/user/data");
    expect((init.headers as any).Authorization).toBe("Bearer t");
  });

  it("does not retry auth endpoints on 401", async () => {
    setToken("t");
    fetchMock.mockResolvedValue(new Response("{}", { status: 401 }));
    await apiFetch("/auth/refresh");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("refreshes the token and retries once on 401", async () => {
    setToken("expired");
    localStorage.setItem("refreshToken", "rt");
    fetchMock
      .mockResolvedValueOnce(new Response("{}", { status: 401 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ token: "fresh", refreshToken: "rt2" }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(new Response("{}", { status: 200 }));

    const response = await apiFetch("/user/data");
    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(localStorage.getItem("token")).toBe("fresh");
    expect(localStorage.getItem("refreshToken")).toBe("rt2");
  });
});