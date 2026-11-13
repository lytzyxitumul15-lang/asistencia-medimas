const salida = document.getElementById('salida');
const etiqueta = document.getElementById('etiqueta');
const btnMedir = document.getElementById('medir');
const btnCentro = document.getElementById('centro');
const btnCopiar = document.getElementById('copiar');

const RADIO_TIERRA_M = 6371000;
const aRad = (g) => (g * Math.PI) / 180;

function distancia(a, b) {
  const dLat = aRad(b.lat - a.lat);
  const dLng = aRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aRad(a.lat)) * Math.cos(aRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * RADIO_TIERRA_M * Math.asin(Math.sqrt(h));
}

let centro = null;
let ultima = null;
const lineas = [];

function pintar() {
  salida.textContent = lineas.length ? lineas.join('\n') : 'Sin mediciones todavía.';
}

function terminar() {
  btnMedir.disabled = false;
  btnMedir.textContent = 'Medir mi ubicación';
  pintar();
}

btnMedir.addEventListener('click', () => {
  if (!navigator.geolocation) {
    salida.textContent = 'Este navegador no soporta geolocalización.';
    return;
  }
  btnMedir.disabled = true;
  btnMedir.textContent = 'Midiendo...';

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude, accuracy } = pos.coords;
      ultima = { lat: latitude, lng: longitude };
      const d = centro ? distancia(centro, ultima).toFixed(1) : '-';
      const nombre = etiqueta.value.trim() || 'sin nombre';
      lineas.push(
        `${nombre} | ${latitude.toFixed(7)}, ${longitude.toFixed(7)} | precisión ${Math.round(accuracy)} m | a ${d} m del centro`
      );
      btnCentro.disabled = false;
      terminar();
    },
    (err) => {
      const mensajes = {
        1: 'Permiso de ubicación denegado. Actívalo para este sitio.',
        2: 'No se pudo obtener la ubicación. Activa el GPS.',
        3: 'Se agotó el tiempo. Intenta de nuevo.',
      };
      lineas.push(`ERROR: ${mensajes[err.code] || err.message}`);
      terminar();
    },
    { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
  );
});

btnCentro.addEventListener('click', () => {
  if (!ultima) return;
  centro = ultima;
  lineas.push(`>> CENTRO fijado en ${centro.lat.toFixed(7)}, ${centro.lng.toFixed(7)}`);
  pintar();
});

btnCopiar.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(lineas.join('\n'));
    btnCopiar.textContent = 'Copiado';
  } catch (e) {
    btnCopiar.textContent = 'No se pudo copiar: selecciona el texto a mano';
  }
});