const { horaLocalADate, diaSemanaGuatemala } = require('./fechas');

const UMBRAL_GRAVE_POR_DEFECTO = 60;
const aMin = (ms) => Math.floor(ms / 60000);

/**
 * fecha:    'AAAA-MM-DD' (día en Guatemala)
 * turno:    { hora_entrada, hora_salida, tolerancia_min, dias_semana } o null
 * marcajes: marcajes válidos de ese día: { tipo, hora_efectiva }
 * cerrada:  true si el día ya terminó (cierre diario)
 */
function calcularJornada({
  fecha,
  turno,
  marcajes,
  cerrada,
  umbral_tardanza_grave_min = UMBRAL_GRAVE_POR_DEFECTO,
}) {
  const ordenados = [...marcajes].sort(
    (a, b) => new Date(a.hora_efectiva) - new Date(b.hora_efectiva)
  );
  const entrada = ordenados.find((m) => m.tipo === 'entrada') || null;
  const salida = [...ordenados].reverse().find((m) => m.tipo === 'salida') || null;

  let fueraMs = 0;
  let salidaAbierta = null;
  for (const m of ordenados) {
    const t = new Date(m.hora_efectiva);
    if (m.tipo === 'salida_temporal') {
      salidaAbierta = t;
    } else if (m.tipo === 'regreso' && salidaAbierta) {
      fueraMs += t - salidaAbierta;
      salidaAbierta = null;
    }
  }

  const horaEntrada = entrada ? new Date(entrada.hora_efectiva) : null;
  const horaSalida = salida ? new Date(salida.hora_efectiva) : null;
  const tieneTurno =
    Boolean(turno) && turno.dias_semana.includes(diaSemanaGuatemala(fecha));

  let minutos_retraso = 0;
  if (tieneTurno && horaEntrada) {
    const retraso = aMin(horaEntrada - horaLocalADate(fecha, turno.hora_entrada));
    if (retraso > turno.tolerancia_min) minutos_retraso = retraso;
  }

  let minutos_salida_anticipada = 0;
  if (tieneTurno && horaSalida) {
    minutos_salida_anticipada = Math.max(
      0,
      aMin(horaLocalADate(fecha, turno.hora_salida) - horaSalida)
    );
  }

  const minutos_fuera = aMin(fueraMs);
  const completa = Boolean(horaEntrada && horaSalida && !salidaAbierta);
  const minutos_trabajados = completa
    ? Math.max(0, aMin(horaSalida - horaEntrada) - minutos_fuera)
    : null;

  let estado;
  if (!horaEntrada) {
    if (!tieneTurno) estado = turno ? 'no_laborable' : 'sin_actividad';
    else estado = cerrada ? 'ausente' : 'pendiente';
  } else if (!completa) {
    estado = cerrada ? 'incompleto' : 'en_curso';
  } else if (!tieneTurno) {
    estado = 'libre';
  } else if (minutos_retraso > umbral_tardanza_grave_min) {
    estado = 'tardanza_grave';
  } else if (minutos_retraso > 0) {
    estado = 'tardanza';
  } else if (minutos_salida_anticipada > 0) {
    estado = 'salida_anticipada';
  } else {
    estado = 'a_tiempo';
  }

  return {
    estado,
    hora_entrada: horaEntrada,
    hora_salida: horaSalida,
    minutos_retraso,
    minutos_salida_anticipada,
    minutos_fuera,
    minutos_trabajados,
  };
}

module.exports = { calcularJornada };