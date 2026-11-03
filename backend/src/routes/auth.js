const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const { Usuario } = require('../models');
const { requireAuth } = require('../middlewares/auth');

const router = express.Router();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Intenta de nuevo en unos minutos.' },
});

const loginSchema = z.object({
  usuario: z.string().trim().min(1).max(60),
  password: z.string().min(1).max(200),
});

// Hash falso para tardar lo mismo cuando el usuario no existe
const HASH_FALSO = bcrypt.hashSync('contraseña-inexistente', 12);

router.post('/login', limiter, async (req, res) => {
  const datos = loginSchema.safeParse(req.body);
  if (!datos.success) {
    return res
      .status(400)
      .json({ error: 'Usuario y contraseña son obligatorios' });
  }
  const { usuario, password } = datos.data;

  const user = await Usuario.scope('conPassword').findOne({
    where: { usuario },
  });
  const coincide = await bcrypt.compare(
    password,
    user ? user.password_hash : HASH_FALSO
  );

  if (!user || !coincide || !user.activo) {
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
  }

  const token = jwt.sign(
    { sub: user.id, empresa_id: user.empresa_id, rol: user.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '12h' }
  );

  res.json({
    token,
    usuario: {
      id: user.id,
      nombre: user.nombre,
      rol: user.rol,
      debe_cambiar_password: user.debe_cambiar_password,
    },
  });
});

router.get('/me', requireAuth, (req, res) => {
  const u = req.user;
  res.json({
    usuario: {
      id: u.id,
      nombre: u.nombre,
      rol: u.rol,
      sede_id: u.sede_id,
      debe_cambiar_password: u.debe_cambiar_password,
    },
  });
});

module.exports = router;