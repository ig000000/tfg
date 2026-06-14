const list = document.getElementById("topicsList");

async function loadTopics() {
  
  const lang = localStorage.getItem("preferredLanguage") || "ES";

  const res = await fetch(`/api/articles/topics/all?lang=${lang}`);
  const topics = await res.json();

  list.innerHTML = "";

  topics.forEach(topic => {
    const li = document.createElement("li");

    li.innerHTML = `
      <a href="/index.html?topic=${encodeURIComponent(topic)}">
        ${topic}
      </a>
    `;

    list.appendChild(li);
  });
}

document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {
    loadTopics();
  });
});

loadTopics();