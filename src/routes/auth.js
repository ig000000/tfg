const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();
//bycript
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;
//const users = require(path.join(__dirname,"../../data/users.json"))
const { getUsers, saveUsers } = require("../utils/usersData");
//Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  //const users = getUsers();

  //const user = users.find(
  //  u => u.username === username && u.password === password
  //);
  const user = await login(username, password);

  if (!user) {
    return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
  }

  console.log("PPPPPPPPPPPPPPPPPPPPPPP")
  console.log(user)

  //req.session.user = user.username;
  req.session.user = {
    id: user.id,
    roles: user.roles,
    activeRole :user.roles[0] // por defecto
  }

  req.session.save(() => {
    res.json({ success: true, roles: user.roles });
  });
});

//Login bycript
async function login(username, passwordInput) {
  console.log("llega aqui");

  const users = getUsers();

  const user = users.find(u => u.username === username)
  if (!user) return false

  // CASO 1: password ya está en bcrypt
  if (user.password.startsWith("$2")) {

    const match = await bcrypt.compare(passwordInput, user.password)

    if (!match) return false

    return user
  }

  // CASO 2: password antigua en texto plano
  if (user.password === passwordInput) {

    console.log("passwordInput:", passwordInput)

    // migrar a bcrypt automáticamente
    const hash = await bcrypt.hash(passwordInput, SALT_ROUNDS)

    user.password = hash

    console.log("user.password:", user?.password)

    //saveUsers()
    saveUsers(users);

    console.log("Password migrada a bcrypt para:", username)

    return user
  }

  return false
}

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