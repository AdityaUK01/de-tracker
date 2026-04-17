// ═══════════════════════════════════════════════════════════════
//  DE Tracker v2 — Frontend App
//  Aditya Rawat | 2026
//  All progress saved to MySQL via API
//  Datetime recorded when each task is marked complete
// ═══════════════════════════════════════════════════════════════

const API = "";
let authToken   = null;
let currentUser = null;
let prog        = {};   // { key: true/false }
let timestamps  = {};   // { key: "2026-01-15 09:30:00" }
let saveTimer   = null;
let pendingSaves = {};

// ─── Auth Guard ────────────────────────────────────────────────
async function initAuth() {
  authToken = localStorage.getItem("de_token");
  if (!authToken) { window.location.href = "/"; return; }
  try {
    const res = await apiFetch("/api/auth/me");
    if (!res.ok) { clearAuth(); return; }
    const data = await res.json();
    currentUser = data.user;
    setUserUI(currentUser);
    await loadProgress();
    renderAll();
  } catch {
    clearAuth();
  }
}

function clearAuth() {
  localStorage.removeItem("de_token");
  localStorage.removeItem("de_user");
  window.location.href = "/";
}

function apiFetch(url, opts = {}) {
  return fetch(API + url, {
    ...opts,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + authToken,
      ...(opts.headers || {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
}

// ─── User UI ───────────────────────────────────────────────────
function setUserUI(user) {
  const n = user.full_name || user.username;
  document.getElementById("userName").textContent   = n;
  document.getElementById("userAvatar").textContent = n.charAt(0).toUpperCase();
  document.getElementById("ddName").textContent     = n;
  document.getElementById("ddEmail").textContent    = user.email;
}

function toggleMenu() {
  document.getElementById("userDropdown").classList.toggle("open");
}
document.addEventListener("click", e => {
  if (!e.target.closest(".user-menu"))
    document.getElementById("userDropdown")?.classList.remove("open");
});

function openSyllabus() {
  window.open("https://drive.google.com/file/d/1Ou3VZ2PKi2dSTMgbonpXPRzmlwwBzm7H/view?usp=sharing", "_blank");
  document.getElementById("userDropdown").classList.remove("open");
}

async function logout() {
  try { await apiFetch("/api/auth/logout", { method: "POST" }); } catch {}
  clearAuth();
}

async function resetProgress() {
  if (!confirm("Reset ALL your progress? This cannot be undone.")) return;
  document.getElementById("userDropdown").classList.remove("open");
  try {
    await apiFetch("/api/progress/reset", { method: "DELETE" });
    prog = {};
    timestamps = {};
    renderAll();
    showSaved("✓ Reset");
  } catch { alert("Error resetting progress. Try again."); }
}

// ─── Load Progress from MySQL ──────────────────────────────────
async function loadProgress() {
  try {
    const res  = await apiFetch("/api/progress");
    const data = await res.json();
    prog       = data.progress   || {};
    timestamps = data.timestamps || {};
  } catch {
    prog = {}; timestamps = {};
  }
}

// ─── Save Progress (debounced batch) ──────────────────────────
function queueSave(key, value, ts) {
  pendingSaves[key] = { value, ts };
  clearTimeout(saveTimer);
  saveTimer = setTimeout(flushSaves, 600);
}

async function flushSaves() {
  const batch = { ...pendingSaves };
  if (!Object.keys(batch).length) return;
  Object.keys(batch).forEach(k => delete pendingSaves[k]);
  try {
    // Build updates object: { key: bool } and timestamps: { key: datetime }
    const updates    = {};
    const tsBatch    = {};
    for (const [k, { value, ts }] of Object.entries(batch)) {
      updates[k] = value;
      if (ts) tsBatch[k] = ts;
    }
    await apiFetch("/api/progress", {
      method: "POST",
      body: { updates, timestamps: tsBatch },
    });
    showSaved("✓ Saved");
  } catch {
    // silently fail — data is still in local state
  }
}

function showSaved(msg = "✓ Saved") {
  const el = document.getElementById("saveInd");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("visible");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("visible"), 2200);
}

// ─── Helpers ───────────────────────────────────────────────────
const allSkills    = PHASES.flatMap(p => p.skills);
const totalDays    = allSkills.reduce((a, s) => a + s.days.length, 0);
const totalTasters = allSkills.filter(s => s.taster).length;

function doneDays()    { return allSkills.reduce((a, s) => a + s.days.filter((_, i) => prog[`${s.id}_d${i}`]).length, 0); }
function doneTasters() { return allSkills.filter(s => s.taster && prog[`taster_${s.id}`]).length; }
function doneCombos()  { return COMBOS.filter(c => prog[`combo_${c.id}`]).length; }
function overallPct()  { return totalDays ? Math.round(doneDays() / totalDays * 100) : 0; }

function skillDone(sid) {
  const sk = allSkills.find(s => s.id === sid);
  return sk ? sk.days.every((_, i) => prog[`${sk.id}_d${i}`]) : false;
}
function comboUnlocked(c) { return c.unlockAfter.every(sid => skillDone(sid)); }
function phasePercent(ph) {
  const tot  = ph.skills.reduce((a, s) => a + s.days.length, 0);
  const done = ph.skills.reduce((a, s) => a + s.days.filter((_, i) => prog[`${s.id}_d${i}`]).length, 0);
  return tot ? Math.round(done / tot * 100) : 0;
}

// Format a stored UTC timestamp to local readable string
function fmtTs(ts) {
  if (!ts) return null;
  try {
    const d = new Date(ts);
    return d.toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: true,
    });
  } catch { return null; }
}

// Current datetime as ISO string
function nowISO() {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

function checkMark() {
  return `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
}

// ─── Nav ───────────────────────────────────────────────────────
let currentView   = "dash";
let activeSidebar = { phase: null, skill: null };

document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => switchView(btn.dataset.view));
});

function switchView(v) {
  currentView = v;
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.toggle("active", b.dataset.view === v));
  document.querySelectorAll(".view").forEach(el => el.classList.toggle("active", el.id === `view-${v}`));
  if (v === "dash")      renderDash();
  if (v === "schedule")  renderSchedule();
  if (v === "tasks")     { renderTasksSidebar(); renderTasksContent(); }
  if (v === "combos")    renderCombos();
  if (v === "checklist") renderChecklist();
}

function renderAll() {
  renderDash();
  renderSchedule();
  renderTasksSidebar();
  renderCombos();
  renderChecklist();
}

// ─── Progress Ring ──────────────────────────────────────────────
function drawRing(pct) {
  const canvas = document.getElementById("progressRing");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const size = 130, stroke = 7, r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  ctx.clearRect(0, 0, size, size);
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, r, 0, 2 * Math.PI);
  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  ctx.lineWidth = stroke;
  ctx.stroke();
  if (pct > 0) {
    const g = ctx.createLinearGradient(0, 0, size, 0);
    g.addColorStop(0, "#1648d6");
    g.addColorStop(1, "#00d4ff");
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, r, -Math.PI / 2, -Math.PI / 2 + (2 * Math.PI * pct / 100));
    ctx.strokeStyle = g;
    ctx.lineWidth = stroke;
    ctx.lineCap = "round";
    ctx.stroke();
  }
}

// ─── Dashboard ─────────────────────────────────────────────────
function renderDash() {
  const pct = overallPct(), dd = doneDays(), dt = doneTasters(), dc = doneCombos();
  document.getElementById("heroPct").textContent       = pct + "%";
  document.getElementById("heroPctText").textContent   = pct + "%";
  document.getElementById("heroBarFill").style.width   = pct + "%";
  document.getElementById("doneDaysCount").textContent = dd;
  document.getElementById("totalDaysCount").textContent= totalDays;
  document.getElementById("statDays").textContent      = dd;
  document.getElementById("statDaysOf").textContent    = "of " + totalDays;
  document.getElementById("statTasters").textContent   = dt;
  document.getElementById("statTastersOf").textContent = "of " + totalTasters;
  document.getElementById("statCombos").textContent    = dc;
  document.getElementById("statOverall").textContent   = pct + "%";
  drawRing(pct);

  // Phase grid
  const pg = document.getElementById("phaseGrid");
  pg.innerHTML = "";
  PHASES.forEach(ph => {
    const pp = phasePercent(ph);
    const card = document.createElement("div");
    card.className = "phase-card";
    card.style.setProperty("--pc", ph.color);
    card.innerHTML = `
      <div class="phase-card-emoji">${ph.emoji}</div>
      <div class="phase-card-num">${ph.num}</div>
      <div class="phase-card-title">${ph.title}</div>
      <div class="phase-mini-bar"><div class="phase-mini-fill" style="width:${pp}%;background:${ph.color}"></div></div>
      <div class="phase-mini-pct">${pp}%</div>`;
    card.addEventListener("click", () => {
      switchView("tasks");
      activeSidebar = { phase: ph.id, skill: null };
      renderTasksSidebar();
      renderTasksContent();
    });
    pg.appendChild(card);
  });

  // Next tasks
  const nt = document.getElementById("nextTasks");
  nt.innerHTML = "";
  const nexts = PHASES.flatMap(ph =>
    ph.skills.flatMap(sk =>
      sk.days.map((d, i) => ({ ph, sk, d, i })).filter(({ sk, i }) => !prog[`${sk.id}_d${i}`])
    )
  ).slice(0, 5);

  if (!nexts.length) {
    nt.innerHTML = `<div style="text-align:center;padding:16px;color:#4ade80;font-size:12px;font-weight:600">🎉 All tasks complete! You're Top 5%.</div>`;
  } else {
    nexts.forEach(({ ph, sk, d, i }) => {
      const row = document.createElement("div");
      row.className = "next-task-row";
      row.innerHTML = `
        <div class="next-dot" style="background:${ph.color}"></div>
        <div>
          <div><span class="next-task-skill" style="color:${ph.color}">${sk.name}</span>
          <span class="next-task-day"> · Day ${i + 1} · Week ${sk.week}</span></div>
          <div class="next-task-text">${d.substring(0, 90)}...</div>
        </div>`;
      row.addEventListener("click", () => {
        switchView("tasks");
        activeSidebar = { phase: ph.id, skill: sk.id };
        renderTasksSidebar();
        renderTasksContent();
      });
      nt.appendChild(row);
    });
  }
}

// ─── Schedule ──────────────────────────────────────────────────
const PC = { "PHASE 0": "#9333ea", "PHASE 1": "#0f766e", "PHASE 2": "#1648d6", "PHASE 3": "#166534", "PHASE 4": "#b45309" };

function renderSchedule() {
  const tbody = document.getElementById("scheduleTbody");
  tbody.innerHTML = "";
  SCHEDULE.forEach(r => {
    const pc = PC[r.phase] || "#6b7280";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><span class="sched-week" style="color:${pc}">${r.wk}</span></td>
      <td><span class="sched-skill">${r.skill}</span></td>
      <td><span class="phase-badge" style="background:${pc}22;color:${pc}">${r.phase}</span></td>
      <td class="sched-resource">${r.resource}</td>
      <td class="sched-action">${r.action}</td>`;
    tbody.appendChild(tr);
  });
}

// ─── Tasks Sidebar ──────────────────────────────────────────────
function renderTasksSidebar() {
  const sb = document.getElementById("tasksSidebar");
  sb.innerHTML = "";
  PHASES.forEach(ph => {
    const isActive = activeSidebar.phase === ph.id;
    const phDiv = document.createElement("div");
    phDiv.className = "sidebar-phase";

    const btn = document.createElement("button");
    btn.className = "sidebar-phase-btn" + (isActive ? " active" : "");
    btn.style.setProperty("--pc", ph.color);
    btn.innerHTML = `
      <span class="sb-emoji">${ph.emoji}</span>
      <div class="sb-info">
        <div class="sb-num" style="color:${ph.color}">${ph.num}</div>
        <div class="sb-title">${ph.title}</div>
      </div>
      <div class="sb-pct" style="color:${isActive ? ph.color : "#6b7280"}">${phasePercent(ph)}%</div>`;
    btn.addEventListener("click", () => {
      activeSidebar = activeSidebar.phase === ph.id ? { phase: null, skill: null } : { phase: ph.id, skill: null };
      renderTasksSidebar();
      renderTasksContent();
    });
    phDiv.appendChild(btn);

    if (isActive) {
      const skillsDiv = document.createElement("div");
      skillsDiv.className = "sidebar-skills";
      ph.skills.forEach(sk => {
        const done  = skillDone(sk.id);
        const skBtn = document.createElement("button");
        skBtn.className = "skill-nav-btn" + (activeSidebar.skill === sk.id ? " active" : "");
        skBtn.style.setProperty("--pc", ph.color);
        // Show completion % in sidebar
        const skDone = sk.days.filter((_, i) => prog[`${sk.id}_d${i}`]).length;
        const skPct  = Math.round(skDone / sk.days.length * 100);
        skBtn.innerHTML = `
          <span style="margin-right:4px">${done ? "✅" : "◦"}</span>
          <span style="flex:1">${sk.name}</span>
          <span style="font-size:9px;color:${done ? ph.color : "#4b5563"};font-family:var(--mono)">${skPct}%</span>`;
        skBtn.style.display = "flex";
        skBtn.style.alignItems = "center";
        skBtn.addEventListener("click", e => {
          e.stopPropagation();
          activeSidebar.skill = activeSidebar.skill === sk.id ? null : sk.id;
          renderTasksSidebar();
          renderTasksContent();
        });
        skillsDiv.appendChild(skBtn);
      });
      phDiv.appendChild(skillsDiv);
    }
    sb.appendChild(phDiv);
  });
}

// ─── Tasks Content ──────────────────────────────────────────────
function renderTasksContent() {
  const content = document.getElementById("tasksContent");

  if (!activeSidebar.phase) {
    content.innerHTML = `<div class="tasks-placeholder"><div class="placeholder-icon">◉</div><div class="placeholder-text">SELECT A PHASE FROM THE SIDEBAR</div></div>`;
    return;
  }

  const ph = PHASES.find(p => p.id === activeSidebar.phase);
  if (!ph) return;

  // Phase overview (no skill selected)
  if (!activeSidebar.skill) {
    let html = `
      <div class="skill-header" style="background:${ph.color}18;border:1px solid ${ph.color}40">
        <div>
          <div class="skill-week" style="color:${ph.color}">${ph.emoji} ${ph.num} — ${ph.sub}</div>
          <div class="skill-title">${ph.title}</div>
          <div style="font-size:11px;color:#6b7280;margin-top:4px">${ph.desc}</div>
        </div>
        <div style="text-align:right">
          <div class="skill-pct-big" style="color:${ph.color}">${phasePercent(ph)}%</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">`;
    ph.skills.forEach(sk => {
      let done = 0; sk.days.forEach((_, i) => { if (prog[`${sk.id}_d${i}`]) done++; });
      const pp = Math.round(done / sk.days.length * 100);
      html += `
        <div class="phase-card" style="--pc:${ph.color};cursor:pointer"
             onclick="activeSidebar.skill='${sk.id}';renderTasksSidebar();renderTasksContent()">
          <div class="phase-card-title" style="font-size:12px">${sk.name}</div>
          <div style="font-size:10px;color:#6b7280;margin-bottom:8px">Week ${sk.week} · ${sk.days.length} days</div>
          <div class="phase-mini-bar"><div class="phase-mini-fill" style="width:${pp}%;background:${ph.color}"></div></div>
          <div class="phase-mini-pct">${done}/${sk.days.length} · ${pp}%</div>
        </div>`;
    });
    content.innerHTML = html + "</div>";
    return;
  }

  // Individual skill view
  const sk = ph.skills.find(s => s.id === activeSidebar.skill);
  if (!sk) return;

  let doneCount = 0;
  sk.days.forEach((_, i) => { if (prog[`${sk.id}_d${i}`]) doneCount++; });
  const pp         = Math.round(doneCount / sk.days.length * 100);
  const tasterDone = !!prog[`taster_${sk.id}`];
  const tasterTs   = timestamps[`taster_${sk.id}`];

  let html = `
    <div class="skill-header" style="background:${ph.color}18;border:1px solid ${ph.color}40">
      <div>
        <div class="skill-week" style="color:${ph.color}">${ph.emoji} WEEK ${sk.week}</div>
        <div class="skill-title">${sk.name}</div>
        <div style="font-size:11px;color:#6b7280;margin-top:5px"><b>WHY:</b> ${sk.why}</div>
        <div style="font-size:10px;color:${ph.color};margin-top:4px;font-weight:600">${sk.impact}</div>
        <div style="font-size:10px;color:#6b7280;margin-top:4px">🌐 ${sk.where}</div>
      </div>
      <div style="text-align:right">
        <div class="skill-pct-big" style="color:${ph.color}">${pp}%</div>
        <div class="skill-pct-days">${doneCount}/${sk.days.length} days done</div>
      </div>
    </div>
    <div class="task-list-label">DAILY TASKS — click to mark complete</div>`;

  sk.days.forEach((task, i) => {
    const key    = `${sk.id}_d${i}`;
    const isDone = !!prog[key];
    const ts     = fmtTs(timestamps[key]);

    html += `
      <div class="task-row${isDone ? " done" : ""}"
           style="--task-bg:${ph.color}12;--task-border:${ph.color}40;--pc:${ph.color}"
           onclick="toggleTask('${key}')">
        <div class="task-checkbox">${isDone ? checkMark() : ""}</div>
        <div style="flex:1">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:3px">
            <span class="task-day" style="color:${isDone ? ph.color : "#6b7280"}">DAY ${i + 1}</span>
            ${isDone && ts ? `<span style="font-size:9px;color:#4b5563;font-family:var(--mono);background:rgba(255,255,255,.04);padding:1px 7px;border-radius:4px">✅ ${ts}</span>` : ""}
          </div>
          <div class="task-text">${task}</div>
        </div>
      </div>`;
  });

  // Skill taster
  if (sk.taster) {
    const tagColors = sk.taster.skills.map(t =>
      `<span class="skill-tag" style="background:${ph.color}22;color:${ph.color}">${t}</span>`
    ).join("");

    html += `
      <div class="taster-wrap">
        <div class="taster-label">🧪 SKILL TASTER PROJECT</div>
        <div class="taster-card" style="border-color:${ph.color}">
          <div class="taster-header">
            <div>
              <div class="taster-name" style="color:${ph.color}">${sk.taster.name}</div>
              ${tasterDone && tasterTs ? `<div style="font-size:10px;color:#4b5563;font-family:var(--mono);margin-top:4px">✅ Completed ${fmtTs(tasterTs)}</div>` : ""}
            </div>
            <button class="taster-done-btn"
              style="background:${tasterDone ? ph.color : ph.color + "22"};color:${tasterDone ? "#fff" : ph.color};border-color:${ph.color}"
              onclick="toggleTaster('${sk.id}')">
              ${tasterDone ? "✅ Done" : "Mark Complete"}
            </button>
          </div>
          <div class="taster-desc">${sk.taster.desc}</div>
          <div class="taster-skills">${tagColors}</div>
        </div>
      </div>`;
  }

  content.innerHTML = html;
}

// ─── Toggle Task ────────────────────────────────────────────────
function toggleTask(key) {
  const newVal = !prog[key];
  prog[key] = newVal;
  const ts = newVal ? nowISO() : null;  // record datetime when marking DONE; clear on unmark
  if (newVal) {
    timestamps[key] = ts;
  } else {
    delete timestamps[key];
  }
  queueSave(key, newVal, ts);
  renderTasksContent();
  renderTasksSidebar();
  if (currentView === "dash") renderDash();
}

// ─── Toggle Taster ──────────────────────────────────────────────
function toggleTaster(sid) {
  const key    = `taster_${sid}`;
  const newVal = !prog[key];
  prog[key] = newVal;
  const ts = newVal ? nowISO() : null;
  if (newVal) { timestamps[key] = ts; } else { delete timestamps[key]; }
  queueSave(key, newVal, ts);
  renderTasksContent();
}

// ─── Combos ─────────────────────────────────────────────────────
function renderCombos() {
  const list = document.getElementById("combosList");
  list.innerHTML = "";
  COMBOS.forEach(combo => {
    const unlocked  = comboUnlocked(combo);
    const completed = !!prog[`combo_${combo.id}`];
    const comboTs   = fmtTs(timestamps[`combo_${combo.id}`]);

    const prereqsHtml = combo.unlockAfter.map(sid => {
      const sk   = allSkills.find(s => s.id === sid);
      const done = skillDone(sid);
      return `<span class="prereq-badge ${done ? "prereq-done" : "prereq-pending"}">${done ? "✅ " : "○ "}${sk ? sk.name : sid}</span>`;
    }).join("");

    let statusHtml = "";
    if (!unlocked)           statusHtml = `<span class="combo-status" style="background:rgba(255,255,255,.05);color:#6b7280">🔒 Complete prerequisites</span>`;
    if (unlocked && !completed) statusHtml = `<span class="combo-status" style="background:${combo.color}22;color:${combo.color};font-weight:700">🟢 READY TO BUILD</span>`;
    if (completed)           statusHtml = `<span class="combo-status" style="background:rgba(22,101,52,.3);color:#4ade80;font-weight:700">✅ COMPLETED</span>`;

    const markBtn = unlocked ? `
      <button class="combo-mark-btn"
        style="background:${completed ? "rgba(22,101,52,.4)" : combo.color}"
        onclick="toggleCombo('${combo.id}')">
        ${completed ? "✅ Done" : "Mark Complete"}
      </button>` : "";

    const card = document.createElement("div");
    card.className = `combo-card${unlocked ? "" : " locked"}`;
    card.style.setProperty("--cc", combo.color);
    card.style.borderColor = unlocked ? `${combo.color}50` : "rgba(255,255,255,0.07)";
    card.innerHTML = `
      <div class="combo-top">
        <div>
          <div class="combo-badges">
            <span class="combo-level-badge" style="background:${combo.color}22;color:${combo.color}">${combo.level}</span>
            ${statusHtml}
          </div>
          <div class="combo-title">${combo.title}</div>
          ${completed && comboTs ? `<div style="font-size:10px;color:#4b5563;font-family:var(--mono);margin-top:5px">✅ Completed ${comboTs}</div>` : ""}
        </div>
        ${markBtn}
      </div>
      <div class="combo-desc">${combo.desc}</div>
      <div class="combo-deliverable">
        <div class="combo-deliverable-label">📦 DELIVERABLE</div>
        <div class="combo-deliverable-text">${combo.deliverable}</div>
      </div>
      <div style="margin-top:8px">
        <div style="font-size:9px;color:#6b7280;font-weight:700;letter-spacing:1px;margin-bottom:4px">SKILLS USED</div>
        <div style="font-size:11px;color:#9ca3af;margin-bottom:10px">${combo.skills}</div>
      </div>
      <div>
        <div class="combo-unlock-label">UNLOCK AFTER:</div>
        <div class="combo-prereqs">${prereqsHtml}</div>
      </div>`;
    list.appendChild(card);
  });
}

function toggleCombo(cid) {
  const key    = `combo_${cid}`;
  const newVal = !prog[key];
  prog[key] = newVal;
  const ts = newVal ? nowISO() : null;
  if (newVal) { timestamps[key] = ts; } else { delete timestamps[key]; }
  queueSave(key, newVal, ts);
  renderCombos();
}

// ─── Checklist ──────────────────────────────────────────────────
function renderChecklist() {
  const wrap = document.getElementById("checklistWrap");
  wrap.innerHTML = "";

  CHECKLIST.forEach(section => {
    const phDiv     = document.createElement("div");
    const doneItems = section.items.filter((_, i) => prog[`cl_${section.phase}_${i}`]).length;

    const hdr = document.createElement("div");
    hdr.className = "check-phase-header";
    hdr.style.cssText = `background:${section.color}22;border:1px solid ${section.color}50`;
    hdr.innerHTML = `
      <span class="check-phase-title" style="color:${section.color}">${section.phase}</span>
      <span class="check-phase-pct" style="color:${section.color}">${doneItems}/${section.items.length}</span>`;
    phDiv.appendChild(hdr);

    section.items.forEach((item, i) => {
      const key  = `cl_${section.phase}_${i}`;
      const done = !!prog[key];
      const ts   = fmtTs(timestamps[key]);

      const row = document.createElement("div");
      row.className = `check-item${done ? " done" : ""}`;
      row.style.cssText = `--ci-bg:${section.color}0e;--ci-border:${section.color}30;--ci-bg2:${section.color}20;--pc2:${section.color}`;
      row.innerHTML = `
        <div class="check-box">${done ? checkMark() : ""}</div>
        <div style="flex:1">
          <div class="check-text">${item}</div>
          ${done && ts ? `<div style="font-size:9px;color:#4b5563;font-family:var(--mono);margin-top:3px">✅ ${ts}</div>` : ""}
        </div>
        ${done ? `<div class="check-done-badge">✅ DONE</div>` : ""}`;
      row.addEventListener("click", () => {
        const newVal = !prog[key];
        prog[key] = newVal;
        const ts2 = newVal ? nowISO() : null;
        if (newVal) { timestamps[key] = ts2; } else { delete timestamps[key]; }
        queueSave(key, newVal, ts2);
        renderChecklist();
      });
      phDiv.appendChild(row);
    });
    wrap.appendChild(phDiv);
  });

  // Combos in checklist
  const comboSec = document.createElement("div");
  comboSec.className = "check-combo-section";
  comboSec.innerHTML = `<div class="check-combo-title">⬡ COMBO PROJECTS</div>`;
  COMBOS.forEach(c => {
    const done     = !!prog[`combo_${c.id}`];
    const unlocked = comboUnlocked(c);
    const ts       = fmtTs(timestamps[`combo_${c.id}`]);
    const row      = document.createElement("div");
    row.style.cssText = "display:flex;align-items:center;gap:8px;margin-bottom:8px";
    row.innerHTML = `
      <div style="width:16px;height:16px;border-radius:4px;background:${done ? c.color : "rgba(255,255,255,.06)"};display:flex;align-items:center;justify-content:center;font-size:10px;color:#fff">${done ? "✓" : ""}</div>
      <div>
        <div style="font-size:11px;color:${done ? "#f8fafc" : "#6b7280"}">${c.title}${!unlocked ? " 🔒" : ""}</div>
        ${done && ts ? `<div style="font-size:9px;color:#4b5563;font-family:var(--mono)">✅ ${ts}</div>` : ""}
      </div>`;
    comboSec.appendChild(row);
  });
  wrap.appendChild(comboSec);
}

// ─── Boot ───────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", initAuth);