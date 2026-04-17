// middleware/auth.js — JWT verification
const jwt = require("jsonwebtoken");

function authRequired(req, res, next) {
  let token = null;
  const header = req.headers["authorization"] || "";
  if (header.startsWith("Bearer ")) token = header.slice(7);
  if (!token && req.cookies?.token) token = req.cookies.token;

  if (!token) return res.status(401).json({ error: "Authentication required" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, username: payload.username, email: payload.email, role: payload.role || "user" };
    next();
  } catch (err) {
    const msg = err.name === "TokenExpiredError" ? "Session expired, please login again" : "Invalid token";
    return res.status(401).json({ error: msg });
  }
}

function adminRequired(req, res, next) {
  if (req.user?.role === "admin") return next();
  return res.status(403).json({ error: "Admin access required" });
}

module.exports = { authRequired, adminRequired };
