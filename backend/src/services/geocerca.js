const RADIO_TIERRA_M = 6371000;

// Si el GPS reporta un error mayor a este valor, no se acepta el marcaje.
// Es un valor provisional: se ajusta con la prueba de GPS en el local.
const MAX_PRECISION_M = 100;

const aRad = (grados) => (grados * Math.PI) / 180;

function distanciaMetros(lat1, lng1, lat2, lng2) {
  const dLat = aRad(lat2 - lat1);
  const dLng = aRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aRad(lat1)) * Math.cos(aRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * RADIO_TIERRA_M * Math.asin(Math.sqrt(a));
}

function validarUbicacion({ lat, lng, accuracy }, sede) {
  const valida =
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180;
  if (!valida) {
    return { ok: false, motivo: 'coordenadas_invalidas' };
  }

  const distancia_m =
    Math.round(distanciaMetros(lat, lng, sede.lat, sede.lng) * 100) / 100;
  const base = { distancia_m, radio_m: sede.radio_m };

  if (Number.isFinite(accuracy) && accuracy > MAX_PRECISION_M) {
    return { ok: false, motivo: 'precision_insuficiente', ...base };
  }
  if (distancia_m > sede.radio_m) {
    return { ok: false, motivo: 'fuera_de_geocerca', ...base };
  }
  return { ok: true, ...base };
}

module.exports = { distanciaMetros, validarUbicacion, MAX_PRECISION_M };