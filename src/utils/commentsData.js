const fs = require("fs");
const path = require("path");

const commentsPath = path.join(__dirname, "../../data/comments.json");

// Obtener comentarios de un artículo
function getComments(){
    return JSON.parse(fs.readFileSync(commentsPath));
}

function saveComments(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports = {getComments, saveComments};