require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const aiRoutes = require("./routes/ai");
const docRoutes = require("./routes/doc");
const { billingRouter, stripeWebhookHandler } = require("./routes/billing");
const analyticsRoutes = require("./routes/analytics");
const activityRoutes = require("./routes/activity");

const app = express();

app.use(cors());

app.post(
  "/api/billing/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhookHandler,
);

// security middlewares
const sanitize = require('./middleware/sanitize');
const rateLimiter = require('./middleware/rateLimiter');
const auditLogger = require('./middleware/auditLogger');

app.use(sanitize);
app.use(rateLimiter);
app.use(express.json());
app.use(auditLogger);

try {
  require("./lib/supabase").getSupabase();
  console.log("Connected to Supabase");
} catch (err) {
  console.error("Supabase configuration error:", err.message);
}

const http = require("http");
const socketIo = require("socket.io");

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/doc", docRoutes);
app.use("/api/tasks", require('./routes/tasks'));
app.use("/api/workspaces", require('./routes/workspaces'));
app.use("/api/templates", require('./routes/templates'));
app.use("/api/notifications", require('./routes/notifications'));
app.use("/api/search", require('./routes/search_vector'));
app.use("/api/billing", billingRouter);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/meetings", require('./routes/meetings'));
app.use("/api/support", require('./routes/support'));
app.use("/api/resources", require('./routes/resources'));

const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 5000;

// Wrap express app in http server for WebSocket support
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Make the socket server reachable from routes (used to broadcast workspace
// member changes to everyone currently inside the workspace).
app.set("io", io);

// ── Workspace presence ──────────────────────────────────────────────────
// Tracks who is online in each workspace so the UI can show live collaborators.
const workspacePresence = new Map(); // workspaceId -> Map<socketId, user>

function roomName(workspaceId) {
  return `ws:${workspaceId}`;
}

function presenceList(workspaceId) {
  const room = workspacePresence.get(workspaceId);
  if (!room) return [];
  const seen = new Map();
  for (const user of room.values()) seen.set(user.userId, user);
  return Array.from(seen.values());
}

function broadcastPresence(workspaceId) {
  io.to(roomName(workspaceId)).emit("workspace-presence", {
    workspaceId,
    online: presenceList(workspaceId),
  });
}

io.on('connection', (socket) => {
  console.log('Collaborator connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(String(roomId));
    console.log(`Socket ${socket.id} joined page room ${roomId}`);
  });

  socket.on('leave-room', (roomId) => {
    socket.leave(String(roomId));
    console.log(`Socket ${socket.id} left page room ${roomId}`);
  });

  socket.on('page-update', ({ pageId, data, source }) => {
    // Broadcast back to everyone in the room except sender
    socket.to(String(pageId)).emit('page-update', { pageId, data, source });
  });

  socket.on('cursor-move', ({ pageId, userId, userName, x, y }) => {
    socket.to(String(pageId)).emit('cursor-move', { userId, userName, x, y });
  });

  // ── Workspace presence: who is inside which workspace ────────────────
  socket.on('workspace-join', ({ workspaceId, user } = {}) => {
    if (!workspaceId) return;
    const room = workspacePresence.get(workspaceId) || new Map();
    room.set(socket.id, {
      userId: (user && (user.id || user.userId)) || socket.id,
      name: (user && user.name) || 'Collaboratore',
      email: (user && user.email) || '',
      picture: (user && user.picture) || null,
    });
    workspacePresence.set(workspaceId, room);
    socket.join(roomName(workspaceId));
    socket.data.workspaceId = workspaceId;
    broadcastPresence(workspaceId);
  });

  socket.on('workspace-leave', ({ workspaceId } = {}) => {
    if (!workspaceId) return;
    const room = workspacePresence.get(workspaceId);
    if (room) {
      room.delete(socket.id);
      if (room.size === 0) workspacePresence.delete(workspaceId);
    }
    socket.leave(roomName(workspaceId));
    broadcastPresence(workspaceId);
  });

  socket.on('disconnect', () => {
    const wsId = socket.data && socket.data.workspaceId;
    if (wsId) {
      const room = workspacePresence.get(wsId);
      if (room) {
        room.delete(socket.id);
        if (room.size === 0) workspacePresence.delete(wsId);
      }
      broadcastPresence(wsId);
    }
    console.log('Collaborator disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Collaborative server running on port ${PORT}`);
});

server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the process using that port or set PORT env var to a different port and restart.`);
    console.error('To find and kill the process on Windows:');
    console.error('  netstat -ano | findstr :' + PORT);
    console.error('  taskkill /PID <pid> /F');
    process.exit(1);
  }
  console.error('Server error:', err);
  process.exit(1);
});
