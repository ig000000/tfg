const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../../data/content.json");

// 📥 leer
function getContent() {
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
}

// 💾 guardar
function saveContent(content) {
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
}

module.exports = { getContent, saveContent };