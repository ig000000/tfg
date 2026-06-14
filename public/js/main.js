// Parametros
let currentLang;

let currentSearch = "";
let currentSort = "date";
let currentOrder = "desc";
let currentPage = 1;

//
const urlParams = new URLSearchParams(window.location.search);
let selectedTopic = urlParams.get("topic");

//funciones
//async function loadArticles() {
async function loadArticles(page = 1) {

  //const url = `/api/articles?tag=${currentLang}&q=${encodeURIComponent(currentSearch)}&sort=${currentSort}&order=${currentOrder}`;
  let url = `/api/articles?tag=${currentLang}&q=${encodeURIComponent(currentSearch)}&sort=${currentSort}&order=${currentOrder}`;

  currentPage = page;

  if (selectedTopic) {
    url += `&topic=${encodeURIComponent(selectedTopic)}`;
  }
  url += `&page=${currentPage}`;

  const res = await fetch(url);
  const data = await res.json();

  const container = document.getElementById("articles");

  if (!data.articles.length) {
    container.innerHTML = `<p>${translations[currentLang].noArticles}</p>`;
    return;
  }

  renderArticles(data.articles)
  renderPagination(data.pagination);
}

//renderizar lecciones
function renderArticles(articles) {
  const container = document.getElementById("articles");
  container.innerHTML = "";

  articles.forEach(a => {
    container.innerHTML += `
      <div class="article">
        <h3>${a.title}</h3>
        <p><em>${a.author}</em></p>
        <p>${a.summary || ""}</p>
        <p><small>${a.date}</small></p>
        <a href="article.html?id=${a.id}">${translations[currentLang].readMore}</a>
      </div>
    `;
  });
}

//Buscar lección por título
async function searchAndShowSingleArticle() {
  const searchValue = document.getElementById("searchInput").value.trim();
  const container = document.getElementById("articles");

  if (!searchValue) {
    container.innerHTML = "<p>Escribe algo para buscar.</p>";
    return;
  }

  const res = await fetch(`/api/articles?tag=${currentLang}&q=${encodeURIComponent(searchValue)}`);
  const articles = await res.json();

  container.innerHTML = "";

  if (articles.length === 0) {
    container.innerHTML = "<p>No se encontró ninguna lección con ese texto.</p>";
    return;
  }

  articles.forEach(article => {
    container.innerHTML += `
      <article>
        <h2>${article.title}</h2>
        <p><em>${article.author} — ${article.date}</em></p>
        <p>${article.summary}</p>
        <a href="article.html?id=${article.id}">Leer más...</a>
      </article>
      <hr>
    `;
  });

}

//Pulsar boton de búsqueda
document.getElementById("searchButton").addEventListener("click", () => {
  currentSearch = document.getElementById("searchInput").value.trim();

  //Para no filtro doble
  selectedTopic = "";

  loadArticles(1);
});


// Cambiar idioma
function changeLanguage(lang) {
  currentLang = lang;      // Actualizar idioma
  // Guardar idioma en localStorage
  localStorage.setItem("preferredLanguage", currentLang);
  applyTranslations();
  loadArticles(1);          // Cargar las lecciones
}


function applyTranslations() {
  
  const t = translations[currentLang];

  // Textos normales
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    el.innerHTML = t[key] || key;
  });

  // PLACEHOLDERS
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    el.placeholder = t[key] || key;

  });
}


// --- SISTEMA DE TABS ---
const tabs = document.querySelectorAll(".tab");

tabs.forEach(tab => {
  tab.addEventListener("click", () => {

    // quitar active a todas
    tabs.forEach(t => t.classList.remove("active"));

    // activar la pulsada
    tab.classList.add("active");

    // cambiar idioma
    currentLang = tab.getAttribute("data-tag");
    loadArticles(1);
  });
});

//idioma
document.querySelectorAll(".tab").forEach(tab => {
  if (tab.getAttribute("data-tag") === currentLang)
    tab.classList.add("active");

  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    changeLanguage(tab.getAttribute("data-tag"));
  });
});

// Renderizar la paginación
function renderPagination(pagination) {
  const container = document.getElementById("pagination");
  container.innerHTML = "";

  if (pagination.totalPages <= 1) return;

  for (let i = 1; i <= pagination.totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;

    if (i === pagination.currentPage) {
      btn.disabled = true;
    }

    btn.addEventListener("click", () => {
      loadArticles(i);
    });

    container.appendChild(btn);
  }
}

//-------------PARA poner OTROS HTML ------------
//settings poner
async function settings(lang) {
  const res = await fetch("/settings");
  const settings = await res.json();
  
  document.getElementById("name").innerHTML = settings.siteName;

  if (lang) {
    loadDefaultLang(settings);
  }
}

//idioma por defecto
async function loadDefaultLang(settings) {
  //currentLang = settings.defaultLang;
  changeLanguage(settings.defaultLang);
  aply();
}

function aply(){
  document.querySelectorAll(".tab").forEach(tab => {
    tab.classList.toggle("active", tab.getAttribute("data-tag") === currentLang);
  });
}

// Iniciar
document.addEventListener("DOMContentLoaded", () => {
  // Recuperar idioma almacenado o usar ES por defecto
  const savedLang = localStorage.getItem("preferredLanguage");
  if (!savedLang){
    settings(!savedLang);
  } else {
    settings(!savedLang);
    changeLanguage(savedLang);
    aply()
  }
});

//Para ordenar
document.getElementById("sortBtn").addEventListener("click", () => {
  currentSort = document.getElementById("sortField").value;
  currentOrder = document.getElementById("sortOrder").value;
  loadArticles(1);
});