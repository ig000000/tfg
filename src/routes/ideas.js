const express = require("express");
const fs = require("fs");
const path = require("path");

//middleware
const { requireRole } = require("../middleware/auth");

const router = express.Router();

const { readIdeas, saveIdeas } = require("../utils/ideasData");
const filePath = path.join(__dirname, "../../data/ideas.json");

//PUBLIC 
router.get("/",  (req, res) => {
  res.json(readIdeas());
});

//ADMIN ONLY 
router.post("/", requireRole("teacher"),  (req, res) => {
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

router.delete("/:id", async (req, res) => {
  const ideas = readIdeas().filter(i => i.id != req.params.id);
  saveIdeas(ideas);
  res.json({ success: true });
});

module.exports = router;
