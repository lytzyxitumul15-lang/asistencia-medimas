const express = require('express');
const { Op } = require('sequelize');
const { z } = require('zod');
const { requireAuth, requireActivo } = require('../middlewares/auth');
const { Marcaje, MotivoSalida, Dispositivo } = require('../models');
const {
  registrarMarcaje,
  ErrorNegocio,
  TIPOS,
} = require('../services/marcajes');

const router = express.Router();
router.use(requireAuth, requireActivo);

const crearSchema = z.object({
  tipo: z.enum(TIPOS),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  accuracy: z.number().min(0).max(100000).optional(),
  device_id: z.string().trim().min(8).max(64).optional(),
  client_uuid: z.uuid(),
  motivo_id: z.number().int().positive().optional(),
  motivo_texto: z.string().trim().max(300).optional(),
});

router.post('/', async (req, res) => {
  const parsed = crearSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: 'Datos inválidos',
      campos: Object.keys(z.flattenError(parsed.error).fieldErrors),
    });
  }
  const d = parsed.data;
  const user = req.user;

  // Reglas del motivo de salida
  const conMotivo = d.tipo === 'salida_temporal' || d.tipo === 'salida';
  if (!conMotivo && (d.motivo_id || d.motivo_texto)) {
    throw new ErrorNegocio('motivo_no_aplica', 'El motivo solo aplica a salidas', 400);
  }
  let motivo = null;
  if (d.motivo_id) {
    motivo = await MotivoSalida.findOne({
      where: { id: d.motivo_id, empresa_id: user.empresa_id, activo: true },
    });
    if (!motivo) {
      throw new ErrorNegocio('motivo_invalido', 'El motivo de salida no existe', 422);
    }
  }
  if (d.tipo === 'salida_temporal' && !motivo) {
    throw new ErrorNegocio('motivo_requerido', 'Indica el motivo de la salida', 422);
  }
  if (motivo && motivo.requiere_detalle && !d.motivo_texto) {
    throw new ErrorNegocio('detalle_requerido', 'Escribe el detalle del motivo', 422);
  }

  const { marcaje, duplicado } = await registrarMarcaje(user, d);

  // Registro del dispositivo (solo en marcajes nuevos)
  if (!duplicado && d.device_id) {
    const [disp, creado] = await Dispositivo.findOrCreate({
      where: { usuario_id: user.id, device_id: d.device_id },
      defaults: { user_agent: (req.get('user-agent') || '').slice(0, 300) },
    });
    if (!creado) await disp.update({ ultimo_uso: new Date() });
  }

  res.status(duplicado ? 200 : 201).json({
    duplicado,
    marcaje: {
      id: marcaje.id,
      tipo: marcaje.tipo,
      hora: marcaje.hora_efectiva,
      distancia_m: marcaje.distancia_m,
      motivo_id: marcaje.motivo_id,
      motivo_texto: marcaje.motivo_texto,
    },
  });
});

const consultaSchema = z.object({
  desde: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  hasta: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  limite: z.coerce.number().int().min(1).max(200).default(100),
});

router.get('/mios', async (req, res) => {
  const parsed = consultaSchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Parámetros inválidos' });
  }
  const { desde, hasta, limite } = parsed.data;

  // Guatemala es UTC-6 todo el año (sin horario de verano)
  const rango = {};
  if (desde) rango[Op.gte] = new Date(`${desde}T00:00:00-06:00`);
  if (hasta) rango[Op.lt] = new Date(new Date(`${hasta}T00:00:00-06:00`).getTime() + 86400000);

  const filas = await Marcaje.findAll({
    where: {
      usuario_id: req.user.id,
      ...(desde || hasta ? { hora_efectiva: rango } : {}),
    },
    attributes: [
      'id', 'tipo', 'hora_efectiva', 'motivo_id', 'motivo_texto',
      'origen', 'estado_validacion', 'distancia_m',
    ],
    order: [['hora_efectiva', 'DESC']],
    limit: limite,
  });
  res.json({ marcajes: filas });
});

module.exports = router;