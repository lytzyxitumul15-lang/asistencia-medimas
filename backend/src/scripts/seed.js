require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, Empresa, Sede, Usuario } = require('../models');

async function main() {
  const pass = process.env.SEED_PASSWORD;
  if (!pass || pass.length < 12) {
    throw new Error('Define SEED_PASSWORD (mínimo 12 caracteres) en el .env');
  }
  const hash = await bcrypt.hash(pass, 12);

  const [empresa, empresaNueva] = await Empresa.findOrCreate({
    where: { nombre: 'Medimas' },
  });
  console.log(empresaNueva ? 'Empresa creada' : 'Empresa ya existía');

  // Coordenadas TEMPORALES: se reemplazan con las reales tras la prueba de GPS.
  const [sede, sedeNueva] = await Sede.findOrCreate({
    where: { empresa_id: empresa.id, nombre: 'Sede principal' },
    defaults: { lat: 14.6349, lng: -90.5069, radio_m: 50 },
  });
  console.log(sedeNueva ? 'Sede creada' : 'Sede ya existía');

  const usuarios = [
    { usuario: 'admin', nombre: 'Administrador', rol: 'admin' },
    { usuario: 'empleado1', nombre: 'Empleado 8:00-17:00', rol: 'empleado' },
    { usuario: 'empleado2', nombre: 'Empleado 11:00-20:00', rol: 'empleado' },
    { usuario: 'empleado3', nombre: 'Empleado fin de semana', rol: 'empleado' },
  ];

  for (const u of usuarios) {
    const [, nuevo] = await Usuario.findOrCreate({
      where: { empresa_id: empresa.id, usuario: u.usuario },
      defaults: {
        sede_id: sede.id,
        nombre: u.nombre,
        rol: u.rol,
        password_hash: hash,
        debe_cambiar_password: true,
      },
    });
    console.log(`${u.usuario}: ${nuevo ? 'creado' : 'ya existía'}`);
  }
}

main()
  .catch((e) => {
    console.error('Error en el seed:', e.message);
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());