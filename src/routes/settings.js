const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const { getSettings, saveSettings } = require("../utils/settingsData");
const settingsPath = path.join(__dirname, "../../data/settings.json");

/*
// Leer settings
function getSettings() {
  return JSON.parse(fs.readFileSync(settingsPath));
}

// Guardar settings
function saveSettings(data) {
  fs.writeFileSync(settingsPath, JSON.stringify(data, null, 2));
}*/

// GET settings
router.get("/",  (req, res) => {
  const settings = getSettings();
  res.json(settings);
});

// PUT settings (solo admin)
router.put("/",  (req, res) => {
  const settings = getSettings();

  const updated = { ...settings, ...req.body };

  saveSettings(updated);

  res.json({ message: "Settings actualizados" });
});

module.exports = router;