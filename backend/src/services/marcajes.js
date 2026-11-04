const { UniqueConstraintError, Op } = require('sequelize');
const { sequelize, Marcaje, Sede } = require('../models');
const { validarUbicacion } = require('./geocerca');
const { calcularHash } = require('./hashChain');
const { validarSecuencia } = require('./secuencia');
const { inicioDiaGuatemala } = require('./fechas');

const TIPOS = ['entrada', 'salida', 'salida_temporal', 'regreso'];
const NS_MARCAJES = 1; // espacio de nombres del bloqueo de la cadena
const DIA_MS = 24 * 60 * 60 * 1000;

const MENSAJES = {
  coordenadas_invalidas: 'No se pudo leer tu ubicación',
  precision_insuficiente: 'La precisión del GPS es insuficiente. Intenta de nuevo al aire libre o con el GPS en modo alta precisión',
  fuera_de_geocerca: 'Estás fuera del área permitida para marcar',
};

class ErrorNegocio extends Error {
  constructor(codigo, mensaje, estado = 422, extra = {}) {
    super(mensaje);
    this.codigo = codigo;
    this.estado = estado;
    this.extra = extra;
  }
}

const redondear = (n, d) => Number(Number(n).toFixed(d));

async function registrarMarcaje(user, entrada) {
  const {
    tipo,
    motivo_id = null,
    motivo_texto = null,
    lat,
    lng,
    accuracy = null,
    device_id = null,
    client_uuid,
  } = entrada;

  if (!TIPOS.includes(tipo)) {
    throw new ErrorNegocio('tipo_invalido', 'Tipo de marcaje inválido', 400);
  }

  const sede = await Sede.findByPk(user.sede_id);
  if (!sede) {
    throw new ErrorNegocio('sede_inexistente', 'El usuario no tiene sede asignada', 409);
  }

  const ub = validarUbicacion({ lat, lng, accuracy }, sede);
  if (!ub.ok) {
    throw new ErrorNegocio(ub.motivo, MENSAJES[ub.motivo], 422, {
      distancia_m: ub.distancia_m,
      radio_m: ub.radio_m,
    });
  }

  const buscarExistente = async () => {
    const m = await Marcaje.findOne({ where: { client_uuid } });
    if (m && m.usuario_id !== user.id) {
      throw new ErrorNegocio('uuid_en_uso', 'Identificador de marcaje inválido', 409);
    }
    return m;
  };

  const previo = await buscarExistente();
  if (previo) return { marcaje: previo, duplicado: true };

  try {
    return await sequelize.transaction(async (t) => {
      await sequelize.query('SELECT pg_advisory_xact_lock(:ns, :empresa)', {
        replacements: { ns: NS_MARCAJES, empresa: user.empresa_id },
        transaction: t,
      });

      const ultimo = await Marcaje.findOne({
        where: { empresa_id: user.empresa_id },
        order: [['id', 'DESC']],
        attributes: ['hash'],
        transaction: t,
      });

      const hora = new Date();

      // Regla de secuencia: se evalúa dentro del bloqueo
      const inicioDia = inicioDiaGuatemala(hora);
      const ultimoDelDia = await Marcaje.findOne({
        where: {
          usuario_id: user.id,
          estado_validacion: { [Op.ne]: 'rechazado' },
          hora_efectiva: {
            [Op.gte]: inicioDia,
            [Op.lt]: new Date(inicioDia.getTime() + DIA_MS),
          },
        },
        order: [['hora_efectiva', 'DESC'], ['id', 'DESC']],
        attributes: ['tipo'],
        transaction: t,
      });
      const seq = validarSecuencia(ultimoDelDia ? ultimoDelDia.tipo : null, tipo);
      if (!seq.ok) {
        throw new ErrorNegocio('secuencia_invalida', seq.mensaje, 409, {
          estado_actual: seq.estado_actual,
        });
      }

      const datos = {
        empresa_id: user.empresa_id,
        usuario_id: user.id,
        sede_id: user.sede_id,
        tipo,
        motivo_id,
        motivo_texto,
        hora_servidor: hora,
        hora_dispositivo: null,
        hora_efectiva: hora,
        origen: 'directo',
        estado_validacion: 'valido',
        lat: redondear(lat, 7),
        lng: redondear(lng, 7),
        accuracy: accuracy == null ? null : redondear(accuracy, 2),
        distancia_m: ub.distancia_m,
        device_id,
        client_uuid,
        corrige_marcaje_id: null,
        registrado_por: user.id,
      };

      const hash_prev = ultimo ? ultimo.hash : null;
      const hash = calcularHash(datos, hash_prev);
      const marcaje = await Marcaje.create(
        { ...datos, hash_prev, hash },
        { transaction: t }
      );
      return { marcaje, duplicado: false };
    });
  } catch (e) {
    if (e instanceof UniqueConstraintError) {
      const m = await buscarExistente();
      if (m) return { marcaje: m, duplicado: true };
    }
    throw e;
  }
}

module.exports = { registrarMarcaje, ErrorNegocio, TIPOS };