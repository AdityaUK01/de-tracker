// server.js — DE Tracker v2.0 — MySQL 5.5 compatible
require("dotenv").config();

const express      = require("express");
const cookieParser = require("cookie-parser");
const cors         = require("cors");
const rateLimit    = require("express-rate-limit");
const path         = require("path");
const mysql        = require("mysql2/promise");

const app  = express();
const PORT = process.env.PORT || 3000;

app.set("trust proxy", 1);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));

const limiterOpts = { validate: { xForwardedForHeader: false } };
const authLimiter = rateLimit({ ...limiterOpts, windowMs: 15*60*1000, max: 20, standardHeaders: true, legacyHeaders: false, message: { error: "Too many requests" } });
const generalLimiter = rateLimit({ ...limiterOpts, windowMs: 60*1000, max: 200, message: { error: "Too many requests" } });
app.use("/api/", generalLimiter);
app.use("/api/auth/login",    authLimiter);
app.use("/api/auth/register", authLimiter);
app.use(express.static(path.join(__dirname, "public")));

// ── Create tables — MySQL 5.5 compatible ─────────────────────
// Rules for MySQL 5.5:
//   - Only ONE TIMESTAMP column with DEFAULT CURRENT_TIMESTAMP per table
//   - No TIMESTAMP NULL DEFAULT NULL
//   - No utf8mb4 on some hosts → use utf8
//   - Store dates as VARCHAR(30) where auto-timestamp not needed
async function initDatabase() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST,
    port:     parseInt(process.env.DB_PORT || "3306"),
    user:     process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });
  console.log("✅  MySQL connected to", process.env.DB_HOST);

  await conn.execute("SET SESSION sql_mode = ''");

  // ── users ────────────────────────────────────────────────────
  // Only created_at uses CURRENT_TIMESTAMP auto-default
  // last_login stored as VARCHAR to avoid TIMESTAMP limit
  await conn.execute(
    "CREATE TABLE IF NOT EXISTS users (" +
    "  id         INT UNSIGNED  NOT NULL AUTO_INCREMENT," +
    "  username   VARCHAR(50)   NOT NULL," +
    "  email      VARCHAR(150)  NOT NULL," +
    "  password   VARCHAR(255)  NOT NULL," +
    "  full_name  VARCHAR(120)  NOT NULL DEFAULT ''," +
    "  role       VARCHAR(10)   NOT NULL DEFAULT 'user'," +
    "  is_active  TINYINT(1)    NOT NULL DEFAULT 1," +
    "  created_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP," +
    "  last_login VARCHAR(30)            DEFAULT NULL," +
    "  PRIMARY KEY (id)," +
    "  UNIQUE KEY uk_username (username)," +
    "  UNIQUE KEY uk_email (email)" +
    ") ENGINE=InnoDB DEFAULT CHARSET=utf8"
  );
  console.log("✅  Table: users");

  // ── progress ─────────────────────────────────────────────────
  // completed_at as VARCHAR — stores "2026-01-15 09:30:00" string
  // Only created_at uses auto CURRENT_TIMESTAMP
  await conn.execute(
    "CREATE TABLE IF NOT EXISTS progress (" +
    "  id           INT UNSIGNED NOT NULL AUTO_INCREMENT," +
    "  user_id      INT UNSIGNED NOT NULL," +
    "  pkey         VARCHAR(220) NOT NULL," +
    "  value        TINYINT(1)   NOT NULL DEFAULT 1," +
    "  completed_at VARCHAR(30)           DEFAULT NULL," +
    "  created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP," +
    "  PRIMARY KEY (id)," +
    "  UNIQUE KEY uk_user_key (user_id, pkey)," +
    "  INDEX idx_user (user_id)," +
    "  FOREIGN KEY fk_prog (user_id) REFERENCES users(id) ON DELETE CASCADE" +
    ") ENGINE=InnoDB DEFAULT CHARSET=utf8"
  );
  console.log("✅  Table: progress");

  // ── sessions ─────────────────────────────────────────────────
  await conn.execute(
    "CREATE TABLE IF NOT EXISTS sessions (" +
    "  id          INT UNSIGNED NOT NULL AUTO_INCREMENT," +
    "  user_id     INT UNSIGNED NOT NULL," +
    "  token_hash  CHAR(64)     NOT NULL," +
    "  ip_address  VARCHAR(45)           DEFAULT NULL," +
    "  user_agent  VARCHAR(512)          DEFAULT NULL," +
    "  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP," +
    "  PRIMARY KEY (id)," +
    "  INDEX idx_token (token_hash)," +
    "  FOREIGN KEY fk_sess (user_id) REFERENCES users(id) ON DELETE CASCADE" +
    ") ENGINE=InnoDB DEFAULT CHARSET=utf8"
  );
  console.log("✅  Table: sessions");

  await conn.end();
  console.log("🎉  Database ready!\n");
}

// Routes
app.use("/api/auth",     require("./routes/auth"));
app.use("/api/progress", require("./routes/progress"));
app.use("/api/admin",    require("./routes/admin"));
app.get("/api/health",   (_req, res) => res.json({ status: "ok", time: new Date().toISOString() }));
app.get("/app",          (_req, res) => res.sendFile(path.join(__dirname, "public", "app.html")));
app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) return res.status(404).json({ error: "Not found" });
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.use((err, _req, res, _next) => res.status(500).json({ error: "Server error" }));

// Boot
(async () => {
  try {
    console.log("\n╔══════════════════════════════════════╗");
    console.log("║     DE TRACKER  v2.0  — STARTING     ║");
    console.log("╚══════════════════════════════════════╝\n");
    await initDatabase();
    require("./config/db");
    app.listen(PORT, () => {
      console.log("🚀  Port:", PORT);
      console.log("📦  DB:", process.env.DB_HOST + "/" + process.env.DB_NAME + "\n");
    });
  } catch (err) {
    console.error("❌  Startup failed:", err.message);
    process.exit(1);
  }
})();