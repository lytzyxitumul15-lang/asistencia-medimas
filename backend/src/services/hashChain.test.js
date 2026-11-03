const test = require('node:test');
const assert = require('node:assert');
const { calcularHash, verificarCadena } = require('./hashChain');

const base = {
  empresa_id: 1, usuario_id: 2, sede_id: 1, tipo: 'entrada',
  motivo_id: null, motivo_texto: null,
  hora_servidor: new Date('2026-11-03T14:00:00.123Z'),
  hora_dispositivo: null,
  hora_efectiva: new Date('2026-11-03T14:00:00.123Z'),
  origen: 'directo', estado_validacion: 'valido',
  lat: 14.6349, lng: -90.5069, accuracy: 12.5, distancia_m: 8.2,
  device_id: 'abc123', client_uuid: '3f0c2b52-9d1e-4c1a-8b7e-0a1b2c3d4e5f',
  corrige_marcaje_id: null, registrado_por: 2,
};

function construir(n) {
  const filas = [];
  let previo = null;
  for (let i = 1; i <= n; i++) {
    const datos = { ...base, client_uuid: `uuid-${i}`, usuario_id: i };
    const hash = calcularHash(datos, previo);
    filas.push({ id: i, ...datos, hash_prev: previo, hash });
    previo = hash;
  }
  return filas;
}

test('el hash tiene 64 caracteres y es determinista', () => {
  const h1 = calcularHash(base, null);
  assert.strictEqual(h1.length, 64);
  assert.strictEqual(h1, calcularHash({ ...base }, null));
});

test('cambiar un dato cambia el hash', () => {
  assert.notStrictEqual(
    calcularHash(base, null),
    calcularHash({ ...base, tipo: 'salida' }, null)
  );
});

test('cambiar el hash anterior cambia el hash', () => {
  assert.notStrictEqual(calcularHash(base, null), calcularHash(base, 'a'.repeat(64)));
});

test('el formato de la base da el mismo hash que el del código', () => {
  const formatoBase = {
    ...base,
    empresa_id: '1', usuario_id: '2', sede_id: '1',
    lat: '14.6349000', lng: '-90.5069000', accuracy: '12.50', distancia_m: '8.20',
    hora_servidor: '2026-11-03T14:00:00.123Z',
    hora_efectiva: new Date('2026-11-03T14:00:00.123Z'),
  };
  assert.strictEqual(calcularHash(base, null), calcularHash(formatoBase, null));
});

test('una cadena íntegra se verifica', () => {
  assert.deepStrictEqual(verificarCadena(construir(3)), { ok: true });
});

test('alterar un dato rompe la verificación', () => {
  const filas = construir(3);
  filas[1].tipo = 'salida';
  const r = verificarCadena(filas);
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.id, 2);
  assert.strictEqual(r.motivo, 'hash_invalido');
});

test('borrar un eslabón rompe la verificación', () => {
  const filas = construir(3);
  filas.splice(1, 1);
  const r = verificarCadena(filas);
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.motivo, 'enlace_roto');
});