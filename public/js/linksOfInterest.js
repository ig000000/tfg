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

        <label>
          Visible
          <input type="checkbox" ${link.visible ? "checked" : ""} 
            onchange="updateLink(${i}, 'visible', this.checked)">
        </label>

        <button onclick="deleteLink(${i})">Eliminar</button>
      </div>
    `;
  });
}

//addLink
function addLink() {
  linksData.push({
    title: "",
    url: "",
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

  alert("Links guardados");
}

//4. MOSTRAR LINKS EN LA WEB
async function loadPublicLinks() {
  const res = await fetch("/settings");
  const data = await res.json();

  const container = document.getElementById("links");

  data.links
    .filter(link => link.visible)
    .forEach(link => {
      container.innerHTML += `
        <li><a href="${link.url}" target="_blank">${link.title}</a></li>
      `;
    });
}