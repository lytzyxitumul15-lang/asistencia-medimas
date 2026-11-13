const test = require('node:test');
const assert = require('node:assert');
const { calcularJornada } = require('./jornada');
const { horaLocalADate, diaSemanaGuatemala } = require('./fechas');

const F = '2026-11-04'; // miércoles
const turno = {
  hora_entrada: '08:00:00',
  hora_salida: '17:00:00',
  tolerancia_min: 10,
  dias_semana: [1, 2, 3, 4, 5],
};
const m = (tipo, hhmm, fecha = F) => ({
  tipo,
  hora_efectiva: horaLocalADate(fecha, hhmm),
});
const calc = (marcajes, extra = {}) =>
  calcularJornada({ fecha: F, turno, marcajes, cerrada: true, ...extra });

test('entrada temprano y salida a la hora: a tiempo', () => {
  const r = calc([m('entrada', '07:55'), m('salida', '17:05')]);
  assert.strictEqual(r.estado, 'a_tiempo');
  assert.strictEqual(r.minutos_retraso, 0);
  assert.strictEqual(r.minutos_trabajados, 550);
});

test('llegar dentro de la tolerancia (10 min) no es tardanza', () => {
  const r = calc([m('entrada', '08:10'), m('salida', '17:00')]);
  assert.strictEqual(r.estado, 'a_tiempo');
  assert.strictEqual(r.minutos_retraso, 0);
});

test('un minuto después de la tolerancia es tardanza', () => {
  const r = calc([m('entrada', '08:11'), m('salida', '17:00')]);
  assert.strictEqual(r.estado, 'tardanza');
  assert.strictEqual(r.minutos_retraso, 11);
});

test('60 minutos es tardanza y 61 es tardanza grave', () => {
  const a = calc([m('entrada', '09:00'), m('salida', '17:00')]);
  assert.strictEqual(a.estado, 'tardanza');
  assert.strictEqual(a.minutos_retraso, 60);
  const b = calc([m('entrada', '09:01'), m('salida', '17:00')]);
  assert.strictEqual(b.estado, 'tardanza_grave');
  assert.strictEqual(b.minutos_retraso, 61);
});

test('salir antes de la hora es salida anticipada', () => {
  const r = calc([m('entrada', '08:00'), m('salida', '16:30')]);
  assert.strictEqual(r.estado, 'salida_anticipada');
  assert.strictEqual(r.minutos_salida_anticipada, 30);
});

test('la tardanza prevalece sobre la salida anticipada, y ambos números se guardan', () => {
  const r = calc([m('entrada', '08:30'), m('salida', '16:30')]);
  assert.strictEqual(r.estado, 'tardanza');
  assert.strictEqual(r.minutos_retraso, 30);
  assert.strictEqual(r.minutos_salida_anticipada, 30);
});

test('sin marcajes: ausente al cerrar el día, pendiente mientras tanto', () => {
  assert.strictEqual(calc([]).estado, 'ausente');
  assert.strictEqual(calc([], { cerrada: false }).estado, 'pendiente');
});

test('entrada sin salida: incompleto al cerrar, en curso mientras tanto', () => {
  const cerrado = calc([m('entrada', '08:00')]);
  assert.strictEqual(cerrado.estado, 'incompleto');
  assert.strictEqual(cerrado.minutos_trabajados, null);
  assert.strictEqual(calc([m('entrada', '08:00')], { cerrada: false }).estado, 'en_curso');
});

test('el tiempo fuera se descuenta de las horas trabajadas', () => {
  const r = calc([
    m('entrada', '08:00'),
    m('salida_temporal', '12:00'),
    m('regreso', '12:40'),
    m('salida', '17:00'),
  ]);
  assert.strictEqual(r.minutos_fuera, 40);
  assert.strictEqual(r.minutos_trabajados, 500);
  assert.strictEqual(r.estado, 'a_tiempo');
});

test('una salida temporal sin regreso deja el día incompleto', () => {
  const r = calc([m('entrada', '08:00'), m('salida_temporal', '12:00')]);
  assert.strictEqual(r.estado, 'incompleto');
  assert.strictEqual(r.minutos_trabajados, null);
});

test('sin turno asignado: horario libre, solo se miden horas', () => {
  const libre = calcularJornada({
    fecha: F,
    turno: null,
    marcajes: [m('entrada', '09:00'), m('salida', '15:00')],
    cerrada: true,
  });
  assert.strictEqual(libre.estado, 'libre');
  assert.strictEqual(libre.minutos_trabajados, 360);
  assert.strictEqual(libre.minutos_retraso, 0);
  const nada = calcularJornada({ fecha: F, turno: null, marcajes: [], cerrada: true });
  assert.strictEqual(nada.estado, 'sin_actividad');
});

test('un día que el turno no cubre es no laborable, y si trabaja queda libre', () => {
  const sabado = '2026-11-07';
  const sin = calcularJornada({ fecha: sabado, turno, marcajes: [], cerrada: true });
  assert.strictEqual(sin.estado, 'no_laborable');
  const con = calcularJornada({
    fecha: sabado,
    turno,
    marcajes: [m('entrada', '10:00', sabado), m('salida', '14:00', sabado)],
    cerrada: true,
  });
  assert.strictEqual(con.estado, 'libre');
});

test('conversión de horas locales de Guatemala y día de la semana', () => {
  assert.strictEqual(horaLocalADate(F, '08:00').toISOString(), '2026-11-04T14:00:00.000Z');
  assert.strictEqual(horaLocalADate(F, '19:00:00').toISOString(), '2026-11-05T01:00:00.000Z');
  assert.strictEqual(diaSemanaGuatemala('2026-11-04'), 3);
  assert.strictEqual(diaSemanaGuatemala('2026-11-08'), 7);
  assert.strictEqual(diaSemanaGuatemala('2026-11-09'), 1);
});