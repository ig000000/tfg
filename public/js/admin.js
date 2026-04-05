///
const table = document.getElementById('usersTable');
let data;
let usersData = [];
//let currentLang = localStorage.getItem("lang") || "ES";
//let user;
///

//cargar usuarios
async function loadUsers() {
  const search = document.getElementById("searchUser").value;
  const role = document.getElementById("filterRole").value;

  const res = await fetch(`/users?search=${search}&role=${role}`);
  const users = await res.json();

  usersData = users;

  //const table = document.getElementById('usersTable');
  table.innerHTML = '';

  renderUsers(users);
}

async function createUser() {
  const username = document.getElementById('newUsername').value;
  //const password = document.getElementById('newPassword').value;
  const userNumber = document.getElementById("newUserNumber").value;

  const roles = [];
  if (document.getElementById('roleProfesor').checked) roles.push('teacher');
  if (document.getElementById('roleAdmin').checked) roles.push('admin');

  if (roles.length === 0) {
    alert("Debes seleccionar al menos un rol");
    return;
  }

  if (!userNumber) {
    alert("El número de usuario es obligatorio");
    return;
  }

  const res = await fetch('/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, userNumber, roles })
    //body: JSON.stringify({ username, userNumber, password, roles })
  });

  const data = await res.json();

  //console.log(data.tempPassword);
  alert(`
    Usuario creado correctamente

    Usuario: ${username}
    Contraseña temporal: ${data.tempPassword}

    El usuario deberá cambiarla al iniciar sesión.
  `);

  loadUsers();
}

//render users
function renderUsers(users){
    
  users.forEach(user => {  
    const tr = document.createElement('tr');
      
    tr.innerHTML = `
      <td>${user.username}</td>
      <td>

<label>
<input type="checkbox"
${user.roles.includes("teacher") ? "checked" : ""}
onchange="toggleRole(${user.id}, 'teacher', this.checked)">
Teacher
</label>

<label>
<input type="checkbox"
${user.roles.includes("admin") ? "checked" : ""}
onchange="toggleRole(${user.id}, 'admin', this.checked)">
Admin
</label>

</td>
      <td>${user.activo ? 'Activo' : 'Inactivo'}</td>
      <td>
        <button onclick="toggleStatus(${user.id})">Activar/Desactivar</button>
        <button onclick="deleteUser(${user.id})">Eliminar</button>
        <button onclick="resetPassword(${user.id})">
          Reset password
        </button>
      </td>
    `;
    //<td>${user.roles.join(', ')}</td>

    table.appendChild(tr);
  });
}

//delete
async function deleteUser(id) {

  //const confirmDelete = confirm("¿Seguro que quieres eliminar este usuario?");
  const confirmDelete = confirm("¿Seguro que quieres Desactivar este usuario?");

  if (!confirmDelete) return;

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
  loadDeletedUsers();
}

//usuarios eliminados mostrar
async function loadDeletedUsers() {
  const res = await fetch('/users/deleted');
  const users = await res.json();

  const table = document.getElementById("deletedUsersTable");
  const emptyMsg = document.getElementById("noDeletedUsers");

  table.innerHTML = "";

  //console.log(users);

  if (users.length === 0) {
    emptyMsg.style.display = "block";
    return;
  }

  emptyMsg.style.display = "none";

  users.forEach(user => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${user.username}</td>
      <td>${user.roles.join(", ")}</td>
      <td>${user.deletedAt ? new Date(user.deletedAt).toLocaleString() : "-"}</td>
      <td>
        <button class="restore-btn" onclick="restoreUser(${user.id})">
          Restaurar
        </button>
        <button class="delete-btn" onclick="deletePermanent(${user.id})">
          Eliminar permanentemente
        </button>
      </td>
    `;

    table.appendChild(row);
  });
}

//borrar usuarios permanentemente
async function deletePermanent(id) {
  if (!confirm("Eliminar permanentemente?")) return;

  await fetch(`/users/permanent/${id}`, {
    method: "DELETE"
  });

  loadDeletedUsers();
}

//boton restaurar usuarios
async function restoreUser(id) {
  if (!confirm("¿Restaurar este usuario?")) return;

  await fetch(`/users/restore/${id}`, {
    method: "PUT"
  });

  loadDeletedUsers();
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

//settings
//Cargar settings
async function loadSettings() {
  const res = await fetch("/settings", {
    credentials: "include"
  });

  const data = await res.json();

  document.getElementById("siteName").value = data.siteName;
  document.getElementById("defaultLang").value = data.defaultLang;
  document.getElementById("articlesPerPage").value = data.articlesPerPage;
  document.getElementById("logoFile").value = data.logo;
  document.getElementById("faviconFile").value = data.favicon;
}

//Guardar settings
async function saveSettings() {
  const body = {
    siteName: document.getElementById("siteName").value,
    defaultLang: document.getElementById("defaultLang").value,
    articlesPerPage: parseInt(document.getElementById("articlesPerPage").value),
    //logo: document.getElementById("logo").value,
    //favicon: document.getElementById("favicon").value
  };

  const res = await fetch("/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body)
  });

  const data = await res.json();
  alert(data.message);
}

//Subir logo
async function uploadLogo() {

  const file = document.getElementById("logoFile").files[0];

  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch("/upload/logo", {
    method: "POST",
    credentials: "include",
    body: formData
  });

  const data = await res.json();

  alert("Logo actualizado");
}

//subir favicon
async function uploadFavicon() {

  const file = document.getElementById("faviconFile").files[0];

  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch("/upload/favicon", {
    method: "POST",
    credentials: "include",
    body: formData
  });

  const data = await res.json();

  alert("Favicon actualizado");
}

//cambiar roles
window.toggleRole = async function(id, role, checked) {

  const user = usersData.find(u => u.id === id);

  let roles = [...user.roles];

  if (checked) {
    roles.push(role);
  } else {
    roles = roles.filter(r => r !== role);
  }

  if (roles.length === 0) {
    alert("El usuario debe tener al menos un rol");
    loadUsers();
    return;
  }
  //console.log("MMMMMMMMMMMMMMMMMMMMMMMMMMM");
  //console.log(roles);
  //console.log(id);

  const res = await fetch(`/users/${id}/roles`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ roles })
  });

  const data = await res.json();

  alert(data.message);

  loadUsers();
};

//reset contraseña
window.resetPassword = async function(id) {

  //const newPassword = prompt("Introduce la nueva contraseña:");

  //if (!newPassword) return;

  const res = await fetch(`/users/${id}/password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    //body: JSON.stringify({
    //  password: newPassword
    //})
  });

  const data = await res.json();

  //alert(data.message);
  alert(`
    ${data.message}

    Contraseña temporal: ${data.tempPassword}

    El usuario deberá cambiarla al iniciar sesión.
  `);

};

//________________________________________________________
//Leciones cargar
//filtro
const adminLangFilter = document.getElementById("adminLangFilter");
const adminSearchInput = document.getElementById("adminSearchInput");
const adminSearchBtn = document.getElementById("adminSearchBtn");
const adminArticlesList = document.getElementById("adminArticlesList");

async function loadAdminArticles() {
  const lang = adminLangFilter.value;
  const search = adminSearchInput.value.trim();

  console.log(lang);
  console.log(search);

  let url = "/api/articles?all=true";

  if (lang) url += `&tag=${lang}&`;
  if (search) url += `&q=${search}`;

  const res = await fetch(url);
  const data = await res.json();

  const articles = data.articles;
  console.log(data);

  adminArticlesList.innerHTML = "";

  if (!articles.length) {
    adminArticlesList.innerHTML = `<p>${translations[currentLang].nolessons}</p>`;
    return;
  }

  articles.forEach(article => {
    const div = document.createElement("div");
    div.classList.add("admin-article-item");

    //console.log(currentLang);

    div.innerHTML = `
      <strong>${article.title}</strong> - ${article.tags.join(", ")}
      <button onclick="deleteArticle(${article.id})">${translations[currentLang].clear2}</button>
    `;
    adminArticlesList.appendChild(div);
  });
}

//borrar lecciones
async function deleteArticle(id) {
  //if (!confirm("¿Borrar lección?")) return;
  if (!confirm(translations[currentLang].deleteLesson)) return;

  await fetch(`/api/articles/${id}`, { method: "DELETE" });
  loadAdminArticles();
}

// botón buscar
adminSearchBtn.addEventListener("click", loadAdminArticles);

//DOM
loadContent();
loadUsers();
loadSettings();
loadDeletedUsers();
//----
loadAdminArticles();