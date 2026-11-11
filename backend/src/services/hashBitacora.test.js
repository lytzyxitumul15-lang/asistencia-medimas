const test = require('node:test');
const assert = require('node:assert');
const {
  calcularHashBitacora,
  verificarCadenaBitacora,
} = require('./hashBitacora');

const base = {
  empresa_id: 1,
  actor_id: 5,
  accion: 'usuario_aprobado',
  entidad: 'usuario',
  entidad_id: 9,
  detalle: { sede_id: 1, turno_id: 2, rol: 'empleado' },
  ip: '203.0.113.7',
  creada_en: new Date('2026-11-10T15:00:00.123Z'),
};

function construir(n) {
  const filas = [];
  let previo = null;
  for (let i = 1; i <= n; i++) {
    const datos = { ...base, entidad_id: i };
    const hash = calcularHashBitacora(datos, previo);
    filas.push({ id: i, ...datos, hash_prev: previo, hash });
    previo = hash;
  }
  return filas;
}

test('el hash tiene 64 caracteres y es determinista', () => {
  const h = calcularHashBitacora(base, null);
  assert.strictEqual(h.length, 64);
  assert.strictEqual(h, calcularHashBitacora({ ...base }, null));
});

test('el orden de las claves del detalle no cambia el hash', () => {
  const reordenado = {
    ...base,
    detalle: { rol: 'empleado', turno_id: 2, sede_id: 1 },
  };
  assert.strictEqual(
    calcularHashBitacora(base, null),
    calcularHashBitacora(reordenado, null)
  );
});

test('cambiar un dato o el detalle cambia el hash', () => {
  const h = calcularHashBitacora(base, null);
  assert.notStrictEqual(h, calcularHashBitacora({ ...base, accion: 'usuario_rechazado' }, null));
  assert.notStrictEqual(
    h,
    calcularHashBitacora({ ...base, detalle: { ...base.detalle, turno_id: 3 } }, null)
  );
});

test('el formato de la base da el mismo hash que el del código', () => {
  const formatoBase = {
    ...base,
    empresa_id: '1',
    actor_id: '5',
    entidad_id: '9',
    creada_en: '2026-11-10T15:00:00.123Z',
    detalle: { turno_id: 2, rol: 'empleado', sede_id: 1 },
  };
  assert.strictEqual(
    calcularHashBitacora(base, null),
    calcularHashBitacora(formatoBase, null)
  );
});

test('una cadena íntegra se verifica', () => {
  assert.deepStrictEqual(verificarCadenaBitacora(construir(3)), { ok: true });
});

test('alterar el detalle de un registro rompe la verificación', () => {
  const filas = construir(3);
  filas[1].detalle = { sede_id: 99 };
  const r = verificarCadenaBitacora(filas);
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.id, 2);
  assert.strictEqual(r.motivo, 'hash_invalido');
});

test('borrar un eslabón rompe la verificación', () => {
  const filas = construir(3);
  filas.splice(1, 1);
  const r = verificarCadenaBitacora(filas);
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.motivo, 'enlace_roto');
});