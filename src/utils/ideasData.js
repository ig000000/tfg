const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../../data/ideas.json");

function readIdeas() {
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath));
}

function saveIdeas(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports = { readIdeas, saveIdeas };