const express = require("express");
const fs = require("fs");
const path = require("path");

//middleware
const { requireRole } = require("../middleware/auth");

const router = express.Router();
const filePath = path.join(__dirname, "../../data/ideas.json");

function readIdeas() {
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath));
}

function saveIdeas(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

/* ====== PUBLIC ====== */
router.get("/", (req, res) => {
  res.json(readIdeas());
});

/* ====== ADMIN ONLY ====== */
router.post("/", requireRole("teacher"), (req, res) => {

 // if (!req.session?.user?.isAdmin)
 //   return res.status(403).json({ error: "Unauthorized" });

  const ideas = readIdeas();
  const newIdea = {
    id: Date.now(),
    ...req.body,
    date: new Date().toISOString().split("T")[0]
  };

  ideas.push(newIdea);
  saveIdeas(ideas);
  res.json(newIdea);
});

router.delete("/:id", (req, res) => {
  //if (!req.session?.user?.isAdmin)
  //  return res.status(403).json({ error: "Unauthorized" });

  const ideas = readIdeas().filter(i => i.id != req.params.id);
  saveIdeas(ideas);
  res.json({ success: true });
});

module.exports = router;
