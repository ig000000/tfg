const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const { getSettings, saveSettings } = require("../utils/settingsData");
const settingsPath = path.join(__dirname, "../../data/settings.json");

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

  res.json({ message: "Settings actualizados", 
              ok: true
  });
});

module.exports = router;