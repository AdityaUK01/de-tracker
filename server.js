// server.js — DE Tracker Main Server
// Aditya Rawat | AWS Data Engineer Tracker | 2026
require("dotenv").config();

const express     = require("express");
const cookieParser= require("cookie-parser");
const cors        = require("cors");
const rateLimit   = require("express-rate-limit");
const path        = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ─────────────────────────────────────────────────
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: true,
  credentials: true,
}));

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { error: "Too many requests, please try again in 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});

// General rate limiter
const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 120,
  message: { error: "Too many requests" },
});

app.use("/api/", generalLimiter);
app.use("/api/auth/login",    authLimiter);
app.use("/api/auth/register", authLimiter);

// ── Static files ──────────────────────────────────────────────
app.use(express.static(path.join(__dirname, "public")));

// ── API Routes ─────────────────────────────────────────────────
// Import DB connection (will throw and exit if MySQL is down)
require("./config/db");

app.use("/api/auth",     require("./routes/auth"));
app.use("/api/progress", require("./routes/progress"));
app.use("/api/admin",    require("./routes/admin"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "DE Tracker",
    version: "2.0.0",
    time: new Date().toISOString(),
  });
});

// ── SPA fallback ──────────────────────────────────────────────
app.get("/app", (req, res) => res.sendFile(path.join(__dirname, "public", "app.html")));
app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) return res.status(404).json({ error: "Not found" });
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ── Global error handler ──────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ error: "Internal server error" });
});

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log("\n╔════════════════════════════════════════╗");
  console.log("║       DE TRACKER  v2.0  — RUNNING      ║");
  console.log("╚════════════════════════════════════════╝");
  console.log(`\n🚀  http://localhost:${PORT}`);
  console.log(`📦  MySQL: ${process.env.DB_HOST || "localhost"}/${process.env.DB_NAME || "de_tracker"}`);
  console.log(`🌍  Mode: ${process.env.NODE_ENV || "development"}\n`);
});
