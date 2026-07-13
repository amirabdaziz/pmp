
/* Phase 3 - ClickUp-style interactions */

function safeValue(v){ return String(v ?? "").replaceAll('"',"&quot;"); }
function nextTaskId(){
  const nums = state.tasks.map(t => Number(String(t.id).replace(/\D/g,""))).filter(Boolean);
  return "T-" + String((Math.max(0,...nums)+1)).padStart(3,"0");
}

function openTaskModal(id){
  const existing = id ? state.tasks.find(t => t.id === id) : null;
  const t = existing || {
    id: nextTaskId(),
    phaseNo:"Local",
    phase:"Local Task",
    scope:"",
    task:"",
    frontEnd:"Pending",
    backEnd:"Pending",
    corrsimEngine:"N/A",
    owner:"Amir",
    priority:"Medium",
    progress:0,
    status:"Not Started",
    remarks:""
  };

  document.body.insertAdjacentHTML("beforeend", `
    <div class="modal-backdrop" id="taskModal">
      <div class="modal">
        <div class="modal-head">
          <h2>${existing ? "Edit Task" : "Create Task"}</h2>
          <button class="secondary-btn" onclick="closeTaskModal()">Close</button>
        </div>

        <div class="form-grid">
          ${field("Task ID","id",t.id)}
          ${field("Phase No.","phaseNo",t.phaseNo)}
          ${field("Phase","phase",t.phase)}
          ${field("Scope / Module","scope",t.scope)}
          <div class="wide">${field("Task Name","task",t.task)}</div>
          ${selectField("Front End","frontEnd",t.frontEnd,["N/A","Pending","Backlog","In Progress","Completed"])}
          ${selectField("Back End","backEnd",t.backEnd,["N/A","Pending","Backlog","In Progress","Completed"])}
          ${selectField("Corrsim Engine","corrsimEngine",t.corrsimEngine,["N/A","Pending","Backlog","In Progress","Completed"])}
          ${field("Owner","owner",t.owner)}
          ${selectField("Priority","priority",t.priority,["Low","Medium","High","Critical"])}
          ${selectField("Status","status",t.status,["Not Started","Backlog","In Progress","Completed"])}
          ${field("Progress %","progress",t.progress,"number")}
          <div class="wide">${textField("Remarks","remarks",t.remarks)}</div>
        </div>

        <div class="modal-actions">
          <button class="primary-btn" onclick="saveTaskFromModal('${existing ? t.id : ""}')">Save Task</button>
          ${existing ? `<button class="danger-btn" onclick="deleteTaskFromModal('${t.id}')">Delete Task</button>` : ""}
        </div>
      </div>
    </div>
  `);
}

function field(label,id,value,type="text"){
  return `<div><label>${label}</label><input id="f_${id}" type="${type}" value="${safeValue(value)}"></div>`;
}
function textField(label,id,value){
  return `<div><label>${label}</label><textarea id="f_${id}" rows="4">${value ?? ""}</textarea></div>`;
}
function selectField(label,id,value,options){
  return `<div><label>${label}</label><select id="f_${id}">${options.map(o => `<option ${o===value?"selected":""}>${o}</option>`).join("")}</select></div>`;
}
function closeTaskModal(){
  document.getElementById("taskModal")?.remove();
}
function fv(id){ return document.getElementById("f_"+id).value; }

function saveTaskFromModal(oldId){
  const task = {
    id: fv("id"),
    phaseNo: fv("phaseNo"),
    phase: fv("phase"),
    scope: fv("scope"),
    task: fv("task"),
    frontEnd: fv("frontEnd"),
    backEnd: fv("backEnd"),
    corrsimEngine: fv("corrsimEngine"),
    owner: fv("owner"),
    priority: fv("priority"),
    status: fv("status"),
    progress: Number(fv("progress") || 0),
    remarks: fv("remarks")
  };

  if(oldId){
    const idx = state.tasks.findIndex(t => t.id === oldId);
    if(idx >= 0) state.tasks[idx] = task;
  } else {
    state.tasks.push(task);
  }

  recalculateDerivedData();
  saveLocalState();
  closeTaskModal();
  navigate(currentPage);
  showToast("Task saved");
}

function deleteTaskFromModal(id){
  state.tasks = state.tasks.filter(t => t.id !== id);
  recalculateDerivedData();
  saveLocalState();
  closeTaskModal();
  navigate(currentPage);
  showToast("Task deleted");
}

function saveLocalState(){
  localStorage.setItem("fazcorrs_phase3_state", JSON.stringify(state));
}

function loadLocalState(){
  const saved = localStorage.getItem("fazcorrs_phase3_state");
  if(saved){
    try{ state = JSON.parse(saved); }catch(e){}
  }
}

function resetLocalState(){
  localStorage.removeItem("fazcorrs_phase3_state");
  location.reload();
}

function recalculateDerivedData(){
  const tasks = state.tasks;

  state.project.progress = Math.round(tasks.reduce((s,t)=>s+(Number(t.progress)||0),0)/Math.max(1,tasks.length));

  const phaseNos = [...new Set(tasks.map(t=>t.phaseNo))];
  state.phases = phaseNos.map(phaseNo => {
    const group = tasks.filter(t=>t.phaseNo===phaseNo);
    const progress = Math.round(group.reduce((s,t)=>s+(Number(t.progress)||0),0)/group.length);
    const completed = group.filter(t=>t.status==="Completed").length;
    return {
      phaseNo,
      name: group[0]?.phase || phaseNo,
      total: group.length,
      completed,
      progress,
      status: progress>=95 ? "Completed" : progress>0 ? "In Progress" : "Not Started"
    };
  });

  const owners = [...new Set(tasks.map(t=>t.owner))];
  state.team = owners.map(owner => {
    const group = tasks.filter(t=>t.owner===owner);
    return {
      name: owner,
      role:"Project Team",
      tasks:group.length,
      completed:group.filter(t=>t.status==="Completed").length,
      ongoing:group.filter(t=>t.status==="In Progress").length,
      backlog:group.filter(t=>["Backlog","Not Started"].includes(t.status)).length,
      progress:Math.round(group.reduce((s,t)=>s+(Number(t.progress)||0),0)/group.length)
    };
  });

  const scopes = [...new Set(tasks.map(t=>t.scope))];
  state.modules = scopes.map(scope => {
    const group = tasks.filter(t=>t.scope===scope);
    const progress = Math.round(group.reduce((s,t)=>s+(Number(t.progress)||0),0)/group.length);
    return {
      name: scope || "Unassigned",
      owner: group[0]?.owner || "-",
      total: group.length,
      completed: group.filter(t=>t.status==="Completed").length,
      progress,
      status: progress>=95 ? "Completed" : progress>0 ? "In Progress" : "Not Started"
    };
  });
}

function showToast(message){
  let toast = document.getElementById("phase3Toast");
  if(!toast){
    toast = document.createElement("div");
    toast.id = "phase3Toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.remove("hidden");
  setTimeout(()=>toast.classList.add("hidden"),2200);
}

function exportProjectJson(){
  const blob = new Blob([JSON.stringify(state,null,2)], {type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "project-data-export.json";
  a.click();
}

function exportTasksCsv(){
  const headers = ["id","phaseNo","phase","scope","task","frontEnd","backEnd","corrsimEngine","owner","priority","progress","status","remarks"];
  const rows = state.tasks.map(t => headers.map(h => `"${String(t[h] ?? "").replaceAll('"','""')}"`).join(","));
  const csv = headers.join(",") + "\n" + rows.join("\n");
  const blob = new Blob([csv], {type:"text/csv"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "fazcorrs-tasks-export.csv";
  a.click();
}

function importProjectJson(input){
  const file = input.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try{
      const imported = JSON.parse(e.target.result);
      if(!imported.tasks) throw new Error("Invalid project data");
      state = imported;
      recalculateDerivedData();
      saveLocalState();
      navigate("Dashboard");
      showToast("Project JSON imported");
    }catch(err){
      alert("Invalid JSON file.");
    }
  };
  reader.readAsText(file);
}

function importTasksCsv(input){
  const file = input.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const lines = e.target.result.split(/\r?\n/).filter(Boolean);
    const headers = lines.shift().split(",").map(h=>h.replaceAll('"',"").trim());
    const tasks = lines.map(line => {
      const cells = parseCsvLine(line);
      const obj = {};
      headers.forEach((h,i)=>obj[h]=cells[i] ?? "");
      obj.progress = Number(obj.progress || 0);
      return obj;
    });
    state.tasks = tasks;
    recalculateDerivedData();
    saveLocalState();
    navigate("Tasks");
    showToast("CSV tasks imported");
  };
  reader.readAsText(file);
}

function parseCsvLine(line){
  const result=[]; let current=""; let quote=false;
  for(let i=0;i<line.length;i++){
    const char=line[i];
    if(char === '"' && line[i+1] === '"'){ current+='"'; i++; }
    else if(char === '"'){ quote = !quote; }
    else if(char === "," && !quote){ result.push(current); current=""; }
    else current += char;
  }
  result.push(current);
  return result;
}

function toggleDarkMode(){
  document.body.classList.toggle("dark");
  localStorage.setItem("fazcorrs_dark_mode", document.body.classList.contains("dark") ? "1" : "0");
}

function initDarkMode(){
  if(localStorage.getItem("fazcorrs_dark_mode")==="1") document.body.classList.add("dark");
}

function makeBoardDraggable(){
  document.querySelectorAll(".task-card").forEach(card => {
    card.draggable = true;
    card.addEventListener("dragstart", e => {
      card.classList.add("dragging");
      e.dataTransfer.setData("text/plain", card.dataset.id);
    });
    card.addEventListener("dragend", () => card.classList.remove("dragging"));
  });

  document.querySelectorAll(".board-col").forEach(col => {
    col.addEventListener("dragover", e => {
      e.preventDefault();
      col.classList.add("drag-over");
    });
    col.addEventListener("dragleave", () => col.classList.remove("drag-over"));
    col.addEventListener("drop", e => {
      e.preventDefault();
      col.classList.remove("drag-over");
      const id = e.dataTransfer.getData("text/plain");
      const status = col.dataset.status;
      const task = state.tasks.find(t=>t.id===id);
      if(task){
        task.status = status;
        if(status === "Completed") task.progress = 100;
        if(status === "Not Started") task.progress = 0;
        recalculateDerivedData();
        saveLocalState();
        navigate("Board");
        showToast(`Moved to ${status}`);
      }
    });
  });
}

/* Override / extend render functions from dashboard.js */

const originalRenderTasks = renderTasks;
renderTasks = function(){
  return `
    <section class="panel">
      <div class="panel-head">
        <h2>Excel Task Database</h2>
        <div class="top-actions">
          <button class="primary-btn" onclick="openTaskModal()">+ Add Task</button>
          <button onclick="exportTasksCsv()">Export CSV</button>
          <button onclick="exportProjectJson()">Export JSON</button>
        </div>
      </div>

      <div class="filter-row">
        <input id="taskSearch" oninput="filterTasks()" placeholder="Search task, owner, phase..." />
        <select id="phaseFilter" onchange="filterTasks()">
          <option value="">All phases</option>
          ${[...new Set(state.tasks.map(t=>t.phaseNo))].map(p=>`<option>${p}</option>`).join("")}
        </select>
        <select id="statusFilter" onchange="filterTasks()">
          <option value="">All status</option>
          ${[...new Set(state.tasks.map(t=>t.status))].map(s=>`<option>${s}</option>`).join("")}
        </select>
        <button onclick="resetLocalState()">Reset</button>
      </div>

      <div class="import-box">
        <b>Import / Export</b>
        <p class="small">Import JSON or CSV exported from this application. Browser import is saved locally.</p>
        <input type="file" accept=".json" onchange="importProjectJson(this)">
        <input type="file" accept=".csv" onchange="importTasksCsv(this)">
      </div>

      <br>
      <div class="table-wrap" id="taskTable">${taskTable(state.tasks)}</div>
    </section>
  `;
}

const originalTaskTable = taskTable;
taskTable = function(tasks){
  return `
    <table>
      <thead>
        <tr><th>ID</th><th>Phase / Scope</th><th>Task</th><th>FE</th><th>BE</th><th>Engine</th><th>Owner</th><th>Progress</th><th>Status</th><th>Action</th></tr>
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
            <td><button onclick="openTaskModal('${t.id}')">Edit</button></td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

filterTasks = function(){
  const q = document.getElementById("taskSearch")?.value.toLowerCase() || "";
  const ph = document.getElementById("phaseFilter")?.value || "";
  const st = document.getElementById("statusFilter")?.value || "";
  const filtered = state.tasks.filter(t =>
    (!q || JSON.stringify(t).toLowerCase().includes(q)) &&
    (!ph || t.phaseNo === ph) &&
    (!st || t.status === st)
  );
  document.getElementById("taskTable").innerHTML = taskTable(filtered);
}

renderBoard = function(){
  const statuses = ["Not Started", "Backlog", "In Progress", "Completed"];
  return `<div class="board">
    ${statuses.map(s => `
      <div class="board-col" data-status="${s}">
        <h3>${s}</h3>
        ${state.tasks.filter(t => t.status === s).map(t => `
          <div class="task-card" data-id="${t.id}" ondblclick="openTaskModal('${t.id}')">
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

const originalNavigate = navigate;
navigate = function(page){
  originalNavigate(page);
  if(page === "Board") setTimeout(makeBoardDraggable, 30);
}

document.addEventListener("DOMContentLoaded", () => {
  initDarkMode();
  setTimeout(() => {
    loadLocalState();
    const header = document.querySelector(".top-actions");
    if(header && !document.getElementById("darkToggle")){
      header.insertAdjacentHTML("afterbegin", `<button id="darkToggle" onclick="toggleDarkMode()">Dark Mode</button>`);
    }
  }, 300);
});
