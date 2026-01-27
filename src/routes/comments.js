const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const commentsPath = path.join(__dirname, "../../data/comments.json");

// Obtener comentarios de un artículo
router.get("/:id/comments", (req, res) => {
  const articleId = Number(req.params.id);

  const data = JSON.parse(fs.readFileSync(commentsPath));

  const filtered = data.filter(c => c.articleId === articleId);

  res.json(filtered);
});

// Enviar comentario
router.post("/:id/comments", (req, res) => {
  const articleId = Number(req.params.id);
  const { name, comment } = req.body;

  if (!name || !comment)
    return res.status(400).json({ error: "Faltan campos" });

  const data = JSON.parse(fs.readFileSync(commentsPath));

  const newComment = {
    articleId,
    name,
    comment,
    date: new Date().toISOString()
  };

  data.push(newComment);

  fs.writeFileSync(commentsPath, JSON.stringify(data, null, 2));

  res.json({ success: true, comment: newComment });
});

module.exports = router;