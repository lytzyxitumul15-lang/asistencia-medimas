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

module.exports = { inicioDiaGuatemala, hoyGuatemala, OFFSET_GT_MS };