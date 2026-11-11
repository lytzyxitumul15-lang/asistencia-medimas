const test = require('node:test');
const assert = require('node:assert');
const { hoyGuatemala } = require('./fechas');

test('a las 21:17 de Guatemala todavía es el día anterior en UTC', () => {
  assert.strictEqual(hoyGuatemala(new Date('2026-11-04T03:17:15Z')), '2026-11-03');
});

test('a medianoche de Guatemala cambia el día', () => {
  assert.strictEqual(hoyGuatemala(new Date('2026-11-04T06:00:00Z')), '2026-11-04');
});