// ===============================
// PART 1
// Global Variables
// Navigation
// Dashboard
// ===============================

// code......



// ===============================
// PART 2
// Task Table
// Task Modal
// ===============================

// code......



// ===============================
// PART 3
// Kanban
// Timeline
// Milestones
// ===============================

// code......



// ===============================
// PART 4
// Charts
// Export
// Dark Mode
// initDashboard()
// ===============================

// code......

/* =========================================================
   dashboard.js - PART 2
   Includes:
   - Task page
   - Search and filters
   - Task table
   - Add/Edit task modal
   - Save task
   - Delete task
   - Recalculate project data
   - Export CSV / JSON

   Paste this directly below PART 1.
========================================================= */


/* =========================
   TASK PAGE
========================= */

function renderTasks() {
  const phases = [...new Set(state.tasks.map(task => task.phaseNo))];
  const statuses = [...new Set(state.tasks.map(task => task.status))];
  const owners = [...new Set(state.tasks.map(task => task.owner))];

  return `
    <section class="panel">
      <div class="panel-head">
        <div>
          <h2>Task Database</h2>
          <p class="small">Excel-style project tracker with searchable tasks, owners, progress, and status.</p>
        </div>

        <div class="top-actions">
          <button class="primary-btn" onclick="openTaskModal()">+ Add Task</button>
          <button onclick="exportTasksCsv()">Export CSV</button>
          <button onclick="exportProjectJson()">Export JSON</button>
          <button onclick="resetLocalState()">Reset</button>
        </div>
      </div>

      <div class="filter-row">
        <input
          id="taskSearch"
          type="text"
          placeholder="Search task, owner, phase, module..."
          oninput="filterTasks()"
        />

        <select id="phaseFilter" onchange="filterTasks()">
          <option value="">All phases</option>
          ${phases.map(phase => `
            <option value="${phase}">${phase}</option>
          `).join("")}
        </select>

        <select id="statusFilter" onchange="filterTasks()">
          <option value="">All status</option>
          ${statuses.map(status => `
            <option value="${status}">${status}</option>
          `).join("")}
        </select>

        <select id="ownerFilter" onchange="filterTasks()">
          <option value="">All owners</option>
          ${owners.map(owner => `
            <option value="${owner}">${owner}</option>
          `).join("")}
        </select>
      </div>

      <div class="table-summary">
        <div>
          <b>${state.tasks.length}</b>
          <span>Total Tasks</span>
        </div>
        <div>
          <b>${state.tasks.filter(task => task.status === "Completed").length}</b>
          <span>Completed</span>
        </div>
        <div>
          <b>${state.tasks.filter(task => task.status === "In Progress").length}</b>
          <span>In Progress</span>
        </div>
        <div>
          <b>${state.tasks.filter(task => task.status === "Backlog" || task.status === "Not Started").length}</b>
          <span>Backlog / Not Started</span>
        </div>
      </div>

      <div class="table-wrap" id="taskTable">
        ${taskTable(state.tasks)}
      </div>
    </section>
  `;
}


/* =========================
   TASK TABLE
========================= */

function taskTable(tasks) {
  if (!tasks || tasks.length === 0) {
    return `
      <div class="empty-state">
        <h3>No tasks found</h3>
        <p>Try changing your filters or add a new task.</p>
      </div>
    `;
  }

  return `
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Phase / Scope</th>
          <th>Task</th>
          <th>Front End</th>
          <th>Back End</th>
          <th>Engine</th>
          <th>Owner</th>
          <th>Priority</th>
          <th>Progress</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
        ${tasks.map(task => `
          <tr>
            <td>
              <b>${task.id}</b>
            </td>

            <td>
              <b>${task.phaseNo}</b>
              <br>
              <small>${task.scope || "-"}</small>
            </td>

            <td>
              <b>${task.task}</b>
              <br>
              <small>${task.remarks || ""}</small>
            </td>

            <td>${task.frontEnd || "-"}</td>
            <td>${task.backEnd || "-"}</td>
            <td>${task.corrsimEngine || "-"}</td>
            <td>${task.owner || "-"}</td>

            <td>
              <span class="badge ${priorityClass(task.priority)}">
                ${task.priority || "Medium"}
              </span>
            </td>

            <td>
              ${progressBar(task.progress)}
              <small>${Number(task.progress) || 0}%</small>
            </td>

            <td>
              <span class="badge ${statusClass(task.status)}">
                ${task.status || "Not Started"}
              </span>
            </td>

            <td>
              <button onclick="openTaskModal('${task.id}')">Edit</button>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}


/* =========================
   FILTER TASKS
========================= */

function filterTasks() {
  const query = document.getElementById("taskSearch")?.value.toLowerCase() || "";
  const phase = document.getElementById("phaseFilter")?.value || "";
  const status = document.getElementById("statusFilter")?.value || "";
  const owner = document.getElementById("ownerFilter")?.value || "";

  const filtered = state.tasks.filter(task => {
    const matchesSearch =
      !query ||
      JSON.stringify(task).toLowerCase().includes(query);

    const matchesPhase =
      !phase ||
      task.phaseNo === phase;

    const matchesStatus =
      !status ||
      task.status === status;

    const matchesOwner =
      !owner ||
      task.owner === owner;

    return matchesSearch && matchesPhase && matchesStatus && matchesOwner;
  });

  const table = document.getElementById("taskTable");
  if (table) {
    table.innerHTML = taskTable(filtered);
  }
}


/* =========================
   TASK MODAL
========================= */

function openTaskModal(taskId) {
  const existingTask = taskId
    ? state.tasks.find(task => task.id === taskId)
    : null;

  const task = existingTask || {
    id: nextTaskId(),
    phaseNo: "Local",
    phase: "Local Task",
    scope: "",
    task: "",
    frontEnd: "Pending",
    backEnd: "Pending",
    corrsimEngine: "N/A",
    owner: "Amir",
    priority: "Medium",
    progress: 0,
    status: "Not Started",
    remarks: ""
  };

  closeTaskModal();

  document.body.insertAdjacentHTML("beforeend", `
    <div class="modal-backdrop" id="taskModal">
      <div class="modal">
        <div class="modal-head">
          <div>
            <h2>${existingTask ? "Edit Task" : "Create New Task"}</h2>
            <p class="small">
              Update task details, status, progress, and ownership.
            </p>
          </div>

          <button onclick="closeTaskModal()">Close</button>
        </div>

        <div class="form-grid">
          ${formInput("Task ID", "id", task.id)}
          ${formInput("Phase No.", "phaseNo", task.phaseNo)}

          ${formInput("Phase Name", "phase", task.phase)}
          ${formInput("Scope / Module", "scope", task.scope)}

          <div class="wide">
            ${formInput("Task Name", "task", task.task)}
          </div>

          ${formSelect(
            "Front End",
            "frontEnd",
            task.frontEnd,
            ["N/A", "Pending", "Backlog", "In Progress", "Completed"]
          )}

          ${formSelect(
            "Back End",
            "backEnd",
            task.backEnd,
            ["N/A", "Pending", "Backlog", "In Progress", "Completed"]
          )}

          ${formSelect(
            "Corrsim Engine",
            "corrsimEngine",
            task.corrsimEngine,
            ["N/A", "Pending", "Backlog", "In Progress", "Completed"]
          )}

          ${formInput("Owner", "owner", task.owner)}

          ${formSelect(
            "Priority",
            "priority",
            task.priority,
            ["Low", "Medium", "High", "Critical"]
          )}

          ${formSelect(
            "Status",
            "status",
            task.status,
            ["Not Started", "Backlog", "In Progress", "Completed"]
          )}

          ${formInput("Progress %", "progress", task.progress, "number")}

          <div class="wide">
            ${formTextarea("Remarks", "remarks", task.remarks)}
          </div>
        </div>

        <div class="modal-actions">
          <button class="primary-btn" onclick="saveTaskFromModal('${existingTask ? task.id : ""}')">
            Save Task
          </button>

          ${existingTask ? `
            <button class="danger-btn" onclick="deleteTaskFromModal('${task.id}')">
              Delete Task
            </button>
          ` : ""}

          <button onclick="closeTaskModal()">Cancel</button>
        </div>
      </div>
    </div>
  `);
}

function closeTaskModal() {
  const modal = document.getElementById("taskModal");
  if (modal) modal.remove();
}


/* =========================
   FORM COMPONENTS
========================= */

function formInput(label, id, value, type = "text") {
  return `
    <div>
      <label>${label}</label>
      <input
        id="f_${id}"
        type="${type}"
        value="${safeValue(value)}"
      />
    </div>
  `;
}

function formTextarea(label, id, value) {
  return `
    <div>
      <label>${label}</label>
      <textarea id="f_${id}" rows="4">${value || ""}</textarea>
    </div>
  `;
}

function formSelect(label, id, selectedValue, options) {
  return `
    <div>
      <label>${label}</label>
      <select id="f_${id}">
        ${options.map(option => `
          <option value="${option}" ${option === selectedValue ? "selected" : ""}>
            ${option}
          </option>
        `).join("")}
      </select>
    </div>
  `;
}

function getFormValue(id) {
  return document.getElementById("f_" + id)?.value || "";
}


/* =========================
   SAVE TASK
========================= */

function saveTaskFromModal(oldTaskId) {
  const task = {
    id: getFormValue("id"),
    phaseNo: getFormValue("phaseNo"),
    phase: getFormValue("phase"),
    scope: getFormValue("scope"),
    task: getFormValue("task"),
    frontEnd: getFormValue("frontEnd"),
    backEnd: getFormValue("backEnd"),
    corrsimEngine: getFormValue("corrsimEngine"),
    owner: getFormValue("owner"),
    priority: getFormValue("priority"),
    status: getFormValue("status"),
    progress: Number(getFormValue("progress") || 0),
    remarks: getFormValue("remarks")
  };

  if (!task.id) {
    alert("Task ID is required.");
    return;
  }

  if (!task.task) {
    alert("Task name is required.");
    return;
  }

  if (oldTaskId) {
    const index = state.tasks.findIndex(item => item.id === oldTaskId);

    if (index >= 0) {
      state.tasks[index] = task;
    }
  } else {
    const exists = state.tasks.some(item => item.id === task.id);

    if (exists) {
      alert("Task ID already exists.");
      return;
    }

    state.tasks.push(task);
  }

  recalculateAllData();
  saveLocalState();
  closeTaskModal();
  navigate(currentPage);
}


/* =========================
   DELETE TASK
========================= */

function deleteTaskFromModal(taskId) {
  const confirmDelete = confirm("Are you sure you want to delete this task?");

  if (!confirmDelete) return;

  state.tasks = state.tasks.filter(task => task.id !== taskId);

  recalculateAllData();
  saveLocalState();
  closeTaskModal();
  navigate(currentPage);
}


/* =========================
   RECALCULATE DATA
========================= */

function recalculateAllData() {
  state.project.progress = calculateAverageProgress(state.tasks);

  state.phases = buildPhasesFromTasks();
  state.team = buildTeamFromTasks();
  state.modules = buildModulesFromTasks();

  updateMilestoneProgressFromPhases();
}

function updateMilestoneProgressFromPhases() {
  if (!state.milestones) {
    state.milestones = buildMilestonesFromPhases();
    return;
  }

  state.milestones = state.milestones.map(milestone => {
    const matchingPhase = state.phases.find(
      phase => phase.phaseNo === milestone.phaseNo
    );

    if (!matchingPhase) return milestone;

    return {
      ...milestone,
      progress: matchingPhase.progress,
      status: matchingPhase.status
    };
  });
}


/* =========================
   EXPORT FUNCTIONS
========================= */

function exportProjectJson() {
  const blob = new Blob(
    [JSON.stringify(state, null, 2)],
    { type: "application/json" }
  );

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "project-data-export.json";
  link.click();
}

function exportTasksCsv() {
  const headers = [
    "id",
    "phaseNo",
    "phase",
    "scope",
    "task",
    "frontEnd",
    "backEnd",
    "corrsimEngine",
    "owner",
    "priority",
    "progress",
    "status",
    "remarks"
  ];

  const rows = state.tasks.map(task => {
    return headers.map(header => {
      const value = String(task[header] ?? "");
      return `"${value.replaceAll('"', '""')}"`;
    }).join(",");
  });

  const csv = headers.join(",") + "\n" + rows.join("\n");

  const blob = new Blob([csv], { type: "text/csv" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "fazcorrs-task-export.csv";
  link.click();
}


/* =========================
   NEXT TASK ID
========================= */

function nextTaskId() {
  const numbers = state.tasks
    .map(task => Number(String(task.id || "").replace(/\D/g, "")))
    .filter(number => !isNaN(number));

  const next = Math.max(0, ...numbers) + 1;

  return "T-" + String(next).padStart(3, "0");
}


/* ===== END OF PART 2 ===== */

/* =========================================================
   dashboard.js - PART 3
   Includes:
   - Kanban Board
   - Drag & Drop
   - Timeline
   - Milestones
   - Modules
   - Risks
   - Reports
   - Users

   Paste this directly below PART 2.
========================================================= */


/* =========================
   KANBAN BOARD
========================= */

function renderBoard() {
  const statuses = [
    "Not Started",
    "Backlog",
    "In Progress",
    "Completed"
  ];

  return `
    <div class="board-toolbar">
      <div>
        <h2>Kanban Board</h2>
        <p class="small">Drag tasks between columns to update their status.</p>
      </div>

      <button class="primary-btn" onclick="openTaskModal()">+ Add Task</button>
    </div>

    <div class="board">
      ${statuses.map(status => renderBoardColumn(status)).join("")}
    </div>
  `;
}

function renderBoardColumn(status) {
  const tasks = state.tasks.filter(task => task.status === status);

  return `
    <div class="board-col" data-status="${status}">
      <div class="board-col-head">
        <h3>${status}</h3>
        <span class="badge neutral">${tasks.length}</span>
      </div>

      ${tasks.map(task => renderBoardCard(task)).join("")}
    </div>
  `;
}

function renderBoardCard(task) {
  return `
    <div
      class="task-card"
      draggable="true"
      data-id="${task.id}"
      ondblclick="openTaskModal('${task.id}')"
    >
      <div class="task-card-head">
        <span class="badge ${priorityClass(task.priority)}">${task.priority || "Medium"}</span>
        <small>${task.id}</small>
      </div>

      <h4>${task.task}</h4>

      <p class="small">
        ${task.phaseNo || "-"} · ${task.scope || "-"}
      </p>

      ${progressBar(task.progress)}

      <div class="task-card-footer">
        <span class="avatar-mini">${getInitials(task.owner)}</span>
        <span>${task.owner || "-"}</span>
        <span>${Number(task.progress) || 0}%</span>
      </div>
    </div>
  `;
}

function getInitials(name) {
  if (!name) return "-";

  return String(name)
    .split(" ")
    .map(word => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}


/* =========================
   DRAG & DROP
========================= */

function makeBoardDraggable() {
  const cards = document.querySelectorAll(".task-card");
  const columns = document.querySelectorAll(".board-col");

  cards.forEach(card => {
    card.addEventListener("dragstart", event => {
      card.classList.add("dragging");
      event.dataTransfer.setData("text/plain", card.dataset.id);
    });

    card.addEventListener("dragend", () => {
      card.classList.remove("dragging");
    });
  });

  columns.forEach(column => {
    column.addEventListener("dragover", event => {
      event.preventDefault();
      column.classList.add("drag-over");
    });

    column.addEventListener("dragleave", () => {
      column.classList.remove("drag-over");
    });

    column.addEventListener("drop", event => {
      event.preventDefault();
      column.classList.remove("drag-over");

      const taskId = event.dataTransfer.getData("text/plain");
      const newStatus = column.dataset.status;

      updateTaskStatus(taskId, newStatus);
    });
  });
}

function updateTaskStatus(taskId, newStatus) {
  const task = state.tasks.find(item => item.id === taskId);

  if (!task) return;

  task.status = newStatus;

  if (newStatus === "Completed") {
    task.progress = 100;
  }

  if (newStatus === "Not Started") {
    task.progress = 0;
  }

  if (newStatus === "In Progress" && Number(task.progress) === 0) {
    task.progress = 25;
  }

  recalculateAllData();
  saveLocalState();
  navigate("Board");
}


/* =========================
   TEAM PAGE
========================= */

function renderTeam() {
  return `
    <div class="section-heading">
      <div>
        <h2>Team Progress</h2>
        <p class="small">Team workload and progress are calculated from task ownership.</p>
      </div>
    </div>

    <div class="grid three">
      ${state.team.map(member => renderTeamCard(member)).join("")}
    </div>

    <section class="panel">
      <div class="panel-head">
        <h2>Team Workload Table</h2>
        <span class="badge neutral">Calculated from tasks</span>
      </div>

      <table>
        <thead>
          <tr>
            <th>Team Member</th>
            <th>Role</th>
            <th>Total Tasks</th>
            <th>Completed</th>
            <th>Ongoing</th>
            <th>Backlog</th>
            <th>Average Progress</th>
          </tr>
        </thead>

        <tbody>
          ${state.team.map(member => `
            <tr>
              <td><b>${member.name}</b></td>
              <td>${member.role}</td>
              <td>${member.tasks}</td>
              <td>${member.completed}</td>
              <td>${member.ongoing}</td>
              <td>${member.backlog}</td>
              <td>
                ${progressBar(member.progress)}
                <small>${member.progress}%</small>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </section>
  `;
}

function renderTeamCard(member) {
  return `
    <section class="panel person">
      <div class="avatar">${getInitials(member.name)}</div>

      <h3>${member.name}</h3>
      <p>${member.role}</p>

      ${progressBar(member.progress)}

      <small>
        ${member.tasks} tasks ·
        ${member.completed} completed ·
        ${member.progress}% avg
      </small>
    </section>
  `;
}


/* =========================
   TIMELINE PAGE
========================= */

function renderTimeline() {
  return `
    <section class="panel">
      <div class="panel-head">
        <div>
          <h2>Project Timeline</h2>
          <p class="small">Phase roadmap generated from project phases.</p>
        </div>

        <span class="badge neutral">Roadmap View</span>
      </div>

      <div class="timeline-list">
        ${state.phases.map(phase => renderTimelineRow(phase)).join("")}
      </div>
    </section>

    <div class="grid three">
      ${state.phases.map(phase => renderPhaseCard(phase)).join("")}
    </div>
  `;
}

function renderTimelineRow(phase) {
  return `
    <div class="timeline-row">
      <div>
        <b>${phase.phaseNo}</b>
        <br>
        <small>${phase.name}</small>
      </div>

      ${progressBar(phase.progress)}

      <span>${phase.progress}%</span>
    </div>
  `;
}

function renderPhaseCard(phase) {
  return `
    <section class="panel">
      <div class="panel-head">
        <h3>${phase.phaseNo}</h3>
        <span class="badge ${statusClass(phase.status)}">${phase.status}</span>
      </div>

      <p><b>${phase.name}</b></p>

      ${progressBar(phase.progress)}

      <p>
        <b>${phase.completed}</b> / ${phase.total} tasks completed
      </p>
    </section>
  `;
}


/* =========================
   MILESTONES PAGE
========================= */

function renderMilestones() {
  return `
    <section class="panel">
      <div class="panel-head">
        <div>
          <h2>Milestones by Phase</h2>
          <p class="small">Track planned vs actual milestone delivery for each project phase.</p>
        </div>

        <span class="badge neutral">Gate Review</span>
      </div>

      <table>
        <thead>
          <tr>
            <th>Phase</th>
            <th>Milestone</th>
            <th>Planned Date</th>
            <th>Actual Date</th>
            <th>Owner</th>
            <th>Progress</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          ${state.milestones.map(milestone => `
            <tr>
              <td><b>${milestone.phaseNo}</b></td>
              <td>${milestone.milestone}</td>
              <td>${milestone.plannedDate || "-"}</td>
              <td>${milestone.actualDate || "-"}</td>
              <td>${milestone.owner || "-"}</td>
              <td>
                ${progressBar(milestone.progress)}
                <small>${milestone.progress}%</small>
              </td>
              <td>
                <span class="badge ${statusClass(milestone.status)}">
                  ${milestone.status}
                </span>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </section>

    <div class="grid three">
      ${state.milestones.map(milestone => renderMilestoneDetailCard(milestone)).join("")}
    </div>
  `;
}

function renderMilestoneDetailCard(milestone) {
  return `
    <section class="panel">
      <div class="panel-head">
        <h3>${milestone.phaseNo}</h3>
        <span class="badge ${statusClass(milestone.status)}">
          ${milestone.status}
        </span>
      </div>

      <p><b>${milestone.milestone}</b></p>

      ${progressBar(milestone.progress)}

      <p class="small">
        Planned: ${milestone.plannedDate || "-"}
        <br>
        Actual: ${milestone.actualDate || "-"}
        <br>
        Owner: ${milestone.owner || "-"}
      </p>
    </section>
  `;
}


/* =========================
   MODULES PAGE
========================= */

function renderModules() {
  return `
    <div class="section-heading">
      <div>
        <h2>Module Development Status</h2>
        <p class="small">Module readiness is calculated from related tasks.</p>
      </div>
    </div>

    <div class="grid three">
      ${state.modules.map(module => renderModuleCard(module)).join("")}
    </div>
  `;
}

function renderModuleCard(module) {
  return `
    <section class="panel">
      <div class="panel-head">
        <h3>${module.name}</h3>
        <span class="badge ${statusClass(module.status)}">
          ${module.status}
        </span>
      </div>

      ${progressBar(module.progress)}

      <p>
        <b>${module.completed}</b> / ${module.total} tasks completed
      </p>

      <p class="small">
        Owner: ${module.owner || "-"}
      </p>
    </section>
  `;
}


/* =========================
   RISKS PAGE
========================= */

function renderRisks() {
  return `
    <section class="panel">
      <div class="panel-head">
        <div>
          <h2>Executive Risk Register</h2>
          <p class="small">Track delivery risks, probability, impact, mitigation and owner.</p>
        </div>

        <span class="badge warning">PMO Review</span>
      </div>

      <table>
        <thead>
          <tr>
            <th>Issue</th>
            <th>Impact</th>
            <th>Probability</th>
            <th>Owner</th>
            <th>Mitigation</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          ${state.risks.map(risk => `
            <tr>
              <td><b>${risk.issue}</b></td>
              <td>
                <span class="badge ${risk.impact === "High" ? "danger" : "warning"}">
                  ${risk.impact}
                </span>
              </td>
              <td>${risk.probability}</td>
              <td>${risk.owner}</td>
              <td>${risk.mitigation}</td>
              <td>
                <span class="badge ${statusClass(risk.status)}">
                  ${risk.status}
                </span>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </section>
  `;
}


/* =========================
   REPORTS PAGE
========================= */

function renderReports() {
  const completed = state.tasks.filter(task => task.status === "Completed").length;
  const total = state.tasks.length;
  const actual = state.project.progress;
  const latest = getLatestPlannedActual();
  const variance = actual - latest.planned;

  return `
    <div class="grid two">
      <section class="panel">
        <div class="panel-head">
          <h2>Weekly PMO Report</h2>
          <span class="badge ${statusClass(state.project.health)}">${state.project.health}</span>
        </div>

        <h3>Achievements</h3>
        <ul>
          <li>${completed} of ${total} tasks are completed.</li>
          <li>Actual vs planned progress is now tracked.</li>
          <li>Milestone tracking is available by phase.</li>
          <li>Kanban board supports drag-and-drop status update.</li>
        </ul>

        <h3>Current Focus</h3>
        <ul>
          <li>${state.project.currentPhase}</li>
          <li>Backend calculation services.</li>
          <li>Simulation validation and UAT preparation.</li>
        </ul>

        <h3>Management Actions</h3>
        <ul>
          <li>Prioritise backend/C# support.</li>
          <li>Run milestone gate reviews weekly.</li>
          <li>Confirm validation matrix against MultiCorp reference.</li>
        </ul>
      </section>

      <section class="panel">
        <h2>Executive Health Summary</h2>

        <p>
          Overall progress is <b>${actual}%</b>.
        </p>

        <p>
          Planned progress is <b>${latest.planned}%</b>.
        </p>

        <p>
          The project is currently
          <b>${Math.abs(variance)}%</b>
          ${variance < 0 ? "behind" : "ahead of"} plan.
        </p>

        <p>
          Open risks require management attention:
          <b>${state.risks.filter(risk => risk.status !== "Closed").length}</b>
        </p>
      </section>
    </div>

    <section class="panel">
      <h2>Module Analytics</h2>
      <canvas id="moduleChart"></canvas>
    </section>
  `;
}


/* =========================
   USERS PAGE
========================= */

function renderUsers() {
  return `
    <section class="panel">
      <div class="panel-head">
        <div>
          <h2>User Access</h2>
          <p class="small">Demo role-based access overview.</p>
        </div>

        <span class="badge neutral">RBAC</span>
      </div>

      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Password</th>
            <th>Role</th>
            <th>Access Level</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td><b>admin</b></td>
            <td>Admin@123</td>
            <td>Administrator</td>
            <td>Full access</td>
          </tr>

          <tr>
            <td><b>amir</b></td>
            <td>Amir@123</td>
            <td>Project Manager</td>
            <td>Project management</td>
          </tr>

          <tr>
            <td><b>mustaza</b></td>
            <td>Mustaza@123</td>
            <td>Product Engineer</td>
            <td>Simulation modules</td>
          </tr>

          <tr>
            <td><b>najwa</b></td>
            <td>Najwa@123</td>
            <td>Software Engineer</td>
            <td>Development modules</td>
          </tr>

          <tr>
            <td><b>aimar</b></td>
            <td>Aimar@123</td>
            <td>UI/UX Developer</td>
            <td>UI and visualization</td>
          </tr>

          <tr>
            <td><b>management</b></td>
            <td>Mgmt@123</td>
            <td>Executive</td>
            <td>Read-only dashboard</td>
          </tr>
        </tbody>
      </table>
    </section>
  `;
}


/* ===== END OF PART 3 ===== */

/* =========================================================
   dashboard.js - PART 4
   Includes:
   - Chart engine
   - Actual vs Planned line chart
   - Bar charts
   - Canvas helpers
   - Dark mode

   Paste this directly below PART 3.
========================================================= */


/* =========================
   DRAW ALL CHARTS
========================= */

function drawCharts() {
  if (!state) return;

  drawLineChart(
    "actualPlanChart",
    state.plannedVsActual.map(item => item.month),
    [
      {
        label: "Planned",
        values: state.plannedVsActual.map(item => Number(item.planned) || 0)
      },
      {
        label: "Actual",
        values: state.plannedVsActual.map(item => Number(item.actual) || 0)
      }
    ],
    "%"
  );

  drawBarChart(
    "phaseChart",
    state.phases.map(phase => phase.phaseNo),
    state.phases.map(phase => Number(phase.progress) || 0),
    "%"
  );

  drawBarChart(
    "teamChart",
    state.team.map(member => member.name),
    state.team.map(member => Number(member.tasks) || 0),
    ""
  );

  drawBarChart(
    "moduleChart",
    state.modules.slice(0, 10).map(module => module.name),
    state.modules.slice(0, 10).map(module => Number(module.progress) || 0),
    "%"
  );

  const statusCounts = {};

  state.tasks.forEach(task => {
    statusCounts[task.status] = (statusCounts[task.status] || 0) + 1;
  });

  drawBarChart(
    "statusChart",
    Object.keys(statusCounts),
    Object.values(statusCounts),
    ""
  );
}


/* =========================
   CANVAS SETUP
========================= */

function setupCanvas(id) {
  const canvas = document.getElementById(id);

  if (!canvas) return null;

  const rect = canvas.getBoundingClientRect();

  if (!rect.width) return null;

  const ratio = window.devicePixelRatio || 1;

  canvas.width = rect.width * ratio;
  canvas.height = 280 * ratio;

  const ctx = canvas.getContext("2d");
  ctx.scale(ratio, ratio);

  return {
    canvas,
    ctx,
    width: rect.width,
    height: 280
  };
}

function drawGrid(ctx, width, height, padding) {
  ctx.strokeStyle = getLineColor();
  ctx.lineWidth = 1;

  for (let i = 0; i <= 5; i++) {
    const y = padding + i * (height - padding * 2) / 5;

    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
  }
}


/* =========================
   BAR CHART
========================= */

function drawBarChart(id, labels, values, suffix = "") {
  const chart = setupCanvas(id);

  if (!chart) return;

  const { ctx, width, height } = chart;

  const padding = 44;
  const max = Math.max(100, ...values);
  const step = (width - padding * 2) / Math.max(1, values.length);
  const barWidth = step * 0.52;

  ctx.clearRect(0, 0, width, height);
  drawGrid(ctx, width, height, padding);

  values.forEach((value, index) => {
    const x = padding + index * step + (step - barWidth) / 2;
    const barHeight = (height - padding * 2) * (value / max);
    const y = height - padding - barHeight;

    ctx.fillStyle = "#0078D4";
    roundedRect(ctx, x, y, barWidth, barHeight, 8);
    ctx.fill();

    ctx.fillStyle = getTextColor();
    ctx.font = "bold 12px Segoe UI";
    ctx.fillText(String(value) + suffix, x, y - 8);

    ctx.save();
    ctx.fillStyle = getMutedColor();
    ctx.font = "11px Segoe UI";
    ctx.translate(x, height - 14);
    ctx.rotate(-0.55);
    ctx.fillText(String(labels[index]), 0, 0);
    ctx.restore();
  });
}


/* =========================
   LINE CHART
========================= */

function drawLineChart(id, labels, series, suffix = "") {
  const chart = setupCanvas(id);

  if (!chart) return;

  const { ctx, width, height } = chart;

  const padding = 44;
  const max = 100;

  const colors = [
    "#0078D4",
    "#16A34A",
    "#F59E0B",
    "#7C3AED"
  ];

  ctx.clearRect(0, 0, width, height);
  drawGrid(ctx, width, height, padding);

  series.forEach((line, lineIndex) => {
    const color = colors[lineIndex % colors.length];

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();

    line.values.forEach((value, index) => {
      const x = padding + index * (width - padding * 2) / Math.max(1, labels.length - 1);
      const y = height - padding - (height - padding * 2) * (value / max);

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    line.values.forEach((value, index) => {
      const x = padding + index * (width - padding * 2) / Math.max(1, labels.length - 1);
      const y = height - padding - (height - padding * 2) * (value / max);

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = getTextColor();
      ctx.font = "bold 11px Segoe UI";
      ctx.fillText(value + suffix, x - 10, y - 10);
    });

    ctx.fillStyle = color;
    ctx.fillRect(padding + lineIndex * 105, 15, 10, 10);

    ctx.fillStyle = getMutedColor();
    ctx.font = "12px Segoe UI";
    ctx.fillText(line.label, padding + 16 + lineIndex * 105, 25);
  });

  labels.forEach((label, index) => {
    const x = padding + index * (width - padding * 2) / Math.max(1, labels.length - 1);

    ctx.fillStyle = getMutedColor();
    ctx.font = "11px Segoe UI";
    ctx.fillText(String(label).replace(" 2026", ""), x - 16, height - 14);
  });
}


/* =========================
   OPTIONAL DOUGHNUT CHART
========================= */

function drawDoughnutChart(id, labels, values) {
  const chart = setupCanvas(id);

  if (!chart) return;

  const { ctx, width, height } = chart;

  const total = values.reduce((sum, value) => sum + value, 0);
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 3;

  const colors = [
    "#0078D4",
    "#16A34A",
    "#F59E0B",
    "#DC2626",
    "#7C3AED",
    "#0891B2"
  ];

  let startAngle = -Math.PI / 2;

  ctx.clearRect(0, 0, width, height);

  values.forEach((value, index) => {
    const sliceAngle = (value / total) * Math.PI * 2;
    const endAngle = startAngle + sliceAngle;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.arc(centerX, centerY, radius * 0.58, endAngle, startAngle, true);
    ctx.closePath();

    ctx.fillStyle = colors[index % colors.length];
    ctx.fill();

    startAngle = endAngle;
  });

  ctx.fillStyle = getTextColor();
  ctx.font = "bold 20px Segoe UI";
  ctx.textAlign = "center";
  ctx.fillText(String(total), centerX, centerY + 6);

  ctx.textAlign = "left";
}


/* =========================
   DRAWING HELPERS
========================= */

function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();

  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
}

function getTextColor() {
  return document.body.classList.contains("dark")
    ? "#F8FAFC"
    : "#101828";
}

function getMutedColor() {
  return document.body.classList.contains("dark")
    ? "#CBD5E1"
    : "#667085";
}

function getLineColor() {
  return document.body.classList.contains("dark")
    ? "#334155"
    : "#E6EAF0";
}


/* =========================
   DARK MODE
========================= */

function toggleDarkMode() {
  document.body.classList.toggle("dark");

  localStorage.setItem(
    "fazcorrs_dark_mode",
    document.body.classList.contains("dark") ? "1" : "0"
  );

  setTimeout(drawCharts, 100);
}

function initDarkMode() {
  if (localStorage.getItem("fazcorrs_dark_mode") === "1") {
    document.body.classList.add("dark");
  }

  const actions = document.querySelector(".top-actions");

  if (actions && !document.getElementById("darkToggle")) {
    actions.insertAdjacentHTML("afterbegin", `
      <button id="darkToggle" onclick="toggleDarkMode()">
        Dark Mode
      </button>
    `);
  }
}


/* ===== END OF PART 4 ===== */

/* =========================================================
   dashboard.js - PART 5
   Includes:
   - CSV import
   - JSON import
   - File import helpers
   - Browser storage utilities
   - Startup
   - Error handling

   Paste this directly below PART 4.
========================================================= */


/* =========================
   IMPORT CONTROLS
========================= */

function renderImportControls() {
  return `
    <div class="import-box">
      <b>Import Project Data</b>

      <p class="small">
        Import JSON or CSV files. Imported data is saved in your browser local storage.
      </p>

      <div class="import-actions">
        <label class="file-label">
          Import JSON
          <input type="file" accept=".json" onchange="importProjectJson(this)" hidden>
        </label>

        <label class="file-label">
          Import CSV
          <input type="file" accept=".csv" onchange="importTasksCsv(this)" hidden>
        </label>
      </div>
    </div>
  `;
}


/* =========================
   IMPORT JSON
========================= */

function importProjectJson(input) {
  const file = input.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = event => {
    try {
      const imported = JSON.parse(event.target.result);

      if (!imported.tasks || !Array.isArray(imported.tasks)) {
        alert("Invalid JSON file. It must contain a tasks array.");
        return;
      }

      state = imported;

      ensureDataDefaults();
      recalculateAllData();
      saveLocalState();

      alert("Project JSON imported successfully.");

      navigate("Dashboard");
    } catch (error) {
      alert("Unable to import JSON. Please check the file format.");
      console.error(error);
    }
  };

  reader.readAsText(file);
}


/* =========================
   IMPORT CSV
========================= */

function importTasksCsv(input) {
  const file = input.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = event => {
    try {
      const text = event.target.result;
      const rows = csvToObjects(text);

      if (!rows || rows.length === 0) {
        alert("CSV file is empty.");
        return;
      }

      state.tasks = rows.map(row => ({
        id: row.id || nextTaskId(),
        phaseNo: row.phaseNo || row.phase || "Local",
        phase: row.phase || "Imported Task",
        scope: row.scope || "",
        task: row.task || row.name || "",
        frontEnd: row.frontEnd || row.frontend || "Pending",
        backEnd: row.backEnd || row.backend || "Pending",
        corrsimEngine: row.corrsimEngine || row.engine || "N/A",
        owner: row.owner || "Unassigned",
        priority: row.priority || "Medium",
        progress: Number(row.progress || 0),
        status: row.status || "Not Started",
        remarks: row.remarks || ""
      }));

      recalculateAllData();
      saveLocalState();

      alert("CSV imported successfully.");

      navigate("Tasks");
    } catch (error) {
      alert("Unable to import CSV. Please check the file format.");
      console.error(error);
    }
  };

  reader.readAsText(file);
}


/* =========================
   CSV PARSER
========================= */

function csvToObjects(csvText) {
  const lines = csvText
    .split(/\r?\n/)
    .filter(line => line.trim() !== "");

  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map(header =>
    header.trim()
  );

  return lines.slice(1).map(line => {
    const values = parseCsvLine(line);
    const object = {};

    headers.forEach((header, index) => {
      object[header] = values[index] || "";
    });

    return object;
  });
}

function parseCsvLine(line) {
  const result = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && nextChar === '"') {
      current += '"';
      i++;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === "," && !insideQuotes) {
      result.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current);

  return result;
}


/* =========================
   ENHANCE TASK PAGE IMPORT
========================= */

const originalRenderTasksWithImport = renderTasks;

renderTasks = function () {
  return `
    ${renderImportControls()}
    ${originalRenderTasksWithImport()}
  `;
};


/* =========================
   STORAGE UTILITIES
========================= */

function clearAllBrowserData() {
  const confirmClear = confirm(
    "This will clear all saved project edits from this browser. Continue?"
  );

  if (!confirmClear) return;

  localStorage.removeItem("fazcorrs_local_state");
  localStorage.removeItem("fazcorrs_dark_mode");

  alert("Browser data cleared.");

  location.reload();
}

function downloadCurrentBackup() {
  exportProjectJson();
}


/* =========================
   ERROR PANEL
========================= */

function renderErrorPanel(error) {
  return `
    <section class="panel">
      <h2>Unable to load dashboard</h2>

      <p>
        Please confirm that the following file exists:
      </p>

      <p>
        <b>data/project-data.json</b>
      </p>

      <p class="small">
        Error: ${error.message}
      </p>
    </section>
  `;
}


/* =========================
   STARTUP
========================= */

async function initDashboard() {
  try {
    await loadProjectData();

    initNavigation();
    initDarkMode();

    navigate("Dashboard");
  } catch (error) {
    console.error(error);

    const content = document.getElementById("content");

    if (content) {
      content.innerHTML = renderErrorPanel(error);
    }
  }
}

document.addEventListener("DOMContentLoaded", initDashboard);


/* =========================================================
   END OF dashboard.js
========================================================= */

