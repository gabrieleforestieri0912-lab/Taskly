import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import http from "http";
import { Server, Socket } from "socket.io";

import { verifyToken } from "./middleware/auth";
import { getSupabase } from "./supabase/client";
import "./types";

import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import aiRoutes from "./routes/ai";
import docRoutes from "./routes/doc";
import { billingRouter, stripeWebhookHandler } from "./routes/billing";
import analyticsRoutes from "./routes/analytics";
import activityRoutes from "./routes/activity";
import meetingsRoutes from "./routes/meetings";
import integrationsRoutes from "./routes/integrations";
import resourcesRoutes from "./routes/resources";
import tasksRoutes from "./routes/tasks";
import workspacesRoutes from "./routes/workspaces";
import templatesRoutes from "./routes/templates";
import notificationsRoutes from "./routes/notifications";
import searchVectorRoutes from "./routes/search_vector";

// ---------------------------------------------------------------------------
// Standalone API server.
//
// This process ONLY serves the Express API (+ Socket.IO realtime). The Next.js
// frontend runs separately with `npm run dev` (Next dev server on :3000) and
// proxies every /api request here via the rewrites in next.config.mjs.
// ---------------------------------------------------------------------------
// API server port. API_PORT is preferred so an exported PORT (often set by
// other tooling) can never collide with the Next.js dev server on :3000.
const PORT = process.env.API_PORT || process.env.PORT || 3001;

const app = express();
const server = http.createServer(app);

function parseOrigins(value: string | undefined): string[] {
  return String(value || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const allowedOrigins = parseOrigins(
  process.env.CORS_ORIGINS || process.env.FRONTEND_URL || "http://localhost:3000",
);

const corsOptions = {
  origin(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`Origin not allowed by CORS: ${origin}`));
  },
  credentials: true,
};

// Same-origin requests (the frontend is served by this same server, on whatever
// port/domain it runs) must always be allowed. Only cross-origin requests are
// checked against the configured CORS origins.
function isSameOrigin(req: Request): boolean {
  const origin = req.headers.origin;
  if (!origin) return true; // no Origin header → not a browser CORS request
  const host = req.get("host");
  // Accept http/https so the check also works behind a TLS-terminating proxy.
  return origin === `http://${host}` || origin === `https://${host}`;
}

app.use((req: Request, res: Response, next: NextFunction) => {
  if (isSameOrigin(req)) return next();
  return cors(corsOptions)(req, res, next);
});

app.post(
  "/api/billing/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhookHandler,
);

import sanitize from "./middleware/sanitize";
import rateLimiter from "./middleware/rateLimiter";
import auditLogger from "./middleware/auditLogger";

app.use(express.json());
// Security middlewares apply to the API only: Next.js pages and assets must
// never be throttled, logged as API traffic, or have their queries rewritten.
// sanitize runs after express.json() so it actually sanitizes request bodies.
app.use("/api", sanitize);
app.use("/api", rateLimiter);
app.use("/api", auditLogger);

// Initialize Supabase (Postgres + Auth)
try {
  getSupabase();
  console.log(`Connected to Supabase (${process.env.SUPABASE_URL || "URL mancante"})`);
} catch (err) {
  console.error("Supabase connection error:", (err as Error).message);
}

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/doc", docRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/workspaces", workspacesRoutes);
app.use("/api/templates", templatesRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/search", searchVectorRoutes);
app.use("/api/billing", billingRouter);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/meetings", meetingsRoutes);
app.use("/api/integrations", integrationsRoutes);
app.use("/api/resources", resourcesRoutes);

app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// Unmatched API routes get a JSON 404 instead of falling through to Next.js
// (which would return an HTML 404 page the API client can't parse).
app.use("/api", (req: Request, res: Response) => {
  res.status(404).json({
    error: { message: "Not Found", status: 404, code: "NOT_FOUND" },
  });
});

import errorHandler from "./middleware/errorHandler";
app.use(errorHandler);

// Socket.IO realtime on the same HTTP server
const io = new Server(server, {
  cors: {
    // Same-origin websockets must always work (the app can run on any port).
    // Real security comes from the JWT check in io.use below.
    origin: true,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.use((socket: Socket, next) => {
  const token =
    socket.handshake.auth?.token ||
    socket.handshake.headers?.authorization?.replace("Bearer ", "");

  if (!token) {
    return next(new Error("Authentication required"));
  }

  try {
    const decoded = verifyToken(token as string);
    (socket as any).user = { id: decoded.sub, email: decoded.email };
    return next();
  } catch {
    return next(new Error("Invalid token"));
  }
});

io.on("connection", (socket: Socket) => {
  console.log("Collaborator connected:", socket.id);

  socket.on("join-room", (roomId: unknown) => {
    socket.join(String(roomId));
    console.log(`Socket ${socket.id} joined page room ${roomId}`);
  });

  socket.on("leave-room", (roomId: unknown) => {
    socket.leave(String(roomId));
    console.log(`Socket ${socket.id} left page room ${roomId}`);
  });

  socket.on(
    "page-update",
    ({ pageId, data, source }: { pageId: unknown; data: unknown; source: unknown }) => {
      // Broadcast back to everyone in the room except sender
      socket.to(String(pageId)).emit("page-update", { pageId, data, source });
    },
  );

  socket.on(
    "cursor-move",
    ({
      pageId,
      userId,
      userName,
      x,
      y,
    }: {
      pageId: unknown;
      userId: unknown;
      userName: unknown;
      x: unknown;
      y: unknown;
    }) => {
      const self = socket as any;
      socket.to(String(pageId)).emit("cursor-move", {
        userId: self.user?.id || userId,
        userName,
        x,
        y,
      });
    },
  );

  socket.on("disconnect", () => {
    console.log("Collaborator disconnected:", socket.id);
  });
});

server.listen(Number(PORT), () => {
  console.log(`Taskly API server running on http://localhost:${PORT}`);
  console.log("API: /api  ·  Socket.IO realtime: same origin");
  console.log(
    "Frontend (npm run dev): Next.js on http://localhost:3000, /api proxied here.",
  );
});

server.on("error", (err: NodeJS.ErrnoException) => {
  if (err && err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Stop the process using that port or set PORT env var to a different port and restart.`);
    console.error("To find and kill the process on Windows:");
    console.error("  netstat -ano | findstr :" + PORT);
    console.error("  taskkill /PID <pid> /F");
    process.exit(1);
  }
  console.error("Server error:", err);
  process.exit(1);
});
