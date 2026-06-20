const fs = require("fs");
const path = require("path");

const commentsPath = path.join(__dirname, "../../data/comments.json");

// Obtener comentarios de un artículo
function getComments(){
    console.log(commentsPath);
    return JSON.parse(fs.readFileSync(commentsPath));
}

function saveComments(data) {
  fs.writeFileSync(commentsPath, JSON.stringify(data, null, 2));
}

module.exports = {getComments, saveComments};