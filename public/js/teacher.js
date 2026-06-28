//variables global
let box;
let quill;
let currentPage = 1;
const articlesPerPage = 3;


//editar lección
async function editArticle(id) {
  const res = await fetch(`/api/articles/${id}`);
  const a = await res.json();

  document.getElementById("articleId").value = a.id;
  document.getElementById("title").value = a.title;
  document.getElementById("lang").value = a.tags[0]
  document.getElementById("author").value = a.author;
  document.getElementById("date").value = a.date;
  document.getElementById("summary").value = a.summary;
  document.getElementById("tags").value = a.tags.slice(1).join(",");
   quill.root.innerHTML = a.content;
}

async function deleteArticle(id) {
  if (!confirm(translations[currentLang].deleteLesson)) return;

  await fetch(`/api/articles/${id}`, { method: "DELETE" });
  loadAdminArticles();
}

//guardar otro idioma
document.getElementById("saveOtherlang").addEventListener("click", async () => {
  const lang = document.getElementById("lang").value.trim();
  const titleValue = title.value.trim();
  const authorValue = author.value.trim();
  const dateValue = date.value.trim();
  const summaryValue = summary.value.trim();

  //Procesar tags 
  const extraTags = tags.value
    .split(",")
    .map(t => t.trim())
    .filter(t => t.length > 0);

  if (!lang || !titleValue || !authorValue || !dateValue || !extraTags) {
    alert(translations[currentLang].mandatory)
    return;
  }

   // añadir idioma como PRIMER tag
  const finalTags = [lang, ...extraTags];

  const article = {
    title: titleValue,
    author: authorValue,
    date: dateValue,
    summary: summaryValue,
    content: quill.root.innerHTML,
    tags: finalTags
  };

  const id = document.getElementById("articleId").value;

  let res;

  if (id) {
    res = await fetch(`/api/articles/lang/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json"},
      body: JSON.stringify(article)
    });
  } else {
    res = await fetch(`/api/articles`, {
      method: "POST",
      headers: { "Content-Type": "application/json"},
      body: JSON.stringify(article)
    });
  }

  if(!res.ok){
    alert(translations[currentLang].errsave);
  } else {
    clearForm();
    loadAdminArticles();
    alert(translations[currentLang].lsave);
  }
})

//guardar
document.getElementById("saveBtn").addEventListener("click", async () => {

  const lang = document.getElementById("lang").value.trim();
  const titleValue = title.value.trim();
  const authorValue = author.value.trim();
  const dateValue = date.value.trim();
  const summaryValue = summary.value.trim();

  //Procesar tags
  const extraTags = tags.value
    .split(",")
    .map(t => t.trim())
    .filter(t => t.length > 0);

  if (!lang || !titleValue || !authorValue || !dateValue || !extraTags) {
    alert(translations[currentLang].mandatory)
    return;
  }

  //  → añadir idioma como PRIMER tag
  const finalTags = [lang, ...extraTags];

  const article = {
    title: titleValue,
    author: authorValue,
    date: dateValue,
    summary: summaryValue,
    content: quill.root.innerHTML,
    tags: finalTags
  };

  const id = document.getElementById("articleId").value;

  let res;

  if (id) {
    res = await fetch(`/api/articles/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json"},
      body: JSON.stringify(article)
    });
  } else {
    res = await fetch(`/api/articles`, {
      method: "POST",
      headers: { "Content-Type": "application/json"},
      body: JSON.stringify(article)
    });
  }

  if(!res.ok){
    alert(translations[currentLang].errsave);
  } else {
    clearForm();
    loadAdminArticles();
    alert(translations[currentLang].lsave);
  }
});

async function saveArticle() {
  const id = document.getElementById("articleId").value;
  const contentHTML = quill.root.innerHTML;

  const article = {
    title: title.value,
    author: author.value,
    date: date.value,
    summary: generateSummaryFromContent(contentHTML),
    content: contentHTML,
    tags: buildTags()
  };

  let res;

  if (id) {
    // EDITAR
    res = await fetch(`/api/articles/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(article)
    });
  } else {
    // CREAR
    res = await fetch("/api/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(article)
    });
  }

  if (!res.ok) {
    alert(translations[currentLang].errsave);
    return;
  }

  alert(translations[currentLang].lsave);
  clearForm();
  loadAdminArticles();
}

document.getElementById("clearBtn").addEventListener("click", clearForm);

//obtener fecha
function getDate(){
  return new Date().toISOString().split("T")[0];
}

//Limpiar Formulario
function clearForm() {
  articleId.value = "";
  title.value = "";
  author.value = "";
  date.value = getDate();

  summary.value = "";
  quill.root.innerHTML = "";
  tags.value = "";
}

//filtro
const adminLangFilter = document.getElementById("adminLangFilter");
const adminSearchInput = document.getElementById("adminSearchInput");
const adminSearchBtn = document.getElementById("adminSearchBtn");
const adminArticlesList = document.getElementById("adminArticlesList");

async function loadAdminArticles() {
  const lang = adminLangFilter.value;
  const search = adminSearchInput.value.trim();

  let url = "/api/articles?all=true";

  if (lang) url += `&tag=${lang}&`;
  if (search) url += `&q=${search}`;

  const res = await fetch(url);
  const data = await res.json();

  const articles = data.articles;

  //paginación
  const totalPages = Math.ceil(articles.length / articlesPerPage);

  // PAGINACIÓN
  const start = (currentPage - 1) * articlesPerPage;
  const end = start + articlesPerPage;
  const visible = articles.slice(start, end);

  adminArticlesList.innerHTML = "";

  if (!articles.length) {
    adminArticlesList.innerHTML = `<p>${translations[currentLang].nolessons}</p>`;
    return;
  }

  visible.forEach(article => {
    const div = document.createElement("div");
    div.classList.add("admin-article-item");


    div.innerHTML = `
      <strong>${article.title}</strong> - ${article.tags.join(", ")}
      <button onclick="editArticle(${article.id})" class="login-btn">${translations[currentLang].select}</button>
      <button onclick="deleteArticle(${article.id})" class="delete-btn">${translations[currentLang].clear2}</button>
    `;
    adminArticlesList.appendChild(div);

    // INFO DE PÁGINA
    document.getElementById("pageInfo").textContent =
      `${currentPage} / ${totalPages || 1}`;

    // BOTONES
    document.getElementById("prevBtn").disabled = currentPage === 1;
    document.getElementById("nextBtn").disabled = currentPage === totalPages;
  });
}

// <- EVENTOS ->
document.getElementById("prevBtn").addEventListener("click", () => {
  currentPage--;
  loadAdminArticles();
});

document.getElementById("nextBtn").addEventListener("click", () => {
  currentPage++;
  loadAdminArticles();
});

// botón buscar
adminSearchBtn.addEventListener("click", loadAdminArticles);

// cargar todo al entrar
document.addEventListener("DOMContentLoaded", loadAdminArticles);

//Función para cargar lecciones
async function loadArticleToForm(id) {
  const res = await fetch(`/api/articles/${id}`);

  if (!res.ok) {
    alert(translations[currentLang].noclessons);
    return;
  }

  const article = await res.json();

  // rellenar formulario
  document.getElementById("articleId").value = article.id;
  document.getElementById("title").value = article.title;
  document.getElementById("author").value = article.author;
  document.getElementById("date").value = article.date;
  document.getElementById("summary").value = article.summary;

  // tags
  document.getElementById("lang").value =
    article.tags.find(t => ["ES", "EU", "EN"].includes(t));

  document.getElementById("tags").value =
    article.tags.filter(t => !["ES", "EU", "EN"].includes(t)).join(", ");

  // contenido (Quill)
  quill.root.innerHTML = article.content;
}

//idioma
document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {
    loadAdminArticles();
    loadIdeasAdmin();
  });
});

//link lección
document.getElementById("linkLessonBtn").addEventListener("click", async () => {
  const res = await fetch("/api/articles?all=true");
  const data = await res.json();

  const lessonTitles = data.articles
    .map(a => `${a.id} - ${a.title}`)
    .join("\n");

  const choice = prompt(
    //"Escribe el ID de la lección que quieres enlazar:\n\n" + lessonTitles
    translations[currentLang].linkLeson + lessonTitles
  );

  if (!choice) return;

  const article = data.articles.find(a => a.id == choice);
  if (!article) return alert(translations[currentLang].invalidLesson);

  const range = quill.getSelection();
  if (!range) return  alert(translations[currentLang].selectTextfirst);

  quill.format("link", `/article.html?id=${article.id}`);
});

/* ================= IDEAS ================= */

const ideaTitle = document.getElementById("ideaTitle");
const ideaDescription = document.getElementById("ideaDescription");
const addIdeaBtn = document.getElementById("addIdeaBtn");
const adminIdeasList = document.getElementById("adminIdeasList");

async function loadIdeasAdmin() {
  const res = await fetch("/api/ideas");
  const ideas = await res.json();

  adminIdeasList.innerHTML = "";

  ideas.forEach(i => {
    const div = document.createElement("div");
    div.className = "idea-card";

    div.innerHTML = `
      <strong>${i.title}</strong>
      <p>${i.description}</p>
      <small>${i.date}</small>
      <br>
      <button onclick="deleteIdea(${i.id})" data-id="${i.id}" class="delete-btn">🗑 ${translations[currentLang].clear2}</button>
    `;

    adminIdeasList.appendChild(div);
  });
}

async function deleteIdea(id) {
  if (!confirm(translations[currentLang].deleteIdea)) return;

  const res = await fetch(`/api/ideas/${id}`, {
    method: "DELETE"
  });

  if (!res.ok) {
    alert(translations[currentLang].errDelete);
    return;
  } else {
    alert(translations[currentLang].deleteIdeacorrect);
    loadIdeasAdmin();
  }
}

addIdeaBtn.addEventListener("click", async () => {
 
  if (!ideaTitle.value || !ideaDescription.value) {
    alert(translations[currentLang].mandatoryIdea);
    return;
  }

  const res = await fetch("/api/ideas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      title: ideaTitle.value,
      description: ideaDescription.value,
    })
  });

  if(!res.ok){
    alert(translations[currentLang].errsave);
  } else {
    ideaTitle.value = "";
    ideaDescription.value = "";

    alert(translations[currentLang].saveIdea)

    loadIdeasAdmin();
  }
});

//DOM
document.addEventListener("DOMContentLoaded", () => {
  box = document.getElementById("adminArticlesList");

  if (!box) {
    console.error("adminArticlesList no existe");
    return;
  }

  quill = new Quill("#editor", {
    theme: "snow",
    modules: {
      toolbar: [
        ["bold", "italic", "underline"],
        ["link", "image"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["clean"]
      ]
    }
  });

  clearForm();
  loadAdminArticles();
  loadIdeasAdmin();
});