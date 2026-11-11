const { sequelize, Bitacora } = require('../models');
const { calcularHashBitacora } = require('./hashBitacora');

const NS_BITACORA = 2; // distinto del de marcajes: las dos cadenas no se bloquean entre sí

async function registrarBitacora(datos, { transaction } = {}) {
  if (!transaction) {
    throw new Error('registrarBitacora debe ejecutarse dentro de una transacción');
  }
  const {
    empresa_id,
    actor_id = null,
    accion,
    entidad,
    entidad_id = null,
    detalle = {},
    ip = null,
  } = datos;

  await sequelize.query('SELECT pg_advisory_xact_lock(:ns, :empresa)', {
    replacements: { ns: NS_BITACORA, empresa: empresa_id },
    transaction,
  });

  const ultimo = await Bitacora.findOne({
    where: { empresa_id },
    order: [['id', 'DESC']],
    attributes: ['hash'],
    transaction,
  });

  const fila = {
    empresa_id,
    actor_id,
    accion,
    entidad,
    entidad_id,
    detalle,
    ip: ip ? String(ip).slice(0, 45) : null,
    creada_en: new Date(),
  };

  const hash_prev = ultimo ? ultimo.hash : null;
  const hash = calcularHashBitacora(fila, hash_prev);
  return Bitacora.create({ ...fila, hash_prev, hash }, { transaction });
}

module.exports = { registrarBitacora };