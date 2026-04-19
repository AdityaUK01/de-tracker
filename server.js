// server.js — DE Tracker v2.0
// Aditya Rawat | 2026
require("dotenv").config();

const express      = require("express");
const cookieParser = require("cookie-parser");
const cors         = require("cors");
const rateLimit    = require("express-rate-limit");
const path         = require("path");
const mysql        = require("mysql2/promise");

const app  = express();
const PORT = process.env.PORT || 3000;

// Trust proxy — required for Render/Railway
app.set("trust proxy", 1);

// Middleware
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));

// Rate limiters
const limiterOpts = { validate: { xForwardedForHeader: false } };

const authLimiter = rateLimit({
  ...limiterOpts,
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, try again in 15 minutes" },
});

const generalLimiter = rateLimit({
  ...limiterOpts,
  windowMs: 1 * 60 * 1000,
  max: 200,
  message: { error: "Too many requests" },
});

app.use("/api/", generalLimiter);
app.use("/api/auth/login",    authLimiter);
app.use("/api/auth/register", authLimiter);

// Static files
app.use(express.static(path.join(__dirname, "public")));

// ── Auto-create MySQL tables on startup ─────────────────────
async function initDatabase() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST,
    port:     parseInt(process.env.DB_PORT || "3306"),
    user:     process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  console.log("✅  MySQL connected");

  // Relax strict mode for freesqldatabase.com compatibility
  await conn.execute("SET SESSION sql_mode = 'NO_ENGINE_SUBSTITUTION'");

  // users table
  await conn.execute(
    "CREATE TABLE IF NOT EXISTS users (" +
    "  id         INT UNSIGNED NOT NULL AUTO_INCREMENT," +
    "  username   VARCHAR(50)  NOT NULL," +
    "  email      VARCHAR(150) NOT NULL," +
    "  password   VARCHAR(255) NOT NULL," +
    "  full_name  VARCHAR(120) NOT NULL DEFAULT ''," +
    "  role       ENUM('user','admin') NOT NULL DEFAULT 'user'," +
    "  is_active  TINYINT(1)   NOT NULL DEFAULT 1," +
    "  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP," +
    "  updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP," +
    "  last_login TIMESTAMP NULL," +
    "  PRIMARY KEY (id)," +
    "  UNIQUE KEY uk_username (username)," +
    "  UNIQUE KEY uk_email (email)" +
    ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
  );
  console.log("✅  Table: users");

  // progress table — use `pkey` to avoid reserved word `key`
  await conn.execute(
    "CREATE TABLE IF NOT EXISTS progress (" +
    "  id           INT UNSIGNED NOT NULL AUTO_INCREMENT," +
    "  user_id      INT UNSIGNED NOT NULL," +
    "  pkey         VARCHAR(220) NOT NULL," +
    "  value        TINYINT(1)   NOT NULL DEFAULT 1," +
    "  completed_at TIMESTAMP             DEFAULT NULL," +
    "  updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP," +
    "  PRIMARY KEY (id)," +
    "  UNIQUE KEY uk_user_key (user_id, pkey)," +
    "  FOREIGN KEY fk_prog_user (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE," +
    "  INDEX idx_user (user_id)" +
    ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
  );
  console.log("✅  Table: progress");

  // sessions table
  await conn.execute(
    "CREATE TABLE IF NOT EXISTS sessions (" +
    "  id          INT UNSIGNED NOT NULL AUTO_INCREMENT," +
    "  user_id     INT UNSIGNED NOT NULL," +
    "  token_hash  CHAR(64)     NOT NULL," +
    "  ip_address  VARCHAR(45)           DEFAULT NULL," +
    "  user_agent  VARCHAR(512)          DEFAULT NULL," +
    "  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP," +
    "  expires_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP," +
    "  PRIMARY KEY (id)," +
    "  FOREIGN KEY fk_sess_user (user_id) REFERENCES users(id) ON DELETE CASCADE," +
    "  INDEX idx_token (token_hash)," +
    "  INDEX idx_expires (expires_at)" +
    ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
  );
  console.log("✅  Table: sessions");

  await conn.end();
  console.log("🎉  Database ready!\n");
}

// API Routes
app.use("/api/auth",     require("./routes/auth"));
app.use("/api/progress", require("./routes/progress"));
app.use("/api/admin",    require("./routes/admin"));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "DE Tracker", version: "2.0.0", time: new Date().toISOString() });
});

// SPA fallback
app.get("/app", (_req, res) => res.sendFile(path.join(__dirname, "public", "app.html")));
app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) return res.status(404).json({ error: "Not found" });
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error("Error:", err.message);
  res.status(500).json({ error: "Internal server error" });
});

// Boot
(async () => {
  try {
    console.log("\n╔══════════════════════════════════════╗");
    console.log("║     DE TRACKER  v2.0  — STARTING     ║");
    console.log("╚══════════════════════════════════════╝\n");

    await initDatabase();

    require("./config/db");

    app.listen(PORT, () => {
      console.log("🚀  Running on port", PORT);
      console.log("📦  DB:", process.env.DB_HOST + "/" + process.env.DB_NAME);
      console.log("🌍  Mode:", process.env.NODE_ENV || "development", "\n");
    });
  } catch (err) {
    console.error("❌  Startup failed:", err.message);
    process.exit(1);
  }
})();