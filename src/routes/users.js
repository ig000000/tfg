const express = require("express");
const router = express.Router();
const { getUsers, saveUsers } = require("../utils/usersData");
const { requireRole } = require("../middleware/auth");

// ✅ Obtener usuarios
//router.get("/", requireRole("admin"), (req, res) => {
//  const users = getUsers();
//  res.json(users);
//});
router.get("/", requireRole("admin"), (req, res) => {
  let users = getUsers();

  const search = req.query.search?.toLowerCase();
  const role = req.query.role;

  if (search && search.trim() !== "") {
    users = users.filter(u =>
      u.username.toLowerCase().includes(search)
    );
  }

  if (role && role.trim() !== "") {
    users = users.filter(u =>
      u.roles.includes(role)
    );
  }

  res.json(users);
});

// ✅ Crear usuario
router.post("/", requireRole("admin"), (req, res) => {
  const users = getUsers();

  const { username, password, roles } = req.body;

  if (!roles || roles.length === 0) {
    return res.status(400).json({
      error: "El usuario debe tener al menos un rol"
    });
  }

  const newUser = {
    id: users.length ? users[users.length - 1].id + 1 : 1,
    username,
    password,
    roles,
    active: true
  };

  users.push(newUser);
  saveUsers(users);

  res.json(newUser);
});

// ✅ Eliminar usuario (con protección admin)
router.delete("/:id", requireRole("admin"), (req, res) => {
  const users = getUsers();
  const id = parseInt(req.params.id);

  const user = users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }

  const admins = users.filter(u => u.roles.includes("admin"));

  if (admins.length === 1 && user.roles.includes("admin")) {
    return res.status(400).json({ message: "No puedes eliminar el último admin" });
  }

  const updatedUsers = users.filter(u => u.id !== id);
  saveUsers(updatedUsers);

  res.json({ message: "Usuario eliminado" });
});

// ✅ Activar / desactivar
router.patch("/:id/status", requireRole("admin"), (req, res) => {
  const users = getUsers();
  const id = parseInt(req.params.id);

  const user = users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }

  user.active = !user.active;

  saveUsers(users);
  res.json(user);
});

// ✅ Cambiar roles
/*router.patch("/:id/roles", requireRole("admin"), (req, res) => {
  const users = getUsers();
  const id = parseInt(req.params.id);
  const { roles } = req.body;

  const user = users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }

  user.roles = roles;

  saveUsers(users);
  res.json(user);
});*/

//Cambiar user roles
router.put("/:id/roles", (req, res) => {

  console.log("posinko");
/*
  if (req.session.user.id === id && !roles.includes("admin")) {
    return res.status(400).json({
      error: "No puedes quitarte tu propio rol admin"
    });
  }*/

  const id = parseInt(req.params.id);
  const { roles } = req.body;

  if (!roles || roles.length === 0) {
    return res.status(400).json({
      error: "Debe tener al menos un rol"
    });
  }

  const users = getUsers();

  const user = users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({
      error: "Usuario no encontrado"
    });
  }

  user.roles = roles;

  saveUsers(users);

  console.log("posinko");

  res.json({
    message: "Roles actualizados"
  });

});

module.exports = router;