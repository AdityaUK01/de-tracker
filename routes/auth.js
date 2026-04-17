// routes/auth.js
const express  = require("express");
const bcrypt   = require("bcryptjs");
const jwt      = require("jsonwebtoken");
const crypto   = require("crypto");
const pool     = require("../config/db");
const { authRequired } = require("../middleware/auth");

const router = express.Router();
const COOKIE_MAX_AGE = 7 * 24 * 3600 * 1000; // 7 days ms
const JWT_EXPIRES    = "7d";

function makeToken(user) {
  return jwt.sign(
    { sub: user.id, username: user.username, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

function setCookie(res, token) {
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "Lax",
    maxAge:   COOKIE_MAX_AGE,
    secure:   process.env.NODE_ENV === "production",
  });
}

// ── POST /api/auth/register ───────────────────────────────────
router.post("/register", async (req, res) => {
  const { username = "", email = "", password = "", full_name = "" } = req.body || {};

  if (!username.trim() || username.trim().length < 3)
    return res.status(400).json({ error: "Username must be at least 3 characters" });
  if (!email.trim() || !email.includes("@"))
    return res.status(400).json({ error: "Valid email required" });
  if (!password || password.length < 6)
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  if (!full_name.trim())
    return res.status(400).json({ error: "Full name is required" });

  const uname = username.trim().toLowerCase();
  const em    = email.trim().toLowerCase();

  try {
    const [rows] = await pool.query(
      "SELECT id FROM users WHERE username = ? OR email = ?", [uname, em]
    );
    if (rows.length) return res.status(409).json({ error: "Username or email already taken" });

    const hashed = await bcrypt.hash(password, 12);
    const [result] = await pool.query(
      "INSERT INTO users (username, email, password, full_name) VALUES (?, ?, ?, ?)",
      [uname, em, hashed, full_name.trim()]
    );
    const userId = result.insertId;
    const user   = { id: userId, username: uname, email: em, full_name: full_name.trim(), role: "user" };
    const token  = makeToken(user);

    // Log session
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    await pool.query(
      "INSERT INTO sessions (user_id, token_hash, ip_address, user_agent, expires_at) VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))",
      [userId, tokenHash, req.ip, req.headers["user-agent"]?.slice(0, 512) || ""]
    );

    setCookie(res, token);
    return res.status(201).json({ message: "Account created successfully", user, token });
  } catch (err) {
    console.error("Register error:", err.message);
    return res.status(500).json({ error: "Server error, please try again" });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────
router.post("/login", async (req, res) => {
  const { login = "", password = "" } = req.body || {};
  if (!login.trim() || !password)
    return res.status(400).json({ error: "Login credentials required" });

  const id = login.trim().toLowerCase();
  try {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE (username = ? OR email = ?) AND is_active = 1", [id, id]
    );
    if (!rows.length) return res.status(401).json({ error: "Invalid credentials" });

    const user = rows[0];
    const ok   = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    await pool.query("UPDATE users SET last_login = NOW() WHERE id = ?", [user.id]);

    const payload = { id: user.id, username: user.username, email: user.email, full_name: user.full_name, role: user.role };
    const token   = makeToken(payload);

    // Log session
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    await pool.query(
      "INSERT INTO sessions (user_id, token_hash, ip_address, user_agent, expires_at) VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))",
      [user.id, tokenHash, req.ip, req.headers["user-agent"]?.slice(0, 512) || ""]
    );

    setCookie(res, token);
    return res.json({
      message: "Login successful",
      user: { id: user.id, username: user.username, email: user.email, full_name: user.full_name, role: user.role },
      token,
    });
  } catch (err) {
    console.error("Login error:", err.message);
    return res.status(500).json({ error: "Server error" });
  }
});

// ── POST /api/auth/logout ─────────────────────────────────────
router.post("/logout", authRequired, (req, res) => {
  res.clearCookie("token");
  return res.json({ message: "Logged out successfully" });
});

// ── GET /api/auth/me ──────────────────────────────────────────
router.get("/me", authRequired, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, username, email, full_name, role, created_at, last_login FROM users WHERE id = ?",
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: "User not found" });
    return res.json({ user: rows[0] });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

// ── PUT /api/auth/profile ─────────────────────────────────────
router.put("/profile", authRequired, async (req, res) => {
  const { full_name = "" } = req.body || {};
  if (!full_name.trim()) return res.status(400).json({ error: "Full name required" });
  try {
    await pool.query("UPDATE users SET full_name = ? WHERE id = ?", [full_name.trim(), req.user.id]);
    return res.json({ message: "Profile updated" });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
