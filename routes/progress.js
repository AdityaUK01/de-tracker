// routes/progress.js
const express = require("express");
const pool    = require("../config/db");
const { authRequired } = require("../middleware/auth");

const router = express.Router();
router.use(authRequired);

// GET /api/progress — load all progress + timestamps
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT pkey, value, completed_at FROM progress WHERE user_id = ?",
      [req.user.id]
    );
    const progress = {}, timestamps = {};
    rows.forEach(r => {
      progress[r.pkey] = !!r.value;
      if (r.value && r.completed_at) timestamps[r.pkey] = r.completed_at;
    });
    return res.json({ progress, timestamps });
  } catch (err) {
    console.error("GET progress:", err.message);
    return res.status(500).json({ error: "Server error" });
  }
});

// POST /api/progress — batch upsert { updates: {key:bool}, timestamps: {key:datetime} }
router.post("/", async (req, res) => {
  const updates    = req.body?.updates;
  const timestamps = req.body?.timestamps;
  if (!updates || typeof updates !== "object")
    return res.status(400).json({ error: "updates object required" });

  const entries = Object.entries(updates).filter(([k]) => typeof k === "string" && k.length <= 220);
  if (!entries.length) return res.json({ saved: 0 });

  try {
    for (const [key, value] of entries) {
      const v  = value ? 1 : 0;
      const ts = (value && timestamps && timestamps[key]) ? timestamps[key] : null;
      await pool.query(
        "INSERT INTO progress (user_id, pkey, value, completed_at) VALUES (?, ?, ?, ?) " +
        "ON DUPLICATE KEY UPDATE value=VALUES(value), completed_at=VALUES(completed_at), updated_at=NOW()",
        [req.user.id, key, v, ts]
      );
    }
    return res.json({ saved: entries.length });
  } catch (err) {
    console.error("POST progress:", err.message);
    return res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/progress/:key — toggle single item
router.put("/:key", async (req, res) => {
  const key = req.params.key;
  if (!key || key.length > 220) return res.status(400).json({ error: "Invalid key" });
  try {
    const [rows] = await pool.query(
      "SELECT value FROM progress WHERE user_id = ? AND pkey = ?",
      [req.user.id, key]
    );
    const newVal = rows.length ? (rows[0].value ? 0 : 1) : 1;
    const ts     = newVal ? new Date().toISOString().replace("T", " ").slice(0, 19) : null;
    await pool.query(
      "INSERT INTO progress (user_id, pkey, value, completed_at) VALUES (?, ?, ?, ?) " +
      "ON DUPLICATE KEY UPDATE value=VALUES(value), completed_at=VALUES(completed_at), updated_at=NOW()",
      [req.user.id, key, newVal, ts]
    );
    return res.json({ key, value: !!newVal, completed_at: ts });
  } catch (err) {
    console.error("PUT progress:", err.message);
    return res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/progress/reset
router.delete("/reset", async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM progress WHERE user_id = ?", [req.user.id]
    );
    return res.json({ message: "Progress reset", deleted: result.affectedRows });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

// GET /api/progress/stats
router.get("/stats", async (req, res) => {
  try {
    const [[stats]] = await pool.query(
      "SELECT COUNT(*) AS total_done, " +
      "SUM(pkey REGEXP '_d[0-9]+$') AS tasks_done, " +
      "SUM(pkey LIKE 'taster_%') AS tasters_done, " +
      "SUM(pkey LIKE 'combo_%') AS combos_done, " +
      "SUM(pkey LIKE 'cl_%') AS checklist_done, " +
      "MIN(completed_at) AS first_task, " +
      "MAX(completed_at) AS last_task " +
      "FROM progress WHERE user_id = ? AND value = 1",
      [req.user.id]
    );
    return res.json({ stats });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;