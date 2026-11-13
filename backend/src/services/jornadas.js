const { Op } = require('sequelize');
const { AsignacionTurno, Turno, Marcaje, Jornada } = require('../models');
const { calcularJornada } = require('./jornada');
const { horaLocalADate, hoyGuatemala } = require('./fechas');

const DIA_MS = 24 * 60 * 60 * 1000;

// Turno que aplica a un empleado en una fecha 'AAAA-MM-DD' (o null: horario libre)
async function turnoVigente(usuario_id, fecha, { transaction } = {}) {
  const asignacion = await AsignacionTurno.findOne({
    where: {
      usuario_id,
      vigente_desde: { [Op.lte]: fecha },
      [Op.or]: [{ vigente_hasta: null }, { vigente_hasta: { [Op.gte]: fecha } }],
    },
    include: [{ model: Turno, where: { activo: true }, required: true }],
    order: [['vigente_desde', 'DESC'], ['id', 'DESC']],
    transaction,
  });
  return asignacion ? asignacion.Turno : null;
}

// Marcajes válidos del día de Guatemala (de 00:00 a 24:00 locales)
async function marcajesDelDia(usuario_id, fecha, { transaction } = {}) {
  const inicio = horaLocalADate(fecha, '00:00');
  return Marcaje.findAll({
    where: {
      usuario_id,
      estado_validacion: 'valido',
      hora_efectiva: {
        [Op.gte]: inicio,
        [Op.lt]: new Date(inicio.getTime() + DIA_MS),
      },
    },
    attributes: ['tipo', 'hora_efectiva'],
    order: [['hora_efectiva', 'ASC'], ['id', 'ASC']],
    raw: true,
    transaction,
  });
}

async function recalcularJornada(usuario, fecha, { cerrada, transaction } = {}) {
  const existente = await Jornada.findOne({
    where: { usuario_id: usuario.id, fecha },
    transaction,
  });
  const esCerrada =
    cerrada ?? ((existente && existente.cerrada) || fecha < hoyGuatemala());

  const turno = await turnoVigente(usuario.id, fecha, { transaction });
  const marcajes = await marcajesDelDia(usuario.id, fecha, { transaction });

  const r = calcularJornada({
    fecha,
    turno: turno
      ? {
          hora_entrada: turno.hora_entrada,
          hora_salida: turno.hora_salida,
          tolerancia_min: turno.tolerancia_min,
          dias_semana: turno.dias_semana,
        }
      : null,
    marcajes,
    cerrada: esCerrada,
  });

  const valores = {
    empresa_id: usuario.empresa_id,
    usuario_id: usuario.id,
    fecha,
    turno_id: turno ? turno.id : null,
    estado: r.estado,
    hora_entrada: r.hora_entrada,
    hora_salida: r.hora_salida,
    minutos_retraso: r.minutos_retraso,
    minutos_salida_anticipada: r.minutos_salida_anticipada,
    minutos_fuera: r.minutos_fuera,
    minutos_trabajados: r.minutos_trabajados,
    cerrada: esCerrada,
    calculada_en: new Date(),
  };

  if (existente) {
    await existente.update(valores, { transaction });
    return existente;
  }
  return Jornada.create(valores, { transaction });
}

module.exports = { turnoVigente, marcajesDelDia, recalcularJornada };