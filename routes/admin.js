// routes/admin.js — Admin-only routes (first registered user = admin)
const express = require("express");
const pool    = require("../config/db");
const { authRequired, adminRequired } = require("../middleware/auth");

const router = express.Router();
router.use(authRequired, adminRequired);

// GET /api/admin/users
router.get("/users", async (req, res) => {
  try {
    const [users] = await pool.query(
      "SELECT id, username, email, full_name, role, is_active, created_at, last_login FROM users ORDER BY id"
    );
    return res.json({ users });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

// GET /api/admin/stats
router.get("/stats", async (req, res) => {
  try {
    const [[{ total_users }]] = await pool.query("SELECT COUNT(*) AS total_users FROM users");
    const [[{ total_progress }]] = await pool.query("SELECT COUNT(*) AS total_progress FROM progress WHERE value=1");
    const [active] = await pool.query("SELECT COUNT(DISTINCT user_id) AS c FROM progress WHERE updated_at > DATE_SUB(NOW(), INTERVAL 7 DAY)");
    return res.json({ total_users, total_progress, active_last_7d: active[0].c });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/admin/users/:id/role
router.put("/users/:id/role", async (req, res) => {
  const { role } = req.body || {};
  if (!["user", "admin"].includes(role)) return res.status(400).json({ error: "Invalid role" });
  try {
    await pool.query("UPDATE users SET role = ? WHERE id = ?", [role, req.params.id]);
    return res.json({ message: "Role updated" });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
