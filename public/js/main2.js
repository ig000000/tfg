// Parametros
let currentLang = localStorage.getItem("lang") || "ES";

let currentSearch = "";
let currentSort = "date";
let currentOrder = "desc";

//funciones
//async function loadArticles() {

//  const url = `/api/articles?tag=${currentLang}&q=${encodeURIComponent(currentSearch)}&sort=${currentSort}&order=${currentOrder}`;

//  const res = await fetch(url);
//  const articles = await res.json();

//  const container = document.getElementById("articles");
//  container.innerHTML = "";

//  if (!articles.length) {
//    container.innerHTML = `<p>${translations[currentLang].noArticles}</p>`;
//    return;
//  }

//  articles.forEach(a => {
//    container.innerHTML += `
//      <div class="article">
//        <h3>${a.title}</h3>
//        <p><em>${a.author}</em></p>
//        <p>${a.summary || ""}</p>
//        <p><small>${a.date}</small></p>
//        <a href="article.html?id=${a.id}">Leer más...</a>
//      </div>
//    `;
//  });
//}


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

// Cambiar idioma
function changeLanguage(lang) {
  currentLang = lang;      // 1️⃣ Actualizamos idioma
  // Guardar idioma en localStorage
  localStorage.setItem("preferredLanguage", currentLang);
  applyTranslations();
  //loadArticles();          // 3️⃣ Cargar las lecciones
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
    //if (translations[lang][key]) {
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
    //currentTag = tab.getAttribute("data-tag");
    currentLang = tab.getAttribute("data-tag");
    //loadArticles();
  });
});

//#########
document.querySelectorAll(".tab").forEach(tab => {
  if (tab.getAttribute("data-tag") === currentLang)
    tab.classList.add("active");

  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    changeLanguage(tab.getAttribute("data-tag"));
  });
});

// Iniciar
document.addEventListener("DOMContentLoaded", () => {

  
  // 🔹 Recuperar idioma almacenado o usar ES por defecto
  const savedLang = localStorage.getItem("preferredLanguage");
  currentLang = savedLang || "ES";

  // 🔹 (Opcional) marcar el tab correcto activo
  document.querySelectorAll(".tab").forEach(tab => {
    tab.classList.toggle("active", tab.getAttribute("data-tag") === currentLang);
  });
  
  applyTranslations();
  //loadArticles();
});

//Para ordenar
//document.getElementById("sortBtn").addEventListener("click", () => {
//  currentSort = document.getElementById("sortField").value;
//  currentOrder = document.getElementById("sortOrder").value;
//  loadArticles();
//});