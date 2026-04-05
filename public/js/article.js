const params = new URLSearchParams(location.search);
const id = params.get("id");

// Cargar artículo
async function loadArticle() {
  try{
    const res = await fetch(`/api/articles/${id}`);
    const article = await res.json();

    console.log(article.id);


    if(article.id){
      document.getElementById("content").innerHTML = `
      <h1>${article.title}</h1>
      <p><em>${article.author} — ${article.date}</em></p>
      <div class="ql-editor">${article.content}</div>
    `
    } else{
      document.getElementById("content").innerHTML = `
      No se ha encontrado la lección seleccionada.`;
    }
    
  } catch (err) {
    document.getElementById("content").innerHTML = `
    No se ha encontrado la lección seleccionada.`;
  }
 
}

// Cargar comentarios
async function loadComments() {
  const res = await fetch(`/api/articles/${id}/comments`);
  const comments = await res.json();

  const container = document.getElementById("comments");
  container.innerHTML = "";

  if (!comments.length) {
    container.innerHTML = `<p>${translations[currentLang].noComments}</p>`;
    return;
  }
  //<p>No hay comentarios todavía.</p>

  comments.forEach(c => {
    container.innerHTML += `
      <div class="comment">
        <strong>${c.name}</strong>
        <small>(${new Date(c.date).toLocaleString()})</small>
        <p>${c.comment}</p>
      </div>
    `;
  });
}

// Enviar comentario
document.getElementById("sendComment").addEventListener("click", async () => {
  const name = document.getElementById("name").value.trim();
  const comment = document.getElementById("comment").value.trim();

  if (!name || !comment) {
    alert("Rellena todo");
    return;
  }

  await fetch(`/api/articles/${id}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json"},
    body: JSON.stringify({ name, comment })
  });

  document.getElementById("name").value = "";
  document.getElementById("comment").value = "";

  loadComments();
});

//Idioma
document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {
    loadComments();
  });
});

//DOM
loadArticle();
loadComments();