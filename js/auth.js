
const accounts = {
  admin: { password: "Admin@123", name: "Administrator", role: "Administrator", avatar: "AD" },
  amir: { password: "Amir@123", name: "Amir Abd Aziz", role: "Project Manager", avatar: "AA" },
  mustaza: { password: "Mustaza@123", name: "Mustaza", role: "Product Engineer", avatar: "MU" },
  najwa: { password: "Najwa@123", name: "Najwa", role: "Software Engineer", avatar: "NJ" },
  aimar: { password: "Aimar@123", name: "Aimar", role: "UI/UX Developer", avatar: "AI" },
  management: { password: "Mgmt@123", name: "Management Viewer", role: "Executive", avatar: "MG" }
};

function login() {
  const username = document.getElementById("loginUser").value.trim().toLowerCase();
  const password = document.getElementById("loginPass").value;

  if (accounts[username] && accounts[username].password === password) {
    localStorage.setItem("fazcorrs_current_user", JSON.stringify({ username, ...accounts[username] }));
    window.location.href = "dashboard.html";
    return;
  }

  document.getElementById("loginError").classList.remove("hidden");
}

function requireLogin() {
  const user = JSON.parse(localStorage.getItem("fazcorrs_current_user") || "null");
  if (!user) {
    window.location.href = "login.html";
    return null;
  }

  const sideUser = document.getElementById("sideUser");
  const sideRole = document.getElementById("sideRole");
  const topAvatar = document.getElementById("topAvatar");

  if (sideUser) sideUser.textContent = user.name;
  if (sideRole) sideRole.textContent = user.role;
  if (topAvatar) topAvatar.textContent = user.avatar;

  return user;
}

function logout() {
  localStorage.removeItem("fazcorrs_current_user");
  window.location.href = "login.html";
}
