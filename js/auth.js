const ACCOUNTS = {
  admin: { password: 'Admin@123', name: 'Administrator', role: 'System Administrator' },
  amir: { password: 'Amir@123', name: 'Amir Abd Aziz', role: 'Project Manager' },
  mustaza: { password: 'Mustaza@123', name: 'Mustaza', role: 'Product Engineer' },
  najwa: { password: 'Najwa@123', name: 'Najwa', role: 'Software Engineer' },
  aimar: { password: 'Aimar@123', name: 'Aimar', role: 'UI/UX Developer' },
  management: { password: 'Mgmt@123', name: 'Management Viewer', role: 'Executive Viewer' }
};

function login() {
  const username = document.getElementById('loginUser').value.trim().toLowerCase();
  const password = document.getElementById('loginPass').value;
  const user = ACCOUNTS[username];

  if (!user || user.password !== password) {
    document.getElementById('loginError').classList.remove('hidden');
    return;
  }

  localStorage.setItem('fazcorrs_user', JSON.stringify({ username, name: user.name, role: user.role }));
  window.location.href = 'dashboard.html';
}

function logout() {
  localStorage.removeItem('fazcorrs_user');
  window.location.href = 'login.html';
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem('fazcorrs_user') || 'null');
}

function requireAuth() {
  if (!getCurrentUser()) window.location.href = 'login.html';
}

function hydrateUser() {
  const user = getCurrentUser();
  if (!user) return;
  const name = document.getElementById('currentUserName');
  const role = document.getElementById('currentUserRole');
  if (name) name.textContent = user.name;
  if (role) role.textContent = user.role;
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && document.getElementById('loginUser')) login();
});
