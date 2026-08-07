import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { track } from "../src/lib/activity";

vi.mock("../src/lib/api", () => ({
  apiFetch: vi.fn(() => Promise.resolve(new Response("{}", { status: 200 }))),
}));

import { apiFetch } from "../src/lib/api";
const apiFetchMock = vi.mocked(apiFetch);

describe("track", () => {
  beforeEach(() => {
    apiFetchMock.mockClear();
  });

afterEach(() => {
    localStorage.removeItem("token");
  });

  it("no-ops for guests (no token)", () => {
    localStorage.removeItem("token");
    expect(track({ type: "task_created", title: "T" })).toBeUndefined();
    expect(apiFetchMock).not.toHaveBeenCalled();
  });

  it("posts when a token is present", () => {
    localStorage.setItem("token", "t");
    track({ type: "event", title: "Task completato" });
    expect(apiFetchMock).toHaveBeenCalledTimes(1);
    const [, init] = apiFetchMock.mock.calls[0];
    expect(String(init?.method)).toBe("POST");
    const body = JSON.parse((init?.body as string) ?? "{}");
    expect(body).toMatchObject({ type: "event", title: "Task completato" });
  });

  it("debounces identical bursts within 3s", () => {
    localStorage.setItem("token", "t");
    track({ type: "event", title: "same" });
    track({ type: "event", title: "same" });
    expect(apiFetchMock).toHaveBeenCalledTimes(1);
    track({ type: "event", title: "different" });
    expect(apiFetchMock).toHaveBeenCalledTimes(2);
  });
});