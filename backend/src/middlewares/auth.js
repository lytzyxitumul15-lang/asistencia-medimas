const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [tipo, token] = header.split(' ');

  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Falta el token de acceso' });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
    });
  } catch (e) {
    return res.status(401).json({ error: 'Sesión inválida o vencida' });
  }

  try {
    const user = await Usuario.findByPk(payload.sub);
    if (!user || !user.activo) {
      return res.status(401).json({ error: 'Usuario inactivo o inexistente' });
    }
    req.user = user;
    next();
  } catch (e) {
    next(e);
  }
}

function requireRol(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.rol)) {
      return res
        .status(403)
        .json({ error: 'No tienes permiso para esta acción' });
    }
    next();
  };
}

module.exports = { requireAuth, requireRol };