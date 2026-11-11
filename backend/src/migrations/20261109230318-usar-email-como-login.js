'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      UPDATE usuarios
      SET email = CASE usuario
        WHEN 'admin' THEN 'admin@example.com'
        WHEN 'empleado1' THEN 'empleado1@example.com'
        WHEN 'empleado2' THEN 'empleado2@example.com'
        WHEN 'empleado3' THEN 'empleado3@example.com'
        ELSE email
      END
      WHERE email IS NULL
    `);
    await queryInterface.sequelize.query(
      'UPDATE usuarios SET email = lower(email)'
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE usuarios ALTER COLUMN email SET NOT NULL'
    );
    await queryInterface.sequelize.query(
      'DROP INDEX IF EXISTS usuarios_empresa_email_uq'
    );
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX usuarios_empresa_email_uq
      ON usuarios (empresa_id, lower(email))
    `);
    await queryInterface.removeIndex('usuarios', 'usuarios_empresa_usuario_uq');
    await queryInterface.removeColumn('usuarios', 'usuario');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('usuarios', 'usuario', {
      type: Sequelize.STRING(60),
      allowNull: true,
    });
    await queryInterface.sequelize.query(
      'UPDATE usuarios SET usuario = left(lower(email), 60)'
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE usuarios ALTER COLUMN usuario SET NOT NULL'
    );
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX usuarios_empresa_usuario_uq
      ON usuarios (empresa_id, usuario)
    `);
    await queryInterface.sequelize.query(
      'ALTER TABLE usuarios ALTER COLUMN email DROP NOT NULL'
    );
  },
};