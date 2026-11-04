// Guatemala es UTC-6 todo el año (sin horario de verano)
const OFFSET_GT_MS = 6 * 60 * 60 * 1000;

function inicioDiaGuatemala(fecha = new Date()) {
  const local = new Date(fecha.getTime() - OFFSET_GT_MS);
  return new Date(
    Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()) +
      OFFSET_GT_MS
  );
}

module.exports = { inicioDiaGuatemala, OFFSET_GT_MS };