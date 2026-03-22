function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: "No autenticado" });
  }
  next();
}

function requireRole(role) {
  return (req, res, next) => {

    const sessionUser = req.session.user;
    //console.log(sessionUser);
    //console.log("#############");
    //console.log(req.session);
    //console.log("AAAAAAAAAAAAAAAAAA");

    if (!sessionUser) {
      return res.status(401).json({ message: "No autenticado" });
    }

    if (!sessionUser.roles.includes(role)) {
      return res.status(403).json({ message: "No autorizado" });
    }

    next();
  };
}

function requireAnyRole(roles) {
  return (req, res, next) => {
    const sessionUser = req.session.user;

    if (!sessionUser) {
      return res.status(401).json({ message: "No autenticado" });
    }

    if (!roles.includes(sessionUser.activeRole)) {
      return res.status(403).json({ message: "No autorizado" });
    }

    next();
  };
}


module.exports = {
  requireAuth,
  requireRole,
  requireAnyRole
};