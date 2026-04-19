# DE Tracker — AWS Data Engineer Progress Tracker
### 🌐 Live at: [https://de-tracker-7fnr.onrender.com](https://de-tracker-7fnr.onrender.com)

> **Built by Aditya Rawat** — Aspiring AWS Data Engineer | BCA Graduate | Delhi

---

## 🚀 What is this?

A full-stack web application to track your journey from **Basic → Top 5% AWS Data Engineer**.

- ✅ **23 skills** across 5 phases
- 📅 **22-week structured plan**
- 💾 **Progress saved to MySQL** — never lose your data
- ⏰ **Datetime stamp** on every completed task (IST)
- 🔐 **Login system** — your progress is yours alone
- 📥 **Download full syllabus PDF** from Google Drive

---

## 🌐 Live Website

```
https://de-tracker-7fnr.onrender.com
```

> ⚠️ Free Render instance — may take **30–50 seconds** to wake up on first visit.
> Just wait and refresh once. After that it's fast.

---

## 📋 Features

| Feature | Description |
|---------|-------------|
| 🔐 Login / Register | Secure accounts with bcrypt password hashing + JWT |
| 📊 Dashboard | Progress ring, stat cards, phase overview, next tasks |
| 📅 Schedule | Full 22-week study plan table |
| ✅ Daily Tasks | 100+ tasks — tick to complete, datetime recorded |
| ⬡ Combo Projects | 5 multi-skill projects that unlock on prerequisites |
| ✓ Checklist | Job-readiness checklist with completion timestamps |
| 📥 Syllabus PDF | Opens full curriculum from Google Drive |
| 💾 MySQL Backend | All progress stored in MySQL, survives page refresh |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla HTML + CSS + JavaScript |
| Backend | Node.js + Express.js |
| Database | MySQL (freesqldatabase.com) |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Hosting | Render (free tier) |
| Fonts | Space Grotesk + JetBrains Mono |

---

## 📁 Project Structure

```
de-tracker-full/
├── server.js                 ← Express server + auto table creation
├── package.json
├── .env.example              ← Copy → .env with your MySQL creds
│
├── config/
│   └── db.js                 ← MySQL connection pool
│
├── middleware/
│   └── auth.js               ← JWT auth middleware
│
├── routes/
│   ├── auth.js               ← /api/auth/* (register, login, logout, me)
│   ├── progress.js           ← /api/progress/* (save, load, toggle, reset)
│   └── admin.js              ← /api/admin/* (admin-only)
│
├── db/
│   ├── schema.sql            ← MySQL schema reference
│   └── setup.js              ← Manual table setup script
│
└── public/                   ← Frontend (static files)
    ├── index.html            ← Login / Register page
    ├── app.html              ← Main tracker app
    ├── css/style.css
    └── js/
        ├── data.js           ← All 23 skills, curriculum data
        └── app.js            ← Frontend logic
```

---

## 🗄️ Database Schema

### `users`
```sql
id, username (unique), email (unique), password (bcrypt),
full_name, role, is_active, created_at, last_login
```

### `progress`
```sql
id, user_id, pkey (task key), value (0/1),
completed_at (IST datetime string), created_at
```

### Progress key format
| Type | Key | Example |
|------|-----|---------|
| Daily task | `{skill}_d{index}` | `math_d0`, `python_basics_d4` |
| Skill taster | `taster_{skill}` | `taster_git` |
| Combo project | `combo_{id}` | `combo_c1` |
| Checklist | `cl_{phase}_{index}` | `cl_PHASE 0_2` |

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/progress` | Load all progress + timestamps |
| POST | `/api/progress` | Batch save progress |
| PUT | `/api/progress/:key` | Toggle single task |
| DELETE | `/api/progress/reset` | Reset all progress |
| GET | `/api/progress/stats` | Summary stats |
| GET | `/api/health` | Health check |

---

## 🔧 Run Locally

### 1. Clone
```bash
git clone https://github.com/AdityaUK01/de-tracker.git
cd de-tracker
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
```bash
cp .env.example .env
```
Edit `.env`:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=your_password
DB_NAME=de_tracker
JWT_SECRET=any_long_random_string
PORT=3000
NODE_ENV=development
```

### 4. Start MySQL and create tables
```bash
node db/setup.js
```

### 5. Run
```bash
node server.js
# or for auto-reload:
npm run dev
```

### 6. Open
```
http://localhost:3000
```

---

## 📥 Syllabus PDF

Full 22-week curriculum available on Google Drive:

**[📄 Download Syllabus PDF](https://drive.google.com/file/d/1Ou3VZ2PKi2dSTMgbonpXPRzmlwwBzm7H/view?usp=sharing)**

---

## 🔗 Links

| | |
|-|-|
| 🌐 **Live App** | [de-tracker-7fnr.onrender.com](https://de-tracker-7fnr.onrender.com) |
| 💼 **LinkedIn** | [linkedin.com/in/aditya-rawat-b6635521a](https://www.linkedin.com/in/aditya-rawat-b6635521a/) |
| 🐙 **GitHub** | [github.com/AdityaUK01](https://github.com/AdityaUK01) |
| 📧 **Email** | [adityarawat9917@gmail.com](mailto:adityarawat9917@gmail.com) |

---

## 📊 22-Week Learning Path

| Phase | Weeks | Skills |
|-------|-------|--------|
| 🧱 Phase 0 — Absolute Basics | 1–2 | Math, English, Linux, CS Fundamentals |
| 🐣 Phase 1 — Beginner Core | 3–6 | Python, SQL/MySQL, Git, Bash |
| ⚙️ Phase 2 — Intermediate Stack | 7–12 | AWS S3+Glue+Athena, Redshift, Lambda, Data Modeling, Airflow, dbt |
| 🚀 Phase 3 — Advanced Stack | 13–18 | PySpark+EMR+Delta Lake, Kafka+Kinesis, Snowflake, REST APIs, Terraform+Docker |
| 🏆 Phase 4 — Expert Level | 19–22 | Data Quality, Lake Formation, System Design, AWS DEA-C01 |

---

## ⚡ Combo Projects (unlock by completing prerequisites)

1. **Full Serverless Batch Pipeline** — S3 + Glue + Athena + Redshift + Lambda
2. **Airflow + dbt + Redshift Production Pipeline** — Full orchestrated DE stack
3. **PySpark + Delta Lake + Glue Lakehouse** — Distributed modern lakehouse
4. **Real-Time Lambda Architecture** — Kafka + Kinesis + Airflow (streaming + batch)
5. **Full Modern Data Stack Capstone** — Everything combined — your portfolio flagship

---

*DE Tracker v2.0 · 2026 · Built for Aditya Rawat · MySQL · Node.js · JWT · Render*