require('dotenv').config();
const bcrypt = require('bcryptjs');
const {
  sequelize, Empresa, Sede, Usuario, Turno, MotivoSalida,
} = require('../models');

const HOST_PRODUCCION = 'bcvswio9';

const MOTIVOS = [
  { nombre: 'Depositar', requiere_detalle: false },
  { nombre: 'Dejar mercadería', requiere_detalle: false },
  { nombre: 'Instrumentar', requiere_detalle: false },
  { nombre: 'Otro', requiere_detalle: true },
];

// dias_semana: 1 = lunes ... 7 = domingo
const TURNOS = [
  { nombre: 'Lunes a viernes 8:00-17:00', entrada: '08:00', salida: '17:00', dias: [1, 2, 3, 4, 5] },
  { nombre: 'Lunes a viernes 11:00-20:00', entrada: '11:00', salida: '20:00', dias: [1, 2, 3, 4, 5] },
  { nombre: 'Fin de semana 10:00-20:00', entrada: '10:00', salida: '20:00', dias: [6, 7] },
];

async function main() {
  const host = new URL(process.env.DATABASE_URL_APP).host;
  if (!host.includes(HOST_PRODUCCION)) {
    throw new Error(`DATABASE_URL_APP no apunta a producción (${host})`);
  }
  console.log('Servidor:', host);

  const { ADMIN_EMAIL, ADMIN_NOMBRE, ADMIN_PASSWORD, CODIGO_REGISTRO } = process.env;
  const email = (ADMIN_EMAIL || '').trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('ADMIN_EMAIL inválido');
  if (!ADMIN_NOMBRE || ADMIN_NOMBRE.trim().length < 2) throw new Error('Falta ADMIN_NOMBRE');
  if (!ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12 || ADMIN_PASSWORD.length > 72) {
    throw new Error('ADMIN_PASSWORD debe tener entre 12 y 72 caracteres');
  }
  const codigo = (CODIGO_REGISTRO || '').trim().toUpperCase();
  if (codigo.length < 8) throw new Error('CODIGO_REGISTRO debe tener al menos 8 caracteres');

  const empresa = await Empresa.findOne({ where: { nombre: 'Medimas' } });
  if (!empresa) throw new Error('No existe la empresa en producción');
  const sede = await Sede.findOne({
    where: { empresa_id: empresa.id },
    order: [['id', 'ASC']],
  });
  if (!sede) throw new Error('No existe la sede en producción');

  await empresa.update({
    configuracion: { ...empresa.configuracion, codigo_registro: codigo },
  });
  console.log('Código de registro guardado');

  for (const m of MOTIVOS) {
    const [, nuevo] = await MotivoSalida.findOrCreate({
      where: { empresa_id: empresa.id, nombre: m.nombre },
      defaults: { requiere_detalle: m.requiere_detalle },
    });
    console.log(`Motivo ${m.nombre}: ${nuevo ? 'creado' : 'ya existía'}`);
  }

  for (const t of TURNOS) {
    const [, nuevo] = await Turno.findOrCreate({
      where: { empresa_id: empresa.id, nombre: t.nombre },
      defaults: {
        sede_id: sede.id,
        hora_entrada: t.entrada,
        hora_salida: t.salida,
        dias_semana: t.dias,
        tolerancia_min: 10,
      },
    });
    console.log(`Turno ${t.nombre}: ${nuevo ? 'creado' : 'ya existía'}`);
  }

  const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const [, nuevoAdmin] = await Usuario.findOrCreate({
    where: { empresa_id: empresa.id, email },
    defaults: {
      sede_id: sede.id,
      nombre: ADMIN_NOMBRE.trim(),
      rol: 'admin',
      estado: 'activo',
      password_hash: hash,
      debe_cambiar_password: false,
      aprobado_en: new Date(),
    },
  });
  console.log(`Administrador ${email}: ${nuevoAdmin ? 'creado' : 'ya existía (no se cambió su contraseña)'}`);
  console.log('Recuerda: las coordenadas de la sede siguen siendo provisionales.');
}

main()
  .catch((e) => {
    console.error('Error:', e.message);
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());