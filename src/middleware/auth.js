function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: "No autenticado" });
  }
  next();
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.session.user) return res.sendStatus(401);

    if (req.session.user.activeRole !== role) {
      return res.sendStatus(403);
    }

    next();
  };
}


module.exports = {
  requireAuth,
  requireRole
};