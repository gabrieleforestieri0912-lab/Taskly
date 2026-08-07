import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";

// Mock the data-access layer so routes run with deterministic in-memory behavior.
vi.mock("../server/supabase/db", () => ({
  getProfile: vi.fn(),
  listPages: vi.fn(),
  syncPages: vi.fn(),
  listAllTasks: vi.fn(),
  listGoals: vi.fn(),
  listIdeas: vi.fn(),
  replaceTasks: vi.fn(),
  replaceGoals: vi.fn(),
  replaceIdeas: vi.fn(),
}));

import * as db from "../server/supabase/db";
import userRouter from "../server/routes/user";
import { JWT_SECRET } from "../server/middleware/auth";

const UID = "00000000-0000-0000-0000-000000000001";
const token = jwt.sign({ sub: UID, email: "tester@example.com" }, JWT_SECRET, {
  algorithm: "HS256",
});

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/user", userRouter);
  return app;
}

const dbMock = db as any;

beforeEach(() => {
  vi.clearAllMocks();

  dbMock.listPages.mockResolvedValue([]);
  dbMock.listAllTasks.mockResolvedValue([]);
  dbMock.listGoals.mockResolvedValue([]);
  dbMock.listIdeas.mockResolvedValue([]);
  dbMock.listGoals.mockResolvedValue([]);
  dbMock.replaceTasks.mockImplementation(() => []);
  dbMock.replaceGoals.mockImplementation(() => []);
  dbMock.replaceIdeas.mockImplementation(() => []);
});

describe("authRequired guard", () => {
  it("returns 401 when no token is provided", async () => {
    const res = await request(makeApp()).get("/api/user/data");
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("No token, authorization denied");
  });

  it("returns 401 for an invalid token", async () => {
    const res = await request(makeApp())
      .get("/api/user/data")
      .set("Authorization", "Bearer not-a-valid-token");
    expect(res.status).toBe(401);
  });
});

describe("GET /api/user/data", () => {
  it("returns profile data and a computed plan", async () => {
    dbMock.getProfile.mockResolvedValue({
      id: UID,
      name: "Tester",
      email: "tester@example.com",
      subscription: { status: "active", planId: "pro_monthly" },
      plannerMeta: { focus: "ship" },
    });
    dbMock.listPages.mockResolvedValue([{ id: "p1" }]);
    dbMock.listAllTasks.mockResolvedValue([{ _id: "t1" }]);

    const res = await request(makeApp())
      .get("/api/user/data")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Tester");
    expect(res.body.plan.id).toBe("pro");
    expect(res.body.plan.maxPages).toBe(50);
    expect(res.body.pages).toEqual([{ id: "p1" }]);
    expect(res.body.tasks).toEqual([{ _id: "t1" }]);
  });

  it("returns 404 when the profile does not exist", async () => {
    dbMock.getProfile.mockResolvedValue(null);
    const res = await request(makeApp())
      .get("/api/user/data")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});

describe("POST /api/user/data (plan enforcement)", () => {
  it("rejects writes that exceed the plan page limit with 403", async () => {
    dbMock.getProfile.mockResolvedValue({
      id: UID,
      subscription: { planId: "starter_monthly" },
    });
    const pages = Array.from({ length: 5 }, (_, i) => ({ id: `p${i}` }));

    const res = await request(makeApp())
      .post("/api/user/data")
      .set("Authorization", `Bearer ${token}`)
      .send({ pages });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("plan_limit_reached");
    expect(res.body.limit).toBe(3);
    expect(dbMock.syncPages).not.toHaveBeenCalled();
  });

  it("allows exactly the plan limit (Starter maxPages = 3)", async () => {
    dbMock.getProfile.mockResolvedValue({
      id: UID,
      subscription: { planId: "starter_monthly" },
    });
    const pages = Array.from({ length: 3 }, (_, i) => ({ id: `p${i}` }));
    dbMock.syncPages.mockResolvedValue(pages);

    const res = await request(makeApp())
      .post("/api/user/data")
      .set("Authorization", `Bearer ${token}`)
      .send({ pages });

    expect(res.status).toBe(200);
    expect(dbMock.syncPages).toHaveBeenCalledTimes(1);
    expect(res.body.plan.id).toBe("starter");
  });

  it("unlimited plan (enterprise) allows 100+ pages", async () => {
    dbMock.getProfile.mockResolvedValue({
      id: UID,
      subscription: { planId: "enterprise_annual" },
    });
    const pages = Array.from({ length: 120 }, (_, i) => ({ id: `p${i}` }));
    dbMock.syncPages.mockResolvedValue(pages);

    const res = await request(makeApp())
      .post("/api/user/data")
      .set("Authorization", `Bearer ${token}`)
      .send({ pages });

    expect(res.status).toBe(200);
  });

  it("syncs tasks/goals/ideas without touching pages when pages not provided", async () => {
    dbMock.getProfile.mockResolvedValue({ id: UID, subscription: {} });

    const res = await request(makeApp())
      .post("/api/user/data")
      .set("Authorization", `Bearer ${token}`)
      .send({ tasks: [{ _id: "t1" }] });

    expect(res.status).toBe(200);
    expect(dbMock.replaceTasks).toHaveBeenCalledTimes(1);
    expect(dbMock.replaceGoals).not.toHaveBeenCalled();
    expect(dbMock.replaceIdeas).not.toHaveBeenCalled();
    expect(dbMock.syncPages).not.toHaveBeenCalled();
    expect(res.body.plan).toBeNull();
  });
});

describe("GET /api/user/subscription", () => {
  it("returns the subscription with inactive default", async () => {
    dbMock.getProfile.mockResolvedValue({ id: UID });
    const res = await request(makeApp())
      .get("/api/user/subscription")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.subscription.status).toBe("inactive");
  });
});