const express = require("express");
const router = express.Router();
const { getUsers, saveUsers } = require("../utils/usersData");
const { requireRole, requireAuth } = require("../middleware/auth");
//bycript
const bcrypt = require("bcrypt");

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

  //res.json(users);
  res.json(users.filter(u => !u.deleted));
});

// ✅ Crear usuario
router.post("/", requireRole("admin"), async (req, res) => {
  const users = getUsers();

  //const { username, password, roles, userNumber} = req.body;
  const { username, roles, userNumber} = req.body;

  // if (!username || !password || !userNumber) {
  if (!username || !userNumber) {
    return res.status(400).json({
      error: "Username, password y número de usuario son obligatorios"
    });
  }

  if (!roles || roles.length === 0) {
    return res.status(400).json({
      error: "El usuario debe tener al menos un rol"
    });
  }

  //const hash = await passwordBcript(password);
  const tempPassword = generateTempPassword();
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  const newUser = {
    id: users.length ? users[users.length - 1].id + 1 : 1,
    username,
    userNumber,
    password: hashedPassword,
    roles,
    active: true,
    deleted: false,
    mustChangePassword: true,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);

  //res.json(newUser);
  res.json({
    message: "Usuario creado",
    tempPassword: tempPassword
  });

});

//bycript password
async function passwordBcript(password) {
  return await bcrypt.hash(password, 10);
}

// ✅ Eliminar usuario (con protección admin)
router.delete("/:id", requireRole("admin"), (req, res) => {
  const users = getUsers();
  const id = parseInt(req.params.id);

  const user = users.find(u => u.id === id);
  //let user = users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }

  const admins = users.filter(u => u.roles.includes("admin"));

  if (admins.length === 1 && user.roles.includes("admin")) {
    return res.status(400).json({ message: "No puedes eliminar el último admin" });
  }

  user.deleted = true;
  user.deletedAt = new Date().toISOString();

  //const updatedUsers = users.filter(u => u.id !== id);
  //saveUsers(updatedUsers);
  saveUsers(users);

  res.json({ message: "Usuario eliminado" });
  //res.json({ message: "Usuario enviado a la papelera" });
});

//Eliminar usuario permanentemente
router.delete("/permanent/:id", requireRole("admin"), (req, res) => {
  let users = getUsers();

  const user = users.find(u => u.id == req.params.id);

  if (!user) {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }

  if (!user.deleted) {
    return res.status(400).json({
      message: "Primero debe enviarse a la papelera"
    });
  }

  users = users.filter(u => u.id != req.params.id);

  saveUsers(users);

  res.json({ message: "Usuario eliminado permanentemente" });
});

//Restaurar usuarios eliminados
router.put('/restore/:id', (req, res) => {
  const users = getUsers();
  const user = users.find(u => u.id == req.params.id);

  if (!user) {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }

  user.deleted = false;
  user.deletedAt = null;

  saveUsers(users);

  res.json({ message: "Usuario restaurado" });
});

//filtrar usuarios en papelera
router.get('/deleted', (req, res) => {
  const users = getUsers();
  res.json(users.filter(u => u.deleted));
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

  res.json({
    message: "Roles actualizados"
  });

});

//Generar contraseña temporal
function generateTempPassword() {
  return Math.random().toString(36).slice(-8);
}

//cambiar contraseña
router.put("/:id/password", async (req, res) => {

  const id = parseInt(req.params.id);
  //const { password } = req.body;

  //if (!password) {
  //  return res.status(400).json({
  //    error: "Password requerida"
  //  });
  //}

  const users = getUsers();

  const user = users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({
      error: "Usuario no encontrado"
    });
  }

  //const hash = await passwordBcript(password);

  const tempPassword = generateTempPassword();
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  user.password = hashedPassword;

  //user.password = password;
  //user.password = hash;
  user.mustChangePassword = true;

  saveUsers(users);

  res.json({
    message: "Contraseña actualizada",
    tempPassword: tempPassword
  });

});

//Cambiar contraseña 2
router.put('/change-password-first', requireAuth, async (req, res) => {
  //const { userId, newPassword } = req.body;
  const { newPassword } = req.body;

  const users = getUsers();
  const user = users.find(u => u.id == req.session.user.id);

  if (!user) {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  //user.password = newPassword;
  user.password = hashedPassword;
  user.mustChangePassword = false;

  saveUsers(users);

  res.json({ message: "Contraseña actualizada",
             roles: user.roles,
   });
});

//Cambiar contraseña cuando quieras
router.put('/change-password', requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const users = getUsers();
  const user = users.find(u => u.id == req.session.user.id);

  if (!user) {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }

  //testeo contraseña
  const strongPassword =
    newPassword.length >= 8 &&
    /[A-Z]/.test(newPassword) &&
    /[0-9]/.test(newPassword);

  if (!strongPassword) {
    return res.status(400).json({
      message: "Debe tener 8 caracteres, una mayúscula y un número"
    });
  }

  // comprobar contraseña actual
  const validPassword = await bcrypt.compare(currentPassword, user.password);

  if (!validPassword) {
    return res.status(400).json({ message: "Contraseña actual incorrecta" });
  }

  // hash nueva contraseña
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;

  saveUsers(users);

  const activeRole = req.session.user.activeRole;

  res.json({ message: "Contraseña cambiada correctamente",
             activeRole: activeRole
   });
});

module.exports = router;