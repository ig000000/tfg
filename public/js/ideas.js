async function loadIdeas() {
  const res = await fetch("/api/ideas");
  const ideas = await res.json();

  const box = document.getElementById("ideasList");
  box.innerHTML = "";

  ideas.forEach(i => {
    const div = document.createElement("div");
    div.className = "idea-card";
    div.innerHTML = `
      <h3>${i.title}</h3>
      <p>${i.description}</p>
    `;
    box.appendChild(div);
  });
}

loadIdeas();
