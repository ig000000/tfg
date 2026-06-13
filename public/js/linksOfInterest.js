let linksData = [];

//load link
async function loadLinks() {
  const res = await fetch("/settings", {
    credentials: "include"
  });

  const data = await res.json();
  linksData = data.links || [];

  renderLinks();
}

//render link
function renderLinks() {
  const container = document.getElementById("linksContainer");
  container.innerHTML = "";

  linksData.forEach((link, i) => {
    container.innerHTML += `
      <div class="link-item">
        <input value="${link.title}" 
          onchange="updateLink(${i}, 'title', this.value)">

        <input value="${link.url}" 
          onchange="updateLink(${i}, 'url', this.value)">

        <label data-i18n="${translations[currentLang].visible}">
          Visible
          <input type="checkbox" ${link.visible ? "checked" : ""} 
            onchange="updateLink(${i}, 'visible', this.checked)">
        </label>

        <button onclick="deleteLink(${i})" data-i18n="${translations[currentLang].eliminate}">Eliminar</button>
      </div>
    `;
  });
}

//addLink
function addLink() {
  linksData.push({
    title: "titulo",
    url: "url",
    visible: true
  });

  renderLinks();
}

//updatelink
function updateLink(index, field, value) {
  linksData[index][field] = value;
}

//saveLink
async function saveLinks() {
  const resSettings = await fetch("/settings", {
    credentials: "include"
  });

  const settings = await resSettings.json();

  settings.links = linksData;

  await fetch("/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(settings)
  });

  alert("Los cambios se han guardado");
}

//4. MOSTRAR LINKS EN LA WEB
async function loadPublicLinks() {
  const res = await fetch("/settings");
  const data = await res.json();

  const container = document.getElementById("links");
  const title = document.getElementById("VisibleLinks");
  const aside = document.querySelector(".links-of-interest");

  container.innerHTML = "";

  const visibleLinks = (data.links || []).filter(link => link.visible);

  // Si no hay links visibles → ocultar todo
  if (visibleLinks.length === 0) {
    aside.style.display = "none";
    return;
  }

  // Si hay links → mostrar
  aside.style.display = "block";

  visibleLinks.forEach(link => {
    container.innerHTML += `
      <li><a href="${link.url}" target="_blank">${link.title}</a></li>
    `;
  });
}

//Eliminar link
 function deleteLink(index) {

  const confirmDelete = confirm("¿Seguro que quieres Eliminar este link?");
  if (!confirmDelete) return;

  linksData.splice(index, 1);
  renderLinks();

  saveLinks();
}