const fs = require("fs");
const path = require("path");

const articlesPath = path.join(__dirname, "../../data/articles.json");

function getArticles(){
    return JSON.parse(fs.readFileSync(articlesPath));
}

function saveArticles(data){
    fs.writeFileSync(articlesPath, JSON.stringify(data, null, 2));
}

module.exports = {getArticles, saveArticles};