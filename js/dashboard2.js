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
