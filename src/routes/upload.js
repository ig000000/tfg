const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { getSettings, saveSettings } = require("../utils/settingsData");
const settingsPath = path.join(__dirname, "../../data/settings.json");


const storage = multer.diskStorage({
  destination: function (req, file, cb) {

    const folder = req.params.type === "logo"
      ? "public/uploads/logo"
      : "public/uploads/favicon";

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    cb(null, folder);
  },

  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, req.params.type + ext);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {

    const allowed = ["image/png", "image/jpeg", "image/x-icon"];

    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Tipo de archivo no permitido"));
    }

    cb(null, true);
  }
});

//
router.post("/:type", upload.single("image"), (req, res) => {

  const type = req.params.type;
  const settings = getSettings();

  const filePath = `/uploads/${type}/${req.file.filename}`;

  if (type === "logo") settings.logo = filePath;
  if (type === "favicon") settings.favicon = filePath;

  saveSettings(settings);

  res.json({
    message: "Imagen subida",
    path: filePath
  });

});

module.exports = router;