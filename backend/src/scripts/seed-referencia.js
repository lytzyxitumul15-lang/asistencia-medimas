require('dotenv').config();
const {
  sequelize, Empresa, Sede, Usuario, Turno, AsignacionTurno, MotivoSalida,
} = require('../models');

const MOTIVOS = [
  { nombre: 'Depositar', requiere_detalle: false },
  { nombre: 'Dejar mercadería', requiere_detalle: false },
  { nombre: 'Instrumentar', requiere_detalle: false },
  { nombre: 'Otro', requiere_detalle: true },
];

// dias_semana: 1 = lunes ... 7 = domingo
const TURNOS = [
  { nombre: 'Lunes a viernes 8:00-17:00', entrada: '08:00', salida: '17:00', dias: [1, 2, 3, 4, 5], email: 'empleado1@example.com' },
  { nombre: 'Lunes a viernes 11:00-20:00', entrada: '11:00', salida: '20:00', dias: [1, 2, 3, 4, 5], email: 'empleado2@example.com' },
  { nombre: 'Fin de semana 10:00-20:00', entrada: '10:00', salida: '20:00', dias: [6, 7], email: 'empleado3@example.com' },
];

async function main() {
  const empresa = await Empresa.findOne({ where: { nombre: 'Medimas' } });
  if (!empresa) throw new Error('No hay empresa: ejecuta primero npm run seed');
  const sede = await Sede.findOne({ where: { empresa_id: empresa.id } });

  for (const m of MOTIVOS) {
    const [, nuevo] = await MotivoSalida.findOrCreate({
      where: { empresa_id: empresa.id, nombre: m.nombre },
      defaults: { requiere_detalle: m.requiere_detalle },
    });
    console.log(`Motivo ${m.nombre}: ${nuevo ? 'creado' : 'ya existía'}`);
  }

  for (const t of TURNOS) {
    const [turno, tNuevo] = await Turno.findOrCreate({
      where: { empresa_id: empresa.id, nombre: t.nombre },
      defaults: {
        sede_id: sede.id,
        hora_entrada: t.entrada,
        hora_salida: t.salida,
        dias_semana: t.dias,
        tolerancia_min: 10,
      },
    });
    console.log(`Turno ${t.nombre}: ${tNuevo ? 'creado' : 'ya existía'}`);

    const user = await Usuario.findOne({
      where: { empresa_id: empresa.id, email: t.email },
    });
    if (!user) throw new Error(`No existe el usuario ${t.email}`);

    const [, aNueva] = await AsignacionTurno.findOrCreate({
      where: { usuario_id: user.id, turno_id: turno.id, vigente_desde: '2026-11-01' },
    });
    console.log(`  Asignado a ${t.email}: ${aNueva ? 'creado' : 'ya existía'}`);
  }
}

main()
  .catch((e) => {
    console.error('Error en el seed de referencia:', e.message);
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());