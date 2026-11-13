// Guatemala es UTC-6 todo el año (sin horario de verano)
const OFFSET_GT_MS = 6 * 60 * 60 * 1000;

function inicioDiaGuatemala(fecha = new Date()) {
  const local = new Date(fecha.getTime() - OFFSET_GT_MS);
  return new Date(
    Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()) +
      OFFSET_GT_MS
  );
}

// Fecha de hoy en Guatemala como 'AAAA-MM-DD'
function hoyGuatemala(fecha = new Date()) {
  return new Date(fecha.getTime() - OFFSET_GT_MS).toISOString().slice(0, 10);
}

// Convierte una hora local de Guatemala ('HH:MM' o 'HH:MM:SS') de una fecha
// 'AAAA-MM-DD' al instante exacto (Date, en UTC)
function horaLocalADate(fecha, hhmm) {
  const [y, m, d] = fecha.split('-').map(Number);
  const [h, min] = hhmm.split(':').map(Number);
  return new Date(Date.UTC(y, m - 1, d, h, min) + OFFSET_GT_MS);
}

// Día de la semana de una fecha 'AAAA-MM-DD': 1 = lunes ... 7 = domingo
function diaSemanaGuatemala(fecha) {
  const [y, m, d] = fecha.split('-').map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return dow === 0 ? 7 : dow;
}

module.exports = {
  inicioDiaGuatemala,
  hoyGuatemala,
  horaLocalADate,
  diaSemanaGuatemala,
  OFFSET_GT_MS,
};