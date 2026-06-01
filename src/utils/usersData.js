const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../../data/users.json");

// Leer usuarios
function getUsers() {
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
}

// Guardar usuarios
function saveUsers(users) {
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
}

module.exports = { getUsers, saveUsers };