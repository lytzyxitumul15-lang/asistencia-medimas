const crypto = require('crypto');

// Orden fijo: cambiarlo invalida todos los hashes ya guardados.
const CAMPOS = [
  'empresa_id', 'actor_id', 'accion', 'entidad', 'entidad_id',
  'detalle', 'ip', 'creada_en',
];

// JSON con las claves ordenadas, para que el orden de las claves no cambie el hash
function estable(valor) {
  if (valor === null || typeof valor !== 'object') return JSON.stringify(valor);
  if (Array.isArray(valor)) return `[${valor.map(estable).join(',')}]`;
  const claves = Object.keys(valor)
    .filter((k) => valor[k] !== undefined)
    .sort();
  return `{${claves.map((k) => `${JSON.stringify(k)}:${estable(valor[k])}`).join(',')}}`;
}

function normalizar(campo, valor) {
  if (campo === 'detalle') return estable(valor ?? {});
  if (valor === null || valor === undefined) return null;
  if (campo === 'creada_en') return new Date(valor).toISOString();
  if (campo.endsWith('_id')) return String(valor);
  return valor;
}

function canonico(datos) {
  return JSON.stringify(CAMPOS.map((c) => normalizar(c, datos[c])));
}

function calcularHashBitacora(datos, hashPrev) {
  return crypto
    .createHash('sha256')
    .update(`${hashPrev ?? ''}|${canonico(datos)}`)
    .digest('hex');
}

function verificarCadenaBitacora(filas) {
  let previo = null;
  for (const f of filas) {
    if ((f.hash_prev ?? null) !== previo) {
      return { ok: false, id: f.id, motivo: 'enlace_roto' };
    }
    if (calcularHashBitacora(f, previo) !== f.hash) {
      return { ok: false, id: f.id, motivo: 'hash_invalido' };
    }
    previo = f.hash;
  }
  return { ok: true };
}

module.exports = { CAMPOS, calcularHashBitacora, verificarCadenaBitacora };