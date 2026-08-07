import type { Request, Response, NextFunction } from "express";
import { insertAnalyticsEvent } from "../supabase/db";

export default function auditLogger(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const evt = {
      name: "http_request",
      payload: {
        method: req.method,
        path: req.path,
        ip: req.ip,
        user: req.user ? req.user.id : null,
      },
      ts: Date.now(),
    };
    insertAnalyticsEvent(
      (req.body as { workspaceId?: string | null } | undefined)
        ?.workspaceId || null,
      evt,
    ).catch(() => {});
  } catch (e) {
    // never block the request for audit logging
  }
  next();
}
