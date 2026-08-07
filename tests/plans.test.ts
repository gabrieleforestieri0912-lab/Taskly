import { describe, it, expect } from "vitest";
import { getPlan } from "../server/lib/plans";

describe("getPlan", () => {
  it("returns Starter by default (free / no plan)", () => {
    expect(getPlan(undefined).id).toBe("starter");
    expect(getPlan(null as any).id).toBe("starter");
    expect(getPlan({}).id).toBe("starter");
    expect(getPlan({ planId: "" }).id).toBe("starter");
    expect(getPlan({ planId: null }).id).toBe("starter");
  });

  it("maps each plan tier", () => {
    expect(getPlan({ planId: "pro" }).id).toBe("pro");
    expect(getPlan({ planId: "team" }).id).toBe("team");
    expect(getPlan({ planId: "enterprise" }).id).toBe("enterprise");
  });

  it("handles prefixed/Stripe-style ids", () => {
    expect(getPlan({ planId: "pro_123abc" }).id).toBe("pro");
    expect(getPlan({ planId: "team_xyz" }).id).toBe("team");
    expect(getPlan({ planId: "enterprise_customer_1" }).id).toBe("enterprise");
  });

  it("reports the correct limits per plan", () => {
    expect(getPlan({ planId: "starter" })).toMatchObject({
      name: "Starter",
      maxPages: 3,
      maxMembers: 1,
    });
    expect(getPlan({ planId: "pro" }).maxPages).toBe(50);
    expect(getPlan({ planId: "team" }).maxPages).toBe(500);
    expect(getPlan({ planId: "enterprise" }).maxPages).toBeNull();
    expect(getPlan({ planId: "enterprise" }).maxMembers).toBeNull();
  });

  it("falls back to Starter for unknown plans", () => {
    expect(getPlan({ planId: "gold" }).id).toBe("starter");
  });
});