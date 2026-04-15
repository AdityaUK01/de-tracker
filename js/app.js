// ── Storage ───────────────────────────────────────────────────────────────────
const STORE_KEY = "de_tracker_v3";
function loadProg() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || "{}"); }
  catch { return {}; }
}
function saveProg(p) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(p)); } catch {}
}

let prog = loadProg();

// ── Helpers ────────────────────────────────────────────────────────────────
const allSkills   = PHASES.flatMap(p => p.skills);
const totalDays   = allSkills.reduce((a,s) => a + s.days.length, 0);
const totalTasters= allSkills.filter(s => s.taster).length;

function doneDays()    { return allSkills.reduce((a,s) => a + s.days.filter((_,i) => prog[`${s.id}_d${i}`]).length, 0); }
function doneTasters() { return allSkills.filter(s => s.taster && prog[`taster_${s.id}`]).length; }
function doneCombos()  { return COMBOS.filter(c => prog[`combo_${c.id}`]).length; }
function overallPct()  { return totalDays ? Math.round(doneDays() / totalDays * 100) : 0; }

function skillDone(sid) {
  const sk = allSkills.find(s => s.id === sid);
  return sk ? sk.days.every((_,i) => prog[`${sk.id}_d${i}`]) : false;
}
function comboUnlocked(combo) { return combo.unlockAfter.every(sid => skillDone(sid)); }

function phasePercent(phase) {
  const total = phase.skills.reduce((a,s) => a + s.days.length, 0);
  const done  = phase.skills.reduce((a,s) => a + s.days.filter((_,i) => prog[`${s.id}_d${i}`]).length, 0);
  return total ? Math.round(done / total * 100) : 0;
}

function checkMark() {
  return `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
}

// ── Phase colour helpers ──────────────────────────────────────────────────────
function hexToRGB(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}

// ── Progress ring ─────────────────────────────────────────────────────────────
function drawRing(pct) {
  const canvas = document.getElementById("progressRing");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const size = 130, stroke = 7, r = (size - stroke) / 2;
  const circ  = 2 * Math.PI * r;
  ctx.clearRect(0, 0, size, size);
  // track
  ctx.beginPath();
  ctx.arc(size/2, size/2, r, 0, 2*Math.PI);
  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  ctx.lineWidth = stroke;
  ctx.stroke();
  // fill
  if (pct > 0) {
    const grad = ctx.createLinearGradient(0,0,size,0);
    grad.addColorStop(0, "#1648d6");
    grad.addColorStop(1, "#00d4ff");
    ctx.beginPath();
    ctx.arc(size/2, size/2, r, -Math.PI/2, -Math.PI/2 + (2*Math.PI*pct/100));
    ctx.strokeStyle = grad;
    ctx.lineWidth = stroke;
    ctx.lineCap = "round";
    ctx.stroke();
  }
}

// ── Nav ───────────────────────────────────────────────────────────────────────
let currentView = "dash";
let activeSidebar = { phase: null, skill: null };

document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const v = btn.dataset.view;
    switchView(v);
  });
});

function switchView(v) {
  currentView = v;
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.toggle("active", b.dataset.view === v));
  document.querySelectorAll(".view").forEach(el => el.classList.toggle("active", el.id === `view-${v}`));
  if (v === "dash")      renderDash();
  if (v === "schedule")  renderSchedule();
  if (v === "tasks")     renderTasksSidebar();
  if (v === "combos")    renderCombos();
  if (v === "checklist") renderChecklist();
}

// ── Dashboard ──────────────────────────────────────────────────────────────────
function renderDash() {
  const pct = overallPct();
  const dd  = doneDays();
  const dt  = doneTasters();
  const dc  = doneCombos();

  document.getElementById("heroPct").textContent      = pct + "%";
  document.getElementById("heroPctText").textContent  = pct + "%";
  document.getElementById("heroBarFill").style.width  = pct + "%";
  document.getElementById("doneDaysCount").textContent= dd;
  document.getElementById("totalDaysCount").textContent= totalDays;
  document.getElementById("statDays").textContent     = dd;
  document.getElementById("statDaysOf").textContent   = "of " + totalDays;
  document.getElementById("statTasters").textContent  = dt;
  document.getElementById("statTastersOf").textContent= "of " + totalTasters;
  document.getElementById("statCombos").textContent   = dc;
  document.getElementById("statOverall").textContent  = pct + "%";
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
      <div class="phase-mini-pct">${pp}%</div>
    `;
    card.addEventListener("click", () => { switchView("tasks"); activeSidebar = {phase: ph.id, skill: null}; renderTasksSidebar(); });
    pg.appendChild(card);
  });

  // Next tasks
  const nt = document.getElementById("nextTasks");
  nt.innerHTML = "";
  const nexts = PHASES.flatMap(ph =>
    ph.skills.flatMap(sk =>
      sk.days.map((d,i) => ({ph,sk,d,i})).filter(({sk,i}) => !prog[`${sk.id}_d${i}`])
    )
  ).slice(0, 5);
  nexts.forEach(({ph,sk,d,i}) => {
    const row = document.createElement("div");
    row.className = "next-task-row";
    row.innerHTML = `
      <div class="next-dot" style="background:${ph.color}"></div>
      <div>
        <div><span class="next-task-skill" style="color:${ph.color}">${sk.name}</span> <span class="next-task-day">· Day ${i+1}</span></div>
        <div class="next-task-text">${d.substring(0, 95)}...</div>
      </div>
    `;
    row.addEventListener("click", () => { switchView("tasks"); activeSidebar = {phase:ph.id, skill:sk.id}; renderTasksSidebar(); renderTasksContent(); });
    nt.appendChild(row);
  });
}

// ── Schedule ──────────────────────────────────────────────────────────────────
const PHASE_COLORS = {"PHASE 0":"#9333ea","PHASE 1":"#0f766e","PHASE 2":"#1648d6","PHASE 3":"#166534","PHASE 4":"#b45309"};
function renderSchedule() {
  const tbody = document.getElementById("scheduleTbody");
  tbody.innerHTML = "";
  SCHEDULE.forEach((row, i) => {
    const pc = PHASE_COLORS[row.phase] || "#6b7280";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><span class="sched-week" style="color:${pc}">${row.wk}</span></td>
      <td><span class="sched-skill">${row.skill}</span></td>
      <td><span class="phase-badge" style="background:${pc}22;color:${pc}">${row.phase}</span></td>
      <td class="sched-resource">${row.resource}</td>
      <td class="sched-action">${row.action}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ── Daily Tasks Sidebar ───────────────────────────────────────────────────────
function renderTasksSidebar() {
  const sb = document.getElementById("tasksSidebar");
  sb.innerHTML = "";
  PHASES.forEach(ph => {
    const phDiv = document.createElement("div");
    phDiv.className = "sidebar-phase";
    const isActive = activeSidebar.phase === ph.id;
    const btn = document.createElement("button");
    btn.className = "sidebar-phase-btn" + (isActive ? " active" : "");
    btn.style.setProperty("--pc", ph.color);
    btn.innerHTML = `
      <span class="sb-emoji">${ph.emoji}</span>
      <div class="sb-info">
        <div class="sb-num" style="color:${ph.color}">${ph.num}</div>
        <div class="sb-title">${ph.title}</div>
      </div>
      <div class="sb-pct" style="color:${isActive?ph.color:'#6b7280'}">${phasePercent(ph)}%</div>
    `;
    btn.addEventListener("click", () => {
      activeSidebar = activeSidebar.phase === ph.id ? {phase:null,skill:null} : {phase:ph.id, skill:null};
      renderTasksSidebar();
      renderTasksContent();
    });
    phDiv.appendChild(btn);

    if (isActive) {
      const skillsDiv = document.createElement("div");
      skillsDiv.className = "sidebar-skills";
      ph.skills.forEach(sk => {
        const skBtn = document.createElement("button");
        skBtn.className = "skill-nav-btn" + (activeSidebar.skill === sk.id ? " active" : "");
        skBtn.style.setProperty("--pc", ph.color);
        const done = skillDone(sk.id);
        skBtn.textContent = (done ? "✅ " : "◦ ") + sk.name;
        skBtn.addEventListener("click", (e) => {
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

// ── Daily Tasks Content ───────────────────────────────────────────────────────
function renderTasksContent() {
  const content = document.getElementById("tasksContent");

  if (!activeSidebar.phase) {
    content.innerHTML = `<div class="tasks-placeholder"><div class="placeholder-icon">◉</div><div class="placeholder-text">SELECT A PHASE FROM THE SIDEBAR</div></div>`;
    return;
  }

  const ph = PHASES.find(p => p.id === activeSidebar.phase);

  if (!activeSidebar.skill) {
    // Phase overview grid
    let html = `
      <div class="skill-header" style="background:${ph.color}18;border:1px solid ${ph.color}40;">
        <div class="skill-header-left">
          <div class="skill-week" style="color:${ph.color}">${ph.emoji} ${ph.num} — ${ph.sub}</div>
          <div class="skill-title">${ph.title}</div>
          <div style="font-size:11px;color:#6b7280;margin-top:4px">${ph.desc}</div>
        </div>
        <div style="text-align:right">
          <div class="skill-pct-big" style="color:${ph.color}">${phasePercent(ph)}%</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
    `;
    ph.skills.forEach(sk => {
      let done = 0; sk.days.forEach((_,i) => { if(prog[`${sk.id}_d${i}`]) done++; });
      const pp = Math.round(done/sk.days.length*100);
      html += `
        <div class="phase-card" style="--pc:${ph.color};cursor:pointer" onclick="activeSidebar.skill='${sk.id}';renderTasksSidebar();renderTasksContent()">
          <div class="phase-card-title" style="font-size:12px">${sk.name}</div>
          <div style="font-size:10px;color:#6b7280;margin-bottom:8px">Week ${sk.week} · ${sk.days.length} days</div>
          <div class="phase-mini-bar"><div class="phase-mini-fill" style="width:${pp}%;background:${ph.color}"></div></div>
          <div class="phase-mini-pct">${done}/${sk.days.length} · ${pp}%</div>
        </div>
      `;
    });
    html += `</div>`;
    content.innerHTML = html;
    return;
  }

  const sk = ph.skills.find(s => s.id === activeSidebar.skill);
  if (!sk) return;

  let doneCount = 0;
  sk.days.forEach((_,i) => { if(prog[`${sk.id}_d${i}`]) doneCount++; });
  const pp = Math.round(doneCount / sk.days.length * 100);
  const tasterDone = !!prog[`taster_${sk.id}`];

  let html = `
    <div class="skill-header" style="background:${ph.color}18;border:1px solid ${ph.color}40">
      <div class="skill-header-left">
        <div class="skill-week" style="color:${ph.color}">${ph.emoji} WEEK ${sk.week}</div>
        <div class="skill-title">${sk.name}</div>
        <div style="font-size:11px;color:#6b7280;margin-top:4px"><b>WHY:</b> ${sk.why}</div>
        <div style="font-size:10px;color:${ph.color};margin-top:4px;font-weight:600">${sk.impact}</div>
        <div style="font-size:10px;color:#6b7280;margin-top:4px">🌐 ${sk.where}</div>
      </div>
      <div style="text-align:right">
        <div class="skill-pct-big" style="color:${ph.color}">${pp}%</div>
        <div class="skill-pct-days">${doneCount}/${sk.days.length} days</div>
      </div>
    </div>

    <div class="task-list-label">DAILY TASKS</div>
  `;

  sk.days.forEach((task, i) => {
    const key   = `${sk.id}_d${i}`;
    const isDone = !!prog[key];
    html += `
      <div class="task-row${isDone ? " done" : ""}" 
           style="--task-bg:${ph.color}12;--task-border:${ph.color}40;--pc:${ph.color}"
           onclick="toggleTask('${key}')">
        <div class="task-checkbox">${isDone ? checkMark() : ""}</div>
        <div>
          <div class="task-day" style="color:${isDone ? ph.color : "#6b7280"}">DAY ${i+1}</div>
          <div class="task-text">${task}</div>
        </div>
      </div>
    `;
  });

  if (sk.taster) {
    const tagColors = sk.taster.skills.map(t =>
      `<span class="skill-tag" style="background:${ph.color}22;color:${ph.color}">${t}</span>`
    ).join("");

    html += `
      <div class="taster-wrap">
        <div class="taster-label">🧪 SKILL TASTER PROJECT</div>
        <div class="taster-card" style="--pc:${ph.color}">
          <div class="taster-header">
            <div class="taster-name" style="color:${ph.color}">${sk.taster.name}</div>
            <button class="taster-done-btn" 
              style="background:${tasterDone ? ph.color : ph.color+"22"};color:${tasterDone ? "#fff" : ph.color};border-color:${ph.color}"
              onclick="toggleTaster('${sk.id}')">
              ${tasterDone ? "✅ Done" : "Mark Complete"}
            </button>
          </div>
          <div class="taster-desc">${sk.taster.desc}</div>
          <div class="taster-skills">${tagColors}</div>
        </div>
      </div>
    `;
  }

  content.innerHTML = html;
}

function toggleTask(key) {
  prog[key] = !prog[key];
  saveProg(prog);
  renderTasksContent();
  renderTasksSidebar();
}

function toggleTaster(sid) {
  prog[`taster_${sid}`] = !prog[`taster_${sid}`];
  saveProg(prog);
  renderTasksContent();
}

// ── Combos ─────────────────────────────────────────────────────────────────────
function renderCombos() {
  const list = document.getElementById("combosList");
  list.innerHTML = "";
  COMBOS.forEach(combo => {
    const unlocked  = comboUnlocked(combo);
    const completed = !!prog[`combo_${combo.id}`];
    const card = document.createElement("div");
    card.className = `combo-card ${unlocked ? "" : "locked"}`;
    card.style.setProperty("--cc", combo.color);
    card.style.borderColor = unlocked ? `${combo.color}50` : "rgba(255,255,255,0.07)";

    const prereqsHtml = combo.unlockAfter.map(sid => {
      const sk = allSkills.find(s => s.id === sid);
      const done = skillDone(sid);
      return `<span class="prereq-badge ${done ? "prereq-done" : "prereq-pending"}">${done ? "✅ " : "○ "}${sk ? sk.name : sid}</span>`;
    }).join("");

    let statusHtml = "";
    if (!unlocked)  statusHtml = `<span class="combo-status" style="background:rgba(255,255,255,.05);color:#6b7280">🔒 Complete prerequisites</span>`;
    if (unlocked && !completed) statusHtml = `<span class="combo-status" style="background:${combo.color}22;color:${combo.color};font-weight:700">🟢 READY TO BUILD</span>`;
    if (completed)  statusHtml = `<span class="combo-status" style="background:rgba(22,101,52,.3);color:#4ade80;font-weight:700">✅ COMPLETED</span>`;

    let markBtnHtml = "";
    if (unlocked) {
      markBtnHtml = `<button class="combo-mark-btn" 
        style="background:${completed ? "rgba(22,101,52,.4)" : combo.color}"
        onclick="toggleCombo('${combo.id}')">
        ${completed ? "✅ Done" : "Mark Complete"}
      </button>`;
    }

    card.innerHTML = `
      <div class="combo-top">
        <div>
          <div class="combo-badges">
            <span class="combo-level-badge" style="background:${combo.color}22;color:${combo.color}">${combo.level}</span>
            ${statusHtml}
          </div>
          <div class="combo-title">${combo.title}</div>
        </div>
        ${markBtnHtml}
      </div>
      <div class="combo-desc">${combo.desc}</div>
      <div class="combo-deliverable">
        <div class="combo-deliverable-label">📦 DELIVERABLE</div>
        <div class="combo-deliverable-text">${combo.deliverable}</div>
      </div>
      <div style="margin-top:8px">
        <div style="font-size:10px;color:#6b7280;font-weight:700;letter-spacing:1px;margin-bottom:4px">SKILLS USED</div>
        <div style="font-size:11px;color:#9ca3af;margin-bottom:10px">${combo.skills}</div>
      </div>
      <div>
        <div class="combo-unlock-label">UNLOCK AFTER:</div>
        <div class="combo-prereqs">${prereqsHtml}</div>
      </div>
    `;
    list.appendChild(card);
  });
}

function toggleCombo(cid) {
  prog[`combo_${cid}`] = !prog[`combo_${cid}`];
  saveProg(prog);
  renderCombos();
}

// ── Checklist ──────────────────────────────────────────────────────────────────
function renderChecklist() {
  const wrap = document.getElementById("checklistWrap");
  wrap.innerHTML = "";

  CHECKLIST.forEach(section => {
    const phDiv = document.createElement("div");
    const doneItems = section.items.filter((_,i) => prog[`cl_${section.phase}_${i}`]).length;
    const ph = PHASES.find(p => p.color === section.color);
    const hdr = document.createElement("div");
    hdr.className = "check-phase-header";
    hdr.style.cssText = `background:${section.color}22;border:1px solid ${section.color}50`;
    hdr.innerHTML = `
      <span class="check-phase-title" style="color:${section.color}">${section.phase}</span>
      <span class="check-phase-pct" style="color:${section.color}">${doneItems}/${section.items.length}</span>
    `;
    phDiv.appendChild(hdr);

    section.items.forEach((item, i) => {
      const key  = `cl_${section.phase}_${i}`;
      const done = !!prog[key];
      const row = document.createElement("div");
      row.className = `check-item${done ? " done" : ""}`;
      row.style.cssText = `--ci-bg:${section.color}0e;--ci-border:${section.color}30;--ci-bg2:${section.color}20;--pc2:${section.color}`;
      row.innerHTML = `
        <div class="check-box">${done ? checkMark() : ""}</div>
        <div class="check-text">${item}</div>
        ${done ? `<div class="check-done-badge">✅ DONE</div>` : ""}
      `;
      row.addEventListener("click", () => {
        prog[key] = !prog[key];
        saveProg(prog);
        renderChecklist();
      });
      phDiv.appendChild(row);
    });
    wrap.appendChild(phDiv);
  });

  // Combo checklist
  const comboSec = document.createElement("div");
  comboSec.className = "check-combo-section";
  comboSec.innerHTML = `<div class="check-combo-title">⬡ COMBO PROJECTS</div>`;
  COMBOS.forEach(c => {
    const done = !!prog[`combo_${c.id}`];
    const unlocked = comboUnlocked(c);
    const row = document.createElement("div");
    row.style.cssText = "display:flex;align-items:center;gap:8px;margin-bottom:7px";
    row.innerHTML = `
      <div style="width:16px;height:16px;border-radius:4px;background:${done?c.color:"rgba(255,255,255,.06)"};display:flex;align-items:center;justify-content:center;font-size:10px;color:#fff">${done?"✓":""}</div>
      <span style="font-size:11px;color:${done?"#f8fafc":"#6b7280"}">${c.title}</span>
      ${!unlocked ? `<span style="font-size:9px;color:#374151">🔒</span>` : ""}
    `;
    comboSec.appendChild(row);
  });
  wrap.appendChild(comboSec);
}

// ── Download PDF ───────────────────────────────────────────────────────────────
document.getElementById("downloadBtn").addEventListener("click", () => {
  // Build a printable version
  const win = window.open("", "_blank");
  let html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
  <title>DE Study Guide — Aditya Rawat 2026</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;color:#0f172a;padding:20px;font-size:11px}
    h1{font-size:22px;margin-bottom:4px;color:#1648d6}
    .sub{color:#6b7280;margin-bottom:16px;font-size:12px}
    .phase-title{font-size:14px;font-weight:700;padding:8px 12px;border-radius:6px;color:#fff;margin:16px 0 8px}
    .skill-title{font-size:12px;font-weight:700;margin:10px 0 4px;color:#1e293b;border-bottom:1px solid #e2e8f0;padding-bottom:4px}
    .skill-meta{font-size:10px;color:#6b7280;margin-bottom:6px}
    .day-row{display:flex;gap:6px;padding:4px 0;border-bottom:1px solid #f1f5f9}
    .day-num{min-width:36px;font-weight:700;color:#1648d6;font-size:10px}
    .taster-box{background:#f8fafc;border-left:3px solid #1648d6;padding:8px 10px;margin:8px 0;border-radius:4px}
    .taster-name{font-weight:700;color:#1648d6;margin-bottom:3px}
    .combo-box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:8px 10px;margin:6px 0}
    .combo-title{font-weight:700;margin-bottom:3px}
    .sched-table{width:100%;border-collapse:collapse;margin:10px 0}
    .sched-table th{background:#1648d6;color:#fff;padding:6px 8px;text-align:left;font-size:10px}
    .sched-table td{padding:5px 8px;border-bottom:1px solid #f1f5f9;font-size:10px;vertical-align:top}
    .sched-table tr:nth-child(even) td{background:#f8fafc}
    .footer{margin-top:20px;padding-top:10px;border-top:2px solid #1648d6;display:flex;justify-content:space-between;font-size:10px;color:#6b7280}
    @media print{body{padding:10px} h1{font-size:18px}}
  </style></head><body>`;

  html += `<h1>Basic → Top 5% AWS Data Engineer</h1>
  <div class="sub">Complete Daily Task Tracker · 23 Skills · 22 Weeks · 5 Phases · Built for Aditya Rawat · 2026<br/>
  MySQL as Practice DB | LinkedIn: linkedin.com/in/aditya-rawat-b6635521a | GitHub: github.com/AdityaUK01 | Email: adityarawat9917@gmail.com</div>

  <h2 style="font-size:14px;margin:12px 0 6px;color:#0f172a">22-Week Master Schedule</h2>
  <table class="sched-table"><thead><tr><th>WK</th><th>SKILL</th><th>PHASE</th><th>RESOURCE</th><th>ACTION</th></tr></thead><tbody>`;

  SCHEDULE.forEach(r => {
    html += `<tr><td><b>${r.wk}</b></td><td>${r.skill}</td><td>${r.phase}</td><td>${r.resource}</td><td>${r.action}</td></tr>`;
  });
  html += `</tbody></table>
  <p style="background:#fef3c7;border-left:3px solid #b45309;padding:6px 10px;margin:8px 0;font-size:11px;border-radius:4px">
  ⚡ Start applying at Week 12 — not Week 22. Interview cycles take 3–5 weeks. By final rounds you will have completed everything.</p>`;

  PHASES.forEach(ph => {
    html += `<div class="phase-title" style="background:${ph.color}">${ph.emoji} PHASE ${ph.num}: ${ph.title} — ${ph.sub}</div>`;
    html += `<p style="font-size:10px;color:#6b7280;margin-bottom:8px">${ph.desc}</p>`;
    ph.skills.forEach(sk => {
      html += `<div class="skill-title">${sk.name} <span style="font-weight:400;color:#6b7280">· Week ${sk.week} · ${sk.days.length} days</span></div>`;
      html += `<div class="skill-meta"><b>WHY:</b> ${sk.why} | <b>IMPACT:</b> ${sk.impact}</div>`;
      html += `<div class="skill-meta"><b>WHERE:</b> ${sk.where}</div>`;
      sk.days.forEach((d, i) => {
        html += `<div class="day-row"><span class="day-num">Day ${i+1}</span><span>${d}</span></div>`;
      });
      if (sk.taster) {
        html += `<div class="taster-box"><div class="taster-name">🧪 ${sk.taster.name}</div><div>${sk.taster.desc}</div><div style="margin-top:4px;color:#6b7280">Skills: ${sk.taster.skills.join(" · ")}</div></div>`;
      }
    });
  });

  html += `<h2 style="font-size:14px;margin:16px 0 8px">⬡ Multi-Skill Combo Projects</h2>`;
  COMBOS.forEach(c => {
    html += `<div class="combo-box">
      <div class="combo-title" style="color:${c.color}">${c.title} <span style="font-weight:400;color:#6b7280;font-size:10px">[${c.level}]</span></div>
      <div style="margin-bottom:4px">${c.desc}</div>
      <div><b>Skills:</b> ${c.skills}</div>
      <div><b>Unlock after:</b> ${c.unlockAfter.join(", ")}</div>
      <div><b>Deliverable:</b> ${c.deliverable}</div>
    </div>`;
  });

  html += `<h2 style="font-size:14px;margin:16px 0 8px">✓ Job-Readiness Checklist</h2>`;
  CHECKLIST.forEach(s => {
    html += `<div style="margin-bottom:10px"><div style="font-weight:700;color:${s.color};margin-bottom:5px">${s.phase}</div>`;
    s.items.forEach(item => { html += `<div style="padding:3px 0 3px 16px;border-bottom:1px solid #f1f5f9">☐ ${item}</div>`; });
    html += `</div>`;
  });

  html += `<div class="footer">
    <span>Aditya Rawat · adityarawat9917@gmail.com · linkedin.com/in/aditya-rawat-b6635521a · github.com/AdityaUK01</span>
    <span>DE TRACKER · 2026 · 23 Skills · 22 Weeks · Top 5% AWS Data Engineer</span>
  </div></body></html>`;

  win.document.write(html);
  win.document.close();
  win.onload = () => win.print();
});

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  renderDash();
  renderSchedule();
  renderTasksSidebar();
  renderTasksContent();
  renderCombos();
  renderChecklist();
});
