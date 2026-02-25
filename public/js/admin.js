///
const table = document.getElementById('usersTable');
let data;
//let currentLang = localStorage.getItem("lang") || "ES";
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
    credentials: 'include',
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
  const res = await fetch(`/users/${id}`, { 
    method: 'DELETE' });

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
  await fetch(`/users/${id}/status`, { 
    method: 'PATCH' });
  loadUsers();
}

//eventos sin boton
document.getElementById("searchUser").addEventListener("input", loadUsers);
document.getElementById("filterRole").addEventListener("change", loadUsers);

//Quill ##########

const quillLicencia = new Quill('#editorLicencia', {
  theme: 'snow'
});

const quillContribucion = new Quill('#editorContribucion', {
  theme: 'snow'
});

//añadir contenido
async function loadContent() {
  const res = await fetch('/content');
  data = await res.json();

  updateEditors();
  //quillLicencia.root.innerHTML = data.licencia.content;
  //quillContribucion.root.innerHTML = data.contribucion.content;
}

//Guardar licencia
async function saveLicencia() {
  const text = quillLicencia.root.innerHTML;
  console.log("CLICK GUARDAR");

  try {
    const res = await fetch('/content/licencia', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        lang: currentLang,
        text
      })
    });

    console.log("RESPUESTA STATUS:", res.status);

    const data = await res.json();
    console.log("DATA:", data);

  } catch (err) {
    console.error("ERROR:", err);
  }

  loadContent();
}

//Guardar contribución
async function saveContribucion() {
  const text = quillContribucion.root.innerHTML;

  await fetch('/content/contribucion', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      lang: currentLang,
      text
    })
  });

  loadContent();
}

//Cambiar contenido editor idiomas
function updateEditors() {
  //console.log(contentData.licencia)
  quillLicencia.root.innerHTML = data.licencia[currentLang] || "";
  quillContribucion.root.innerHTML = data.contribucion[currentLang] || "";
}

//idioma
document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {
    updateEditors();
  });
});

//DOM
loadContent();
loadUsers();