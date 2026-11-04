'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('usuarios', 'estado', {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: 'activo',
    });

    await queryInterface.sequelize.query(`
      UPDATE usuarios
      SET estado = CASE WHEN activo THEN 'activo' ELSE 'inactivo' END
    `);

    await queryInterface.addConstraint('usuarios', {
      fields: ['estado'],
      type: 'check',
      where: { estado: ['pendiente', 'activo', 'inactivo'] },
      name: 'usuarios_estado_check',
    });

    await queryInterface.addColumn('usuarios', 'aprobado_por', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'usuarios', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
    await queryInterface.addColumn('usuarios', 'aprobado_en', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX usuarios_empresa_email_uq
      ON usuarios (empresa_id, lower(email))
      WHERE email IS NOT NULL
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      'DROP INDEX IF EXISTS usuarios_empresa_email_uq'
    );
    await queryInterface.removeColumn('usuarios', 'aprobado_en');
    await queryInterface.removeColumn('usuarios', 'aprobado_por');
    await queryInterface.removeColumn('usuarios', 'estado');
  },
};