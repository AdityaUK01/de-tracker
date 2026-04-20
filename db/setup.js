// config/db.js — MySQL connection pool
require("dotenv").config();
const mysql = require("mysql2/promise");
 
const pool = mysql.createPool({
  host:               process.env.DB_HOST,
  port:     parseInt(process.env.DB_PORT || "3306"),
  user:               process.env.DB_USER,
  password:           process.env.DB_PASS,
  database:           process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  charset:            "utf8mb4",
  timezone:           "Z",
  // NO ssl — freesqldatabase.com does not support it
});
 
module.exports = pool;
 