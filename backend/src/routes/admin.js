const express = require('express');
const { z } = require('zod');
const {
  requireAuth,
  requireActivo,
  requireRol,
} = require('../middlewares/auth');
const {
  sequelize, Usuario, Sede, Turno, AsignacionTurno,
} = require('../models');
const { ErrorNegocio } = require('../services/marcajes');
const { registrarBitacora } = require('../services/bitacora');
const { hoyGuatemala } = require('../services/fechas');

const router = express.Router();
router.use(requireAuth, requireActivo, requireRol('admin'));

const ESTADOS = ['pendiente', 'activo', 'inactivo'];
const idSchema = z.coerce.number().int().positive();

router.get('/usuarios', async (req, res) => {
  const { estado } = req.query;
  if (estado !== undefined && !ESTADOS.includes(estado)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }
  const usuarios = await Usuario.findAll({
    where: { empresa_id: req.user.empresa_id, ...(estado ? { estado } : {}) },
    attributes: ['id', 'nombre', 'email', 'rol', 'estado', 'sede_id', 'createdAt'],
    order: [['id', 'ASC']],
  });
  res.json({ usuarios });
});

const aprobarSchema = z.object({
  sede_id: z.number().int().positive().optional(),
  turno_id: z.number().int().positive().nullable().optional(),
  vigente_desde: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

router.post('/usuarios/:id/aprobar', async (req, res) => {
  const id = idSchema.safeParse(req.params.id);
  const body = aprobarSchema.safeParse(req.body ?? {});
  if (!id.success || !body.success) {
    return res.status(400).json({ error: 'Datos inválidos' });
  }
  const admin = req.user;
  const { sede_id, turno_id, vigente_desde } = body.data;

  const aprobado = await sequelize.transaction(async (t) => {
    const u = await Usuario.findOne({
      where: { id: id.data, empresa_id: admin.empresa_id },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!u) {
      throw new ErrorNegocio('usuario_inexistente', 'No existe ese usuario', 404);
    }
    if (u.estado !== 'pendiente') {
      throw new ErrorNegocio(
        'estado_invalido',
        'Solo se pueden aprobar cuentas pendientes',
        409,
        { estado_actual: u.estado }
      );
    }

    const sede = await Sede.findOne({
      where: { id: sede_id ?? u.sede_id, empresa_id: admin.empresa_id },
      transaction: t,
    });
    if (!sede) {
      throw new ErrorNegocio('sede_invalida', 'La sede no existe', 422);
    }

    let turno = null;
    if (turno_id) {
      turno = await Turno.findOne({
        where: { id: turno_id, empresa_id: admin.empresa_id, activo: true },
        transaction: t,
      });
      if (!turno || (turno.sede_id && turno.sede_id !== sede.id)) {
        throw new ErrorNegocio(
          'turno_invalido',
          'El turno no existe o no pertenece a la sede',
          422
        );
      }
    }

    const desde = vigente_desde ?? hoyGuatemala();
    await u.update(
      {
        estado: 'activo',
        sede_id: sede.id,
        aprobado_por: admin.id,
        aprobado_en: new Date(),
      },
      { transaction: t }
    );
    if (turno) {
      await AsignacionTurno.create(
        { usuario_id: u.id, turno_id: turno.id, vigente_desde: desde },
        { transaction: t }
      );
    }
    await registrarBitacora(
      {
        empresa_id: admin.empresa_id,
        actor_id: admin.id,
        accion: 'usuario_aprobado',
        entidad: 'usuario',
        entidad_id: u.id,
        detalle: {
          sede_id: sede.id,
          turno_id: turno ? turno.id : null,
          vigente_desde: turno ? desde : null,
        },
        ip: req.ip,
      },
      { transaction: t }
    );
    return u;
  });

  res.json({
    ok: true,
    usuario: {
      id: aprobado.id,
      nombre: aprobado.nombre,
      email: aprobado.email,
      estado: aprobado.estado,
      sede_id: aprobado.sede_id,
    },
  });
});

const rechazarSchema = z.object({
  motivo: z.string().trim().max(300).optional(),
});

router.post('/usuarios/:id/rechazar', async (req, res) => {
  const id = idSchema.safeParse(req.params.id);
  const body = rechazarSchema.safeParse(req.body ?? {});
  if (!id.success || !body.success) {
    return res.status(400).json({ error: 'Datos inválidos' });
  }
  const admin = req.user;

  const rechazado = await sequelize.transaction(async (t) => {
    const u = await Usuario.findOne({
      where: { id: id.data, empresa_id: admin.empresa_id },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!u) {
      throw new ErrorNegocio('usuario_inexistente', 'No existe ese usuario', 404);
    }
    if (u.estado !== 'pendiente') {
      throw new ErrorNegocio(
        'estado_invalido',
        'Solo se pueden rechazar cuentas pendientes',
        409,
        { estado_actual: u.estado }
      );
    }
    await u.update({ estado: 'inactivo' }, { transaction: t });
    await registrarBitacora(
      {
        empresa_id: admin.empresa_id,
        actor_id: admin.id,
        accion: 'usuario_rechazado',
        entidad: 'usuario',
        entidad_id: u.id,
        detalle: { motivo: body.data.motivo ?? null },
        ip: req.ip,
      },
      { transaction: t }
    );
    return u;
  });

  res.json({ ok: true, usuario: { id: rechazado.id, estado: rechazado.estado } });
});

module.exports = router;