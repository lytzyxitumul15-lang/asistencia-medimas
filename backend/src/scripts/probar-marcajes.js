require('dotenv').config();
const crypto = require('crypto');
const { sequelize, Usuario, Sede, Marcaje } = require('../models');
const { registrarMarcaje } = require('../services/marcajes');
const { verificarCadena } = require('../services/hashChain');

(async () => {
  try {
    const user = await Usuario.findOne({ where: { usuario: 'empleado3' } });
    const sede = await Sede.findByPk(user.sede_id);
    const ubic = { lat: sede.lat, lng: sede.lng, accuracy: 10 };

    // 1. Cinco marcajes simultáneos (prueba del bloqueo)
    const resultados = await Promise.all(
      Array.from({ length: 5 }, () =>
        registrarMarcaje(user, {
          tipo: 'entrada', ...ubic, device_id: 'prueba',
          client_uuid: crypto.randomUUID(),
        })
      )
    );
    console.log('Creados:', resultados.filter((r) => !r.duplicado).length);

    // 2. Idempotencia: el mismo client_uuid dos veces
    const uuid = crypto.randomUUID();
    const a = await registrarMarcaje(user, { tipo: 'salida', ...ubic, client_uuid: uuid });
    const b = await registrarMarcaje(user, { tipo: 'salida', ...ubic, client_uuid: uuid });
    console.log(
      'Reenvío detectado como duplicado:', b.duplicado,
      '| mismo id:', String(a.marcaje.id) === String(b.marcaje.id)
    );

    // 3. Fuera de la geocerca (unos 1.1 km al norte)
    try {
      await registrarMarcaje(user, {
        tipo: 'entrada', lat: sede.lat + 0.01, lng: sede.lng,
        accuracy: 10, client_uuid: crypto.randomUUID(),
      });
      console.log('ERROR: aceptó un marcaje fuera de la geocerca');
    } catch (e) {
      console.log('Fuera de geocerca rechazado:', e.codigo);
    }

    // 4. Verificación de la cadena completa de la empresa
    const filas = await Marcaje.findAll({
      where: { empresa_id: user.empresa_id },
      order: [['id', 'ASC']],
      raw: true,
    });
    console.log('Marcajes en la cadena:', filas.length);
    console.log('Verificación de cadena:', verificarCadena(filas));
  } catch (e) {
    console.error('Error:', e.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
})();