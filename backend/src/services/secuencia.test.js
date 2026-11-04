const test = require('node:test');
const assert = require('node:assert');
const { validarSecuencia } = require('./secuencia');
const { inicioDiaGuatemala } = require('./fechas');

const ok = (u, t) => assert.strictEqual(validarSecuencia(u, t).ok, true);
const no = (u, t) => assert.strictEqual(validarSecuencia(u, t).ok, false);

test('sin marcajes solo se permite entrada', () => {
  ok(null, 'entrada');
  no(null, 'salida');
  no(null, 'salida_temporal');
  no(null, 'regreso');
});

test('después de entrada o regreso se permite salir', () => {
  for (const u of ['entrada', 'regreso']) {
    ok(u, 'salida_temporal');
    ok(u, 'salida');
    no(u, 'entrada');
    no(u, 'regreso');
  }
});

test('con salida temporal abierta solo se permite regreso', () => {
  ok('salida_temporal', 'regreso');
  no('salida_temporal', 'entrada');
  no('salida_temporal', 'salida');
  no('salida_temporal', 'salida_temporal');
});

test('después de la salida final la jornada queda cerrada', () => {
  for (const t of ['entrada', 'salida', 'salida_temporal', 'regreso']) {
    no('salida', t);
  }
});

test('el mensaje cambia según el caso', () => {
  assert.match(validarSecuencia('entrada', 'entrada').mensaje, /Ya marcaste/);
  assert.match(validarSecuencia('salida', 'entrada').mensaje, /cerrada/);
  assert.match(validarSecuencia('salida_temporal', 'salida').mensaje, /regreso/);
});

test('el día de Guatemala empieza a las 06:00 UTC', () => {
  const dia = (iso) => inicioDiaGuatemala(new Date(iso)).toISOString();
  // 21:17 del 3 de noviembre en Guatemala (ya es 4 de noviembre en UTC)
  assert.strictEqual(dia('2026-11-04T03:17:15Z'), '2026-11-03T06:00:00.000Z');
  // 23:59:59 en Guatemala sigue siendo el mismo día
  assert.strictEqual(dia('2026-11-04T05:59:59Z'), '2026-11-03T06:00:00.000Z');
  // medianoche en Guatemala: empieza el día siguiente
  assert.strictEqual(dia('2026-11-04T06:00:00Z'), '2026-11-04T06:00:00.000Z');
});