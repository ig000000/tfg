const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const users = require(path.join(__dirname,"../../data/users.js"))

//Login
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  //const users = JSON.parse(
  //  fs.readFileSync(path.join(__dirname, "../../data/users.json"))
  //);

  const user = users.find(
    u => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
  }

  //req.session.user = user.username;
  req.session.user = {
    id: user.id,
    roles: user.roles,
    activeRole :user.roles[0] // por defecto
  }

  //console.log("____________________");
  //console.log("user.role")

  res.json({ success: true, roles: [user.roles] });
});

//Logout
router.post("/logout", (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// Comprobación
router.get("/check", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ logged: false });
  }

  res.json({
    logged: true,
    id: req.session.user.id,
    roles: req.session.user.roles,
    activeRole: req.session.user.activeRole
  });
});

//Roles
router.post("/set-role", (req, res) => {
  const { role } = req.body;

  if (!req.session.user) {
    return res.sendStatus(401);
  }

  if (!req.session.user.roles.includes(role)) {
    return res.sendStatus(403);
  }

  req.session.user.activeRole = role;

  //console.log(req.session.user);

  res.json({ success: true });
});



module.exports = router;