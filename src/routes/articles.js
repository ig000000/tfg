const express = require("express");
const fs = require("fs");
const path = require("path");

//middleware
const { requireRole } = require("../middleware/auth");

const router = express.Router();

// PATH JSON
const articlesPath = path.join(__dirname, "../../data/articles.json");

// Para paginación
const { ARTICLES_PER_PAGE } = require("../../config");

//generar resumen
function generateSummaryFromHTML(html, maxWords = 100) {
  if (!html) return "";

  // eliminar scripts y estilos
  html = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");

  // convertir <p> en saltos de línea
  html = html.replace(/<\/p>/gi, "\n");

  // eliminar HTML restante
  const text = html.replace(/<[^>]+>/g, "").trim();

  if (!text) return "";

  // coger primer párrafo real
  const paragraphs = text.split("\n").map(p => p.trim()).filter(Boolean);
  const baseText = paragraphs[0] || text;

  const words = baseText.split(/\s+/);

  if (words.length <= maxWords) {
    return baseText;
  }

  return words.slice(0, maxWords).join(" ") + "...";
}

// ✔️ Obtener artículos con filtro por tag + búsqueda
router.get("/", (req, res) => {
  const data = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../../data/articles.json"))
  );

  const tag = req.query.tag;
  //const { tag, topic, q} = req.query;
  const topic = req.query.topic;
  const search = (req.query.q || "").toLowerCase();

  //paginación
  //const page = req.query.page;
  const page = parseInt(req.query.page) || 1;

  const limit = ARTICLES_PER_PAGE;

  let filtered = data;

  // 🔎 filtrar por idioma (tag)
  if (tag) {
    filtered = filtered.filter(article =>
      article.tags.map(t => t.toLowerCase()).includes(tag.toLowerCase())
    );
  }

  // Filtrar por tag
  if (topic) {
    filtered = filtered.filter(a =>
      a.tags.map(t => t.toLowerCase()).includes(topic.toLowerCase())
    );
  }

  // 🔍 filtrar por texto
  if (search) {
    filtered = filtered.filter(a =>
      (a.title || "").toLowerCase().includes(search) ||
      (a.summary || "").toLowerCase().includes(search) ||
      (a.content || "").toLowerCase().includes(search)
    );
  }

  //###############################
  // ORDENACIÓN
  const sort = req.query.sort;     // title | date | rating (futuro)
  const order = req.query.order || "asc";  // asc | desc

  if (sort) {
    filtered.sort((a, b) => {
      let valueA;
      let valueB;

      switch (sort) {
        case "title":
          valueA = (a.title || "").toLowerCase();
          valueB = (b.title || "").toLowerCase();
          return order === "asc"
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);

        case "date":
          valueA = new Date(a.date);
          valueB = new Date(b.date);
          return order === "asc" ? valueA - valueB : valueB - valueA;

        case "rating":   // 🔜 FUTURO
          valueA = a.rating || 0;
          valueB = b.rating || 0;
          return order === "asc" ? valueA - valueB : valueB - valueA;

        default:
          return 0;
      }
    });
  }

  //###############################
  //paginación
  if (req.query.all === "true") {
    return res.json({
      articles: filtered,
      pagination: null
    });
  }

  const total = filtered.length;

  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.max(parseInt(page), 1);

  const start = (currentPage - 1) * limit;
  //const paginatedData = data.slice(start, start + limit);
  const paginatedData = filtered.slice(start, start + limit);


  //res.json(filtered);
  res.json({
    articles: paginatedData,
    pagination: {
      total,
      totalPages,
      currentPage,
      perPage: limit
    }
  })
});


// ✔️ Buscar por ID
router.get("/:id", (req, res) => {
  const data = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../../data/articles.json"))
  );

  const article = data.find(a => a.id == req.params.id);

  if (!article)
    return res.status(404).json({ error: "Artículo no encontrado" });

  res.json(article);
});

// Editar, Añadir, Eliminar
// Crear artículo
router.post("/", requireRole("teacher"),(req, res) => {
  const data = JSON.parse(fs.readFileSync(articlesPath));

  const { title, date, author, content, tags } = req.body;

  //if (!title || !date || !author || !summary || !content || !tags || !tags.length) {
  if (!title || !date || !author || !content || !tags || !tags.length) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  // 🧠 generar resumen si no viene
  const summary = generateSummaryFromHTML(content);

  if (!summary) {
    return res.status(400).json({ error: "No se pudo generar el resumen" });
  }

  const newArticle = {
    id: data.length ? data[data.length - 1].id + 1 : 1,
    title,
    date,
    author,
    summary,
    content,
    tags
  };

  data.push(newArticle);
  fs.writeFileSync(articlesPath, JSON.stringify(data, null, 2));

  res.json({ success: true, article: newArticle });
});


// Editar artículo
router.put("/:id", (req, res) => {
  const filePath = path.join(__dirname, "../../data/articles.json");
  const data = JSON.parse(fs.readFileSync(filePath));

  const index = data.findIndex(a => a.id == req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Artículo no encontrado" });
  }

  const oldArticle = data[index];
  const newContent = req.body.content;

  // 🧠 regenerar resumen si cambia el contenido
  const summary =
    newContent && newContent !== oldArticle.content
      ? generateSummaryFromHTML(newContent)
      : oldArticle.summary;

  data[index] = {
    ...oldArticle,
    ...req.body,
    summary,
    id: oldArticle.id
  };

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  res.json({ message: "Artículo actualizado" });
});


// Borrar artículo
router.delete("/:id", (req, res) => {
  let data = JSON.parse(fs.readFileSync(articlesPath));
  const id = Number(req.params.id);

  const exists = data.some(a => a.id === id);
  if (!exists) return res.status(404).json({ error: "No encontrado" });

  data = data.filter(a => a.id !== id);

  fs.writeFileSync(articlesPath, JSON.stringify(data, null, 2));

  res.json({ success: true });
});

// Obtener temáticas (tags sin idioma)
router.get("/topics/all", (req, res) => {
  const filePath = path.join(__dirname, "../../data/articles.json");
  const data = JSON.parse(fs.readFileSync(filePath));

  const LANGS = ["ES", "EU", "EN"];
  const topicsSet = new Set();

  data.forEach(article => {
    article.tags.forEach(tag => {
      if (!LANGS.includes(tag)) {
        topicsSet.add(tag);
      }
    });
  });

  const topics = Array.from(topicsSet).sort((a, b) =>
    a.localeCompare(b, "es", { sensitivity: "base" })
  );

  res.json(topics);
});


module.exports = router;