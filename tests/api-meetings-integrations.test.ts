import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";

vi.mock("../server/supabase/db", () => ({
  createMeeting: vi.fn(),
  listMeetings: vi.fn(),
  deleteMeeting: vi.fn(),
  getIntegration: vi.fn(),
  listIntegrations: vi.fn(),
  setIntegration: vi.fn(),
  deleteIntegration: vi.fn(),
}));

import * as db from "../server/supabase/db";
import meetingsRouter from "../server/routes/meetings";
import integrationsRouter from "../server/routes/integrations";
import { JWT_SECRET } from "../server/middleware/auth";

const UID = "00000000-0000-0000-0000-000000000002";
const token = jwt.sign({ sub: UID, email: "tester@example.com" }, JWT_SECRET, {
  algorithm: "HS256",
});

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/meetings", meetingsRouter);
  app.use("/api/integrations", integrationsRouter);
  return app;
}

const dbMock = db as any;
const auth = (req: any) => req.set("Authorization", `Bearer ${token}`);

beforeEach(() => {
  vi.resetAllMocks();
  delete process.env.GOOGLE_CLIENT_ID;
  delete process.env.GOOGLE_CLIENT_SECRET;
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("meetings routes", () => {
  it("rejects unauthenticated requests", async () => {
    const res = await request(makeApp()).get("/api/meetings");
    expect(res.status).toBe(401);
  });

  it("POST / creates a meeting from the body", async () => {
    dbMock.createMeeting.mockResolvedValue({ id: "m1", title: "Sprint" });
    const res = await auth(request(makeApp()).post("/api/meetings"))
      .send({ title: "Sprint", transcript: "..." });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.meeting.title).toBe("Sprint");
    expect(dbMock.createMeeting).toHaveBeenCalledWith(UID, { title: "Sprint", transcript: "..." });
  });

  it("GET / lists the user's meetings", async () => {
    dbMock.listMeetings.mockResolvedValue([{ id: "m1" }, { id: "m2" }]);
    const res = await auth(request(makeApp()).get("/api/meetings"));
    expect(res.status).toBe(200);
    expect(res.body.meetings).toHaveLength(2);
  });

  it("DELETE /:id deletes and returns ok", async () => {
    dbMock.deleteMeeting.mockResolvedValue(true);
    const res = await auth(request(makeApp()).delete("/api/meetings/m1"));
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(dbMock.deleteMeeting).toHaveBeenCalledWith(UID, "m1");
  });
});

describe("integrations routes", () => {
  it("GET / lists sanitized integrations", async () => {
    dbMock.listIntegrations.mockResolvedValue([
      { id: "1", provider: "slack", connected: true, config: { webhookUrl: "***" } },
    ]);
    const res = await auth(request(makeApp()).get("/api/integrations"));
    expect(res.status).toBe(200);
    expect(res.body.integrations[0].provider).toBe("slack");
  });

  it("DELETE /:provider disconnects", async () => {
    dbMock.deleteIntegration.mockResolvedValue(true);
    const res = await auth(request(makeApp()).delete("/api/integrations/slack"));
    expect(res.status).toBe(200);
    expect(dbMock.deleteIntegration).toHaveBeenCalledWith(UID, "slack");
  });

  it("POST /slack/webhook accepts a valid https URL", async () => {
    dbMock.setIntegration.mockResolvedValue({ provider: "slack", connected: true });
    const res = await auth(request(makeApp()).post("/api/integrations/slack/webhook"))
      .send({ url: "https://hooks.slack.com/services/T000/B000/XXXX" });

    expect(res.status).toBe(200);
    expect(dbMock.setIntegration).toHaveBeenCalledWith(
      UID,
      "slack",
      { webhookUrl: "https://hooks.slack.com/services/T000/B000/XXXX", channel: "#general" },
    );
  });

  it("POST /slack/webhook rejects non-https URLs with 400", async () => {
    const res = await auth(request(makeApp()).post("/api/integrations/slack/webhook"))
      .send({ url: "http://insecure.example.com" });
    expect(res.status).toBe(400);
    expect(dbMock.setIntegration).not.toHaveBeenCalled();
  });

  it("webhook-test refuses when the stored URL is masked", async () => {
    dbMock.getIntegration.mockResolvedValue({ config: { webhookUrl: "***" } });
    const res = await auth(request(makeApp()).post("/api/integrations/slack/webhook-test"));
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Configura prima/);
  });

  it("webhook-test posts to a provided url and reports success", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, statusText: "OK" });
    vi.stubGlobal("fetch", fetchMock);

    const res = await auth(request(makeApp()).post("/api/integrations/slack/webhook-test"))
      .send({ url: "https://hooks.slack.com/services/T000/B000/XXXX" });

    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://hooks.slack.com/services/T000/B000/XXXX",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("google/authorize returns 503 when not configured", async () => {
    const res = await auth(request(makeApp()).post("/api/integrations/google/authorize"));
    expect(res.status).toBe(503);
  });

  it("google/authorize builds a consent URL when configured", async () => {
    process.env.GOOGLE_CLIENT_ID = "client-id-123";
    const res = await auth(request(makeApp()).post("/api/integrations/google/authorize"));
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.url).toContain("accounts.google.com/o/oauth2/v2/auth");
    expect(res.body.url).toContain(encodeURIComponent("client-id-123"));
  });
});