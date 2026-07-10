
let state = null;
let currentPage = "Dashboard";

async function loadProjectData() {
  const res = await fetch("data/project-data.json", { cache: "no-store" });
  state = await res.json();
}

function statusClass(status) {
  const s = String(status || "").toLowerCase();
  if (s.includes("complete") || s.includes("track")) return "success";
  if (s.includes("progress") || s.includes("monitor")) return "warning";
  if (s.includes("risk") || s.includes("open") || s.includes("critical")) return "danger";
  return "neutral";
}

function progressBar(value) {
  const v = Number(value) || 0;
  return `<div class="progress"><div style="width:${v}%"></div></div>`;
}

function kpi(label, value, note) {
  return `
    <div class="kpi-card">
      <span>${label}</span>
      <strong>${value}</strong>
      <small>${note || ""}</small>
    </div>
  `;
}

function renderDashboard() {
  const total = state.tasks.length;
  const completed = state.tasks.filter(t => t.status === "Completed").length;
  const open = total - completed;
  const risks = state.risks.filter(r => r.status !== "Closed").length;

  return `
    <div class="kpi-grid">
      ${kpi("Overall Progress", state.project.progress + "%", "Excel tracker average")}
      ${kpi("Health", "🟢 " + state.project.health, "Executive status")}
      ${kpi("Tasks", total, "Tracker rows")}
      ${kpi("Completed", completed, "Closed tasks")}
      ${kpi("Open Tasks", open, "Remaining")}
      ${kpi("Open Risks", risks, "PMO attention")}
    </div>

    <div class="grid two">
      <section class="panel">
        <div class="panel-head"><h2>Progress by Phase</h2><span class="badge">Excel source</span></div>
        <canvas id="phaseChart"></canvas>
      </section>
      <section class="panel">
        <div class="panel-head"><h2>Executive Summary</h2><span class="badge ${statusClass(state.project.health)}">${state.project.health}</span></div>
        <p><b>${state.project.name}</b> is tracked from <b>${state.project.source}</b>.</p>
        <p>Overall completion is <b>${state.project.progress}%</b>. Current focus is <b>${state.project.currentPhase}</b>.</p>
        <p><b>Management action:</b> prioritise backend/C# support and validation planning before UAT.</p>
      </section>
    </div>

    <div class="grid two">
      <section class="panel">
        <div class="panel-head"><h2>Phase Timeline</h2><button onclick="navigate('Timeline')">Open Timeline</button></div>
        ${renderMiniTimeline()}
      </section>
      <section class="panel">
        <div class="panel-head"><h2>Team Workload</h2><span class="badge">Task ownership</span></div>
        <canvas id="teamChart"></canvas>
      </section>
    </div>

    <section class="panel">
      <div class="panel-head"><h2>Upcoming Activities</h2><button onclick="navigate('Reports')">Weekly report</button></div>
      <table>
        <thead><tr><th>Period</th><th>Activity</th></tr></thead>
        <tbody>${state.upcoming.map(u => `<tr><td><b>${u.period}</b></td><td>${u.activity}</td></tr>`).join("")}</tbody>
      </table>
    </section>
  `;
}

function renderMiniTimeline() {
  return `<div class="timeline-list">
    ${state.phases.map(p => `
      <div class="timeline-row">
        <b>${p.phaseNo}: ${p.name}</b>
        ${progressBar(p.progress)}
        <span>${p.progress}%</span>
      </div>
    `).join("")}
  </div>`;
}

function renderTasks() {
  return `
    <section class="panel">
      <div class="panel-head">
        <h2>Excel Task Database</h2>
        <input id="taskSearch" oninput="filterTasks()" placeholder="Search task, owner, phase..." />
      </div>
      <div id="taskTable">${taskTable(state.tasks)}</div>
    </section>
  `;
}

function taskTable(tasks) {
  return `
    <table>
      <thead>
        <tr><th>ID</th><th>Phase / Scope</th><th>Task</th><th>FE</th><th>BE</th><th>Engine</th><th>Owner</th><th>Progress</th><th>Status</th></tr>
      </thead>
      <tbody>
        ${tasks.map(t => `
          <tr>
            <td><b>${t.id}</b></td>
            <td><b>${t.phaseNo}</b><br><small>${t.scope}</small></td>
            <td>${t.task}<br><small>${t.remarks || ""}</small></td>
            <td>${t.frontEnd}</td>
            <td>${t.backEnd}</td>
            <td>${t.corrsimEngine}</td>
            <td>${t.owner}</td>
            <td>${progressBar(t.progress)}<small>${t.progress}%</small></td>
            <td><span class="badge ${statusClass(t.status)}">${t.status}</span></td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function filterTasks() {
  const q = document.getElementById("taskSearch").value.toLowerCase();
  const filtered = state.tasks.filter(t => JSON.stringify(t).toLowerCase().includes(q));
  document.getElementById("taskTable").innerHTML = taskTable(filtered);
}

function renderBoard() {
  const statuses = ["Not Started", "Backlog", "In Progress", "Completed"];
  return `<div class="board">
    ${statuses.map(s => `
      <div class="board-col">
        <h3>${s}</h3>
        ${state.tasks.filter(t => t.status === s).map(t => `
          <div class="task-card">
            <b>${t.task}</b>
            <small>${t.id} · ${t.scope}</small>
            ${progressBar(t.progress)}
            <div class="card-tags">
              <span>${t.owner}</span>
              <span>${t.priority}</span>
            </div>
          </div>
        `).join("")}
      </div>
    `).join("")}
  </div>`;
}

function renderTeam() {
  return `
    <div class="grid three">
      ${state.team.map(m => `
        <section class="panel person">
          <div class="avatar">${m.name.slice(0,2).toUpperCase()}</div>
          <h3>${m.name}</h3>
          <p>${m.role}</p>
          ${progressBar(m.progress)}
          <small>${m.tasks} tasks · ${m.completed} completed · ${m.progress}% avg</small>
        </section>
      `).join("")}
    </div>
  `;
}

function renderTimeline() {
  return `
    <section class="panel">
      <div class="panel-head"><h2>Project Timeline</h2><span class="badge">Generated from phases</span></div>
      ${renderMiniTimeline()}
    </section>
    <div class="grid three">
      ${state.phases.map(p => `
        <section class="panel">
          <h3>${p.phaseNo}</h3>
          <p>${p.name}</p>
          ${progressBar(p.progress)}
          <p><b>${p.completed}/${p.total}</b> tasks completed</p>
          <span class="badge ${statusClass(p.status)}">${p.status}</span>
        </section>
      `).join("")}
    </div>
  `;
}

function renderMilestones() {
  return `
    <section class="panel">
      <h2>Milestones by Phase</h2>
      <table>
        <thead><tr><th>Milestone</th><th>Total Tasks</th><th>Completed</th><th>Progress</th><th>Status</th></tr></thead>
        <tbody>${state.phases.map(p => `
          <tr>
            <td><b>${p.phaseNo}: ${p.name}</b></td>
            <td>${p.total}</td>
            <td>${p.completed}</td>
            <td>${progressBar(p.progress)}<small>${p.progress}%</small></td>
            <td><span class="badge ${statusClass(p.status)}">${p.status}</span></td>
          </tr>
        `).join("")}</tbody>
      </table>
    </section>
  `;
}

function renderModules() {
  return `<div class="grid three">
    ${state.modules.map(m => `
      <section class="panel">
        <div class="panel-head"><h3>${m.name}</h3><span class="badge ${statusClass(m.status)}">${m.status}</span></div>
        ${progressBar(m.progress)}
        <p>${m.completed}/${m.total} tasks completed</p>
        <small>Owner: ${m.owner}</small>
      </section>
    `).join("")}
  </div>`;
}

function renderRisks() {
  return `
    <section class="panel">
      <h2>Executive Risk Register</h2>
      <table>
        <thead><tr><th>Issue</th><th>Impact</th><th>Probability</th><th>Owner</th><th>Mitigation</th><th>Status</th></tr></thead>
        <tbody>${state.risks.map(r => `
          <tr>
            <td><b>${r.issue}</b></td>
            <td>${r.impact}</td>
            <td>${r.probability}</td>
            <td>${r.owner}</td>
            <td>${r.mitigation}</td>
            <td><span class="badge ${statusClass(r.status)}">${r.status}</span></td>
          </tr>
        `).join("")}</tbody>
      </table>
    </section>
  `;
}

function renderReports() {
  const completed = state.tasks.filter(t => t.status === "Completed").length;
  return `
    <div class="grid two">
      <section class="panel">
        <h2>Weekly PMO Report</h2>
        <h3>Achievements</h3>
        <ul>
          <li>${completed} tasks completed from the tracker.</li>
          <li>Phase 1 project structure is largely completed.</li>
          <li>Visualization work is progressing.</li>
        </ul>
        <h3>Current Focus</h3>
        <ul>
          <li>Flow calculation and simulation validation.</li>
          <li>Line Run and Parametric Run.</li>
          <li>Authentication and UAT preparation.</li>
        </ul>
      </section>
      <section class="panel">
        <h2>Module Analytics</h2>
        <canvas id="moduleChart"></canvas>
      </section>
    </div>
  `;
}

function renderUsers() {
  return `
    <section class="panel">
      <h2>User Access</h2>
      <table>
        <thead><tr><th>Username</th><th>Password</th><th>Role</th></tr></thead>
        <tbody>
          <tr><td>admin</td><td>Admin@123</td><td>Administrator</td></tr>
          <tr><td>amir</td><td>Amir@123</td><td>Project Manager</td></tr>
          <tr><td>management</td><td>Mgmt@123</td><td>Executive</td></tr>
        </tbody>
      </table>
    </section>
  `;
}

function navigate(page) {
  currentPage = page;
  document.querySelectorAll(".nav button").forEach(b => b.classList.toggle("active", b.dataset.page === page));
  document.getElementById("pageTitle").textContent = page;
  const content = document.getElementById("content");

  const views = {
    Dashboard: renderDashboard,
    Tasks: renderTasks,
    Board: renderBoard,
    Team: renderTeam,
    Timeline: renderTimeline,
    Milestones: renderMilestones,
    Modules: renderModules,
    Risks: renderRisks,
    Reports: renderReports,
    Users: renderUsers
  };

  content.innerHTML = views[page] ? views[page]() : renderDashboard();
  setTimeout(drawCharts, 20);
}

function initNavigation() {
  const nav = document.getElementById("nav");
  const pages = ["Dashboard","Tasks","Board","Team","Timeline","Milestones","Modules","Risks","Reports","Users"];
  nav.innerHTML = pages.map(p => `<button data-page="${p}" onclick="navigate('${p}')">${p}</button>`).join("");
}

async function initDashboard() {
  await loadProjectData();
  initNavigation();
  navigate("Dashboard");
}

document.addEventListener("DOMContentLoaded", initDashboard);
