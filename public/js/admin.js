///
const table = document.getElementById('usersTable');
//let user;
///

//cargar usuarios
async function loadUsers() {
  const search = document.getElementById("searchUser").value;
  const role = document.getElementById("filterRole").value;

  const res = await fetch(`/users?search=${search}&role=${role}`);
  const users = await res.json();

  //user = users;

  //const table = document.getElementById('usersTable');
  table.innerHTML = '';

  renderUsers(users);
}

async function createUser() {
  const username = document.getElementById('newUsername').value;
  const password = document.getElementById('newPassword').value;

  const roles = [];
  if (document.getElementById('roleProfesor').checked) roles.push('profesor');
  if (document.getElementById('roleAdmin').checked) roles.push('admin');

  await fetch('/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, roles })
  });

  loadUsers();
}
//render users
function renderUsers(users){

    
  users.forEach(user => {  
    const tr = document.createElement('tr');
      
    tr.innerHTML = `
      <td>${user.username}</td>
      <td>${user.roles.join(', ')}</td>
      <td>${user.activo ? 'Activo' : 'Inactivo'}</td>
      <td>
        <button onclick="toggleStatus(${user.id})">Activar/Desactivar</button>
        <button onclick="deleteUser(${user.id})">Eliminar</button>
      </td>
    `;

    table.appendChild(tr);
  });
}

//delete
async function deleteUser(id) {
  const res = await fetch(`/users/${id}`, { method: 'DELETE' });

  if (!res.ok) {
    const text = await res.text();
    console.error("Error backend:", text);
    alert("Error al eliminar usuario");
    return;
  }

  // solo parsear si hay JSON
  const data = await res.json();

  loadUsers();
}

//??
async function toggleStatus(id) {
  await fetch(`/users/${id}/status`, { method: 'PATCH' });
  loadUsers();
}

//eventos sin boton
document.getElementById("searchUser").addEventListener("input", loadUsers);
document.getElementById("filterRole").addEventListener("change", loadUsers);

//DOM
loadUsers();