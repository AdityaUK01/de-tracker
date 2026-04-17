// config/db.js — MySQL connection pool (shared across all routes)
require("dotenv").config();
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host:               process.env.DB_HOST     || "localhost",
  port:     parseInt(process.env.DB_PORT      || "3306"),
  user:               process.env.DB_USER     || "root",
  password:           process.env.DB_PASS     || "",
  database:           process.env.DB_NAME     || "de_tracker",
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  charset:            "utf8mb4",
  timezone:           "Z",
  namedPlaceholders:  true,
});

// Verify on startup
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log("✅  MySQL connected →", `${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || 3306}/${process.env.DB_NAME || "de_tracker"}`);
    conn.release();
  } catch (err) {
    console.error("❌  MySQL connection failed:", err.message);
    console.error("    → Check .env file and ensure MySQL is running");
    console.error("    → Run: node db/setup.js  to create tables");
    process.exit(1);
  }
})();

module.exports = pool;
