# DE Tracker v2 — Full Stack with MySQL Login
## Aditya Rawat | Basic → Top 5% AWS Data Engineer | 2026

---

## 📁 Project Structure

```
de-tracker-full/
├── server.js                ← Express server (entry point)
├── package.json             ← All dependencies
├── .env.example             ← Copy to .env, fill your values
│
├── config/
│   └── db.js                ← MySQL connection pool (mysql2)
│
├── middleware/
│   └── auth.js              ← JWT Bearer token verification
│
├── routes/
│   ├── auth.js              ← /api/auth/* (register, login, logout, me)
│   ├── progress.js          ← /api/progress/* (load, save, toggle, reset, stats)
│   └── admin.js             ← /api/admin/* (admin-only user management)
│
├── db/
│   ├── schema.sql           ← Full MySQL schema (3 tables)
│   └── setup.js             ← Auto-create database + tables
│
└── public/                  ← Frontend (served as static)
    ├── index.html           ← Login / Register page
    ├── app.html             ← Main tracker app (auth-protected)
    ├── css/style.css        ← Complete dark premium UI styles
    └── js/
        ├── data.js          ← All curriculum data (23 skills, 22 weeks, combos)
        └── app.js           ← Frontend logic (auth, progress, datetime tracking)
```

---

## 🚀 Quick Start (5 steps)

### Step 1 — Install Node.js
Download from https://nodejs.org (v18+ recommended)

### Step 2 — Install MySQL
Download from https://dev.mysql.com/downloads/mysql/ or use XAMPP/WAMP

### Step 3 — Install project dependencies
```bash
cd de-tracker-full
npm install
```

### Step 4 — Configure environment
```bash
cp .env.example .env
```
Edit `.env` with your MySQL credentials:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=de_tracker
JWT_SECRET=any_long_random_string_here
PORT=3000
```

### Step 5 — Create database tables
```bash
node db/setup.js
```
Output should be:
```
✅ MySQL connected → localhost:3306/de_tracker
✅ CREATE DATABASE IF NOT EXISTS de_tracker...
✅ CREATE TABLE IF NOT EXISTS users...
✅ CREATE TABLE IF NOT EXISTS progress...
✅ CREATE TABLE IF NOT EXISTS sessions...
🎉 Database 'de_tracker' is ready!
```

### Step 6 — Start the server
```bash
node server.js
# or for dev with auto-reload:
npm run dev
```

### Step 7 — Open in browser
```
http://localhost:3000
```
Register an account → start tracking!

---

## 🗄️ MySQL Database Schema

### `users` table
```sql
id, username (unique), email (unique), password (bcrypt),
full_name, role (user/admin), is_active,
created_at, updated_at, last_login
```

### `progress` table
```sql
id, user_id (FK → users.id),
key        VARCHAR(220)  -- e.g. "math_d0", "taster_git", "combo_c1"
value      TINYINT(1)    -- 1 = done, 0 = not done
completed_at DATETIME    -- ← EXACT datetime task was marked complete
updated_at DATETIME
```

### `sessions` table
```sql
id, user_id, token_hash (SHA-256 of JWT),
ip_address, user_agent, created_at, expires_at
```

### Progress key naming convention
| Type | Key format | Example |
|------|-----------|---------|
| Daily task | `{skill_id}_d{day_index}` | `math_d0`, `python_basics_d4` |
| Skill taster | `taster_{skill_id}` | `taster_git`, `taster_aws_core1` |
| Combo project | `combo_{combo_id}` | `combo_c1`, `combo_c5` |
| Checklist item | `cl_{phase_name}_{index}` | `cl_PHASE 0 — ABSOLUTE BASICS_2` |

---

## 🌐 API Endpoints

### Auth
| Method | URL | Body | Description |
|--------|-----|------|-------------|
| POST | `/api/auth/register` | `{username, email, password, full_name}` | Create account |
| POST | `/api/auth/login` | `{login, password}` | Login (username or email) |
| POST | `/api/auth/logout` | — | Clear session cookie |
| GET  | `/api/auth/me` | — | Get current user (requires auth) |
| PUT  | `/api/auth/profile` | `{full_name}` | Update profile |

### Progress (all require auth)
| Method | URL | Body | Description |
|--------|-----|------|-------------|
| GET  | `/api/progress` | — | Load all progress + timestamps |
| POST | `/api/progress` | `{updates:{key:bool}, timestamps:{key:datetime}}` | Batch save |
| PUT  | `/api/progress/:key` | — | Toggle single key |
| DELETE | `/api/progress/reset` | — | Wipe all progress |
| GET  | `/api/progress/stats` | — | Summary stats |

### Example progress response
```json
{
  "progress": {
    "math_d0": true,
    "math_d1": true,
    "python_basics_d0": false
  },
  "timestamps": {
    "math_d0": "2026-01-15 09:30:45",
    "math_d1": "2026-01-16 14:22:10"
  }
}
```

---

## ⏰ Datetime Tracking Feature

Every task, taster, combo project, and checklist item records the **exact date and time** it was marked complete.

- Stored in `completed_at` column in MySQL (`DATETIME` type)
- Displayed in the app next to each completed item: `✅ 15 Jan 2026, 09:30 AM`
- Cleared (set to NULL) if you uncheck an item
- Visible in all 5 views: Daily Tasks, Projects, Checklist, Combos

---

## 📥 Download Syllabus

The **"Download Syllabus PDF"** button (green, top bar) opens:
```
https://drive.google.com/file/d/1Ou3VZ2PKi2dSTMgbonpXPRzmlwwBzm7H/view?usp=sharing
```
This opens your full 22-week curriculum PDF from Google Drive in a new tab.

---

## 🔐 Security

| Feature | Implementation |
|---------|---------------|
| Password hashing | bcrypt (12 rounds) |
| Authentication | JWT (7-day expiry) |
| Token storage | httpOnly cookie + localStorage |
| Auth protection | Express middleware on all `/api/progress/*` routes |
| Rate limiting | 20 auth attempts per 15 min, 120 API calls per min |
| Admin routes | Role-based access (first registered user = admin) |

---

## 🔗 Your Links

| Platform | URL |
|----------|-----|
| LinkedIn | https://www.linkedin.com/in/aditya-rawat-b6635521a/ |
| GitHub   | https://github.com/AdityaUK01 |
| Email    | adityarawat9917@gmail.com |
| Syllabus | https://drive.google.com/file/d/1Ou3VZ2PKi2dSTMgbonpXPRzmlwwBzm7H/view?usp=sharing |

---

## 💻 Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js v18+ |
| Framework | Express.js |
| Database | MySQL 8.0 (via mysql2) |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Frontend | Vanilla HTML / CSS / JavaScript |
| Fonts | Space Grotesk + JetBrains Mono |

---

## 🐛 Troubleshooting

**"MySQL connection failed"**
→ Check MySQL is running: `mysql -u root -p`
→ Verify DB_PASS in `.env` file
→ Run `node db/setup.js` to create tables

**"Cannot GET /app.html" after login**
→ Make sure server is running: `node server.js`
→ Open http://localhost:3000 (not the file directly)

**Progress not saving**
→ Check browser console for API errors
→ Verify JWT_SECRET is set in `.env`
→ Check MySQL has the `progress` table: `SHOW TABLES;`

---

*DE Tracker v2 · 2026 · Built for Aditya Rawat · MySQL + Node.js + JWT*
