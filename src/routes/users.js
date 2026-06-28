const express = require("express");
const router = express.Router();
const { getUsers, saveUsers } = require("../utils/usersData");
const { requireRole, requireAuth } = require("../middleware/auth");
//bycript
const bcrypt = require("bcrypt");

// Obtener usuarios
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

  res.json(users.filter(u => !u.deleted));
});

// Crear usuario
router.post("/", requireRole("admin"), async (req, res) => {
  const users = getUsers();

  const { username, roles} = req.body;

  if (!username) {
    return res.status(400).json({
      error: "Username es obligatorio",
      err: 0
    });
  }

  if (!roles || roles.length === 0) {
    return res.status(400).json({
      error: "El usuario debe tener al menos un rol",
      err: 2
    });
  }

  if(userExists(username)){
    return res.status(400).json({
      error: "Ya existe un usuario con ese nombre",
      err:1
    });
  }

  const tempPassword = generateTempPassword();
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  const newUser = {
    id: users.length ? users[users.length - 1].id + 1 : 1,
    username,
    password: hashedPassword,
    roles,
    deleted: false,
    mustChangePassword: true,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);

  res.json({
    message: "Usuario creado",
    tempPassword: tempPassword
  });

});

//Nombre de usuario existe???
function userExists(username) {
  const users = getUsers();
  return users.find(u => u.username === username)
}

//bycript password
async function passwordBcript(password) {
  return await bcrypt.hash(password, 10);
}

//aux, mirar cantidad admins activos
function getActiveAdmins(users) {
  return users.filter(
    u => !u.deleted && u.roles.includes("admin")
  );
}

// Eliminar usuario (con protección admin)
router.delete("/:id", requireRole("admin"), (req, res) => {
  const users = getUsers();
  const id = parseInt(req.params.id);

  const user = users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }

  //const admins = users.filter(u => u.roles.includes("admin"));
  const admins = getActiveAdmins(users);

  if (admins.length === 1 && user.roles.includes("admin") && !user.deleted) {
    return res.status(400).json({ message: "No puedes eliminar el último admin" });
  }

  user.deleted = true;
  user.deletedAt = new Date().toISOString();

  saveUsers(users);

  res.json({ message: "Usuario eliminado" });
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

   const activeAdmins = getActiveAdmins(users);

  // Si es el último administrador (aunque esté en la papelera)
  if (
    user.roles.includes("admin") &&
    activeAdmins.length === 0
  ) {
    return res.status(400).json({
      message: "No puedes eliminar permanentemente el último administrador."
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


//Cambiar user roles
router.put("/:id/roles", (req, res) => {
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
    message: "Roles actualizados",
    ok: true
  });

});

//Generar contraseña temporal
function generateTempPassword() {
  return Math.random().toString(36).slice(-8);
}

//cambiar contraseña
router.put("/:id/password", async (req, res) => {
  const id = parseInt(req.params.id);
  const users = getUsers();
  const user = users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({
      error: "Usuario no encontrado"
    });
  }

  const tempPassword = generateTempPassword();
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  user.password = hashedPassword;
  user.mustChangePassword = true;

  saveUsers(users);

  res.json({
    message: "Contraseña actualizada",
    tempPassword: tempPassword
  });
});

//testeo Contraseña
function strongPasswordfunction(password){
  return password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) ;
}


//Cambiar contraseña 2
router.put('/change-password-first', requireAuth, async (req, res) => {
  const { newPassword } = req.body;

  const users = getUsers();
  const user = users.find(u => u.id == req.session.user.id);

  if (!user) {
    return res.status(404).json({ message: "Usuario no encontrado", errmsg: 1 });
  }

  const strongPassword = strongPasswordfunction(newPassword);

  if (!strongPassword) {
    return res.status(400).json({
      message: "Debe tener 8 caracteres, una mayúscula, una minúscula y un número",
      errmsg: 2
    });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;
  user.mustChangePassword = false;

  saveUsers(users);

  res.json({ message: "Contraseña actualizada",
             errmsg: 3,
             roles: user.roles,
   });
});

//Cambiar contraseña cuando quieras
router.put('/change-password', requireAuth, async (req, res) => {
  const { currentPassword, newPassword, repeatPassword } = req.body;
  const users = getUsers();
  const user = users.find(u => u.id == req.session.user.id);

  if (!user) {
    return res.status(404).json({ message: "Usuario no encontrado", errmsg: 1  });
  }

  if (newPassword !== repeatPassword) {
    return res.status(404).json({ message: "Las contraseñas no coinciden"});
  }

  if(!newPassword || !currentPassword || !repeatPassword){
    return res.status(404).json({ message: "Hay que completar todas las casillas", errmsg: 3});
  }

  if( newPassword == currentPassword){
    return res.status(404).json({ message: "No puedes repetir las contraseñas", errmsg: 2});
  }

  const strongPassword = strongPasswordfunction(newPassword);

  if (!strongPassword) {
    return res.status(400).json({
    message: "Debe tener 8 caracteres, una mayúscula, una minúscula y un número",errmsg: 4
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
              errmsg: 5,
             activeRole: activeRole
   });
});

module.exports = router;