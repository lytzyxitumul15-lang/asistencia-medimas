const crypto = require('crypto');

// Orden fijo: cambiarlo invalida todos los hashes ya guardados.
const CAMPOS = [
  'empresa_id', 'usuario_id', 'sede_id', 'tipo', 'motivo_id', 'motivo_texto',
  'hora_servidor', 'hora_dispositivo', 'hora_efectiva', 'origen',
  'estado_validacion', 'lat', 'lng', 'accuracy', 'distancia_m', 'device_id',
  'client_uuid', 'corrige_marcaje_id', 'registrado_por',
];

const DECIMALES = { lat: 7, lng: 7, accuracy: 2, distancia_m: 2 };
const FECHAS = ['hora_servidor', 'hora_dispositivo', 'hora_efectiva'];

function normalizar(campo, valor) {
  if (valor === null || valor === undefined) return null;
  if (FECHAS.includes(campo)) return new Date(valor).toISOString();
  if (campo in DECIMALES) return Number(valor).toFixed(DECIMALES[campo]);
  if (campo.endsWith('_id') && campo !== 'device_id') return String(valor);
  return valor;
}

function canonico(datos) {
  return JSON.stringify(CAMPOS.map((c) => normalizar(c, datos[c])));
}

function calcularHash(datos, hashPrev) {
  return crypto
    .createHash('sha256')
    .update(`${hashPrev ?? ''}|${canonico(datos)}`)
    .digest('hex');
}

function verificarCadena(filas) {
  let previo = null;
  for (const f of filas) {
    if ((f.hash_prev ?? null) !== previo) {
      return { ok: false, id: f.id, motivo: 'enlace_roto' };
    }
    if (calcularHash(f, previo) !== f.hash) {
      return { ok: false, id: f.id, motivo: 'hash_invalido' };
    }
    previo = f.hash;
  }
  return { ok: true };
}

module.exports = { CAMPOS, canonico, calcularHash, verificarCadena };