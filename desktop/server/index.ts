require("dotenv").config();
const express = require("express");
const cors = require("cors");

// Unico uso del backend locale Express: il flusso di login Google con browser
// esterno per Electron (GoogleWebLoginButton → /api/auth/google/*). Tutto il
// resto dell'app usa le API Next del progetto web (:3000).
const authRoutes = require("./routes/auth");

const app = express();

// Restrict the local backend to the packaged frontend origin(s). A wildcard
// CORS policy would let any website in the user's browser call this API.
const ALLOWED_ORIGINS = (
  process.env.FRONTEND_URL || "http://localhost:3000,http://localhost:3333"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow same-process/CLI callers (no Origin header) and allowlisted origins.
      if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
  }),
);

// security middlewares
const sanitize = require('./middleware/sanitize');
const rateLimiter = require('./middleware/rateLimiter');
const auditLogger = require('./middleware/auditLogger');

app.use(sanitize);
app.use(rateLimiter);
app.use(express.json());
app.use(auditLogger);

app.use("/api/auth", authRoutes);

const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 5000;

// Bind to loopback only: il backend serve solo l'app locale (Electron), non la LAN.
const HOST = process.env.HOST || "127.0.0.1";

const server = app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
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
