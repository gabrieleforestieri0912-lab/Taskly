require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");

const { verifyToken } = require("./middleware/auth");
const { getSupabase } = require("./supabase/client");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const aiRoutes = require("./routes/ai");
const docRoutes = require("./routes/doc");
const { billingRouter, stripeWebhookHandler } = require("./routes/billing");
const analyticsRoutes = require("./routes/analytics");
const activityRoutes = require("./routes/activity");

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

function parseOrigins(value) {
  return String(value || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const allowedOrigins = parseOrigins(
  process.env.CORS_ORIGINS || process.env.FRONTEND_URL || "http://localhost:3000",
);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`Origin not allowed by CORS: ${origin}`));
  },
  credentials: true,
};

// Same-origin requests (the frontend is served by this same server, on whatever
// port/domain it runs) must always be allowed. Only cross-origin requests are
// checked against the configured CORS origins.
function isSameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true; // no Origin header → not a browser CORS request
  const host = req.get("host");
  // Accept http/https so the check also works behind a TLS-terminating proxy.
  return origin === `http://${host}` || origin === `https://${host}`;
}

app.use((req, res, next) => {
  if (isSameOrigin(req)) return next();
  return cors(corsOptions)(req, res, next);
});

app.post(
  "/api/billing/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhookHandler,
);

const sanitize = require("./middleware/sanitize");
const rateLimiter = require("./middleware/rateLimiter");
const auditLogger = require("./middleware/auditLogger");

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
  console.error("Supabase connection error:", err.message);
}

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/doc", docRoutes);
app.use("/api/tasks", require("./routes/tasks"));
app.use("/api/workspaces", require("./routes/workspaces"));
app.use("/api/templates", require("./routes/templates"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/search", require("./routes/search_vector"));
app.use("/api/billing", billingRouter);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/activity", activityRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Unmatched API routes get a JSON 404 instead of falling through to Next.js
// (which would return an HTML 404 page the API client can't parse).
app.use("/api", (req, res) => {
  res.status(404).json({
    error: { message: "Not Found", status: 404, code: "NOT_FOUND" },
  });
});

const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

// Socket.IO realtime on the same HTTP server
const io = socketIo(server, {
  cors: {
    // Same-origin websockets must always work (the app can run on any port).
    // Real security comes from the JWT check in io.use below.
    origin: true,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.use((socket, next) => {
  const token =
    socket.handshake.auth?.token ||
    socket.handshake.headers?.authorization?.replace("Bearer ", "");

  if (!token) {
    return next(new Error("Authentication required"));
  }

  try {
    const decoded = verifyToken(token);
    socket.user = { id: decoded.sub, email: decoded.email };
    return next();
  } catch {
    return next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  console.log("Collaborator connected:", socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(String(roomId));
    console.log(`Socket ${socket.id} joined page room ${roomId}`);
  });

  socket.on("leave-room", (roomId) => {
    socket.leave(String(roomId));
    console.log(`Socket ${socket.id} left page room ${roomId}`);
  });

  socket.on("page-update", ({ pageId, data, source }) => {
    // Broadcast back to everyone in the room except sender
    socket.to(String(pageId)).emit("page-update", { pageId, data, source });
  });

  socket.on("cursor-move", ({ pageId, userId, userName, x, y }) => {
    socket.to(String(pageId)).emit("cursor-move", {
      userId: socket.user.id || userId,
      userName,
      x,
      y,
    });
  });

  socket.on("disconnect", () => {
    console.log("Collaborator disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Taskly API server running on http://localhost:${PORT}`);
  console.log("API: /api  ·  Socket.IO realtime: same origin");
  console.log(
    "Frontend (npm run dev): Next.js on http://localhost:3000, /api proxied here.",
  );
});

server.on("error", (err) => {
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
