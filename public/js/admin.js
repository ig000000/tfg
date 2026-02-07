//variables global
let box;
let quill;

async function editArticle(id) {
  const res = await fetch(`/api/articles/${id}`);
  const a = await res.json();

  //document.getElementById("id").value = a.id;
  document.getElementById("articleId").value = a.id;
  document.getElementById("title").value = a.title;
  document.getElementById("author").value = a.author;
  document.getElementById("date").value = a.date;
  document.getElementById("summary").value = a.summary;
  //document.getElementById("content").value = a.content;
  //document.getElementById("content").innerHTML = a.content;
  //quill.root.innerHTML = a.content;
  document.getElementById("tags").value = a.tags.join(",");
}

async function deleteArticle(id) {
  if (!confirm("¿Borrar lección?")) return;

  await fetch(`/api/articles/${id}`, { method: "DELETE" });
  loadAdminArticles();
  //loadArticles();
}

//guardar
document.getElementById("saveBtn").addEventListener("click", async () => {

  const lang = document.getElementById("lang").value.trim();
  const titleValue = title.value.trim();
  const authorValue = author.value.trim();
  const dateValue = date.value.trim();
  const summaryValue = summary.value.trim();
  //const contentValue = content.value.trim();

  //if (!lang || !titleValue || !authorValue || !dateValue || !summaryValue || !contentValue) {
  if (!lang || !titleValue || !authorValue || !dateValue) {
    //alert("Todos los campos son obligatorios");
    alert(translations[currentLang].mandatory)
    return;
  }

  // Procesar tags → añadir idioma como PRIMER tag
  const extraTags = tags.value
    .split(",")
    .map(t => t.trim())
    .filter(t => t.length > 0);

  const finalTags = [lang, ...extraTags];

  const article = {
    title: titleValue,
    author: authorValue,
    date: dateValue,
    summary: summaryValue,
    //content: contentValue,
    content: quill.root.innerHTML,
    tags: finalTags
  };

  const id = document.getElementById("articleId").value;

  if (id) {
    await fetch(`/api/articles/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json"},
      body: JSON.stringify(article)
    });
  } else {
    await fetch(`/api/articles`, {
      method: "POST",
      headers: { "Content-Type": "application/json"},
      body: JSON.stringify(article)
    });
  }

  clearForm();
  loadAdminArticles();
  //loadArticles();
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
  console.log("#########")

  if (id) {
    // ✏️ EDITAR
    console.log(article)
    res = await fetch(`/api/articles/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(article)
    });
  } else {
    // 🆕 CREAR
    console.log(article)
    res = await fetch("/api/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(article)
    });
  }

  if (!res.ok) {
    //alert("Error al guardar");
    alert(translations[currentLang].errsave);
    return;
  }

  //alert("Artículo guardado correctamente");
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
  //id.value = "";
  articleId.value = "";
  title.value = "";
  author.value = "";
  //date.value = "";
  date.value = getDate();

  summary.value = "";
  //content.value = "";
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

  //let url = "/api/articles?";
  let url = "/api/articles?all=true";

  if (lang) url += `tag=${lang}&`;
  if (search) url += `q=${search}`;

  const res = await fetch(url);
  const data = await res.json();

  const articles = data.articles;
  console.log(data);

  adminArticlesList.innerHTML = "";

  if (!articles.length) {
    //adminArticlesList.innerHTML = "<p>No se encontraron lecciones.</p>";
    adminArticlesList.innerHTML = `<p>${translations[currentLang].nolessons}</p>`;
    //translations[currentLang].nolessons
    return;
  }

  articles.forEach(article => {
    const div = document.createElement("div");
    div.classList.add("admin-article-item");

    console.log(currentLang);

    div.innerHTML = `
      <strong>${article.title}</strong> - ${article.tags.join(", ")}
      <button onclick="selectArticle(${article.id})">${translations[currentLang].select}</button>
      <button onclick="deleteArticle(${article.id})">${translations[currentLang].clear2}</button>
    `;
    //<button onclick="selectArticle(${article.id})">Seleccionar</button>
    //<button onclick="deleteArticle(${article.id})">Borrar</button>
    //<button onclick="selectArticle(${article.id})">${translations[currentLang].select}</button>
    //<button onclick="deleteArticle(${article.id})">${translations[currentLang].clear2}</button>
    adminArticlesList.appendChild(div);
  });
}

// botón buscar
adminSearchBtn.addEventListener("click", loadAdminArticles);

// cargar todo al entrar
document.addEventListener("DOMContentLoaded", loadAdminArticles);

// función al seleccionar para editar/borrar
function selectArticle(id) {
  //console.log("Artículo seleccionado:", id);

  // Aquí llamas a tu función actual de cargar datos en el formulario
  loadArticleToForm(id);
}

//Función para cargar lecciones
async function loadArticleToForm(id) {
  const res = await fetch(`/api/articles/${id}`);

  if (!res.ok) {
    //alert("No se pudo cargar la lección");
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
  //document.getElementById("langSelect").value =
  document.getElementById("lang").value =
    article.tags.find(t => ["ES", "EU", "EN"].includes(t));

  //document.getElementById("extraTags").value =
  document.getElementById("tags").value =
    article.tags.filter(t => !["ES", "EU", "EN"].includes(t)).join(", ");

  // contenido (Quill)
  quill.root.innerHTML = article.content;
}

//
document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {
    loadAdminArticles();
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
  //alert("Lección no válida"); 

  const range = quill.getSelection();
  if (!range) return  alert(translations[currentLang].selectTextfirst);
  //alert("Selecciona texto primero");

  quill.format("link", `/article.html?id=${article.id}`);
});

//Posibles lecciones código
/* ================= IDEAS ================= */

const ideaTitle = document.getElementById("ideaTitle");
const ideaDescription = document.getElementById("ideaDescription");
const ideaAuthor = document.getElementById("ideaAuthor");
const ideaTags = document.getElementById("ideaTags");
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
      <small>${i.author} · ${i.date}</small>
      <br>
      <button data-id="${i.id}" class="deleteIdeaBtn">🗑 Borrar</button>
    `;

    adminIdeasList.appendChild(div);
  });

  document.querySelectorAll(".deleteIdeaBtn").forEach(btn => {
    btn.addEventListener("click", async () => {
      if (!confirm("¿Borrar esta idea?")) return;

      await fetch(`/api/ideas/${btn.dataset.id}`, {
        method: "DELETE"
      });

      loadIdeasAdmin();
    });
  });
}

addIdeaBtn.addEventListener("click", async () => {
 
  if (!ideaTitle.value || !ideaDescription.value) {
    alert("Título y descripción obligatorios");
    return;
  }

  await fetch("/api/ideas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      title: ideaTitle.value,
      description: ideaDescription.value,
      author: ideaAuthor.value || "Anónimo",
      tags: ideaTags.value.split(",").map(t => t.trim())
    })
  });

  ideaTitle.value = "";
  ideaDescription.value = "";
  ideaAuthor.value = "";
  ideaTags.value = "";

  loadIdeasAdmin();
});

//loadIdeasAdmin();


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

//func a ejecutar
//loadArticles();