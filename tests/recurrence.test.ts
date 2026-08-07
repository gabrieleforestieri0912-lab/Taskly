import { describe, it, expect } from "vitest";
import { nextDeadline, isTaskOnDay, daysBetween } from "../src/lib/recurrence";

describe("nextDeadline", () => {
  it("returns the input unchanged when missing", () => {
    expect(nextDeadline(undefined, "giornaliero")).toBeUndefined();
    expect(nextDeadline(null, "giornaliero")).toBeNull();
    expect(nextDeadline("", "settimanale")).toBe("");
  });

  it("returns the input unchanged when no recurrence is set", () => {
    expect(nextDeadline("2026-01-05", "")).toBe("2026-01-05");
    expect(nextDeadline("2026-01-05", undefined as any)).toBe("2026-01-05");
  });

  it("advances daily", () => {
    expect(nextDeadline("2026-01-05", "giornaliero")).toBe("2026-01-06");
    expect(nextDeadline("2026-12-31", "giornaliero")).toBe("2027-01-01");
  });

  it("advances weekly by 7 days", () => {
    expect(nextDeadline("2026-01-05", "settimanale")).toBe("2026-01-12");
  });

  it("advances monthly past month boundaries", () => {
    expect(nextDeadline("2026-01-05", "mensile")).toBe("2026-02-05");
    expect(nextDeadline("2026-03-15", "mensile")).toBe("2026-04-15");
  });

  it("advances annually across leap years", () => {
    expect(nextDeadline("2026-02-28", "annuale")).toBe("2027-02-28");
    expect(nextDeadline("2024-02-29", "annuale")).toBe("2025-02-28");
  });

  it("returns the input unchanged for invalid dates", () => {
    expect(nextDeadline("not-a-date", "mensile")).toBe("not-a-date");
  });
});

describe("isTaskOnDay", () => {
  it("returns false when the task has no date", () => {
    expect(isTaskOnDay(null, "2026-01-05")).toBe(false);
    expect(isTaskOnDay({}, "2026-01-05")).toBe(false);
  });

  it("matches only the exact date for non-recurring tasks", () => {
    const t = { date: "2026-01-05", recurrence: "" };
    expect(isTaskOnDay(t, "2026-01-05")).toBe(true);
    expect(isTaskOnDay(t, "2026-01-06")).toBe(false);
  });

  it("daily repeats every day from the start", () => {
    const t = { date: "2026-01-05", recurrence: "daily" };
    expect(isTaskOnDay(t, "2026-01-05")).toBe(true);
    expect(isTaskOnDay(t, "2026-01-06")).toBe(true);
    expect(isTaskOnDay(t, "2026-06-01")).toBe(true);
  });

  it("weekly repeats every 7 days", () => {
    const t = { date: "2026-01-05", recurrence: "weekly" };
    expect(isTaskOnDay(t, "2026-01-12")).toBe(true); // +7
    expect(isTaskOnDay(t, "2026-01-19")).toBe(true); // +14
    expect(isTaskOnDay(t, "2026-01-06")).toBe(false); // not aligned
  });

  it("monthly repeats on the same day-of-month", () => {
    const t = { date: "2026-01-15", recurrence: "monthly" };
    expect(isTaskOnDay(t, "2026-02-15")).toBe(true);
    expect(isTaskOnDay(t, "2026-03-15")).toBe(true);
    expect(isTaskOnDay(t, "2026-02-16")).toBe(false);
    expect(isTaskOnDay(t, "2025-01-15")).toBe(false); // before start
  });

  it("never repeats before the start date", () => {
    const t = { date: "2026-01-05", recurrence: "daily" };
    expect(isTaskOnDay(t, "2026-01-04")).toBe(false);
  });
});

describe("daysBetween", () => {
  it("computes a positive difference", () => {
    expect(daysBetween("2026-01-05", "2026-01-12")).toBe(7);
  });
});