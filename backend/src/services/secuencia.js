const PERMITIDOS = {
  ninguno: ['entrada'],
  entrada: ['salida_temporal', 'salida'],
  regreso: ['salida_temporal', 'salida'],
  salida_temporal: ['regreso'],
  salida: [],
};

function mensaje(estado, tipo) {
  if (estado === 'salida') {
    return 'Tu jornada de hoy ya está cerrada. Si te equivocaste, solicita una corrección';
  }
  if (estado === 'salida_temporal') {
    return 'Tienes una salida temporal abierta: marca tu regreso';
  }
  if (estado === 'ninguno') return 'Primero debes marcar tu entrada';
  if (tipo === 'entrada') return 'Ya marcaste tu entrada de hoy';
  return 'No tienes una salida temporal abierta';
}

function validarSecuencia(ultimoTipo, tipo) {
  const estado = ultimoTipo || 'ninguno';
  if ((PERMITIDOS[estado] || []).includes(tipo)) {
    return { ok: true, estado_actual: estado };
  }
  return { ok: false, estado_actual: estado, mensaje: mensaje(estado, tipo) };
}

module.exports = { validarSecuencia };