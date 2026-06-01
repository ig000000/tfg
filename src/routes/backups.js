const express = require("express");
const router = express.Router();

const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

//middleware
const { requireRole } = require("../middleware/auth");

router.post("/create", requireRole("admin"), async (req, res) => {
   try {

      const backupDir = path.join(__dirname, "../../backups");

      if (!fs.existsSync(backupDir)) {
         fs.mkdirSync(backupDir);
      }

      const timestamp = new Date()
         .toISOString()
         .replace(/[:.]/g, "-");

      const backupName = `ProjectKnowledge-${timestamp}.zip`;

      const backupPath = path.join(
         backupDir,
         backupName
      );

      const output = fs.createWriteStream(backupPath);

      const archive = archiver("zip", {
         zlib: { level: 9 }
      });

      output.on("close", () => {
         res.download(backupPath);
      });

      archive.on("error", err => {
         throw err;
      });

      archive.pipe(output);

      archive.directory(
         path.join(__dirname, "../../data"),
         "data"
      );

      await archive.finalize();

   } catch (error) {
      console.error(error);

      res.status(500).json({
         error: "Error creating backup"
      });
   }
});

module.exports = router;