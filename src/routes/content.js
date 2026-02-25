const express = require("express");
const router = express.Router();
const { getContent, saveContent } = require("../utils/contentData");
const { requireRole } = require("../middleware/auth");

// 📥 Obtener contenido (público)
router.get("/", (req, res) => {
  const content = getContent();
  res.json(content);
});

// ✏️ Actualizar licencia
router.put("/licencia", requireRole("admin"), (req, res) => {
  const content = getContent();
  const { lang, text } = req.body;

   //console.log("____");
  //console.log("SESSION:", req.session);

  content.licencia[lang] = text;

  saveContent(content);

  console.log("____");
  console.log("SESSION:", req.session);

  res.json({ message: "Licencia actualizada" });
});

// ✏️ Actualizar contribución
router.put("/contribucion", requireRole("admin"), (req, res) => {

    console.log("____");
  console.log("SESSION:", req.session);

  const content = getContent();
  const { lang, text } = req.body;

  content.contribucion[lang] = text;

  saveContent(content);
  res.json({ message: "Contribución actualizada" });
});

module.exports = router;