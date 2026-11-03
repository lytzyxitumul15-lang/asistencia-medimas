const test = require('node:test');
const assert = require('node:assert');
const { distanciaMetros, validarUbicacion } = require('./geocerca');

const sede = { lat: 14.6349, lng: -90.5069, radio_m: 50 };

test('la distancia de un punto a sí mismo es 0', () => {
  assert.strictEqual(distanciaMetros(14.6349, -90.5069, 14.6349, -90.5069), 0);
});

test('0.0005 grados de latitud son unos 55.6 m', () => {
  const d = distanciaMetros(14.6349, -90.5069, 14.6354, -90.5069);
  assert.ok(Math.abs(d - 55.6) < 0.5, `distancia obtenida: ${d}`);
});

test('un punto a unos 44 m está dentro de la geocerca', () => {
  const r = validarUbicacion({ lat: 14.6353, lng: -90.5069, accuracy: 10 }, sede);
  assert.strictEqual(r.ok, true);
});

test('un punto a unos 56 m está fuera de la geocerca', () => {
  const r = validarUbicacion({ lat: 14.6354, lng: -90.5069, accuracy: 10 }, sede);
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.motivo, 'fuera_de_geocerca');
});

test('una precisión de 500 m se rechaza', () => {
  const r = validarUbicacion({ lat: 14.6349, lng: -90.5069, accuracy: 500 }, sede);
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.motivo, 'precision_insuficiente');
});

test('coordenadas imposibles se rechazan', () => {
  const r = validarUbicacion({ lat: 200, lng: -90.5069, accuracy: 10 }, sede);
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.motivo, 'coordenadas_invalidas');
});