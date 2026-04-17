// db/setup.js — Run once to create the database and tables
// Usage: node db/setup.js
require("dotenv").config();
const mysql = require("mysql2/promise");
const fs    = require("fs");
const path  = require("path");

async function setup() {
  console.log("\n🔧  DE Tracker — Database Setup\n");

  // Connect WITHOUT specifying a database so we can create it
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST || "localhost",
    port:     process.env.DB_PORT || 3306,
    user:     process.env.DB_USER || "root",
    password: process.env.DB_PASS || "",
    multipleStatements: true,
  });

  try {
    const sql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
    const statements = sql
      .split(";")
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith("--"));

    for (const stmt of statements) {
      await conn.query(stmt);
      const first = stmt.slice(0, 50).replace(/\s+/g, " ");
      console.log("  ✅", first + (stmt.length > 50 ? "..." : ""));
    }

    console.log("\n🎉  Database 'de_tracker' is ready!\n");
    console.log("Next step: node server.js\n");
  } catch (err) {
    console.error("❌  Error:", err.message);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

setup();
