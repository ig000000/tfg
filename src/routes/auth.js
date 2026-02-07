const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  const users = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../../data/users.json"))
  );

  const user = users.find(
    u => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
  }

  //req.session.user = user.username;
  req.session.user = {
    username,
    isAdmin: true
  }

  res.json({ success: true });
});

router.post("/logout", (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

//?????????
router.get("/check", (req,res)=>{
  if(!req.session.user) return res.status(401).end();
  res.json({ logged: true });
});

//?????????


module.exports = router;