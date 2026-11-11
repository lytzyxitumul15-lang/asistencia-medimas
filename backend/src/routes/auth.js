const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const { UniqueConstraintError } = require('sequelize');
const { Usuario, Empresa, Sede } = require('../models');
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
  email: z.string().trim().toLowerCase().min(1).max(200),
  password: z.string().min(1).max(200),
});

// Hash falso para tardar lo mismo cuando el correo no existe
const HASH_FALSO = bcrypt.hashSync('contraseña-inexistente', 12);

router.post('/login', limiter, async (req, res) => {
  const datos = loginSchema.safeParse(req.body);
  if (!datos.success) {
    return res
      .status(400)
      .json({ error: 'Correo y contraseña son obligatorios' });
  }
  const { email, password } = datos.data;

  const user = await Usuario.scope('conPassword').findOne({ where: { email } });
  const coincide = await bcrypt.compare(
    password,
    user ? user.password_hash : HASH_FALSO
  );

  if (!user || !coincide || user.estado === 'inactivo') {
    return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
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
      estado: user.estado,
    },
  });
});

router.get('/me', requireAuth, (req, res) => {
  const u = req.user;
  res.json({
    usuario: {
      id: u.id,
      nombre: u.nombre,
      email: u.email,
      rol: u.rol,
      estado: u.estado,
      sede_id: u.sede_id,
    },
  });
});

const registroLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de registro. Intenta más tarde.' },
});

const registroSchema = z.object({
  nombre: z.string().trim().min(2).max(150),
  email: z.string().trim().toLowerCase().max(200).pipe(z.email()),
  password: z.string().min(12).max(72),
  codigo_empresa: z.string().trim().toUpperCase().min(1).max(40),
});

router.post('/registro', registroLimiter, async (req, res) => {
  const datos = registroSchema.safeParse(req.body);
  if (!datos.success) {
    return res.status(400).json({
      error:
        'Revisa los datos: nombre, correo válido y contraseña de 12 a 72 caracteres',
    });
  }
  const { nombre, email, password, codigo_empresa } = datos.data;

  const empresa = await Empresa.findOne({
    where: { configuracion: { codigo_registro: codigo_empresa } },
  });
  if (!empresa) {
    return res.status(403).json({ error: 'Código de empresa incorrecto' });
  }

  const sede = await Sede.findOne({
    where: { empresa_id: empresa.id },
    order: [['id', 'ASC']],
  });
  if (!sede) {
    return res
      .status(409)
      .json({ error: 'La empresa aún no tiene sede configurada' });
  }

  const password_hash = await bcrypt.hash(password, 12);
  try {
    await Usuario.create({
      empresa_id: empresa.id,
      sede_id: sede.id,
      nombre,
      email,
      password_hash,
      rol: 'empleado',
      estado: 'pendiente',
      debe_cambiar_password: false,
    });
  } catch (e) {
    if (e instanceof UniqueConstraintError) {
      return res.status(409).json({ error: 'Ese correo ya está registrado' });
    }
    throw e;
  }

  res.status(201).json({
    ok: true,
    mensaje:
      'Solicitud enviada. El administrador debe aprobar tu cuenta antes de que puedas marcar.',
  });
});

module.exports = router;